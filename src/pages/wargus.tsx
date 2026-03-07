import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';

type Faction = 'human' | 'orc' | 'legion';
type UnitType = 'peasant' | 'footman' | 'archer' | 'knight' | 'ballista' | 'mage' | 'paladin';
type BuildingType = 'townhall' | 'barracks' | 'farm' | 'tower' | 'blacksmith' | 'lumbermill' | 'stable' | 'church';
type ResourceType = 'gold' | 'lumber';
type GameMode = 'menu' | 'pve' | 'pvp';
type OrderType = 'move' | 'attack' | 'attackmove' | 'patrol' | 'stop' | 'hold' | 'gather' | 'build' | 'repair';
type AnimState = 'idle' | 'walk' | 'attack' | 'attack2' | 'gather' | 'mining' | 'building' | 'stunned' | 'hurt' | 'die' | 'cast' | 'special';
type SpellType = 'fireball' | 'blizzard' | 'holylight' | 'exorcism';
type AIPhase = 'early' | 'mid' | 'late' | 'attack';

const FACTION_NAMES: Record<Faction, { name: string; subtitle: string; icon1: string; icon2: string }> = {
  human: { name: 'ALLIANCE', subtitle: 'Humans, Elves, Dwarves', icon1: '👑', icon2: '🛡️' },
  orc: { name: 'HORDE', subtitle: 'Orcs, Trolls, Ogres', icon1: '💀', icon2: '⚔️' },
  legion: { name: 'LEGION', subtitle: 'Demons, Undead, Warlocks', icon1: '🔥', icon2: '👿' },
};

const FACTION_COLORS: Record<Faction, string> = {
  human: 'blue',
  orc: 'red',
  legion: 'purple',
};

interface Vec3 { x: number; y: number; z: number; }

interface PathNode { x: number; z: number; g: number; h: number; f: number; parent: PathNode | null; }

interface Particle {
  mesh: THREE.Mesh | THREE.Sprite;
  velocity: Vec3;
  life: number;
  maxLife: number;
  gravity: number;
  fadeOut: boolean;
  scale: number;
  rotSpeed: Vec3;
}

interface Projectile {
  mesh: THREE.Group;
  origin: Vec3;
  target: Vec3;
  targetId: string;
  speed: number;
  damage: number;
  aoe: number;
  progress: number;
  arcHeight: number;
  type: 'arrow' | 'bolt' | 'fireball' | 'holylight';
}

interface ArticulatedModel {
  root: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weapon?: THREE.Mesh;
  shield?: THREE.Mesh;
  mount?: THREE.Group;
  hat?: THREE.Mesh;
}

interface AnimKeyframe {
  time: number;
  leftArmRot: number;
  rightArmRot: number;
  leftLegRot: number;
  rightLegRot: number;
  torsoY: number;
  torsoRot: number;
  headRot: number;
  weaponRot?: number;
}

interface GameUnit {
  id: string;
  type: UnitType;
  faction: Faction;
  position: Vec3;
  targetPosition: Vec3 | null;
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  range: number;
  speed: number;
  isSelected: boolean;
  currentOrder: OrderType | null;
  attackTarget: string | null;
  repairTarget: string | null;
  patrolStart: Vec3 | null;
  patrolEnd: Vec3 | null;
  carryingResource: { type: ResourceType; amount: number } | null;
  gatherTarget: string | null;
  lastGatherTarget: string | null;
  groupNumber: number | null;
  model?: ArticulatedModel;
  selectionRing?: THREE.Mesh;
  healthBar?: THREE.Group;
  isVisible: boolean;
  lastSeenPosition: Vec3 | null;
  animState: AnimState;
  animTime: number;
  attackCooldown: number;
  path: Vec3[];
  pathIndex: number;
  mana: number;
  maxMana: number;
  facing: number;
  deathTime: number;
  isDead: boolean;
}

interface GameBuilding {
  id: string;
  type: BuildingType;
  faction: Faction;
  position: Vec3;
  health: number;
  maxHealth: number;
  isConstructing: boolean;
  constructionProgress: number;
  productionQueue: UnitType[];
  productionProgress: number;
  rallyPoint: Vec3 | null;
  mesh?: THREE.Group;
  healthBar?: THREE.Group;
  isVisible: boolean;
  onFire: boolean;
  fireParticleTimer: number;
}

interface ResourceNode {
  id: string;
  type: ResourceType;
  position: Vec3;
  amount: number;
  mesh?: THREE.Group;
}

interface FogCell { explored: boolean; visible: boolean; }

interface FloatingText {
  sprite: THREE.Sprite;
  startY: number;
  life: number;
  maxLife: number;
}

interface CameraShake {
  intensity: number;
  duration: number;
  elapsed: number;
}

interface AIState {
  phase: AIPhase;
  buildOrder: BuildingType[];
  buildIndex: number;
  attackTimer: number;
  scoutTimer: number;
  expandTimer: number;
  lastAttackSize: number;
  aggression: number;
  peasantTarget: number;
  militaryTarget: number;
}

const UNIT_STATS: Record<UnitType, {
  name: string; icon: string;
  cost: { gold: number; lumber: number };
  health: number; damage: number; armor: number; range: number; speed: number;
  buildTime: number; mana: number; attackSpeed: number;
  commands: string[];
}> = {
  peasant: { name: 'Peasant', icon: '👷', cost: { gold: 200, lumber: 0 }, health: 30, damage: 5, armor: 0, range: 1.5, speed: 4, buildTime: 12, mana: 0, attackSpeed: 1.2, commands: ['move', 'stop', 'attack', 'repair', 'gather', 'build'] },
  footman: { name: 'Footman', icon: '⚔️', cost: { gold: 350, lumber: 0 }, health: 60, damage: 9, armor: 2, range: 1.5, speed: 3.5, buildTime: 15, mana: 0, attackSpeed: 1.0, commands: ['move', 'stop', 'attack', 'patrol', 'hold'] },
  archer: { name: 'Elven Archer', icon: '🏹', cost: { gold: 300, lumber: 30 }, health: 40, damage: 5, armor: 0, range: 5, speed: 3.5, buildTime: 18, mana: 0, attackSpeed: 1.5, commands: ['move', 'stop', 'attack', 'patrol', 'hold'] },
  knight: { name: 'Knight', icon: '🐴', cost: { gold: 500, lumber: 60 }, health: 90, damage: 12, armor: 4, range: 1.5, speed: 6, buildTime: 25, mana: 0, attackSpeed: 1.0, commands: ['move', 'stop', 'attack', 'patrol', 'hold'] },
  ballista: { name: 'Ballista', icon: '🎯', cost: { gold: 600, lumber: 150 }, health: 110, damage: 80, armor: 0, range: 8, speed: 2, buildTime: 40, mana: 0, attackSpeed: 3.0, commands: ['move', 'stop', 'attack', 'patrol'] },
  mage: { name: 'Mage', icon: '🧙', cost: { gold: 700, lumber: 0 }, health: 60, damage: 9, armor: 0, range: 3, speed: 2.5, buildTime: 30, mana: 250, attackSpeed: 1.5, commands: ['move', 'stop', 'attack', 'patrol'] },
  paladin: { name: 'Paladin', icon: '🛡️', cost: { gold: 500, lumber: 60 }, health: 90, damage: 12, armor: 4, range: 1.5, speed: 6, buildTime: 25, mana: 100, attackSpeed: 1.0, commands: ['move', 'stop', 'attack', 'patrol', 'hold'] }
};

const BUILDING_STATS: Record<BuildingType, {
  name: string; icon: string;
  cost: { gold: number; lumber: number };
  health: number; buildTime: number; food: number; trains: UnitType[];
  requires?: BuildingType[];
}> = {
  townhall: { name: 'Town Hall', icon: '🏰', cost: { gold: 600, lumber: 400 }, health: 1200, buildTime: 40, food: 1, trains: ['peasant'] },
  barracks: { name: 'Barracks', icon: '🏛️', cost: { gold: 350, lumber: 200 }, health: 800, buildTime: 25, food: 0, trains: ['footman', 'archer'] },
  farm: { name: 'Farm', icon: '🌾', cost: { gold: 200, lumber: 100 }, health: 400, buildTime: 12, food: 4, trains: [] },
  tower: { name: 'Scout Tower', icon: '🗼', cost: { gold: 300, lumber: 100 }, health: 130, buildTime: 15, food: 0, trains: [] },
  blacksmith: { name: 'Blacksmith', icon: '⚒️', cost: { gold: 400, lumber: 200 }, health: 775, buildTime: 30, food: 0, trains: [] },
  lumbermill: { name: 'Lumber Mill', icon: '🪓', cost: { gold: 300, lumber: 200 }, health: 600, buildTime: 20, food: 0, trains: [] },
  stable: { name: 'Stables', icon: '🐎', cost: { gold: 500, lumber: 150 }, health: 500, buildTime: 25, food: 0, trains: ['knight', 'paladin'], requires: ['barracks'] },
  church: { name: 'Church', icon: '⛪', cost: { gold: 450, lumber: 250 }, health: 700, buildTime: 28, food: 0, trains: ['mage'], requires: ['barracks'] }
};

const COMMAND_ICONS: Record<string, { icon: string; name: string; hotkey: string }> = {
  move: { icon: '👆', name: 'Move', hotkey: 'M' },
  stop: { icon: '⏹️', name: 'Stop', hotkey: 'S' },
  attack: { icon: '⚔️', name: 'Attack', hotkey: 'A' },
  attackmove: { icon: '🎯', name: 'Attack Move', hotkey: 'A' },
  patrol: { icon: '🔄', name: 'Patrol', hotkey: 'P' },
  hold: { icon: '🛑', name: 'Hold Position', hotkey: 'H' },
  gather: { icon: '⛏️', name: 'Gather', hotkey: 'G' },
  build: { icon: '🔨', name: 'Build', hotkey: 'B' },
  repair: { icon: '🔧', name: 'Repair', hotkey: 'R' }
};

const MAP_SIZE = 64;
const FOG_GRID_SIZE = 64;
const VISION_RANGE = 6;
const GRID_RES = 64;
const CELL_SIZE = MAP_SIZE / GRID_RES;

const ANIM_KEYFRAMES: Record<AnimState, AnimKeyframe[]> = {
  idle: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.5, leftArmRot: 0.05, rightArmRot: -0.05, leftLegRot: 0, rightLegRot: 0, torsoY: 0.02, torsoRot: 0, headRot: 0.02 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
  walk: [
    { time: 0, leftArmRot: 0.6, rightArmRot: -0.6, leftLegRot: -0.5, rightLegRot: 0.5, torsoY: 0, torsoRot: 0.03, headRot: 0 },
    { time: 0.25, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0.06, torsoRot: 0, headRot: 0 },
    { time: 0.5, leftArmRot: -0.6, rightArmRot: 0.6, leftLegRot: 0.5, rightLegRot: -0.5, torsoY: 0, torsoRot: -0.03, headRot: 0 },
    { time: 0.75, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0.06, torsoRot: 0, headRot: 0 },
    { time: 1, leftArmRot: 0.6, rightArmRot: -0.6, leftLegRot: -0.5, rightLegRot: 0.5, torsoY: 0, torsoRot: 0.03, headRot: 0 },
  ],
  attack: [
    { time: 0, leftArmRot: 0, rightArmRot: -1.2, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0.15, headRot: 0, weaponRot: -1.2 },
    { time: 0.3, leftArmRot: 0.1, rightArmRot: -2.0, leftLegRot: -0.1, rightLegRot: 0.1, torsoY: 0, torsoRot: 0.2, headRot: -0.1, weaponRot: -2.0 },
    { time: 0.5, leftArmRot: -0.2, rightArmRot: 1.0, leftLegRot: 0.2, rightLegRot: -0.1, torsoY: -0.05, torsoRot: -0.3, headRot: -0.2, weaponRot: 1.0 },
    { time: 0.7, leftArmRot: -0.1, rightArmRot: 0.5, leftLegRot: 0.1, rightLegRot: 0, torsoY: 0, torsoRot: -0.1, headRot: -0.1, weaponRot: 0.5 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0, weaponRot: 0 },
  ],
  attack2: [
    { time: 0, leftArmRot: -0.3, rightArmRot: 0, leftLegRot: -0.2, rightLegRot: 0.2, torsoY: 0, torsoRot: -0.2, headRot: 0, weaponRot: 0 },
    { time: 0.2, leftArmRot: -1.8, rightArmRot: 0.3, leftLegRot: -0.3, rightLegRot: 0.3, torsoY: 0.05, torsoRot: -0.4, headRot: -0.15, weaponRot: -1.5 },
    { time: 0.4, leftArmRot: 0.8, rightArmRot: -0.5, leftLegRot: 0.3, rightLegRot: -0.2, torsoY: -0.08, torsoRot: 0.4, headRot: -0.2, weaponRot: 1.2 },
    { time: 0.6, leftArmRot: 1.2, rightArmRot: 0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.03, torsoRot: 0.15, headRot: -0.1, weaponRot: 0.6 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0, weaponRot: 0 },
  ],
  gather: [
    { time: 0, leftArmRot: 0.3, rightArmRot: -1.5, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0.1, headRot: -0.2, weaponRot: -1.5 },
    { time: 0.4, leftArmRot: 0.5, rightArmRot: 0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.08, torsoRot: -0.2, headRot: -0.3, weaponRot: 0.8 },
    { time: 0.7, leftArmRot: 0.3, rightArmRot: -0.5, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: -0.1, weaponRot: -0.5 },
    { time: 1, leftArmRot: 0.3, rightArmRot: -1.5, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0.1, headRot: -0.2, weaponRot: -1.5 },
  ],
  mining: [
    { time: 0, leftArmRot: 0.2, rightArmRot: -1.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.05, torsoRot: 0.15, headRot: -0.3, weaponRot: -1.8 },
    { time: 0.25, leftArmRot: 0.4, rightArmRot: -0.3, leftLegRot: 0.15, rightLegRot: -0.15, torsoY: -0.12, torsoRot: -0.1, headRot: -0.4, weaponRot: -0.3 },
    { time: 0.5, leftArmRot: 0.6, rightArmRot: 1.0, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.15, torsoRot: -0.25, headRot: -0.35, weaponRot: 1.0 },
    { time: 0.75, leftArmRot: 0.3, rightArmRot: -0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.08, torsoRot: 0.05, headRot: -0.3, weaponRot: -0.8 },
    { time: 1, leftArmRot: 0.2, rightArmRot: -1.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.05, torsoRot: 0.15, headRot: -0.3, weaponRot: -1.8 },
  ],
  building: [
    { time: 0, leftArmRot: -0.5, rightArmRot: -0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: 0, torsoRot: 0, headRot: -0.1, weaponRot: -0.8 },
    { time: 0.2, leftArmRot: -1.2, rightArmRot: -1.5, leftLegRot: 0, rightLegRot: 0, torsoY: 0.05, torsoRot: 0.1, headRot: -0.2, weaponRot: -1.5 },
    { time: 0.4, leftArmRot: -0.3, rightArmRot: 0.5, leftLegRot: 0.15, rightLegRot: -0.15, torsoY: -0.05, torsoRot: -0.15, headRot: -0.15, weaponRot: 0.5 },
    { time: 0.6, leftArmRot: -1.0, rightArmRot: -1.2, leftLegRot: 0, rightLegRot: 0, torsoY: 0.03, torsoRot: 0.05, headRot: -0.2, weaponRot: -1.2 },
    { time: 0.8, leftArmRot: -0.2, rightArmRot: 0.3, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.03, torsoRot: -0.1, headRot: -0.1, weaponRot: 0.3 },
    { time: 1, leftArmRot: -0.5, rightArmRot: -0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: 0, torsoRot: 0, headRot: -0.1, weaponRot: -0.8 },
  ],
  stunned: [
    { time: 0, leftArmRot: 0.8, rightArmRot: -0.8, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.1, torsoRot: 0.2, headRot: 0.5 },
    { time: 0.3, leftArmRot: -0.5, rightArmRot: 0.5, leftLegRot: -0.15, rightLegRot: 0.15, torsoY: -0.08, torsoRot: -0.25, headRot: -0.4 },
    { time: 0.6, leftArmRot: 0.6, rightArmRot: -0.6, leftLegRot: 0.18, rightLegRot: -0.18, torsoY: -0.12, torsoRot: 0.18, headRot: 0.35 },
    { time: 1, leftArmRot: 0.8, rightArmRot: -0.8, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.1, torsoRot: 0.2, headRot: 0.5 },
  ],
  hurt: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.15, leftArmRot: 0.6, rightArmRot: -0.4, leftLegRot: -0.1, rightLegRot: 0.1, torsoY: -0.08, torsoRot: 0.3, headRot: 0.4 },
    { time: 0.35, leftArmRot: 0.3, rightArmRot: -0.6, leftLegRot: 0.15, rightLegRot: -0.1, torsoY: -0.12, torsoRot: -0.2, headRot: -0.3 },
    { time: 0.6, leftArmRot: 0.15, rightArmRot: -0.2, leftLegRot: 0.05, rightLegRot: -0.05, torsoY: -0.04, torsoRot: 0.1, headRot: 0.1 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
  die: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.3, leftArmRot: 0.5, rightArmRot: -0.5, leftLegRot: 0, rightLegRot: 0, torsoY: -0.1, torsoRot: 0.3, headRot: 0.4 },
    { time: 0.6, leftArmRot: 1.2, rightArmRot: -1.0, leftLegRot: 0.3, rightLegRot: -0.2, torsoY: -0.3, torsoRot: 1.0, headRot: 0.6 },
    { time: 1, leftArmRot: 1.5, rightArmRot: -1.3, leftLegRot: 0.5, rightLegRot: -0.3, torsoY: -0.5, torsoRot: 1.5, headRot: 0.8 },
  ],
  cast: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.2, leftArmRot: -1.5, rightArmRot: -1.5, leftLegRot: 0, rightLegRot: 0, torsoY: 0.1, torsoRot: 0, headRot: -0.3 },
    { time: 0.5, leftArmRot: -2.0, rightArmRot: -2.0, leftLegRot: 0, rightLegRot: 0, torsoY: 0.15, torsoRot: 0, headRot: -0.5 },
    { time: 0.8, leftArmRot: -1.0, rightArmRot: -1.0, leftLegRot: 0, rightLegRot: 0, torsoY: 0.05, torsoRot: 0, headRot: -0.2 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
  special: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.15, leftArmRot: -2.2, rightArmRot: -2.2, leftLegRot: -0.3, rightLegRot: 0.3, torsoY: 0.2, torsoRot: 0.5, headRot: -0.6 },
    { time: 0.35, leftArmRot: -1.8, rightArmRot: -1.8, leftLegRot: 0, rightLegRot: 0, torsoY: 0.3, torsoRot: -0.3, headRot: -0.4 },
    { time: 0.55, leftArmRot: 1.5, rightArmRot: 1.5, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.1, torsoRot: 0, headRot: 0.2 },
    { time: 0.75, leftArmRot: 0.5, rightArmRot: 0.5, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: 0.05, torsoRot: 0.1, headRot: 0 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
};

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function dist2D(a: Vec3, b: Vec3): number { return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2); }
function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }

function sampleAnimation(keyframes: AnimKeyframe[], t: number): AnimKeyframe {
  const time = t % 1;
  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].time <= time) i++;
  if (i >= keyframes.length - 1) return keyframes[keyframes.length - 1];
  const a = keyframes[i], b = keyframes[i + 1];
  const segT = (time - a.time) / (b.time - a.time);
  const s = segT * segT * (3 - 2 * segT);
  return {
    time,
    leftArmRot: lerp(a.leftArmRot, b.leftArmRot, s),
    rightArmRot: lerp(a.rightArmRot, b.rightArmRot, s),
    leftLegRot: lerp(a.leftLegRot, b.leftLegRot, s),
    rightLegRot: lerp(a.rightLegRot, b.rightLegRot, s),
    torsoY: lerp(a.torsoY, b.torsoY, s),
    torsoRot: lerp(a.torsoRot, b.torsoRot, s),
    headRot: lerp(a.headRot, b.headRot, s),
    weaponRot: lerp(a.weaponRot ?? 0, b.weaponRot ?? 0, s),
  };
}

class NavGrid {
  blocked: boolean[][];
  w: number;
  h: number;
  constructor() {
    this.w = GRID_RES;
    this.h = GRID_RES;
    this.blocked = [];
    for (let x = 0; x < this.w; x++) {
      this.blocked[x] = [];
      for (let z = 0; z < this.h; z++) {
        this.blocked[x][z] = false;
      }
    }
  }
  worldToGrid(wx: number, wz: number): [number, number] {
    return [clamp(Math.floor(wx / CELL_SIZE), 0, this.w - 1), clamp(Math.floor(wz / CELL_SIZE), 0, this.h - 1)];
  }
  gridToWorld(gx: number, gz: number): Vec3 {
    return { x: (gx + 0.5) * CELL_SIZE, y: 0.5, z: (gz + 0.5) * CELL_SIZE };
  }
  markBuilding(wx: number, wz: number, size: number) {
    const [cx, cz] = this.worldToGrid(wx, wz);
    const r = Math.ceil(size / CELL_SIZE);
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        const nx = cx + dx, nz = cz + dz;
        if (nx >= 0 && nx < this.w && nz >= 0 && nz < this.h) {
          this.blocked[nx][nz] = true;
        }
      }
    }
  }
  clearAll() {
    for (let x = 0; x < this.w; x++) for (let z = 0; z < this.h; z++) this.blocked[x][z] = false;
  }
  findPath(start: Vec3, end: Vec3): Vec3[] {
    const [sx, sz] = this.worldToGrid(start.x, start.z);
    const [ex, ez] = this.worldToGrid(end.x, end.z);
    if (sx === ex && sz === ez) return [end];
    const open: PathNode[] = [];
    const closed = new Set<string>();
    const key = (x: number, z: number) => `${x},${z}`;
    const h = (x: number, z: number) => Math.abs(x - ex) + Math.abs(z - ez);
    open.push({ x: sx, z: sz, g: 0, h: h(sx, sz), f: h(sx, sz), parent: null });
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    let best: PathNode | null = null;
    let iterations = 0;
    while (open.length > 0 && iterations < 2000) {
      iterations++;
      let lowestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[lowestIdx].f) lowestIdx = i;
      }
      const current = open.splice(lowestIdx, 1)[0];
      if (current.x === ex && current.z === ez) { best = current; break; }
      closed.add(key(current.x, current.z));
      if (!best || current.h < best.h) best = current;
      for (const [dx, dz] of dirs) {
        const nx = current.x + dx, nz = current.z + dz;
        if (nx < 0 || nx >= this.w || nz < 0 || nz >= this.h) continue;
        if (this.blocked[nx][nz]) continue;
        if (closed.has(key(nx, nz))) continue;
        if (Math.abs(dx) + Math.abs(dz) === 2) {
          if (this.blocked[current.x + dx]?.[current.z] || this.blocked[current.x]?.[current.z + dz]) continue;
        }
        const moveCost = Math.abs(dx) + Math.abs(dz) === 2 ? 1.414 : 1;
        const ng = current.g + moveCost;
        const existing = open.find(n => n.x === nx && n.z === nz);
        if (existing) { if (ng < existing.g) { existing.g = ng; existing.f = ng + existing.h; existing.parent = current; } }
        else { const nh = h(nx, nz); open.push({ x: nx, z: nz, g: ng, h: nh, f: ng + nh, parent: current }); }
      }
    }
    if (!best) return [end];
    const path: Vec3[] = [];
    let node: PathNode | null = best;
    while (node) { path.unshift(this.gridToWorld(node.x, node.z)); node = node.parent; }
    if (path.length > 1) path.shift();
    path[path.length - 1] = { ...end, y: 0.5 };
    return this.smoothPath(path);
  }
  smoothPath(path: Vec3[]): Vec3[] {
    if (path.length <= 2) return path;
    const smoothed: Vec3[] = [path[0]];
    let i = 0;
    while (i < path.length - 1) {
      let furthest = i + 1;
      for (let j = path.length - 1; j > i + 1; j--) {
        if (this.hasLineOfSight(path[i], path[j])) { furthest = j; break; }
      }
      smoothed.push(path[furthest]);
      i = furthest;
    }
    return smoothed;
  }
  hasLineOfSight(a: Vec3, b: Vec3): boolean {
    const steps = Math.ceil(dist2D(a, b) / (CELL_SIZE * 0.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(steps, 1);
      const wx = lerp(a.x, b.x, t), wz = lerp(a.z, b.z, t);
      const [gx, gz] = this.worldToGrid(wx, wz);
      if (this.blocked[gx]?.[gz]) return false;
    }
    return true;
  }
}

function createTextCanvas(text: string, color: string, fontSize: number = 48): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, 128, 32);
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 32);
  return canvas;
}

const UNIT_COLORS: Record<Faction, { primary: number; secondary: number; skin: number; metal: number }> = {
  human: { primary: 0x2244aa, secondary: 0x3366cc, skin: 0xddb896, metal: 0x888888 },
  orc: { primary: 0x882222, secondary: 0xaa3333, skin: 0x5a8a3a, metal: 0x666655 },
  legion: { primary: 0x6622aa, secondary: 0x8833cc, skin: 0x8a5a8a, metal: 0x554466 },
};

function createArticulatedUnit(type: UnitType, faction: Faction, scene: THREE.Scene): ArticulatedModel {
  const colors = UNIT_COLORS[faction];
  const root = new THREE.Group();
  const scaleF = type === 'knight' || type === 'paladin' ? 1.2 : type === 'ballista' ? 1.3 : type === 'mage' ? 0.9 : 1.0;

  const torsoGeo = new THREE.BoxGeometry(0.4 * scaleF, 0.5 * scaleF, 0.25 * scaleF);
  const torsoMat = new THREE.MeshStandardMaterial({ color: colors.primary, metalness: 0.3, roughness: 0.7 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.7 * scaleF;
  torso.castShadow = true;
  root.add(torso);

  const headGeo = new THREE.SphereGeometry(0.14 * scaleF, 8, 8);
  const headMat = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.8 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.05 * scaleF;
  head.castShadow = true;
  root.add(head);

  if (type === 'mage') {
    const hatGeo = new THREE.ConeGeometry(0.15 * scaleF, 0.35 * scaleF, 6);
    const hatMat = new THREE.MeshStandardMaterial({ color: faction === 'legion' ? 0x660066 : 0x4422aa, roughness: 0.6 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.3 * scaleF;
    hat.castShadow = true;
    root.add(hat);
    if (faction === 'legion') {
      const hornGeo = new THREE.ConeGeometry(0.04 * scaleF, 0.2 * scaleF, 4);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x331111, metalness: 0.5 });
      const lh = new THREE.Mesh(hornGeo, hornMat); lh.position.set(-0.1 * scaleF, 1.2 * scaleF, 0); lh.rotation.z = 0.3; root.add(lh);
      const rh = new THREE.Mesh(hornGeo, hornMat); rh.position.set(0.1 * scaleF, 1.2 * scaleF, 0); rh.rotation.z = -0.3; root.add(rh);
    }
  }
  if (faction === 'legion' && type !== 'mage' && type !== 'ballista') {
    const hornGeo = new THREE.ConeGeometry(0.03 * scaleF, 0.15 * scaleF, 4);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x442222, metalness: 0.4 });
    const lh = new THREE.Mesh(hornGeo, hornMat); lh.position.set(-0.08 * scaleF, 1.15 * scaleF, 0); lh.rotation.z = 0.4; root.add(lh);
    const rh = new THREE.Mesh(hornGeo, hornMat); rh.position.set(0.08 * scaleF, 1.15 * scaleF, 0); rh.rotation.z = -0.4; root.add(rh);
  }

  const armGeo = new THREE.BoxGeometry(0.12 * scaleF, 0.4 * scaleF, 0.12 * scaleF);
  const armMat = new THREE.MeshStandardMaterial({ color: colors.secondary, roughness: 0.7 });

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.28 * scaleF, 0.85 * scaleF, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, armMat);
  leftArmMesh.position.y = -0.2 * scaleF;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.28 * scaleF, 0.85 * scaleF, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, armMat);
  rightArmMesh.position.y = -0.2 * scaleF;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  root.add(rightArm);

  const legGeo = new THREE.BoxGeometry(0.13 * scaleF, 0.35 * scaleF, 0.13 * scaleF);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.9 });

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.1 * scaleF, 0.4 * scaleF, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, legMat);
  leftLegMesh.position.y = -0.18 * scaleF;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.1 * scaleF, 0.4 * scaleF, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, legMat);
  rightLegMesh.position.y = -0.18 * scaleF;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);
  root.add(rightLeg);

  let weapon: THREE.Mesh | undefined;
  let shield: THREE.Mesh | undefined;
  let mount: THREE.Group | undefined;

  if (type === 'footman') {
    const swordGeo = new THREE.BoxGeometry(0.05, 0.55, 0.05);
    const swordMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    weapon = new THREE.Mesh(swordGeo, swordMat);
    weapon.position.y = -0.35;
    weapon.castShadow = true;
    rightArm.add(weapon);

    const shieldGeo = new THREE.BoxGeometry(0.04, 0.3, 0.25);
    const shieldMat = new THREE.MeshStandardMaterial({ color: colors.primary, metalness: 0.5, roughness: 0.4 });
    shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, -0.2, 0);
    shield.castShadow = true;
    leftArm.add(shield);
  } else if (type === 'archer') {
    const bowGeo = new THREE.TorusGeometry(0.2, 0.02, 4, 12, Math.PI);
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.8 });
    weapon = new THREE.Mesh(bowGeo, bowMat);
    weapon.position.set(0, -0.15, 0.1);
    weapon.rotation.z = Math.PI / 2;
    weapon.castShadow = true;
    leftArm.add(weapon);
  } else if (type === 'knight' || type === 'paladin') {
    const lanceGeo = new THREE.CylinderGeometry(0.03, 0.02, 1.2, 6);
    const lanceMat = new THREE.MeshStandardMaterial({ color: type === 'paladin' ? 0xffd700 : 0xaaaaaa, metalness: 0.7, roughness: 0.3 });
    weapon = new THREE.Mesh(lanceGeo, lanceMat);
    weapon.position.y = -0.4;
    weapon.castShadow = true;
    rightArm.add(weapon);

    mount = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.4, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    mount.add(body);
    const headGeoH = new THREE.BoxGeometry(0.2, 0.25, 0.3);
    const headH = new THREE.Mesh(headGeoH, bodyMat);
    headH.position.set(0, 0.15, 0.45);
    headH.castShadow = true;
    mount.add(headH);
    mount.position.y = 0.2;
    root.add(mount);
    torso.position.y += 0.4;
    head.position.y += 0.4;
    leftArm.position.y += 0.4;
    rightArm.position.y += 0.4;
    leftLeg.position.y += 0.2;
    rightLeg.position.y += 0.2;
  } else if (type === 'mage') {
    const staffGeo = new THREE.CylinderGeometry(0.025, 0.03, 1.0, 6);
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x4a2800, roughness: 0.8 });
    weapon = new THREE.Mesh(staffGeo, staffMat);
    weapon.position.y = -0.3;
    weapon.castShadow = true;
    rightArm.add(weapon);
    const orbGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const orbMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x2244aa, emissiveIntensity: 0.8, metalness: 0.2 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = -0.85;
    weapon.add(orb);
  } else if (type === 'peasant') {
    const pickGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    const pickMat = new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 0.9 });
    weapon = new THREE.Mesh(pickGeo, pickMat);
    weapon.position.y = -0.25;
    weapon.rotation.z = 0.3;
    weapon.castShadow = true;
    rightArm.add(weapon);
  } else if (type === 'ballista') {
    const baseGeo = new THREE.BoxGeometry(0.8, 0.15, 0.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    root.add(base);
    const boltGeo = new THREE.CylinderGeometry(0.03, 0.01, 1.0, 4);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 });
    weapon = new THREE.Mesh(boltGeo, boltMat);
    weapon.position.set(0, 0.5, 0.3);
    weapon.rotation.x = Math.PI / 2;
    weapon.castShadow = true;
    root.add(weapon);
    torso.visible = false;
    head.visible = false;
    leftArm.visible = false;
    rightArm.visible = false;
    leftLeg.visible = false;
    rightLeg.visible = false;
    const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0x3a2a10 }));
    wheel1.rotation.z = Math.PI / 2;
    wheel1.position.set(-0.45, 0.2, 0);
    root.add(wheel1);
    const wheel2 = wheel1.clone();
    wheel2.position.x = 0.45;
    root.add(wheel2);
  }

  root.castShadow = true;
  scene.add(root);

  return { root, torso, head, leftArm, rightArm, leftLeg, rightLeg, weapon, shield, mount };
}

function applyAnimation(model: ArticulatedModel, frame: AnimKeyframe, unitType: UnitType) {
  if (unitType === 'ballista') return;
  model.leftArm.rotation.x = frame.leftArmRot;
  model.rightArm.rotation.x = frame.rightArmRot;
  model.leftLeg.rotation.x = frame.leftLegRot;
  model.rightLeg.rotation.x = frame.rightLegRot;
  model.torso.position.y = (unitType === 'knight' || unitType === 'paladin' ? 1.1 : 0.7) + frame.torsoY;
  model.torso.rotation.z = frame.torsoRot;
  model.head.rotation.x = frame.headRot;
  if (model.weapon && frame.weaponRot !== undefined) {
    model.weapon.rotation.x = frame.weaponRot;
  }
}

function createBuildingMesh(type: BuildingType, faction: Faction, scene: THREE.Scene, isConstructing: boolean): THREE.Group {
  const group = new THREE.Group();
  const colors = faction === 'human'
    ? { wall: 0x6688aa, roof: 0x8b3333, trim: 0xaa8855, wood: 0x5a3a1a }
    : faction === 'orc'
    ? { wall: 0x5a4422, roof: 0x3a2a10, trim: 0x886633, wood: 0x3a2a10 }
    : { wall: 0x3a2244, roof: 0x220033, trim: 0x664488, wood: 0x2a1a2a };

  const s = type === 'townhall' ? 3 : type === 'farm' ? 2 : 2.5;
  const h = type === 'tower' ? 4 : type === 'townhall' ? 3.5 : type === 'church' ? 4 : 2.5;

  const wallGeo = new THREE.BoxGeometry(s, h, s);
  const wallMat = new THREE.MeshStandardMaterial({
    color: colors.wall, metalness: 0.1, roughness: 0.9,
    transparent: isConstructing, opacity: isConstructing ? 0.5 : 1,
  });
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = h / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  walls.userData = { isBuildingPart: true };
  group.add(walls);

  if (type === 'tower') {
    const roofGeo = new THREE.ConeGeometry(s * 0.7, 1.8, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.9;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    for (let i = 0; i < 4; i++) {
      const crenGeo = new THREE.BoxGeometry(0.25, 0.4, 0.25);
      const cren = new THREE.Mesh(crenGeo, new THREE.MeshStandardMaterial({ color: colors.wall }));
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      cren.position.set(Math.cos(angle) * s * 0.4, h + 0.1, Math.sin(angle) * s * 0.4);
      cren.castShadow = true;
      group.add(cren);
    }
  } else if (type === 'townhall') {
    const roofGeo = new THREE.ConeGeometry(s * 0.8, 2, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 1;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2, 4),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    flagPole.position.set(0, h + 2.5, 0);
    group.add(flagPole);
    const flagGeo = new THREE.PlaneGeometry(0.6, 0.35);
    const flagMat = new THREE.MeshStandardMaterial({
      color: faction === 'human' ? 0x2244aa : faction === 'orc' ? 0xaa2222 : 0x8833cc,
      side: THREE.DoubleSide,
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.3, h + 3.2, 0);
    group.add(flag);
    const doorGeo = new THREE.BoxGeometry(0.6, 1.2, 0.1);
    const door = new THREE.Mesh(doorGeo, new THREE.MeshStandardMaterial({ color: colors.wood }));
    door.position.set(0, 0.6, s / 2 + 0.05);
    group.add(door);
  } else if (type === 'barracks') {
    const roofGeo = new THREE.BoxGeometry(s + 0.3, 0.3, s + 0.3);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: colors.roof }));
    roof.position.y = h + 0.15;
    roof.castShadow = true;
    group.add(roof);
    const rackGeo = new THREE.BoxGeometry(0.1, 1.0, 0.5);
    const rack = new THREE.Mesh(rackGeo, new THREE.MeshStandardMaterial({ color: colors.wood }));
    rack.position.set(s / 2 + 0.1, 0.6, 0);
    group.add(rack);
  } else if (type === 'farm') {
    const roofGeo = new THREE.ConeGeometry(s * 0.8, 1.0, 4);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0xccaa44 }));
    roof.position.y = h + 0.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    for (let i = 0; i < 3; i++) {
      const wheatGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
      const wheat = new THREE.Mesh(wheatGeo, new THREE.MeshStandardMaterial({ color: 0xddcc55 }));
      wheat.position.set(s / 2 + 0.5 + i * 0.3, 0.25, 0);
      group.add(wheat);
    }
  } else if (type === 'church') {
    const spireGeo = new THREE.ConeGeometry(0.4, 2, 6);
    const spire = new THREE.Mesh(spireGeo, new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5 }));
    spire.position.y = h + 1;
    spire.castShadow = true;
    group.add(spire);
    const crossGeo = new THREE.BoxGeometry(0.4, 0.6, 0.08);
    const cross = new THREE.Mesh(crossGeo, new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 }));
    cross.position.y = h + 2.3;
    group.add(cross);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), cross.material);
    crossH.position.y = h + 2.5;
    crossH.rotation.z = Math.PI / 2;
    group.add(crossH);
  } else {
    const roofGeo = new THREE.BoxGeometry(s + 0.2, 0.2, s + 0.2);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: colors.roof }));
    roof.position.y = h + 0.1;
    roof.castShadow = true;
    group.add(roof);
  }

  if (type === 'blacksmith') {
    const chimneyGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const chimney = new THREE.Mesh(chimneyGeo, new THREE.MeshStandardMaterial({ color: 0x555555 }));
    chimney.position.set(s / 3, h + 0.75, -s / 3);
    chimney.castShadow = true;
    group.add(chimney);
    const anvilGeo = new THREE.BoxGeometry(0.4, 0.2, 0.3);
    const anvil = new THREE.Mesh(anvilGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 }));
    anvil.position.set(s / 2 + 0.5, 0.1, 0);
    group.add(anvil);
  }

  group.castShadow = true;
  scene.add(group);
  return group;
}

function createResourceMesh(type: ResourceType, scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  if (type === 'gold') {
    const baseGeo = new THREE.DodecahedronGeometry(0.8, 0);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, metalness: 0.9, roughness: 0.1,
      emissive: 0x553300, emissiveIntensity: 0.4,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.8;
    base.castShadow = true;
    group.add(base);
    for (let i = 0; i < 3; i++) {
      const nuggetGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2, 0);
      const nugget = new THREE.Mesh(nuggetGeo, baseMat.clone());
      const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
      nugget.position.set(Math.cos(angle) * 0.6, 0.3, Math.sin(angle) * 0.6);
      nugget.rotation.set(Math.random(), Math.random(), Math.random());
      nugget.castShadow = true;
      group.add(nugget);
    }
  } else {
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 2.2, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const r = 1.2 - i * 0.25;
      const h = 1.0 - i * 0.15;
      const leafGeo = new THREE.ConeGeometry(r, h, 7);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x1a6b1a + i * 0x050505 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = 2.2 + i * 0.6;
      leaf.castShadow = true;
      group.add(leaf);
    }
  }
  scene.add(group);
  return group;
}

export default function Wargus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const fogMeshRef = useRef<THREE.Mesh | null>(null);
  const placementPreviewRef = useRef<THREE.Mesh | null>(null);
  const navGridRef = useRef<NavGrid>(new NavGrid());

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [playerFaction, setPlayerFaction] = useState<Faction>('human');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameTime, setGameTime] = useState(0);

  const unitsRef = useRef<GameUnit[]>([]);
  const buildingsRef = useRef<GameBuilding[]>([]);
  const resourceNodesRef = useRef<ResourceNode[]>([]);
  const fogGridRef = useRef<FogCell[][]>([]);
  const unitGroupsRef = useRef<Record<number, string[]>>({});
  const particlesRef = useRef<Particle[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const cameraShakeRef = useRef<CameraShake>({ intensity: 0, duration: 0, elapsed: 0 });
  const makeAIState = useCallback((): AIState => ({
    phase: 'early',
    buildOrder: ['farm', 'barracks', 'lumbermill', 'farm', 'blacksmith', 'stable', 'farm', 'church', 'tower', 'farm'],
    buildIndex: 0,
    attackTimer: 35 + Math.random() * 20,
    scoutTimer: 15,
    expandTimer: 50,
    lastAttackSize: 4,
    aggression: 0.5,
    peasantTarget: 8,
    militaryTarget: 10,
  }), []);
  const aiStatesRef = useRef<Record<Faction, AIState>>({
    human: { phase: 'early', buildOrder: ['farm', 'barracks', 'lumbermill', 'farm', 'blacksmith', 'stable', 'farm', 'church', 'tower', 'farm'], buildIndex: 0, attackTimer: 45, scoutTimer: 20, expandTimer: 60, lastAttackSize: 4, aggression: 0.5, peasantTarget: 8, militaryTarget: 10 },
    orc: { phase: 'early', buildOrder: ['farm', 'barracks', 'lumbermill', 'farm', 'blacksmith', 'stable', 'farm', 'church', 'tower', 'farm'], buildIndex: 0, attackTimer: 45, scoutTimer: 20, expandTimer: 60, lastAttackSize: 4, aggression: 0.5, peasantTarget: 8, militaryTarget: 10 },
    legion: { phase: 'early', buildOrder: ['farm', 'barracks', 'lumbermill', 'farm', 'blacksmith', 'stable', 'farm', 'church', 'tower', 'farm'], buildIndex: 0, attackTimer: 45, scoutTimer: 20, expandTimer: 60, lastAttackSize: 4, aggression: 0.5, peasantTarget: 8, militaryTarget: 10 },
  });

  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [buildingToBuild, setBuildingToBuild] = useState<BuildingType | null>(null);
  const [currentCommand, setCurrentCommand] = useState<OrderType | null>(null);
  const [resources, setResources] = useState<Record<Faction, { gold: number; lumber: number }>>({
    human: { gold: 2000, lumber: 1000 },
    orc: { gold: 2000, lumber: 1000 },
    legion: { gold: 2000, lumber: 1000 }
  });
  const [food, setFood] = useState<Record<Faction, { used: number; max: number }>>({
    human: { used: 5, max: 9 },
    orc: { used: 5, max: 9 },
    legion: { used: 5, max: 9 }
  });
  const [victory, setVictory] = useState<'win' | 'lose' | null>(null);

  const [cameraPosition, setCameraPosition] = useState({ x: 10, z: 10 });
  const [cameraZoom, setCameraZoom] = useState(1);
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('default');
  const [dragSelect, setDragSelect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragSelectRef = useRef<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const dragJustEndedRef = useRef(false);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const pendingGameRef = useRef<{ mode: GameMode; faction: Faction } | null>(null);

  const triggerShake = useCallback((intensity: number, duration: number) => {
    cameraShakeRef.current = { intensity, duration, elapsed: 0 };
  }, []);

  const rebuildNavGrid = useCallback(() => {
    navGridRef.current.clearAll();
    buildingsRef.current.forEach(b => {
      const bs = b.type === 'townhall' ? 2 : b.type === 'farm' ? 1.5 : 1.8;
      navGridRef.current.markBuilding(b.position.x, b.position.z, bs);
    });
  }, []);

  const spawnParticle = useCallback((pos: Vec3, vel: Vec3, color: number, life: number, size: number, gravity: number = 9.8, fadeOut: boolean = true) => {
    if (!sceneRef.current) return;
    const geo = new THREE.SphereGeometry(size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, pos.y, pos.z);
    sceneRef.current.add(mesh);
    particlesRef.current.push({
      mesh, velocity: { ...vel }, life: 0, maxLife: life, gravity, fadeOut, scale: size,
      rotSpeed: { x: Math.random() * 5, y: Math.random() * 5, z: Math.random() * 5 }
    });
  }, []);

  const spawnBloodEffect = useCallback((pos: Vec3) => {
    for (let i = 0; i < 6; i++) {
      spawnParticle(
        { x: pos.x, y: pos.y + 0.5, z: pos.z },
        { x: (Math.random() - 0.5) * 3, y: Math.random() * 3 + 1, z: (Math.random() - 0.5) * 3 },
        0xcc0000, 0.6 + Math.random() * 0.3, 0.04 + Math.random() * 0.04, 12
      );
    }
  }, [spawnParticle]);

  const spawnMagicEffect = useCallback((pos: Vec3, color: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      spawnParticle(
        { x: pos.x + Math.cos(angle) * 0.5, y: pos.y + 0.3, z: pos.z + Math.sin(angle) * 0.5 },
        { x: Math.cos(angle) * 2, y: Math.random() * 3 + 1, z: Math.sin(angle) * 2 },
        color, 0.8 + Math.random() * 0.4, 0.06, 2, true
      );
    }
  }, [spawnParticle]);

  const spawnConstructionDust = useCallback((pos: Vec3) => {
    for (let i = 0; i < 4; i++) {
      spawnParticle(
        { x: pos.x + (Math.random() - 0.5) * 2, y: 0.2, z: pos.z + (Math.random() - 0.5) * 2 },
        { x: (Math.random() - 0.5) * 1, y: Math.random() * 1.5, z: (Math.random() - 0.5) * 1 },
        0xaa9977, 0.8, 0.08, 3, true
      );
    }
  }, [spawnParticle]);

  const spawnGatherSparkle = useCallback((pos: Vec3, type: ResourceType) => {
    const color = type === 'gold' ? 0xffd700 : 0x22cc22;
    for (let i = 0; i < 3; i++) {
      spawnParticle(
        { x: pos.x + (Math.random() - 0.5), y: pos.y + 0.5, z: pos.z + (Math.random() - 0.5) },
        { x: (Math.random() - 0.5) * 1, y: Math.random() * 2, z: (Math.random() - 0.5) * 1 },
        color, 0.5, 0.05, 5, true
      );
    }
  }, [spawnParticle]);

  const spawnExplosion = useCallback((pos: Vec3, size: number) => {
    for (let i = 0; i < 20; i++) {
      const color = [0xff4400, 0xff8800, 0xffcc00, 0xff2200][Math.floor(Math.random() * 4)];
      spawnParticle(
        { x: pos.x, y: pos.y + 0.5, z: pos.z },
        { x: (Math.random() - 0.5) * size * 4, y: Math.random() * size * 3, z: (Math.random() - 0.5) * size * 4 },
        color, 0.5 + Math.random() * 0.5, 0.05 + Math.random() * 0.08, 8, true
      );
    }
    triggerShake(0.3 * size, 0.3);
  }, [spawnParticle, triggerShake]);

  const spawnFireEffect = useCallback((pos: Vec3) => {
    for (let i = 0; i < 3; i++) {
      const color = [0xff4400, 0xff6600, 0xffaa00][Math.floor(Math.random() * 3)];
      spawnParticle(
        { x: pos.x + (Math.random() - 0.5) * 1.5, y: pos.y + Math.random(), z: pos.z + (Math.random() - 0.5) * 1.5 },
        { x: (Math.random() - 0.5) * 0.5, y: 2 + Math.random() * 2, z: (Math.random() - 0.5) * 0.5 },
        color, 0.4 + Math.random() * 0.3, 0.06 + Math.random() * 0.06, -0.5, true
      );
    }
  }, [spawnParticle]);

  const launchProjectile = useCallback((origin: Vec3, targetPos: Vec3, targetId: string, type: Projectile['type'], damage: number, aoe: number = 0) => {
    if (!sceneRef.current) return;
    const group = new THREE.Group();
    if (type === 'arrow') {
      const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
      const shaftMat = new THREE.MeshBasicMaterial({ color: 0x6b4226 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.rotation.x = Math.PI / 2;
      group.add(shaft);
      const tipGeo = new THREE.ConeGeometry(0.04, 0.1, 4);
      const tipMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.z = 0.3;
      group.add(tip);
    } else if (type === 'bolt') {
      const boltGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.8, 4);
      const boltMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.rotation.x = Math.PI / 2;
      group.add(bolt);
    } else if (type === 'fireball') {
      const fireGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const fireMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
      const fire = new THREE.Mesh(fireGeo, fireMat);
      group.add(fire);
      const glowGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.4 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      group.add(glow);
    } else if (type === 'holylight') {
      const lightGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff88 });
      const light = new THREE.Mesh(lightGeo, lightMat);
      group.add(light);
      const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.3 });
      group.add(new THREE.Mesh(glowGeo, glowMat));
    }
    group.position.set(origin.x, origin.y + 1, origin.z);
    sceneRef.current.add(group);
    projectilesRef.current.push({
      mesh: group, origin: { ...origin, y: origin.y + 1 }, target: { ...targetPos, y: targetPos.y + 0.5 },
      targetId, speed: type === 'bolt' ? 12 : type === 'fireball' ? 10 : type === 'holylight' ? 15 : 18,
      damage, aoe, progress: 0,
      arcHeight: type === 'bolt' ? 3 : type === 'fireball' ? 1 : type === 'arrow' ? 2 : 0.5,
      type,
    });
  }, []);

  const updateParticles = useCallback((dt: number) => {
    particlesRef.current = particlesRef.current.filter(p => {
      p.life += dt;
      if (p.life >= p.maxLife) {
        sceneRef.current?.remove(p.mesh);
        if (p.mesh instanceof THREE.Mesh) {
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
        }
        return false;
      }
      p.velocity.y -= p.gravity * dt;
      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.position.z += p.velocity.z * dt;
      if (p.mesh.position.y < 0.05) {
        p.mesh.position.y = 0.05;
        p.velocity.y *= -0.3;
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
      }
      p.mesh.rotation.x += p.rotSpeed.x * dt;
      p.mesh.rotation.y += p.rotSpeed.y * dt;
      if (p.fadeOut) {
        const progress = p.life / p.maxLife;
        if (p.mesh instanceof THREE.Mesh) {
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
        }
      }
      return true;
    });
  }, []);

  const updateProjectiles = useCallback((dt: number) => {
    projectilesRef.current = projectilesRef.current.filter(proj => {
      proj.progress += (proj.speed * dt) / dist2D(proj.origin, proj.target);
      if (proj.progress >= 1) {
        if (proj.type === 'fireball') {
          spawnExplosion(proj.target, 1.5);
          if (proj.aoe > 0) {
            unitsRef.current.forEach(u => {
              if (dist2D(u.position, proj.target) < proj.aoe) {
                u.health -= proj.damage * (1 - dist2D(u.position, proj.target) / proj.aoe);
                spawnBloodEffect(u.position);
              }
            });
          }
        } else if (proj.type === 'holylight') {
          spawnMagicEffect(proj.target, 0xffffaa);
          const target = unitsRef.current.find(u => u.id === proj.targetId);
          if (target) {
            target.health = Math.min(target.maxHealth, target.health + proj.damage);
          }
        } else {
          const target = unitsRef.current.find(u => u.id === proj.targetId) as (GameUnit | undefined);
          const targetB = !target ? buildingsRef.current.find(b => b.id === proj.targetId) : undefined;
          const hit = target || targetB;
          if (hit) {
            const armor = 'armor' in hit ? hit.armor : 0;
            hit.health -= Math.max(1, proj.damage - armor);
            spawnBloodEffect(hit.position);
          }
          if (proj.type === 'bolt') {
            spawnExplosion(proj.target, 0.5);
            triggerShake(0.15, 0.15);
          }
        }
        sceneRef.current?.remove(proj.mesh);
        return false;
      }
      const t = proj.progress;
      const x = lerp(proj.origin.x, proj.target.x, t);
      const z = lerp(proj.origin.z, proj.target.z, t);
      const baseY = lerp(proj.origin.y, proj.target.y, t);
      const arcY = proj.arcHeight * 4 * t * (1 - t);
      proj.mesh.position.set(x, baseY + arcY, z);
      const nextT = Math.min(t + 0.05, 1);
      const nx = lerp(proj.origin.x, proj.target.x, nextT);
      const nz = lerp(proj.origin.z, proj.target.z, nextT);
      const ny = lerp(proj.origin.y, proj.target.y, nextT) + proj.arcHeight * 4 * nextT * (1 - nextT);
      proj.mesh.lookAt(nx, ny, nz);
      if (proj.type === 'fireball') {
        spawnParticle(
          { x: proj.mesh.position.x, y: proj.mesh.position.y, z: proj.mesh.position.z },
          { x: (Math.random() - 0.5) * 1, y: Math.random() * 0.5, z: (Math.random() - 0.5) * 1 },
          0xff6600, 0.2, 0.04, 2, true
        );
      }
      return true;
    });
  }, [spawnExplosion, spawnBloodEffect, spawnMagicEffect, spawnParticle, triggerShake]);

  const initFogGrid = useCallback(() => {
    const grid: FogCell[][] = [];
    for (let x = 0; x < FOG_GRID_SIZE; x++) {
      grid[x] = [];
      for (let z = 0; z < FOG_GRID_SIZE; z++) {
        grid[x][z] = { explored: false, visible: false };
      }
    }
    fogGridRef.current = grid;
  }, []);

  const updateFogMesh = useCallback(() => {
    if (!fogMeshRef.current) return;
    const geometry = fogMeshRef.current.geometry as THREE.PlaneGeometry;
    const colors = geometry.attributes.color;
    for (let i = 0; i < FOG_GRID_SIZE; i++) {
      for (let j = 0; j < FOG_GRID_SIZE; j++) {
        const idx = i * FOG_GRID_SIZE + j;
        const cell = fogGridRef.current[i]?.[j];
        if (cell) {
          const alpha = cell.visible ? 0 : cell.explored ? 0.5 : 1;
          colors.setXYZ(idx, alpha, alpha, alpha);
        }
      }
    }
    colors.needsUpdate = true;
  }, []);

  const updateFogOfWar = useCallback(() => {
    const grid = fogGridRef.current;
    for (let x = 0; x < FOG_GRID_SIZE; x++) for (let z = 0; z < FOG_GRID_SIZE; z++) grid[x][z].visible = false;
    const revealArea = (wx: number, wz: number, range: number) => {
      const cellX = Math.floor((wx / MAP_SIZE) * FOG_GRID_SIZE);
      const cellZ = Math.floor((wz / MAP_SIZE) * FOG_GRID_SIZE);
      const cellRange = Math.ceil((range / MAP_SIZE) * FOG_GRID_SIZE);
      for (let dx = -cellRange; dx <= cellRange; dx++) {
        for (let dz = -cellRange; dz <= cellRange; dz++) {
          const nx = cellX + dx, nz = cellZ + dz;
          if (nx >= 0 && nx < FOG_GRID_SIZE && nz >= 0 && nz < FOG_GRID_SIZE && dx * dx + dz * dz <= cellRange * cellRange) {
            grid[nx][nz].explored = true;
            grid[nx][nz].visible = true;
          }
        }
      }
    };
    unitsRef.current.filter(u => u.faction === playerFaction && !u.isDead).forEach(u => revealArea(u.position.x, u.position.z, VISION_RANGE));
    buildingsRef.current.filter(b => b.faction === playerFaction).forEach(b => revealArea(b.position.x, b.position.z, VISION_RANGE + 2));
    unitsRef.current.forEach(unit => {
      if (unit.faction !== playerFaction) {
        const cellX = Math.floor((unit.position.x / MAP_SIZE) * FOG_GRID_SIZE);
        const cellZ = Math.floor((unit.position.z / MAP_SIZE) * FOG_GRID_SIZE);
        if (cellX >= 0 && cellX < FOG_GRID_SIZE && cellZ >= 0 && cellZ < FOG_GRID_SIZE) {
          unit.isVisible = grid[cellX][cellZ].visible;
          if (unit.isVisible) unit.lastSeenPosition = { ...unit.position };
        }
        if (unit.model) unit.model.root.visible = unit.isVisible;
        if (unit.selectionRing) unit.selectionRing.visible = unit.isVisible && unit.isSelected;
        if (unit.healthBar) unit.healthBar.visible = unit.isVisible && !unit.isDead;
      }
    });
    buildingsRef.current.forEach(building => {
      if (building.faction !== playerFaction) {
        const cellX = Math.floor((building.position.x / MAP_SIZE) * FOG_GRID_SIZE);
        const cellZ = Math.floor((building.position.z / MAP_SIZE) * FOG_GRID_SIZE);
        if (cellX >= 0 && cellX < FOG_GRID_SIZE && cellZ >= 0 && cellZ < FOG_GRID_SIZE) {
          building.isVisible = grid[cellX][cellZ].visible || grid[cellX][cellZ].explored;
        }
        if (building.mesh) building.mesh.visible = building.isVisible;
        if (building.healthBar) building.healthBar.visible = building.isVisible && grid[cellX]?.[cellZ]?.visible;
      }
    });
    updateFogMesh();
  }, [playerFaction, updateFogMesh]);

  const renderMinimap = useCallback(() => {
    const canvas = minimapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / MAP_SIZE;
    for (let x = 0; x < FOG_GRID_SIZE; x++) {
      for (let z = 0; z < FOG_GRID_SIZE; z++) {
        const cell = fogGridRef.current[x]?.[z];
        if (cell && cell.explored) {
          const wx = (x / FOG_GRID_SIZE) * canvas.width;
          const wz = (z / FOG_GRID_SIZE) * canvas.height;
          const cellSize = canvas.width / FOG_GRID_SIZE;
          ctx.fillStyle = cell.visible ? '#2d5016' : '#1a3009';
          ctx.fillRect(wx, wz, cellSize + 1, cellSize + 1);
        }
      }
    }
    resourceNodesRef.current.forEach(r => {
      const x = r.position.x * scale, z = r.position.z * scale;
      const cellX = Math.floor((r.position.x / MAP_SIZE) * FOG_GRID_SIZE);
      const cellZ = Math.floor((r.position.z / MAP_SIZE) * FOG_GRID_SIZE);
      if (fogGridRef.current[cellX]?.[cellZ]?.explored) {
        ctx.fillStyle = r.type === 'gold' ? '#ffd700' : '#228b22';
        ctx.beginPath(); ctx.arc(x, z, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
    buildingsRef.current.forEach(b => {
      if (b.faction === playerFaction || b.isVisible) {
        ctx.fillStyle = b.faction === 'human' ? '#4169e1' : '#dc143c';
        const s = b.type === 'townhall' ? 6 : 4;
        ctx.fillRect(b.position.x * scale - s / 2, b.position.z * scale - s / 2, s, s);
      }
    });
    unitsRef.current.forEach(u => {
      if ((u.faction === playerFaction || u.isVisible) && !u.isDead) {
        ctx.fillStyle = u.isSelected ? '#00ff00' : u.faction === 'human' ? '#6495ed' : '#ff6347';
        ctx.beginPath(); ctx.arc(u.position.x * scale, u.position.z * scale, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const viewW = (20 / cameraZoom) * scale, viewH = (15 / cameraZoom) * scale;
    ctx.strokeRect(cameraPosition.x * scale - viewW / 2, cameraPosition.z * scale - viewH / 2, viewW, viewH);
  }, [cameraPosition, cameraZoom, playerFaction]);

  const createUnit = useCallback((type: UnitType, faction: Faction, x: number, z: number): GameUnit => {
    const stats = UNIT_STATS[type];
    const unit: GameUnit = {
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, faction,
      position: { x, y: 0, z },
      targetPosition: null,
      health: stats.health, maxHealth: stats.health,
      damage: stats.damage, armor: stats.armor, range: stats.range, speed: stats.speed,
      isSelected: false, currentOrder: null, attackTarget: null, repairTarget: null,
      patrolStart: null, patrolEnd: null, carryingResource: null, gatherTarget: null,
      lastGatherTarget: null, groupNumber: null, isVisible: true, lastSeenPosition: null,
      animState: 'idle', animTime: 0, attackCooldown: 0,
      path: [], pathIndex: 0,
      mana: stats.mana, maxMana: stats.mana,
      facing: 0, deathTime: 0, isDead: false,
    };
    if (sceneRef.current) {
      unit.model = createArticulatedUnit(type, faction, sceneRef.current);
      unit.model.root.position.set(x, 0, z);
      unit.model.root.userData = { unitId: unit.id };
      unit.model.torso.userData = { unitId: unit.id };
      unit.model.head.userData = { unitId: unit.id };

      const size = type === 'knight' || type === 'paladin' ? 0.7 : type === 'ballista' ? 0.8 : 0.5;
      const ringGeo = new THREE.RingGeometry(size * 0.8, size * 1.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: faction === 'human' ? 0x00ff00 : 0xff4444, side: THREE.DoubleSide, transparent: true, opacity: 0 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.05, z);
      sceneRef.current.add(ring);
      unit.selectionRing = ring;

      const hbGroup = new THREE.Group();
      const bgGeo = new THREE.PlaneGeometry(0.8, 0.12);
      const bg = new THREE.Mesh(bgGeo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
      hbGroup.add(bg);
      const fgGeo = new THREE.PlaneGeometry(0.75, 0.08);
      const fg = new THREE.Mesh(fgGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }));
      fg.position.z = 0.01;
      fg.name = 'healthFill';
      hbGroup.add(fg);
      if (stats.mana > 0) {
        const mBg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.08), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
        mBg.position.y = -0.12;
        hbGroup.add(mBg);
        const mFg = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.05), new THREE.MeshBasicMaterial({ color: 0x4488ff, side: THREE.DoubleSide }));
        mFg.position.set(0, -0.12, 0.01);
        mFg.name = 'manaFill';
        hbGroup.add(mFg);
      }
      const topY = type === 'knight' || type === 'paladin' ? 2.2 : type === 'ballista' ? 1.2 : 1.5;
      hbGroup.position.set(x, topY, z);
      hbGroup.rotation.x = -Math.PI / 4;
      sceneRef.current.add(hbGroup);
      unit.healthBar = hbGroup;
    }
    return unit;
  }, []);

  const createBuilding = useCallback((type: BuildingType, faction: Faction, x: number, z: number, isConstructing: boolean = false): GameBuilding => {
    const stats = BUILDING_STATS[type];
    const building: GameBuilding = {
      id: `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, faction,
      position: { x, y: 0, z },
      health: isConstructing ? stats.health * 0.1 : stats.health,
      maxHealth: stats.health,
      isConstructing, constructionProgress: isConstructing ? 0 : 100,
      productionQueue: [], productionProgress: 0,
      rallyPoint: null, isVisible: true,
      onFire: false, fireParticleTimer: 0,
    };
    if (sceneRef.current) {
      building.mesh = createBuildingMesh(type, faction, sceneRef.current, isConstructing);
      building.mesh.position.set(x, 0, z);
      building.mesh.userData = { buildingId: building.id };
      building.mesh.traverse(child => { if (child instanceof THREE.Mesh) child.userData.buildingId = building.id; });

      const s = type === 'townhall' ? 3 : type === 'farm' ? 2 : 2.5;
      const h = type === 'tower' ? 4 : type === 'townhall' ? 3.5 : type === 'church' ? 4 : 2.5;
      const hbGroup = new THREE.Group();
      const bgGeo = new THREE.PlaneGeometry(s, 0.25);
      hbGroup.add(new THREE.Mesh(bgGeo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })));
      const fgGeo = new THREE.PlaneGeometry(s * 0.95, 0.18);
      const fg = new THREE.Mesh(fgGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }));
      fg.position.z = 0.01;
      fg.name = 'healthFill';
      hbGroup.add(fg);
      hbGroup.position.set(x, h + 2.5, z);
      hbGroup.rotation.x = -Math.PI / 4;
      sceneRef.current.add(hbGroup);
      building.healthBar = hbGroup;

      const bs = type === 'townhall' ? 2 : type === 'farm' ? 1.5 : 1.8;
      navGridRef.current.markBuilding(x, z, bs);
    }
    return building;
  }, []);

  const createResourceNode = useCallback((type: ResourceType, x: number, z: number, amount: number): ResourceNode => {
    const node: ResourceNode = {
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, position: { x, y: 0, z }, amount,
    };
    if (sceneRef.current) {
      node.mesh = createResourceMesh(type, sceneRef.current);
      node.mesh.position.set(x, 0, z);
      node.mesh.userData = { resourceId: node.id };
      node.mesh.traverse(child => { if (child instanceof THREE.Mesh) child.userData.resourceId = node.id; });
    }
    return node;
  }, []);

  const spawnFloatingText = useCallback((text: string, x: number, y: number, z: number, color: string) => {
    if (!sceneRef.current) return;
    const canvas = createTextCanvas(text, color);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(2, 0.5, 1);
    sceneRef.current.add(sprite);
    floatingTextsRef.current.push({ sprite, startY: y, life: 0, maxLife: 1.5 });
  }, []);

  const updateFloatingTexts = useCallback((dt: number) => {
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => {
      ft.life += dt;
      const progress = ft.life / ft.maxLife;
      ft.sprite.position.y = ft.startY + progress * 3;
      (ft.sprite.material as THREE.SpriteMaterial).opacity = 1 - progress;
      if (ft.life >= ft.maxLife) {
        sceneRef.current?.remove(ft.sprite);
        ft.sprite.material.dispose();
        return false;
      }
      return true;
    });
  }, []);

  const [webglError, setWebglError] = useState(false);

  const initializeScene = useCallback(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 40, 120);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 200);
    camera.position.set(10, 25, 35);
    camera.lookAt(10, 0, 10);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
    catch { setWebglError(true); return; }
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffcc, 1.2);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);
    const hemiLight = new THREE.HemisphereLight(0x8888cc, 0x443322, 0.3);
    scene.add(hemiLight);

    const groundRes = 128;
    const groundGeometry = new THREE.PlaneGeometry(MAP_SIZE + 16, MAP_SIZE + 16, groundRes, groundRes);
    const vertices = groundGeometry.attributes.position.array as Float32Array;
    const groundColors = new Float32Array((groundRes + 1) * (groundRes + 1) * 3);
    for (let i = 0; i <= groundRes; i++) {
      for (let j = 0; j <= groundRes; j++) {
        const idx = (i * (groundRes + 1) + j);
        const vIdx = idx * 3;
        const wx = (j / groundRes) * (MAP_SIZE + 16) - 8;
        const wz = (i / groundRes) * (MAP_SIZE + 16) - 8;
        const borderDist = Math.min(wx, wz, MAP_SIZE - wx, MAP_SIZE - wz);
        let height = 0;
        if (borderDist < 0) height = 3 + Math.abs(borderDist) * 1.2 + Math.random() * 0.5;
        else if (borderDist < 3) { const t = 1 - borderDist / 3; height = t * t * 3 + Math.random() * 0.3; }
        else { height = Math.random() * 0.15; const cx = MAP_SIZE / 2, cz = MAP_SIZE / 2; if (Math.sqrt((wx - cx) ** 2 + (wz - cz) ** 2) < 10) height = -0.1; }
        vertices[vIdx + 2] = height;
        let r: number, g: number, b: number;
        if (borderDist < 0) { r = 0.42; g = 0.42; b = 0.42; }
        else if (borderDist < 2) { const t = borderDist / 2; r = lerp(0.42, 0.36, t); g = lerp(0.42, 0.30, t); b = lerp(0.42, 0.18, t); }
        else if (borderDist < 5) { r = 0.36; g = 0.30; b = 0.18; }
        else { r = 0.24 + Math.random() * 0.06; g = 0.36 + Math.random() * 0.06; b = 0.18 + Math.random() * 0.04; if (Math.sqrt((wx - MAP_SIZE / 2) ** 2 + (wz - MAP_SIZE / 2) ** 2) < 10) { r = 0.75; g = 0.66; b = 0.40; } }
        groundColors[vIdx] = r; groundColors[vIdx + 1] = g; groundColors[vIdx + 2] = b;
      }
    }
    groundGeometry.setAttribute('color', new THREE.BufferAttribute(groundColors, 3));
    groundGeometry.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(MAP_SIZE / 2, 0, MAP_SIZE / 2);
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    const waterGeo = new THREE.PlaneGeometry(14, 10, 16, 16);
    const wv = waterGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < wv.length; i += 3) wv[i + 2] = Math.sin(wv[i] * 0.5) * 0.05;
    const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x1e5d8b, transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.7 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(MAP_SIZE / 2, 0.05, MAP_SIZE / 2);
    scene.add(water);

    const streamPoints = [
      { x: MAP_SIZE * 0.3, z: 0 }, { x: MAP_SIZE * 0.35, z: MAP_SIZE * 0.25 },
      { x: MAP_SIZE * 0.4, z: MAP_SIZE * 0.5 }, { x: MAP_SIZE * 0.45, z: MAP_SIZE * 0.75 },
      { x: MAP_SIZE * 0.5, z: MAP_SIZE },
    ];
    for (let i = 0; i < streamPoints.length - 1; i++) {
      const sp = streamPoints[i]; const ep = streamPoints[i + 1];
      const dx = ep.x - sp.x; const dz = ep.z - sp.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const streamGeo = new THREE.PlaneGeometry(3, len);
      const streamMesh = new THREE.Mesh(streamGeo, new THREE.MeshStandardMaterial({ color: 0x1a6090, transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.5 }));
      streamMesh.rotation.x = -Math.PI / 2;
      streamMesh.rotation.z = Math.atan2(dx, dz);
      streamMesh.position.set((sp.x + ep.x) / 2, 0.03, (sp.z + ep.z) / 2);
      scene.add(streamMesh);
    }

    for (let i = 0; i < 15; i++) {
      const side = Math.floor(Math.random() * 4);
      let rx: number, rz: number;
      if (side === 0) { rx = Math.random() * MAP_SIZE; rz = -4 * Math.random(); }
      else if (side === 1) { rx = Math.random() * MAP_SIZE; rz = MAP_SIZE + 4 * Math.random(); }
      else if (side === 2) { rx = -4 * Math.random(); rz = Math.random() * MAP_SIZE; }
      else { rx = MAP_SIZE + 4 * Math.random(); rz = Math.random() * MAP_SIZE; }
      const rs = 0.5 + Math.random() * 1.5;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), new THREE.MeshStandardMaterial({ color: 0x555555 + Math.floor(Math.random() * 0x222222), roughness: 0.9 }));
      rock.position.set(rx, rs * 0.4 + 2, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      scene.add(rock);
    }

    const cliffPositions = [
      { x: MAP_SIZE * 0.5, z: MAP_SIZE * 0.15, rot: 0.3 },
      { x: MAP_SIZE * 0.15, z: MAP_SIZE * 0.5, rot: 1.2 },
      { x: MAP_SIZE * 0.75, z: MAP_SIZE * 0.6, rot: 2.1 },
    ];
    cliffPositions.forEach(cp => {
      for (let j = 0; j < 4; j++) {
        const rs = 1.2 + Math.random() * 1.0;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 1), new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.95 }));
        rock.position.set(cp.x + (j - 1.5) * 2.5, rs * 0.5, cp.z + Math.sin(j) * 1.5);
        rock.rotation.set(Math.random() * 0.3, cp.rot, Math.random() * 0.3);
        rock.castShadow = true;
        scene.add(rock);
      }
    });

    for (let i = 0; i < 60; i++) {
      const x = 5 + Math.random() * (MAP_SIZE - 10);
      const z = 5 + Math.random() * (MAP_SIZE - 10);
      if (Math.sqrt((x - MAP_SIZE / 2) ** 2 + (z - MAP_SIZE / 2) ** 2) < 10) continue;
      const grassGeo = new THREE.PlaneGeometry(0.15 + Math.random() * 0.1, 0.25 + Math.random() * 0.2);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x2d6b1a + Math.floor(Math.random() * 0x111111), side: THREE.DoubleSide });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.set(x, 0.15, z);
      grass.rotation.y = Math.random() * Math.PI;
      scene.add(grass);
    }

    for (let i = 0; i < 8; i++) {
      const fx = 8 + Math.random() * (MAP_SIZE - 16);
      const fz = 8 + Math.random() * (MAP_SIZE - 16);
      if (Math.sqrt((fx - MAP_SIZE / 2) ** 2 + (fz - MAP_SIZE / 2) ** 2) < 12) continue;
      const flowerGeo = new THREE.SphereGeometry(0.08, 4, 4);
      const flowerColors = [0xff4488, 0xffaa22, 0xff2266, 0xaaff44, 0x44aaff];
      const flower = new THREE.Mesh(flowerGeo, new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length] }));
      flower.position.set(fx, 0.08, fz);
      scene.add(flower);
    }

    const fogGeometry = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, FOG_GRID_SIZE - 1, FOG_GRID_SIZE - 1);
    const fogColors = new Float32Array(FOG_GRID_SIZE * FOG_GRID_SIZE * 3);
    for (let i = 0; i < fogColors.length; i += 3) { fogColors[i] = 1; fogColors[i + 1] = 1; fogColors[i + 2] = 1; }
    fogGeometry.setAttribute('color', new THREE.BufferAttribute(fogColors, 3));
    const fogMesh = new THREE.Mesh(fogGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7, vertexColors: true }));
    fogMesh.rotation.x = -Math.PI / 2;
    fogMesh.position.set(MAP_SIZE / 2, 0.5, MAP_SIZE / 2);
    scene.add(fogMesh);
    fogMeshRef.current = fogMesh;

    const previewMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2, 2.5),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, wireframe: true })
    );
    previewMesh.visible = false;
    scene.add(previewMesh);
    placementPreviewRef.current = previewMesh;

    initFogGrid();
    navGridRef.current = new NavGrid();
    isInitializedRef.current = true;
  }, [initFogGrid]);

  const initializeGameEntities = useCallback((faction: Faction, mode: GameMode) => {
    if (!sceneRef.current) return;
    navGridRef.current.clearAll();
    const newUnits: GameUnit[] = [];
    const newBuildings: GameBuilding[] = [];
    const newResources: ResourceNode[] = [];

    const startPositions: Record<Faction, { x: number; z: number }> = {
      human: { x: 8, z: 8 },
      orc: { x: MAP_SIZE - 12, z: MAP_SIZE - 12 },
      legion: { x: MAP_SIZE - 12, z: 12 },
    };
    const playerStartX = startPositions[faction].x;
    const playerStartZ = startPositions[faction].z;

    newBuildings.push(createBuilding('townhall', faction, playerStartX, playerStartZ, false));
    newBuildings.push(createBuilding('farm', faction, playerStartX + 6, playerStartZ - 4, false));
    for (let i = 0; i < 5; i++) {
      newUnits.push(createUnit('peasant', faction, playerStartX + 4 + (i % 3) * 1.5, playerStartZ + Math.floor(i / 3) * 1.5));
    }

    if (mode === 'pve' || mode === 'pvp') {
      const allFactions: Faction[] = ['human', 'orc', 'legion'];
      const enemyFactions = allFactions.filter(f => f !== faction);
      enemyFactions.forEach((enemyFaction, fi) => {
        const corners = [
          { x: MAP_SIZE - 12, z: MAP_SIZE - 12 },
          { x: MAP_SIZE - 12, z: 12 },
          { x: 12, z: MAP_SIZE - 12 },
        ];
        const corner = corners[fi % corners.length];
        if (Math.abs(corner.x - playerStartX) < 10 && Math.abs(corner.z - playerStartZ) < 10) {
          corner.x = corners[(fi + 1) % corners.length].x;
          corner.z = corners[(fi + 1) % corners.length].z;
        }
        newBuildings.push(createBuilding('townhall', enemyFaction, corner.x, corner.z, false));
        newBuildings.push(createBuilding('barracks', enemyFaction, corner.x - 6, corner.z, false));
        newBuildings.push(createBuilding('farm', enemyFaction, corner.x + 6, corner.z - 4, false));
        newBuildings.push(createBuilding('farm', enemyFaction, corner.x + 6, corner.z + 4, false));
        for (let i = 0; i < 5; i++) {
          newUnits.push(createUnit('peasant', enemyFaction, corner.x + 4 + (i % 3) * 1.5, corner.z + Math.floor(i / 3) * 1.5));
        }
        for (let i = 0; i < 3; i++) {
          newUnits.push(createUnit('footman', enemyFaction, corner.x - 3 + i * 1.5, corner.z + 5));
        }
        newResources.push(createResourceNode('gold', corner.x + 8, corner.z - 6, 10000));
        for (let i = 0; i < 10; i++) {
          newResources.push(createResourceNode('lumber', corner.x - 7 - (i % 5) * 2, corner.z + Math.floor(i / 5) * 2.5, 100));
        }
      });
    }

    newResources.push(createResourceNode('gold', playerStartX + 8, playerStartZ - 6, 10000));
    newResources.push(createResourceNode('gold', MAP_SIZE / 2 + 10, MAP_SIZE / 2, 5000));
    newResources.push(createResourceNode('gold', MAP_SIZE / 2 - 10, MAP_SIZE / 2, 5000));
    newResources.push(createResourceNode('gold', MAP_SIZE / 2, MAP_SIZE / 2 + 12, 5000));

    for (let i = 0; i < 10; i++) {
      newResources.push(createResourceNode('lumber', playerStartX + 11 + (i % 5) * 2, playerStartZ + Math.floor(i / 5) * 2.5, 100));
    }
    for (let i = 0; i < 40; i++) {
      const x = 8 + Math.random() * (MAP_SIZE - 16);
      const z = 8 + Math.random() * (MAP_SIZE - 16);
      const tooCloseToBase = buildingsRef.current.some(b => Math.abs(b.position.x - x) < 10 && Math.abs(b.position.z - z) < 10);
      if (!tooCloseToBase) {
        newResources.push(createResourceNode('lumber', x, z, 100));
      }
    }

    unitsRef.current = newUnits;
    buildingsRef.current = newBuildings;
    resourceNodesRef.current = newResources;

    setResources({ human: { gold: 2000, lumber: 1000 }, orc: { gold: 2000, lumber: 1000 }, legion: { gold: 2000, lumber: 1000 } });
    setFood({ human: { used: 5, max: 9 }, orc: { used: 5, max: 13 }, legion: { used: 5, max: 13 } });
    setVictory(null);
    setCameraPosition({ x: playerStartX, z: playerStartZ });

    aiStatesRef.current = {
      human: makeAIState(),
      orc: makeAIState(),
      legion: makeAIState(),
    };
  }, [createUnit, createBuilding, createResourceNode, makeAIState]);

  const startGame = useCallback((mode: GameMode, faction: Faction) => {
    setGameMode(mode);
    setPlayerFaction(faction);
    setIsPaused(false);
    setGameTime(0);
    setSelectedUnits([]);
    setSelectedBuilding(null);
    setBuildingToBuild(null);
    setCurrentCommand(null);
    setShowBuildMenu(false);

    if (sceneRef.current) {
      unitsRef.current.forEach(u => {
        if (u.model) sceneRef.current?.remove(u.model.root);
        if (u.selectionRing) sceneRef.current?.remove(u.selectionRing);
        if (u.healthBar) sceneRef.current?.remove(u.healthBar);
      });
      buildingsRef.current.forEach(b => {
        if (b.mesh) sceneRef.current?.remove(b.mesh);
        if (b.healthBar) sceneRef.current?.remove(b.healthBar);
      });
      resourceNodesRef.current.forEach(r => { if (r.mesh) sceneRef.current?.remove(r.mesh); });
      floatingTextsRef.current.forEach(ft => { sceneRef.current?.remove(ft.sprite); ft.sprite.material.dispose(); });
      particlesRef.current.forEach(p => { sceneRef.current?.remove(p.mesh); });
      projectilesRef.current.forEach(p => { sceneRef.current?.remove(p.mesh); });
      floatingTextsRef.current = [];
      particlesRef.current = [];
      projectilesRef.current = [];
    }
    unitsRef.current = [];
    buildingsRef.current = [];
    resourceNodesRef.current = [];
    initFogGrid();
    updateFogMesh();
    unitGroupsRef.current = {};

    if (isInitializedRef.current && sceneRef.current) {
      initializeGameEntities(faction, mode);
    } else {
      pendingGameRef.current = { mode, faction };
    }
  }, [initFogGrid, initializeGameEntities, updateFogMesh]);

  const issueOrder = useCallback((order: OrderType, targetX?: number, targetZ?: number, targetId?: string) => {
    if (selectedUnits.length === 0) return;
    const nav = navGridRef.current;
    unitsRef.current = unitsRef.current.map((unit, idx) => {
      if (!selectedUnits.includes(unit.id) || unit.isDead) return unit;
      const offsetX = (idx % 3) * 1.5;
      const offsetZ = Math.floor(idx / 3) * 1.5;
      const dest = targetX !== undefined ? { x: targetX + offsetX, y: 0.5, z: (targetZ || 0) + offsetZ } : null;
      const computedPath = dest ? nav.findPath(unit.position, dest) : [];
      switch (order) {
        case 'move':
          return { ...unit, currentOrder: order, targetPosition: dest, attackTarget: null, gatherTarget: null, lastGatherTarget: null, patrolStart: null, patrolEnd: null, path: computedPath, pathIndex: 0 };
        case 'attack':
          return { ...unit, currentOrder: order, attackTarget: targetId || null, targetPosition: targetX !== undefined ? { x: targetX, y: 0.5, z: targetZ || 0 } : null, gatherTarget: null, lastGatherTarget: null, path: computedPath, pathIndex: 0 };
        case 'attackmove':
          return { ...unit, currentOrder: order, targetPosition: dest, attackTarget: null, gatherTarget: null, lastGatherTarget: null, path: computedPath, pathIndex: 0 };
        case 'patrol':
          return { ...unit, currentOrder: order, patrolStart: { ...unit.position }, patrolEnd: dest, targetPosition: dest, attackTarget: null, gatherTarget: null, lastGatherTarget: null, path: computedPath, pathIndex: 0 };
        case 'repair':
          if (unit.type === 'peasant' && targetId) {
            const tb = buildingsRef.current.find(b => b.id === targetId && b.faction === unit.faction);
            if (tb) { const p = nav.findPath(unit.position, tb.position); return { ...unit, currentOrder: order, repairTarget: targetId, attackTarget: null, targetPosition: { ...tb.position, y: 0.5 }, gatherTarget: null, lastGatherTarget: null, path: p, pathIndex: 0 }; }
          }
          return unit;
        case 'stop':
          return { ...unit, currentOrder: null, targetPosition: null, attackTarget: null, repairTarget: null, gatherTarget: null, lastGatherTarget: null, patrolStart: null, patrolEnd: null, path: [], pathIndex: 0 };
        case 'hold':
          return { ...unit, currentOrder: order, targetPosition: null, attackTarget: null, gatherTarget: null, lastGatherTarget: null, path: [], pathIndex: 0 };
        case 'gather':
          return { ...unit, currentOrder: order, gatherTarget: targetId || null, lastGatherTarget: targetId || null, targetPosition: dest, attackTarget: null, path: computedPath, pathIndex: 0 };
        default: return unit;
      }
    });
    setCurrentCommand(null);
  }, [selectedUnits]);

  const trainUnit = useCallback((unitType: UnitType) => {
    if (!selectedBuilding) return;
    const building = buildingsRef.current.find(b => b.id === selectedBuilding);
    if (!building || building.faction !== playerFaction || building.isConstructing) return;
    const stats = UNIT_STATS[unitType];
    if (resources[playerFaction].gold >= stats.cost.gold && resources[playerFaction].lumber >= stats.cost.lumber && food[playerFaction].used < food[playerFaction].max) {
      setResources(prev => ({ ...prev, [playerFaction]: { gold: prev[playerFaction].gold - stats.cost.gold, lumber: prev[playerFaction].lumber - stats.cost.lumber } }));
      building.productionQueue.push(unitType);
    }
  }, [selectedBuilding, playerFaction, resources, food]);

  const updateAI = useCallback((dt: number, enemyFaction: Faction) => {
    const ai = aiStatesRef.current[enemyFaction];
    const enemyUnits = unitsRef.current.filter(u => u.faction === enemyFaction && !u.isDead);
    const enemyBuildings = buildingsRef.current.filter(b => b.faction === enemyFaction);
    const enemyPeasants = enemyUnits.filter(u => u.type === 'peasant');
    const enemyMilitary = enemyUnits.filter(u => u.type !== 'peasant');
    const enemyRes = resources[enemyFaction];
    const enemyFood = food[enemyFaction];

    const totalMilitary = enemyMilitary.length;
    if (totalMilitary >= 8) ai.phase = 'mid';
    if (totalMilitary >= 15 || enemyBuildings.some(b => b.type === 'stable' || b.type === 'church')) ai.phase = 'late';

    const idlePeasants = enemyPeasants.filter(p => !p.currentOrder && !p.targetPosition && !p.attackTarget);
    idlePeasants.forEach(peasant => {
      const nearestGold = resourceNodesRef.current
        .filter(r => r.type === 'gold' && r.amount > 0)
        .sort((a, b) => dist2D(a.position, peasant.position) - dist2D(b.position, peasant.position))[0];
      const nearestLumber = resourceNodesRef.current
        .filter(r => r.type === 'lumber' && r.amount > 0)
        .sort((a, b) => dist2D(a.position, peasant.position) - dist2D(b.position, peasant.position))[0];
      const target = enemyRes.lumber < 300 && nearestLumber ? nearestLumber : nearestGold || nearestLumber;
      if (target) {
        const path = navGridRef.current.findPath(peasant.position, target.position);
        peasant.currentOrder = 'gather';
        peasant.gatherTarget = target.id;
        peasant.lastGatherTarget = target.id;
        peasant.targetPosition = { ...target.position, y: 0.5 };
        peasant.path = path;
        peasant.pathIndex = 0;
      }
    });

    const townhall = enemyBuildings.find(b => b.type === 'townhall' && !b.isConstructing);
    if (townhall && enemyPeasants.length < ai.peasantTarget && enemyRes.gold >= 400 && enemyFood.used < enemyFood.max && townhall.productionQueue.length < 2) {
      townhall.productionQueue.push('peasant');
      setResources(prev => ({ ...prev, [enemyFaction]: { ...prev[enemyFaction], gold: prev[enemyFaction].gold - 400 } }));
    }

    if (ai.buildIndex < ai.buildOrder.length && enemyPeasants.length >= 3) {
      const nextBuild = ai.buildOrder[ai.buildIndex];
      const bStats = BUILDING_STATS[nextBuild];
      if (enemyRes.gold >= bStats.cost.gold && enemyRes.lumber >= bStats.cost.lumber) {
        const existing = enemyBuildings.find(b => b.type === nextBuild && !b.isConstructing);
        if (nextBuild === 'farm' || !existing) {
          const basePos = enemyBuildings[0]?.position || { x: MAP_SIZE / 2, y: 0, z: MAP_SIZE / 2 };
          const angle = Math.random() * Math.PI * 2;
          const dist = 6 + Math.random() * 4;
          const bx = clamp(basePos.x + Math.cos(angle) * dist, 5, MAP_SIZE - 5);
          const bz = clamp(basePos.z + Math.sin(angle) * dist, 5, MAP_SIZE - 5);
          const tooClose = buildingsRef.current.some(b => Math.abs(b.position.x - bx) < 4 && Math.abs(b.position.z - bz) < 4);
          if (!tooClose) {
            const newB = createBuilding(nextBuild, enemyFaction, bx, bz, true);
            buildingsRef.current.push(newB);
            setResources(prev => ({ ...prev, [enemyFaction]: { gold: prev[enemyFaction].gold - bStats.cost.gold, lumber: prev[enemyFaction].lumber - bStats.cost.lumber } }));
            ai.buildIndex++;
          }
        } else {
          ai.buildIndex++;
        }
      }
    }

    const barracks = enemyBuildings.filter(b => b.type === 'barracks' && !b.isConstructing);
    const stable = enemyBuildings.filter(b => b.type === 'stable' && !b.isConstructing);
    const church = enemyBuildings.filter(b => b.type === 'church' && !b.isConstructing);

    barracks.forEach(b => {
      if (b.productionQueue.length < 3 && enemyFood.used < enemyFood.max) {
        const unitType = Math.random() < 0.6 ? 'footman' : 'archer';
        const stats = UNIT_STATS[unitType];
        if (enemyRes.gold >= stats.cost.gold && enemyRes.lumber >= stats.cost.lumber) {
          b.productionQueue.push(unitType);
          setResources(prev => ({ ...prev, [enemyFaction]: { gold: prev[enemyFaction].gold - stats.cost.gold, lumber: prev[enemyFaction].lumber - stats.cost.lumber } }));
        }
      }
    });

    stable.forEach(b => {
      if (b.productionQueue.length < 2 && enemyFood.used < enemyFood.max && ai.phase !== 'early') {
        const unitType: UnitType = Math.random() < 0.5 ? 'knight' : 'paladin';
        const stats = UNIT_STATS[unitType];
        if (enemyRes.gold >= stats.cost.gold && enemyRes.lumber >= stats.cost.lumber) {
          b.productionQueue.push(unitType);
          setResources(prev => ({ ...prev, [enemyFaction]: { gold: prev[enemyFaction].gold - stats.cost.gold, lumber: prev[enemyFaction].lumber - stats.cost.lumber } }));
        }
      }
    });

    church.forEach(b => {
      if (b.productionQueue.length < 1 && enemyFood.used < enemyFood.max && ai.phase === 'late') {
        const stats = UNIT_STATS['mage'];
        if (enemyRes.gold >= stats.cost.gold) {
          b.productionQueue.push('mage');
          setResources(prev => ({ ...prev, [enemyFaction]: { gold: prev[enemyFaction].gold - stats.cost.gold, lumber: prev[enemyFaction].lumber - stats.cost.lumber } }));
        }
      }
    });

    const nearbyThreats = unitsRef.current.filter(u => u.faction !== enemyFaction && !u.isDead &&
      enemyBuildings.some(b => dist2D(u.position, b.position) < 15));
    if (nearbyThreats.length > 0) {
      const idleDefenders = enemyMilitary.filter(u => !u.attackTarget && !u.targetPosition);
      const defendCount = Math.min(idleDefenders.length, Math.ceil(nearbyThreats.length * 1.5));
      idleDefenders.slice(0, defendCount).forEach(unit => {
        const threat = nearbyThreats[Math.floor(Math.random() * nearbyThreats.length)];
        unit.currentOrder = 'attack';
        unit.attackTarget = threat.id;
        unit.targetPosition = { ...threat.position, y: 0.5 };
        unit.path = navGridRef.current.findPath(unit.position, threat.position);
        unit.pathIndex = 0;
      });
    }

    ai.attackTimer -= dt;
    if (ai.attackTimer <= 0) {
      const idleMilitary = enemyMilitary.filter(u => !u.targetPosition && !u.attackTarget);
      const attackSize = Math.max(ai.lastAttackSize, Math.floor(idleMilitary.length * (0.5 + ai.aggression * 0.3)));
      if (idleMilitary.length >= attackSize) {
        const otherFactions = (['human', 'orc', 'legion'] as Faction[]).filter(f => f !== enemyFaction);
        const allTargets: Vec3[] = [];
        otherFactions.forEach(f => {
          buildingsRef.current.filter(b => b.faction === f).forEach(b => allTargets.push(b.position));
          unitsRef.current.filter(u => u.faction === f && !u.isDead).slice(0, 3).forEach(u => allTargets.push(u.position));
        });
        if (allTargets.length > 0) {
          const basePos = enemyBuildings[0]?.position || idleMilitary[0]?.position;
          const sorted = basePos ? allTargets.sort((a, b) => dist2D(a, basePos) - dist2D(b, basePos)) : allTargets;
          const target = Math.random() < 0.7 ? sorted[0] : sorted[Math.floor(Math.random() * sorted.length)];
          const attackers = idleMilitary.slice(0, attackSize);
          attackers.forEach((unit, i) => {
            const ox = (i % 4) * 1.5 - 3;
            const oz = Math.floor(i / 4) * 1.5;
            const dest = { x: target.x + ox, y: 0.5, z: target.z + oz };
            unit.currentOrder = 'attackmove';
            unit.targetPosition = dest;
            unit.path = navGridRef.current.findPath(unit.position, dest);
            unit.pathIndex = 0;
          });
          ai.lastAttackSize = Math.min(attackSize + 2, 20);
          ai.aggression = Math.min(1, ai.aggression + 0.1);
        }
      }
      ai.attackTimer = 50 + Math.random() * 30 - ai.aggression * 15;
    }
  }, [resources, food, playerFaction, createBuilding]);

  const updateGame = useCallback((deltaTime: number) => {
    if (isPaused || gameMode === 'menu' || victory) return;
    setGameTime(prev => prev + deltaTime);
    updateFogOfWar();
    updateParticles(deltaTime);
    updateProjectiles(deltaTime);
    updateFloatingTexts(deltaTime);

    const shake = cameraShakeRef.current;
    if (shake.elapsed < shake.duration) { shake.elapsed += deltaTime; }

    const playerBuildings = buildingsRef.current.filter(b => b.faction === playerFaction);
    const allFactions: Faction[] = ['human', 'orc', 'legion'];
    const enemyFactions = allFactions.filter(f => f !== playerFaction);
    if (playerBuildings.length === 0 && unitsRef.current.filter(u => u.faction === playerFaction && !u.isDead).length === 0) {
      setVictory('lose');
      return;
    }
    const allEnemiesDead = enemyFactions.every(ef => {
      const eb = buildingsRef.current.filter(b => b.faction === ef);
      const eu = unitsRef.current.filter(u => u.faction === ef && !u.isDead);
      return eb.length === 0 && eu.length === 0;
    });
    if (allEnemiesDead) {
      setVictory('win');
      return;
    }

    unitsRef.current = unitsRef.current.map(unit => {
      if (unit.isDead) {
        unit.deathTime += deltaTime;
        unit.animTime += deltaTime * 0.8;
        if (unit.model) {
          const frame = sampleAnimation(ANIM_KEYFRAMES.die, Math.min(unit.animTime, 0.99));
          applyAnimation(unit.model, frame, unit.type);
          unit.model.root.position.y = -unit.deathTime * 0.3;
        }
        return unit;
      }

      unit.attackCooldown = Math.max(0, unit.attackCooldown - deltaTime);
      if (unit.mana < unit.maxMana) unit.mana = Math.min(unit.maxMana, unit.mana + deltaTime * 2);

      let newAnimState: AnimState = 'idle';

      if (unit.path.length > 0 && unit.pathIndex < unit.path.length) {
        const waypoint = unit.path[unit.pathIndex];
        const dx = waypoint.x - unit.position.x;
        const dz = waypoint.z - unit.position.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < 0.5) {
          unit.pathIndex++;
          if (unit.pathIndex >= unit.path.length) {
            unit.path = [];
            unit.pathIndex = 0;
          }
        } else {
          const moveSpeed = unit.speed * deltaTime;
          const mx = (dx / d) * Math.min(moveSpeed, d);
          const mz = (dz / d) * Math.min(moveSpeed, d);
          unit.position = { x: unit.position.x + mx, y: unit.position.y, z: unit.position.z + mz };
          unit.facing = Math.atan2(dx, dz);
          newAnimState = 'walk';

          if (unit.currentOrder === 'attackmove') {
            const nearbyEnemy = unitsRef.current.find(u =>
              u.faction !== unit.faction && !u.isDead && u.isVisible &&
              dist2D(u.position, unit.position) < unit.range + 3
            );
            if (nearbyEnemy) {
              unit.attackTarget = nearbyEnemy.id;
              unit.path = [];
              unit.pathIndex = 0;
            }
          }
        }
      } else if (unit.targetPosition) {
        const dx = unit.targetPosition.x - unit.position.x;
        const dz = unit.targetPosition.z - unit.position.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < 0.5) {
          if (unit.gatherTarget) {
            const resource = resourceNodesRef.current.find(r => r.id === unit.gatherTarget);
            if (resource && resource.amount > 0) {
              newAnimState = resource.type === 'gold' ? 'mining' : 'gather';
              if (unit.attackCooldown <= 0) {
                const gatherAmt = Math.min(25, resource.amount);
                resource.amount -= gatherAmt;
                unit.carryingResource = { type: resource.type, amount: gatherAmt };
                unit.attackCooldown = 1.0;
                spawnGatherSparkle(resource.position, resource.type);
                if (resource.amount <= 0 && resource.mesh) {
                  sceneRef.current?.remove(resource.mesh);
                }
                const th = buildingsRef.current.find(b => b.type === 'townhall' && b.faction === unit.faction);
                if (th) {
                  const p = navGridRef.current.findPath(unit.position, { x: th.position.x + 3, y: 0.5, z: th.position.z });
                  unit.targetPosition = { x: th.position.x + 3, y: 0.5, z: th.position.z };
                  unit.gatherTarget = null;
                  unit.path = p;
                  unit.pathIndex = 0;
                }
              }
            } else {
              unit.gatherTarget = null;
              const nearbyRes = resourceNodesRef.current.find(r =>
                r.amount > 0 && r.type === (resource?.type || 'gold') &&
                dist2D(r.position, unit.position) < 15
              );
              if (nearbyRes) {
                unit.gatherTarget = nearbyRes.id;
                unit.lastGatherTarget = nearbyRes.id;
                unit.targetPosition = { ...nearbyRes.position, y: 0.5 };
                unit.path = navGridRef.current.findPath(unit.position, nearbyRes.position);
                unit.pathIndex = 0;
              } else { unit.lastGatherTarget = null; unit.targetPosition = null; unit.currentOrder = null; }
            }
          } else if (unit.carryingResource) {
            const th = buildingsRef.current.find(b =>
              b.type === 'townhall' && b.faction === unit.faction &&
              dist2D(b.position, unit.position) < 5
            );
            if (th) {
              const resType = unit.carryingResource.type;
              const resAmt = unit.carryingResource.amount;
              unit.carryingResource = null;
              spawnFloatingText(`+${resAmt} ${resType === 'gold' ? '💰' : '🪵'}`, th.position.x, 5, th.position.z, resType === 'gold' ? '#FFD700' : '#22DD22');
              setResources(prev => ({ ...prev, [unit.faction]: { ...prev[unit.faction], [resType]: prev[unit.faction][resType] + resAmt } }));
              if (unit.lastGatherTarget) {
                const lastRes = resourceNodesRef.current.find(r => r.id === unit.lastGatherTarget && r.amount > 0);
                if (lastRes) {
                  unit.gatherTarget = unit.lastGatherTarget;
                  unit.currentOrder = 'gather';
                  unit.targetPosition = { ...lastRes.position, y: 0.5 };
                  unit.path = navGridRef.current.findPath(unit.position, lastRes.position);
                  unit.pathIndex = 0;
                } else {
                  const nearbyRes = resourceNodesRef.current.find(r => r.amount > 0 && r.type === resType && dist2D(r.position, unit.position) < 15);
                  if (nearbyRes) {
                    unit.gatherTarget = nearbyRes.id;
                    unit.lastGatherTarget = nearbyRes.id;
                    unit.currentOrder = 'gather';
                    unit.targetPosition = { ...nearbyRes.position, y: 0.5 };
                    unit.path = navGridRef.current.findPath(unit.position, nearbyRes.position);
                    unit.pathIndex = 0;
                  } else { unit.lastGatherTarget = null; unit.currentOrder = null; }
                }
              }
            }
          } else if (unit.currentOrder === 'patrol' && unit.patrolStart && unit.patrolEnd) {
            const de = dist2D(unit.position, unit.patrolEnd);
            const ds = dist2D(unit.position, unit.patrolStart);
            if (de < 1) { unit.targetPosition = { ...unit.patrolStart }; unit.path = navGridRef.current.findPath(unit.position, unit.patrolStart); unit.pathIndex = 0; }
            else if (ds < 1) { unit.targetPosition = { ...unit.patrolEnd }; unit.path = navGridRef.current.findPath(unit.position, unit.patrolEnd); unit.pathIndex = 0; }
          }
          if (!unit.gatherTarget && !unit.carryingResource && unit.currentOrder !== 'patrol') {
            unit.targetPosition = null;
          }
        } else {
          const moveSpeed = unit.speed * deltaTime;
          const mx = (dx / d) * Math.min(moveSpeed, d);
          const mz = (dz / d) * Math.min(moveSpeed, d);
          unit.position = { x: unit.position.x + mx, y: unit.position.y, z: unit.position.z + mz };
          unit.facing = Math.atan2(dx, dz);
          newAnimState = 'walk';
        }
      }

      if (unit.attackTarget) {
        const target = unitsRef.current.find(u => u.id === unit.attackTarget && !u.isDead) as GameUnit | undefined;
        const targetB = !target ? buildingsRef.current.find(b => b.id === unit.attackTarget) : undefined;
        const hit = target || targetB;
        if (hit && hit.health > 0) {
          const d = dist2D(unit.position, hit.position);
          unit.facing = Math.atan2(hit.position.x - unit.position.x, hit.position.z - unit.position.z);
          if (d <= unit.range) {
            newAnimState = unit.type === 'mage' ? 'cast' : (Math.random() < 0.3 ? 'attack2' : 'attack');
            if (unit.attackCooldown <= 0) {
              unit.attackCooldown = UNIT_STATS[unit.type].attackSpeed;
              if (unit.type === 'archer') {
                launchProjectile(unit.position, hit.position, hit.id, 'arrow', unit.damage);
              } else if (unit.type === 'ballista') {
                launchProjectile(unit.position, hit.position, hit.id, 'bolt', unit.damage);
                triggerShake(0.1, 0.1);
              } else if (unit.type === 'mage') {
                if (unit.mana >= 60) {
                  const nearbyEnemies = unitsRef.current.filter(u => u.faction !== unit.faction && !u.isDead && dist2D(u.position, hit.position) < 4);
                  if (nearbyEnemies.length >= 3) {
                    unit.mana -= 60;
                    nearbyEnemies.forEach(enemy => {
                      enemy.health -= unit.damage * 1.5;
                      enemy.speed = UNIT_STATS[enemy.type].speed * 0.5;
                      setTimeout(() => { if (!enemy.isDead) enemy.speed = UNIT_STATS[enemy.type].speed; }, 4000);
                      spawnBloodEffect(enemy.position);
                    });
                    for (let i = 0; i < 15; i++) {
                      const angle = Math.random() * Math.PI * 2;
                      const r = Math.random() * 3;
                      spawnParticle(
                        { x: hit.position.x + Math.cos(angle) * r, y: 4 + Math.random() * 2, z: hit.position.z + Math.sin(angle) * r },
                        { x: 0, y: -5 - Math.random() * 3, z: 0 },
                        0x88ccff, 0.6 + Math.random() * 0.3, 0.05, 0.5, true
                      );
                    }
                    spawnFloatingText('BLIZZARD', hit.position.x, 4, hit.position.z, '#88CCFF');
                    triggerShake(0.2, 0.4);
                  } else {
                    launchProjectile(unit.position, hit.position, hit.id, 'fireball', unit.damage * 2, 3);
                    unit.mana -= 30;
                    spawnMagicEffect(unit.position, 0x4488ff);
                  }
                } else if (unit.mana >= 30) {
                  launchProjectile(unit.position, hit.position, hit.id, 'fireball', unit.damage * 2, 3);
                  unit.mana -= 30;
                  spawnMagicEffect(unit.position, 0x4488ff);
                } else {
                  const tArmor = 'armor' in hit ? hit.armor : 0;
                  hit.health -= Math.max(1, unit.damage - tArmor);
                  spawnBloodEffect(hit.position);
                }
              } else if (unit.type === 'paladin') {
                const tArmor = 'armor' in hit ? hit.armor : 0;
                if (unit.mana >= 40) {
                  const exorcismDmg = Math.max(1, unit.damage * 2);
                  hit.health -= exorcismDmg;
                  unit.mana -= 40;
                  spawnMagicEffect(hit.position, 0xffdd44);
                  spawnFloatingText('EXORCISM', hit.position.x, 3, hit.position.z, '#FFDD44');
                  for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    spawnParticle(
                      { x: hit.position.x, y: 1, z: hit.position.z },
                      { x: Math.cos(angle) * 3, y: 2, z: Math.sin(angle) * 3 },
                      0xffdd44, 0.5, 0.06, 5, true
                    );
                  }
                } else {
                  hit.health -= Math.max(1, unit.damage - tArmor);
                }
                spawnBloodEffect(hit.position);
                if (unit.mana >= 25 && unit.health < unit.maxHealth * 0.6) {
                  const woundedAlly = unitsRef.current
                    .filter(u => u.faction === unit.faction && !u.isDead && u.health < u.maxHealth * 0.5 && dist2D(u.position, unit.position) < 8)
                    .sort((a, b) => (a.health / a.maxHealth) - (b.health / b.maxHealth))[0];
                  if (woundedAlly) {
                    launchProjectile(unit.position, woundedAlly.position, woundedAlly.id, 'holylight', 30);
                    unit.mana -= 25;
                    spawnMagicEffect(unit.position, 0xffff88);
                  }
                }
              } else {
                const tArmor = 'armor' in hit ? hit.armor : 0;
                const rawDmg = Math.max(1, unit.damage - tArmor);
                hit.health -= rawDmg;
                spawnBloodEffect(hit.position);
                if (Math.random() < 0.5) spawnFloatingText(`-${rawDmg}`, hit.position.x + (Math.random() - 0.5), 2.5, hit.position.z, '#FF4444');
              }
              if (hit.healthBar) {
                const hf = hit.healthBar.children.find(c => c.name === 'healthFill') as THREE.Mesh | undefined;
                if (hf) {
                  const hp = Math.max(0, hit.health / hit.maxHealth);
                  hf.scale.x = hp;
                  (hf.material as THREE.MeshBasicMaterial).color.setHex(hp > 0.5 ? 0x00ff00 : hp > 0.25 ? 0xffff00 : 0xff0000);
                }
              }
            }
          } else {
            unit.targetPosition = { x: hit.position.x, y: 0.5, z: hit.position.z };
            unit.path = navGridRef.current.findPath(unit.position, hit.position);
            unit.pathIndex = 0;
            newAnimState = 'walk';
          }
        } else {
          unit.attackTarget = null;
          if (unit.currentOrder === 'attackmove' || unit.currentOrder === 'patrol') {
            const nearbyEnemy = unitsRef.current.find(u =>
              u.faction !== unit.faction && !u.isDead && u.isVisible && dist2D(u.position, unit.position) < unit.range + 4
            );
            if (nearbyEnemy) unit.attackTarget = nearbyEnemy.id;
          }
        }
      }

      if (unit.currentOrder === 'hold' && !unit.attackTarget) {
        const nearbyEnemy = unitsRef.current.find(u =>
          u.faction !== unit.faction && !u.isDead && u.isVisible && dist2D(u.position, unit.position) < unit.range
        );
        if (nearbyEnemy) unit.attackTarget = nearbyEnemy.id;
      }

      if (!unit.currentOrder && !unit.attackTarget && !unit.targetPosition) {
        const nearbyEnemy = unitsRef.current.find(u =>
          u.faction !== unit.faction && !u.isDead && u.isVisible && dist2D(u.position, unit.position) < unit.range + 1 && unit.type !== 'peasant'
        );
        if (nearbyEnemy) unit.attackTarget = nearbyEnemy.id;
      }

      if (unit.currentOrder === 'repair' && unit.repairTarget) {
        const tb = buildingsRef.current.find(b => b.id === unit.repairTarget);
        if (tb && tb.health < tb.maxHealth) {
          const d = dist2D(unit.position, tb.position);
          if (d <= 3) {
            newAnimState = 'building';
            const repairAmt = 5 * deltaTime;
            tb.health = Math.min(tb.maxHealth, tb.health + repairAmt);
            if (Math.random() < deltaTime * 3) spawnConstructionDust(tb.position);
            if (tb.healthBar) {
              const hf = tb.healthBar.children.find(c => c.name === 'healthFill') as THREE.Mesh | undefined;
              if (hf) {
                const hp = tb.health / tb.maxHealth;
                hf.scale.x = hp;
                (hf.material as THREE.MeshBasicMaterial).color.setHex(hp > 0.5 ? 0x00ff00 : hp > 0.25 ? 0xffff00 : 0xff0000);
              }
            }
            if (tb.health >= tb.maxHealth) { unit.currentOrder = null; unit.repairTarget = null; unit.targetPosition = null; }
          }
        } else { unit.currentOrder = null; unit.repairTarget = null; }
      }

      const animSpeed = newAnimState === 'walk' ? 2.5 : (newAnimState === 'attack' || newAnimState === 'attack2') ? 1.8 : newAnimState === 'cast' ? 1.5 : (newAnimState === 'gather' || newAnimState === 'mining' || newAnimState === 'building') ? 1.5 : newAnimState === 'hurt' ? 3.0 : newAnimState === 'stunned' ? 0.8 : newAnimState === 'special' ? 2.0 : 0.8;
      if (unit.animState !== newAnimState) { unit.animState = newAnimState; unit.animTime = 0; }
      unit.animTime += deltaTime * animSpeed;
      if (unit.model) {
        const frame = sampleAnimation(ANIM_KEYFRAMES[unit.animState], unit.animTime);
        applyAnimation(unit.model, frame, unit.type);
        unit.model.root.position.set(unit.position.x, unit.position.y, unit.position.z);
        unit.model.root.rotation.y = unit.facing;
      }
      if (unit.selectionRing) {
        unit.selectionRing.position.set(unit.position.x, 0.05, unit.position.z);
        (unit.selectionRing.material as THREE.MeshBasicMaterial).opacity = selectedUnits.includes(unit.id) ? 0.8 : 0;
      }
      if (unit.healthBar) {
        const topY = unit.type === 'knight' || unit.type === 'paladin' ? 2.2 : unit.type === 'ballista' ? 1.2 : 1.5;
        unit.healthBar.position.set(unit.position.x, topY, unit.position.z);
        const hf = unit.healthBar.children.find(c => c.name === 'healthFill') as THREE.Mesh | undefined;
        if (hf) {
          const hp = Math.max(0, unit.health / unit.maxHealth);
          hf.scale.x = hp;
          (hf.material as THREE.MeshBasicMaterial).color.setHex(hp > 0.5 ? 0x00ff00 : hp > 0.25 ? 0xffff00 : 0xff0000);
        }
        const mf = unit.healthBar.children.find(c => c.name === 'manaFill') as THREE.Mesh | undefined;
        if (mf && unit.maxMana > 0) {
          mf.scale.x = Math.max(0, unit.mana / unit.maxMana);
        }
      }

      return unit;
    });

    unitsRef.current = unitsRef.current.filter(unit => {
      if (unit.isDead && unit.deathTime > 3) {
        if (unit.model) sceneRef.current?.remove(unit.model.root);
        if (unit.selectionRing) sceneRef.current?.remove(unit.selectionRing);
        if (unit.healthBar) sceneRef.current?.remove(unit.healthBar);
        return false;
      }
      if (!unit.isDead && unit.health <= 0) {
        unit.isDead = true;
        unit.deathTime = 0;
        unit.animState = 'die';
        unit.animTime = 0;
        if (unit.healthBar) unit.healthBar.visible = false;
        if (unit.selectionRing) (unit.selectionRing.material as THREE.MeshBasicMaterial).opacity = 0;
        setFood(prev => ({ ...prev, [unit.faction]: { ...prev[unit.faction], used: Math.max(0, prev[unit.faction].used - 1) } }));
        spawnBloodEffect(unit.position);
        spawnFloatingText('💀', unit.position.x, 2, unit.position.z, '#ff4444');
      }
      return true;
    });

    buildingsRef.current = buildingsRef.current.map(building => {
      if (building.isConstructing) {
        const newProgress = building.constructionProgress + deltaTime * 3.0;
        building.health = building.maxHealth * (newProgress / 100);
        if (Math.random() < deltaTime * 2) spawnConstructionDust(building.position);
        if (newProgress >= 100) {
          building.isConstructing = false;
          building.constructionProgress = 100;
          building.health = building.maxHealth;
          if (building.mesh) {
            building.mesh.traverse(child => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.transparent = false;
                child.material.opacity = 1;
              }
            });
          }
          const stats = BUILDING_STATS[building.type];
          if (stats.food > 0) setFood(prev => ({ ...prev, [building.faction]: { ...prev[building.faction], max: prev[building.faction].max + stats.food } }));
        } else { building.constructionProgress = newProgress; }
      }

      if (building.health < building.maxHealth * 0.3 && !building.isConstructing) {
        building.onFire = true;
        building.fireParticleTimer += deltaTime;
        if (building.fireParticleTimer > 0.1) {
          building.fireParticleTimer = 0;
          spawnFireEffect(building.position);
        }
      } else { building.onFire = false; }

      if (building.productionQueue.length > 0 && !building.isConstructing) {
        const unitType = building.productionQueue[0];
        const unitStats = UNIT_STATS[unitType];
        building.productionProgress += (deltaTime * 100 / unitStats.buildTime);
        if (building.productionProgress >= 100) {
          const rx = building.rallyPoint?.x || building.position.x + 4;
          const rz = building.rallyPoint?.z || building.position.z;
          const newUnit = createUnit(unitType, building.faction, rx, rz);
          unitsRef.current.push(newUnit);
          setFood(prev => ({ ...prev, [building.faction]: { ...prev[building.faction], used: prev[building.faction].used + 1 } }));
          building.productionQueue.shift();
          building.productionProgress = 0;
        }
      }

      if (building.healthBar) {
        const hf = building.healthBar.children.find(c => c.name === 'healthFill') as THREE.Mesh | undefined;
        if (hf) {
          const hp = Math.max(0, building.health / building.maxHealth);
          hf.scale.x = hp;
          (hf.material as THREE.MeshBasicMaterial).color.setHex(hp > 0.5 ? 0x00ff00 : hp > 0.25 ? 0xffff00 : 0xff0000);
        }
      }

      return building;
    });

    buildingsRef.current = buildingsRef.current.filter(building => {
      if (building.health <= 0) {
        if (building.mesh) sceneRef.current?.remove(building.mesh);
        if (building.healthBar) sceneRef.current?.remove(building.healthBar);
        spawnExplosion(building.position, 2);
        const stats = BUILDING_STATS[building.type];
        if (stats.food > 0) setFood(prev => ({ ...prev, [building.faction]: { ...prev[building.faction], max: Math.max(0, prev[building.faction].max - stats.food) } }));
        rebuildNavGrid();
        return false;
      }
      return true;
    });

    if (gameMode === 'pve') {
      enemyFactions.forEach(ef => {
        if (buildingsRef.current.some(b => b.faction === ef) || unitsRef.current.some(u => u.faction === ef && !u.isDead)) {
          updateAI(deltaTime, ef);
        }
      });
    }

    renderMinimap();
  }, [isPaused, gameMode, selectedUnits, playerFaction, victory, createUnit, resources, food, updateFogOfWar, renderMinimap, spawnFloatingText, updateFloatingTexts, updateParticles, updateProjectiles, updateAI, spawnBloodEffect, spawnMagicEffect, spawnConstructionDust, spawnGatherSparkle, spawnExplosion, spawnFireEffect, launchProjectile, triggerShake]);

  useEffect(() => {
    if (gameMode !== 'menu' && containerRef.current && !isInitializedRef.current) {
      setTimeout(() => {
        if (containerRef.current && containerRef.current.clientWidth > 0) {
          initializeScene();
          if (pendingGameRef.current) {
            const { faction, mode } = pendingGameRef.current;
            initializeGameEntities(faction, mode);
            pendingGameRef.current = null;
          }
        }
      }, 100);
    }
  }, [gameMode, initializeScene, initializeGameEntities]);

  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const animate = () => {
      const now = performance.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      if (gameMode !== 'menu') updateGame(deltaTime);
      if (cameraRef.current) {
        const height = 25 / cameraZoom;
        const offset = 25 / cameraZoom;
        let sx = 0, sz = 0;
        const shake = cameraShakeRef.current;
        if (shake.elapsed < shake.duration) {
          const t = 1 - shake.elapsed / shake.duration;
          sx = (Math.random() - 0.5) * shake.intensity * t * 2;
          sz = (Math.random() - 0.5) * shake.intensity * t * 2;
        }
        cameraRef.current.position.x = cameraPosition.x + sx;
        cameraRef.current.position.z = cameraPosition.z + offset + sz;
        cameraRef.current.position.y = height;
        cameraRef.current.lookAt(cameraPosition.x, 0, cameraPosition.z);
      }
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      gameLoopRef.current = requestAnimationFrame(animate);
    };
    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(animate);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameMode, cameraPosition, cameraZoom, updateGame]);

  const getTargetAtPosition = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = ((screenX - rect.left) / rect.width) * 2 - 1;
    const my = -((screenY - rect.top) / rect.height) * 2 + 1;
    const tempRay = new THREE.Raycaster();
    tempRay.setFromCamera(new THREE.Vector2(mx, my), cameraRef.current);
    const intersects = tempRay.intersectObjects(sceneRef.current.children, true);
    const ground = intersects.find(i => i.object.name === 'ground');
    const targetPos = ground?.point;
    if (!targetPos) return { type: 'none' as const };
    const eu = unitsRef.current.find(u => u.faction !== playerFaction && !u.isDead && u.isVisible && dist2D(u.position, { x: targetPos.x, y: 0, z: targetPos.z }) < 1.5);
    if (eu) return { type: 'enemy' as const, pos: targetPos, id: eu.id };
    const eb = buildingsRef.current.find(b => b.faction !== playerFaction && b.isVisible && Math.abs(b.position.x - targetPos.x) < 2.5 && Math.abs(b.position.z - targetPos.z) < 2.5);
    if (eb) return { type: 'enemy' as const, pos: targetPos, id: eb.id };
    const res = resourceNodesRef.current.find(r => dist2D(r.position, { x: targetPos.x, y: 0, z: targetPos.z }) < 1.5);
    if (res) return { type: 'resource' as const, pos: targetPos, id: res.id };
    const fb = buildingsRef.current.find(b => b.faction === playerFaction && Math.abs(b.position.x - targetPos.x) < 2.5 && Math.abs(b.position.z - targetPos.z) < 2.5 && b.health < b.maxHealth);
    if (fb) return { type: 'repair' as const, pos: targetPos, id: fb.id };
    return { type: 'ground' as const, pos: targetPos };
  }, [playerFaction]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0 || gameMode === 'menu') return;
    if (buildingToBuild || currentCommand) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  }, [gameMode, buildingToBuild, currentCommand]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button !== 0 || gameMode === 'menu') return;
    const ds = dragSelectRef.current;
    if (isDraggingRef.current && ds) {
      if (!containerRef.current || !cameraRef.current) { setDragSelect(null); dragSelectRef.current = null; dragStartRef.current = null; isDraggingRef.current = false; return; }
      const rect = containerRef.current.getBoundingClientRect();
      const minX = Math.min(ds.startX, ds.endX);
      const maxX = Math.max(ds.startX, ds.endX);
      const minY = Math.min(ds.startY, ds.endY);
      const maxY = Math.max(ds.startY, ds.endY);
      const selected: string[] = [];
      unitsRef.current.forEach(unit => {
        if (unit.faction !== playerFaction || unit.isDead || !unit.model) return;
        const pos3 = new THREE.Vector3(unit.position.x, unit.position.y + 0.5, unit.position.z);
        pos3.project(cameraRef.current!);
        const sx = ((pos3.x + 1) / 2) * rect.width + rect.left;
        const sy = ((-pos3.y + 1) / 2) * rect.height + rect.top;
        if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) selected.push(unit.id);
      });
      if (selected.length > 0) {
        if (e.shiftKey) setSelectedUnits(prev => Array.from(new Set([...prev, ...selected])));
        else { setSelectedUnits(selected); setSelectedBuilding(null); }
      }
      setDragSelect(null);
      dragSelectRef.current = null;
      dragStartRef.current = null;
      isDraggingRef.current = false;
      dragJustEndedRef.current = true;
      return;
    }
    dragStartRef.current = null;
    isDraggingRef.current = false;
    dragSelectRef.current = null;
    setDragSelect(null);
  }, [gameMode, playerFaction]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || gameMode === 'menu') return;
    if (isDraggingRef.current || dragJustEndedRef.current) { dragJustEndedRef.current = false; return; }
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
    const groundIntersect = intersects.find(i => i.object.name === 'ground');
    const targetPos = groundIntersect?.point;

    if (e.button === 2 || currentCommand) {
      if (selectedUnits.length > 0 && targetPos) {
        const target = getTargetAtPosition(e.clientX, e.clientY);
        if (currentCommand === 'attack' && target?.type === 'enemy') issueOrder('attack', targetPos.x, targetPos.z, target.id);
        else if (currentCommand === 'gather' && target?.type === 'resource') issueOrder('gather', targetPos.x, targetPos.z, target.id);
        else if (currentCommand === 'patrol') issueOrder('patrol', targetPos.x, targetPos.z);
        else if (currentCommand === 'repair' && target?.type === 'repair') issueOrder('repair', targetPos.x, targetPos.z, target.id);
        else if (currentCommand) issueOrder(currentCommand, targetPos.x, targetPos.z);
        else if (target?.type === 'enemy') issueOrder('attack', targetPos.x, targetPos.z, target.id);
        else if (target?.type === 'resource' && unitsRef.current.some(u => selectedUnits.includes(u.id) && u.type === 'peasant')) issueOrder('gather', targetPos.x, targetPos.z, target.id);
        else if (target?.type === 'repair' && unitsRef.current.some(u => selectedUnits.includes(u.id) && u.type === 'peasant')) issueOrder('repair', targetPos.x, targetPos.z, target.id);
        else issueOrder('move', targetPos.x, targetPos.z);
      }
      setCurrentCommand(null);
      return;
    }

    if (buildingToBuild && targetPos) {
      const stats = BUILDING_STATS[buildingToBuild];
      if (resources[playerFaction].gold >= stats.cost.gold && resources[playerFaction].lumber >= stats.cost.lumber) {
        const newB = createBuilding(buildingToBuild, playerFaction, targetPos.x, targetPos.z, true);
        buildingsRef.current.push(newB);
        setResources(prev => ({ ...prev, [playerFaction]: { gold: prev[playerFaction].gold - stats.cost.gold, lumber: prev[playerFaction].lumber - stats.cost.lumber } }));
        setBuildingToBuild(null);
        setShowBuildMenu(false);
        if (placementPreviewRef.current) placementPreviewRef.current.visible = false;
      }
      return;
    }

    let clickedUnitId: string | null = null;
    let clickedBuildingId: string | null = null;
    for (const intersect of intersects) {
      const ud = intersect.object.userData;
      if (ud?.unitId) {
        const unit = unitsRef.current.find(u => u.id === ud.unitId && u.faction === playerFaction && !u.isDead);
        if (unit) { clickedUnitId = unit.id; break; }
      }
      if (ud?.buildingId) {
        const building = buildingsRef.current.find(b => b.id === ud.buildingId && b.faction === playerFaction);
        if (building) { clickedBuildingId = building.id; break; }
      }
      let parent = intersect.object.parent;
      while (parent) {
        if (parent.userData?.unitId) {
          const unit = unitsRef.current.find(u => u.id === parent!.userData.unitId && u.faction === playerFaction && !u.isDead);
          if (unit) { clickedUnitId = unit.id; break; }
        }
        if (parent.userData?.buildingId) {
          const building = buildingsRef.current.find(b => b.id === parent!.userData.buildingId && b.faction === playerFaction);
          if (building) { clickedBuildingId = building.id; break; }
        }
        parent = parent.parent;
      }
      if (clickedUnitId || clickedBuildingId) break;
    }

    if (clickedUnitId) {
      if (e.ctrlKey || e.shiftKey) setSelectedUnits(prev => prev.includes(clickedUnitId!) ? prev.filter(id => id !== clickedUnitId) : [...prev, clickedUnitId!]);
      else { setSelectedUnits([clickedUnitId]); setSelectedBuilding(null); setShowBuildMenu(false); }
    } else if (clickedBuildingId) {
      setSelectedBuilding(clickedBuildingId);
      setSelectedUnits([]);
      setShowBuildMenu(false);
    } else {
      if (!e.ctrlKey && !e.shiftKey) { setSelectedUnits([]); setSelectedBuilding(null); setShowBuildMenu(false); }
    }
  }, [gameMode, selectedUnits, buildingToBuild, playerFaction, resources, currentCommand, createBuilding, issueOrder, getTargetAtPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    if (dragStartRef.current && e.button !== 2) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDraggingRef.current = true;
        const ds = { startX: dragStartRef.current.x, startY: dragStartRef.current.y, endX: e.clientX, endY: e.clientY };
        dragSelectRef.current = ds;
        setDragSelect(ds);
      }
      return;
    }
    if (buildingToBuild) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
      const gi = intersects.find(i => i.object.name === 'ground');
      if (gi && placementPreviewRef.current) {
        placementPreviewRef.current.position.set(gi.point.x, 1, gi.point.z);
        placementPreviewRef.current.visible = true;
        const canPlace = !buildingsRef.current.some(b => Math.abs(b.position.x - gi.point.x) < 4 && Math.abs(b.position.z - gi.point.z) < 4);
        (placementPreviewRef.current.material as THREE.MeshBasicMaterial).color.setHex(canPlace ? 0x00ff00 : 0xff0000);
      }
      setCursorStyle('crosshair');
      return;
    }
    if (currentCommand) {
      const cursors: Record<string, string> = { attack: 'crosshair', move: 'pointer', patrol: 'crosshair', gather: 'grab', repair: 'help', build: 'cell' };
      setCursorStyle(cursors[currentCommand] || 'crosshair');
      return;
    }
    if (selectedUnits.length > 0 && gameMode !== 'menu') {
      const target = getTargetAtPosition(e.clientX, e.clientY);
      if (target?.type === 'enemy') setCursorStyle('crosshair');
      else if (target?.type === 'resource') setCursorStyle('grab');
      else if (target?.type === 'repair') setCursorStyle('help');
      else setCursorStyle('default');
    } else setCursorStyle('default');
  }, [buildingToBuild, currentCommand, selectedUnits, gameMode, getTargetAtPosition]);

  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    const onCtx = (e: Event) => { e.preventDefault(); handleClick(e as MouseEvent); };
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', onCtx);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('contextmenu', onCtx);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleClick, handleMouseMove, handleMouseDown, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode === 'menu') return;
      const moveSpeed = 2;
      switch (e.key.toLowerCase()) {
        case 'arrowup': case 'w': setCameraPosition(prev => ({ ...prev, z: Math.max(5, prev.z - moveSpeed) })); break;
        case 'arrowdown': case 's': if (!e.ctrlKey) setCameraPosition(prev => ({ ...prev, z: Math.min(MAP_SIZE - 5, prev.z + moveSpeed) })); break;
        case 'arrowleft': case 'a': if (!e.ctrlKey) setCameraPosition(prev => ({ ...prev, x: Math.max(5, prev.x - moveSpeed) })); break;
        case 'arrowright': case 'd': setCameraPosition(prev => ({ ...prev, x: Math.min(MAP_SIZE - 5, prev.x + moveSpeed) })); break;
        case 'escape': setBuildingToBuild(null); setCurrentCommand(null); setShowBuildMenu(false); if (placementPreviewRef.current) placementPreviewRef.current.visible = false; break;
        case ' ': e.preventDefault(); setIsPaused(prev => !prev); break;
        case 'm': setCurrentCommand('move'); break;
        case 'p': setCurrentCommand('patrol'); break;
        case 'h': issueOrder('hold'); break;
        case 'b': if (selectedUnits.some(id => unitsRef.current.find(u => u.id === id)?.type === 'peasant')) setShowBuildMenu(true); break;
        case 'g': setCurrentCommand('gather'); break;
      }
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const gn = parseInt(e.key);
        if (selectedUnits.length > 0) {
          const old = unitGroupsRef.current[gn] || [];
          old.forEach(id => { const u = unitsRef.current.find(unit => unit.id === id); if (u && u.groupNumber === gn) u.groupNumber = null; });
          unitGroupsRef.current[gn] = [...selectedUnits];
          selectedUnits.forEach(id => { const u = unitsRef.current.find(unit => unit.id === id); if (u) u.groupNumber = gn; });
        }
      } else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.key >= '1' && e.key <= '9') {
        const gn = parseInt(e.key);
        const group = unitGroupsRef.current[gn];
        if (group && group.length > 0) {
          const valid = group.filter(id => unitsRef.current.some(u => u.id === id && !u.isDead));
          unitGroupsRef.current[gn] = valid;
          if (valid.length > 0) { setSelectedUnits(valid); setSelectedBuilding(null); setShowBuildMenu(false); }
        }
      }
    };
    const handleWheel = (e: WheelEvent) => { setCameraZoom(prev => clamp(prev + e.deltaY * -0.001, 0.5, 2.5)); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('wheel', handleWheel); };
  }, [gameMode, selectedUnits, issueOrder]);

  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = minimapRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_SIZE;
    const z = ((e.clientY - rect.top) / rect.height) * MAP_SIZE;
    if (e.button === 2 && selectedUnits.length > 0) issueOrder('move', x, z);
    else setCameraPosition({ x: clamp(x, 5, MAP_SIZE - 5), z: clamp(z, 5, MAP_SIZE - 5) });
  }, [selectedUnits, issueOrder]);

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0a00] via-[#2d1810] to-[#1a0a00] text-white">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Link href="/super-engine">
            <Button variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-black" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
          </Link>
          <Link href="/gge-scene">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white">
              GGE Editor
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="relative mb-4">
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-800 drop-shadow-lg" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
              WARGUS
            </h1>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-amber-600 text-xl tracking-widest">
              ━━━━━ TIDES OF DARKNESS ━━━━━
            </div>
          </div>
          <p className="text-lg text-amber-200/80 mb-10 mt-8">3D Real-Time Strategy</p>
          <div className="bg-[#2d1a10] border-4 border-amber-700 rounded-lg p-8 max-w-md">
            <h2 className="text-center text-2xl text-amber-400 mb-6 border-b-2 border-amber-700 pb-2">SELECT FACTION</h2>
            <div className="space-y-3">
              {(['human', 'orc', 'legion'] as Faction[]).map(f => {
                const info = FACTION_NAMES[f];
                const gradients: Record<Faction, string> = {
                  human: 'from-blue-900 via-blue-700 to-blue-900 border-blue-400 hover:from-blue-800 hover:via-blue-600 hover:to-blue-800',
                  orc: 'from-red-900 via-red-700 to-red-900 border-red-400 hover:from-red-800 hover:via-red-600 hover:to-red-800',
                  legion: 'from-purple-900 via-purple-700 to-purple-900 border-purple-400 hover:from-purple-800 hover:via-purple-600 hover:to-purple-800',
                };
                const textColors: Record<Faction, string> = { human: 'text-blue-200', orc: 'text-red-200', legion: 'text-purple-200' };
                const subColors: Record<Faction, string> = { human: 'text-blue-300', orc: 'text-red-300', legion: 'text-purple-300' };
                return (
                  <button key={f} onClick={() => startGame('pve', f)}
                    className={`w-full bg-gradient-to-r ${gradients[f]} border-2 rounded p-3 transition-all`}
                    data-testid={`button-play-${f}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{info.icon1}</span>
                      <div className="text-center"><div className={`text-xl font-bold ${textColors[f]}`}>{info.name}</div><div className={`text-sm ${subColors[f]}`}>{info.subtitle}</div></div>
                      <span className="text-3xl">{info.icon2}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-amber-800">
              <div className="text-amber-500 text-sm text-center mb-3">Features</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-amber-300">
                <div>3 Unique Factions</div>
                <div>Articulated 3D Models</div>
                <div>Keyframe Animations</div>
                <div>A* Pathfinding</div>
                <div>Particle Effects</div>
                <div>Multi-AI Director</div>
                <div>Fog of War</div>
                <div>Spell System</div>
                <div>Terrain Features</div>
                <div>Formation Movement</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-800 text-center text-amber-500 text-sm">
              SPACE pause | WASD scroll | Wheel zoom
            </div>
          </div>
          <div ref={containerRef} className="hidden" />
        </div>
      </div>
    );
  }

  const selectedUnitData = selectedUnits.length > 0 ? unitsRef.current.filter(u => selectedUnits.includes(u.id) && !u.isDead) : [];
  const selectedBuildingData = selectedBuilding ? buildingsRef.current.find(b => b.id === selectedBuilding) : null;
  const firstSelectedUnit = selectedUnitData[0];
  const isPeasantSelected = selectedUnitData.some(u => u.type === 'peasant');

  if (webglError) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#1a1a2e]">
        <div className="text-center p-8 bg-[#0d0d0d] border-2 border-amber-700 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">WebGL Not Available</h2>
          <p className="text-amber-200 mb-4">This 3D game requires WebGL support.</p>
          <Link href="/super-engine"><Button className="bg-amber-700 hover:bg-amber-600 text-white">Return to Game Engine</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" style={{ bottom: '140px', cursor: cursorStyle }} data-testid="game-container" />

      {dragSelect && (
        <div className="fixed border-2 border-green-400 bg-green-400/10 pointer-events-none z-50" style={{
          left: Math.min(dragSelect.startX, dragSelect.endX), top: Math.min(dragSelect.startY, dragSelect.endY),
          width: Math.abs(dragSelect.endX - dragSelect.startX), height: Math.abs(dragSelect.endY - dragSelect.startY)
        }} />
      )}

      {victory && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30" style={{ bottom: '140px' }}>
          <div className="text-center p-8 bg-[#1a0a00]/95 border-4 border-amber-600 rounded-lg">
            <div className="text-6xl mb-4">{victory === 'win' ? '🏆' : '💀'}</div>
            <h2 className={`text-4xl font-bold mb-4 ${victory === 'win' ? 'text-yellow-400' : 'text-red-500'}`}>
              {victory === 'win' ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <p className="text-amber-300 mb-6">{victory === 'win' ? 'The enemy has been vanquished!' : 'Your forces have been destroyed.'}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => { isInitializedRef.current = false; startGame(gameMode, playerFaction); }} className="bg-amber-700 hover:bg-amber-600">Play Again</Button>
              <Button onClick={() => setGameMode('menu')} variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-900">Main Menu</Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-b-2 border-amber-700 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setGameMode('menu')} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 h-7 px-2" data-testid="button-menu"><ArrowLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 h-7 px-2" data-testid="button-pause">{isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</Button>
          <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 h-7 px-2">{isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</Button>
          <Button variant="ghost" size="sm" onClick={() => { isInitializedRef.current = false; startGame(gameMode, playerFaction); }} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 h-7 px-2" data-testid="button-restart">Restart</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)} className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/50 h-7 px-2" data-testid="button-help">? Help</Button>
        </div>
        <div className="flex items-center gap-6 text-lg font-bold">
          <div className="flex items-center gap-2"><span className="text-yellow-400">Gold</span><span className="text-yellow-300" data-testid="text-gold">{resources[playerFaction]?.gold || 0}</span></div>
          <div className="flex items-center gap-2"><span className="text-green-400">Lumber</span><span className="text-green-300" data-testid="text-lumber">{resources[playerFaction]?.lumber || 0}</span></div>
          <div className="flex items-center gap-2"><span className="text-blue-400">Food</span><span className="text-blue-300" data-testid="text-food">{food[playerFaction]?.used || 0}/{food[playerFaction]?.max || 0}</span></div>
        </div>
        <div className="text-amber-500 text-sm">{Math.floor(gameTime / 60)}:{(Math.floor(gameTime) % 60).toString().padStart(2, '0')}</div>
      </div>

      {isPaused && !victory && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20" style={{ bottom: '140px' }}>
          <div className="text-5xl font-bold text-amber-400 border-4 border-amber-600 bg-black/80 px-8 py-4">PAUSED</div>
        </div>
      )}

      {showHelp && (
        <div className="absolute top-12 right-4 w-72 max-h-[70vh] overflow-y-auto bg-[#1a0a00]/95 border-2 border-amber-700 rounded-lg p-4 z-30 text-sm">
          <div className="flex justify-between items-center mb-3 border-b border-amber-800 pb-2">
            <h3 className="text-amber-400 font-bold">Controls</h3>
            <button onClick={() => setShowHelp(false)} className="text-amber-500 hover:text-amber-300">X</button>
          </div>
          <div className="space-y-2 text-amber-200">
            <div className="font-bold text-amber-400 mt-2">Camera:</div>
            <div>WASD/Arrows - Pan | Wheel - Zoom</div>
            <div className="font-bold text-amber-400 mt-2">Selection:</div>
            <div>LClick - Select | Drag - Box select | Shift+Click - Add | RClick - Command</div>
            <div className="font-bold text-amber-400 mt-2">Orders:</div>
            <div>M-Move A-Attack P-Patrol S-Stop H-Hold G-Gather B-Build R-Repair</div>
            <div className="font-bold text-amber-400 mt-2">Groups:</div>
            <div>Ctrl+1-9 Assign | 1-9 Select</div>
            <div className="font-bold text-amber-400 mt-2">Game Systems:</div>
            <div className="text-xs space-y-1">
              <div className="text-cyan-300">A* Pathfinding with obstacle avoidance and path smoothing</div>
              <div className="text-cyan-300">Articulated unit models with animated limbs and weapons</div>
              <div className="text-cyan-300">Keyframe animation: idle, walk, attack, gather, death, cast</div>
              <div className="text-cyan-300">Projectiles: arrows, ballista bolts, fireballs, holy light</div>
              <div className="text-cyan-300">Particles: blood, sparks, magic, construction, fire, explosions</div>
              <div className="text-cyan-300">AI: build orders, economy, tech tree, attack waves, aggression scaling</div>
              <div className="text-cyan-300">Spells: Mage fireball (AoE), Paladin holy light (heal)</div>
              <div className="text-cyan-300">Camera shake on impacts and explosions</div>
              <div className="text-cyan-300">Building fire effects when low health</div>
              <div className="text-cyan-300">Victory/defeat conditions</div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-gradient-to-t from-[#1a0a00] via-[#2d1810] to-[#1a0a00] border-t-4 border-amber-700 flex z-10">
        <div className="w-[160px] p-2 border-r-2 border-amber-800">
          <canvas ref={minimapRef} width={140} height={120} className="w-full h-full border-2 border-amber-700 cursor-crosshair"
            onClick={handleMinimapClick} onContextMenu={(e) => { e.preventDefault(); handleMinimapClick(e); }} data-testid="minimap" />
        </div>

        <div className="w-[220px] p-2 border-r-2 border-amber-800 flex flex-col items-center justify-center overflow-hidden">
          {selectedUnitData.length === 1 && firstSelectedUnit && (
            <>
              <div className="text-4xl mb-1">{UNIT_STATS[firstSelectedUnit.type].icon}</div>
              <div className="text-amber-300 font-bold text-sm">{UNIT_STATS[firstSelectedUnit.type].name}</div>
              <div className="flex items-center gap-1 mt-1 w-full px-2">
                <span className="text-xs text-red-400">HP</span>
                <div className="flex-1 bg-gray-800 h-2 rounded">
                  <div className="h-full rounded transition-all" style={{
                    width: `${(firstSelectedUnit.health / firstSelectedUnit.maxHealth) * 100}%`,
                    backgroundColor: firstSelectedUnit.health / firstSelectedUnit.maxHealth > 0.5 ? '#22c55e' : firstSelectedUnit.health / firstSelectedUnit.maxHealth > 0.25 ? '#eab308' : '#ef4444'
                  }} />
                </div>
                <span className="text-xs text-green-400 w-16 text-right">{Math.ceil(firstSelectedUnit.health)}/{firstSelectedUnit.maxHealth}</span>
              </div>
              {firstSelectedUnit.maxMana > 0 && (
                <div className="flex items-center gap-1 mt-0.5 w-full px-2">
                  <span className="text-xs text-blue-400">MP</span>
                  <div className="flex-1 bg-gray-800 h-1.5 rounded">
                    <div className="bg-blue-500 h-full rounded transition-all" style={{ width: `${(firstSelectedUnit.mana / firstSelectedUnit.maxMana) * 100}%` }} />
                  </div>
                  <span className="text-xs text-blue-300 w-16 text-right">{Math.ceil(firstSelectedUnit.mana)}/{firstSelectedUnit.maxMana}</span>
                </div>
              )}
              <div className="text-amber-500 text-xs mt-1">ATK:{firstSelectedUnit.damage} DEF:{firstSelectedUnit.armor} RNG:{firstSelectedUnit.range.toFixed(1)}</div>
              {firstSelectedUnit.currentOrder && (
                <div className="text-cyan-400 text-xs mt-0.5">{COMMAND_ICONS[firstSelectedUnit.currentOrder]?.icon} {COMMAND_ICONS[firstSelectedUnit.currentOrder]?.name}</div>
              )}
              {firstSelectedUnit.groupNumber && <div className="text-amber-600 text-xs">Group {firstSelectedUnit.groupNumber}</div>}
            </>
          )}
          {selectedUnitData.length > 1 && (
            <div className="w-full h-full overflow-y-auto">
              <div className="text-amber-400 text-xs font-bold mb-1 text-center">{selectedUnitData.length} units selected</div>
              <div className="grid grid-cols-4 gap-0.5">
                {selectedUnitData.slice(0, 16).map(u => (
                  <button key={u.id} onClick={() => { setSelectedUnits([u.id]); setSelectedBuilding(null); }}
                    className="flex flex-col items-center p-0.5 rounded border border-amber-800/50 hover:border-amber-400 bg-amber-900/20 transition-all">
                    <span className="text-lg leading-none">{UNIT_STATS[u.type].icon}</span>
                    <div className="w-full bg-gray-800 h-1 rounded mt-0.5">
                      <div className="h-full rounded" style={{ width: `${(u.health / u.maxHealth) * 100}%`, backgroundColor: u.health / u.maxHealth > 0.5 ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </button>
                ))}
              </div>
              {selectedUnitData.length > 16 && <div className="text-amber-500 text-xs text-center mt-1">+{selectedUnitData.length - 16} more</div>}
            </div>
          )}
          {selectedBuildingData && (
            <>
              <div className="text-4xl mb-1">{BUILDING_STATS[selectedBuildingData.type].icon}</div>
              <div className="text-amber-300 font-bold text-sm">{BUILDING_STATS[selectedBuildingData.type].name}</div>
              <div className="flex items-center gap-1 mt-1 w-full px-2">
                <span className="text-xs text-red-400">HP</span>
                <div className="flex-1 bg-gray-800 h-2 rounded">
                  <div className="h-full rounded transition-all" style={{
                    width: `${(selectedBuildingData.health / selectedBuildingData.maxHealth) * 100}%`,
                    backgroundColor: selectedBuildingData.health / selectedBuildingData.maxHealth > 0.5 ? '#22c55e' : '#ef4444'
                  }} />
                </div>
                <span className="text-xs text-green-400 w-16 text-right">{Math.ceil(selectedBuildingData.health)}/{selectedBuildingData.maxHealth}</span>
              </div>
              {selectedBuildingData.isConstructing && (
                <div className="w-full mt-1 px-2">
                  <div className="text-amber-500 text-xs text-center">Building... {Math.floor(selectedBuildingData.constructionProgress)}%</div>
                  <div className="w-full bg-gray-800 h-2 rounded mt-1"><div className="bg-amber-500 h-full rounded transition-all" style={{ width: `${selectedBuildingData.constructionProgress}%` }} /></div>
                </div>
              )}
            </>
          )}
          {!firstSelectedUnit && !selectedBuildingData && (
            <div className="text-amber-600 text-sm text-center"><div className="text-2xl mb-1">RTS</div>No selection</div>
          )}
        </div>

        <div className="flex-1 p-2">
          {showBuildMenu && isPeasantSelected ? (
            <div className="grid grid-cols-4 gap-1 h-full">
              {(Object.entries(BUILDING_STATS) as [BuildingType, typeof BUILDING_STATS[BuildingType]][]).map(([type, stats]) => {
                const canAfford = resources[playerFaction].gold >= stats.cost.gold && resources[playerFaction].lumber >= stats.cost.lumber;
                return (
                  <button key={type} onClick={() => { setBuildingToBuild(type); setShowBuildMenu(false); }} disabled={!canAfford}
                    className={`flex flex-col items-center justify-center rounded border-2 transition-all text-xs
                      ${buildingToBuild === type ? 'border-green-400 bg-green-900/50' :
                      canAfford ? 'border-amber-700 bg-amber-900/30 hover:bg-amber-800/50 hover:border-amber-500' :
                      'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'}`}
                    data-testid={`button-build-${type}`}>
                    <span className="text-2xl">{stats.icon}</span>
                    <span className="text-amber-300 truncate w-full text-center">{stats.name}</span>
                    <span className="text-yellow-400">{stats.cost.gold}g {stats.cost.lumber > 0 && `${stats.cost.lumber}w`}</span>
                  </button>
                );
              })}
            </div>
          ) : selectedBuildingData && BUILDING_STATS[selectedBuildingData.type].trains.length > 0 && !selectedBuildingData.isConstructing ? (
            <div className="h-full">
              <div className="grid grid-cols-4 gap-1">
                {BUILDING_STATS[selectedBuildingData.type].trains.map(unitType => {
                  const stats = UNIT_STATS[unitType];
                  const canAfford = resources[playerFaction].gold >= stats.cost.gold && resources[playerFaction].lumber >= stats.cost.lumber && food[playerFaction].used < food[playerFaction].max;
                  return (
                    <button key={unitType} onClick={() => trainUnit(unitType)} disabled={!canAfford}
                      className={`flex flex-col items-center justify-center p-2 rounded border-2 transition-all
                        ${canAfford ? 'border-amber-700 bg-amber-900/30 hover:bg-amber-800/50 hover:border-amber-500' :
                        'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'}`}
                      data-testid={`button-train-${unitType}`}>
                      <span className="text-3xl">{stats.icon}</span>
                      <span className="text-amber-300 text-xs">{stats.name}</span>
                      <span className="text-yellow-400 text-xs">{stats.cost.gold}g</span>
                    </button>
                  );
                })}
              </div>
              {selectedBuildingData.productionQueue.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-amber-500 text-xs">Queue:</span>
                  {selectedBuildingData.productionQueue.map((ut, i) => (<span key={i} className="text-lg">{UNIT_STATS[ut].icon}</span>))}
                  <div className="flex-1 bg-gray-800 h-2 rounded ml-2">
                    <div className="bg-amber-500 h-full rounded transition-all" style={{ width: `${selectedBuildingData.productionProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ) : selectedUnitData.length > 0 ? (
            <div className="grid grid-cols-6 gap-1 h-full">
              {firstSelectedUnit && UNIT_STATS[firstSelectedUnit.type].commands.map(cmd => {
                const cmdInfo = COMMAND_ICONS[cmd];
                if (!cmdInfo) return null;
                return (
                  <button key={cmd} onClick={() => {
                    if (cmd === 'stop') issueOrder('stop');
                    else if (cmd === 'hold') issueOrder('hold');
                    else if (cmd === 'build') setShowBuildMenu(true);
                    else setCurrentCommand(cmd as OrderType);
                  }} className={`flex flex-col items-center justify-center rounded border-2 transition-all
                    ${currentCommand === cmd ? 'border-green-400 bg-green-900/50' :
                    'border-amber-700 bg-amber-900/30 hover:bg-amber-800/50 hover:border-amber-500'}`}
                    data-testid={`button-cmd-${cmd}`}>
                    <span className="text-2xl">{cmdInfo.icon}</span>
                    <span className="text-amber-300 text-xs">{cmdInfo.name}</span>
                    <span className="text-amber-500 text-xs">[{cmdInfo.hotkey}]</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-amber-600">Select units or buildings to see commands</div>
          )}
        </div>

        <div className="w-[170px] p-2 border-l-2 border-amber-800 text-xs text-amber-400 overflow-y-auto">
          <div className="font-bold text-amber-300 mb-1 border-b border-amber-800 pb-1">GROUPS</div>
          <div className="grid grid-cols-3 gap-0.5 mb-2">
            {[1,2,3,4,5,6,7,8,9].map(n => {
              const group = unitGroupsRef.current[n];
              const count = group ? group.filter(id => unitsRef.current.some(u => u.id === id && !u.isDead)).length : 0;
              return (
                <button key={n} onClick={() => { if (count > 0) { const valid = group!.filter(id => unitsRef.current.some(u => u.id === id && !u.isDead)); setSelectedUnits(valid); setSelectedBuilding(null); } }}
                  className={`text-center rounded py-0.5 border transition-all ${count > 0 ? 'border-amber-600 bg-amber-900/40 hover:bg-amber-800/60 text-amber-300' : 'border-gray-700 bg-gray-900/30 text-gray-600'}`}>
                  <div className="font-bold">{n}</div>
                  {count > 0 && <div className="text-[10px]">{count}</div>}
                </button>
              );
            })}
          </div>
          <div className="font-bold text-amber-300 mb-1 border-b border-amber-800 pb-1">KEYS</div>
          <div className="space-y-0.5">
            <div>WASD - Scroll</div>
            <div>Wheel - Zoom</div>
            <div>Drag - Box Select</div>
            <div>Shift+Click - Add</div>
            <div>RClick - Order</div>
            <div>Ctrl+# - Set Group</div>
            <div>M A P H S B G</div>
            <div>Space - Pause</div>
            <div>Esc - Cancel</div>
          </div>
        </div>
      </div>

      {currentCommand && (
        <div className="absolute bottom-[150px] left-1/2 -translate-x-1/2 bg-amber-900/90 border-2 border-amber-500 px-4 py-2 rounded text-amber-200 z-10">
          {COMMAND_ICONS[currentCommand]?.icon} {COMMAND_ICONS[currentCommand]?.name} - Click to target or ESC to cancel
        </div>
      )}
      {buildingToBuild && (
        <div className="absolute bottom-[150px] left-1/2 -translate-x-1/2 bg-amber-900/90 border-2 border-amber-500 px-4 py-2 rounded text-amber-200 z-10">
          Building: {BUILDING_STATS[buildingToBuild].name} - Click to place or ESC to cancel
        </div>
      )}
    </div>
  );
}
