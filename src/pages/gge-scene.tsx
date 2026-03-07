import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Settings, Box, Layers, Eye, EyeOff, RotateCcw, Move, Maximize2, ChevronRight, ChevronDown, Paintbrush, Sword, Hammer, Pickaxe, Shield, Zap, Heart, Skull, Sparkles, TreePine, Mountain, Home as HomeIcon, Castle } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type EditorMode = 'scene' | 'model' | 'animation' | 'game';
type AnimStateName = 'idle' | 'mining' | 'building' | 'attack1' | 'attack2' | 'stunned' | 'hurt' | 'death' | 'special';

interface AnimKeyframe {
  time: number;
  leftArmRot: number; rightArmRot: number;
  leftLegRot: number; rightLegRot: number;
  torsoY: number; torsoRot: number; headRot: number;
  weaponRot?: number;
}

interface SceneAsset {
  id: string;
  name: string;
  type: 'building' | 'environment' | 'unit' | 'light';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  visible: boolean;
  mesh?: THREE.Object3D;
  glbPath?: string;
}

const ANIM_LIBRARY: Record<AnimStateName, AnimKeyframe[]> = {
  idle: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.3, leftArmRot: 0.04, rightArmRot: -0.04, leftLegRot: 0, rightLegRot: 0, torsoY: 0.015, torsoRot: 0.01, headRot: 0.02 },
    { time: 0.6, leftArmRot: 0.06, rightArmRot: -0.06, leftLegRot: 0, rightLegRot: 0, torsoY: 0.025, torsoRot: -0.01, headRot: 0.01 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
  mining: [
    { time: 0, leftArmRot: 0.2, rightArmRot: -1.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.05, torsoRot: 0.15, headRot: -0.3, weaponRot: -1.8 },
    { time: 0.2, leftArmRot: 0.4, rightArmRot: -0.5, leftLegRot: 0.15, rightLegRot: -0.15, torsoY: -0.1, torsoRot: 0.05, headRot: -0.35, weaponRot: -0.5 },
    { time: 0.45, leftArmRot: 0.6, rightArmRot: 0.8, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.18, torsoRot: -0.2, headRot: -0.4, weaponRot: 0.8 },
    { time: 0.65, leftArmRot: 0.35, rightArmRot: -0.3, leftLegRot: 0.12, rightLegRot: -0.12, torsoY: -0.08, torsoRot: 0.08, headRot: -0.3, weaponRot: -0.3 },
    { time: 1, leftArmRot: 0.2, rightArmRot: -1.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: -0.05, torsoRot: 0.15, headRot: -0.3, weaponRot: -1.8 },
  ],
  building: [
    { time: 0, leftArmRot: -0.5, rightArmRot: -0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: 0, torsoRot: 0, headRot: -0.1, weaponRot: -0.8 },
    { time: 0.15, leftArmRot: -1.0, rightArmRot: -1.4, leftLegRot: 0.05, rightLegRot: -0.05, torsoY: 0.04, torsoRot: 0.08, headRot: -0.18, weaponRot: -1.4 },
    { time: 0.35, leftArmRot: -0.3, rightArmRot: 0.4, leftLegRot: 0.12, rightLegRot: -0.12, torsoY: -0.06, torsoRot: -0.12, headRot: -0.12, weaponRot: 0.4 },
    { time: 0.55, leftArmRot: -0.9, rightArmRot: -1.1, leftLegRot: 0.03, rightLegRot: -0.03, torsoY: 0.02, torsoRot: 0.04, headRot: -0.18, weaponRot: -1.1 },
    { time: 0.75, leftArmRot: -0.2, rightArmRot: 0.2, leftLegRot: 0.08, rightLegRot: -0.08, torsoY: -0.04, torsoRot: -0.08, headRot: -0.08, weaponRot: 0.2 },
    { time: 1, leftArmRot: -0.5, rightArmRot: -0.8, leftLegRot: 0.1, rightLegRot: -0.1, torsoY: 0, torsoRot: 0, headRot: -0.1, weaponRot: -0.8 },
  ],
  attack1: [
    { time: 0, leftArmRot: 0, rightArmRot: -1.2, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0.15, headRot: 0, weaponRot: -1.2 },
    { time: 0.2, leftArmRot: 0.1, rightArmRot: -2.0, leftLegRot: -0.15, rightLegRot: 0.15, torsoY: 0.02, torsoRot: 0.25, headRot: -0.1, weaponRot: -2.0 },
    { time: 0.4, leftArmRot: -0.3, rightArmRot: 1.2, leftLegRot: 0.25, rightLegRot: -0.15, torsoY: -0.06, torsoRot: -0.35, headRot: -0.2, weaponRot: 1.2 },
    { time: 0.6, leftArmRot: -0.15, rightArmRot: 0.6, leftLegRot: 0.12, rightLegRot: -0.05, torsoY: -0.02, torsoRot: -0.12, headRot: -0.12, weaponRot: 0.6 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0, weaponRot: 0 },
  ],
  attack2: [
    { time: 0, leftArmRot: -0.3, rightArmRot: 0, leftLegRot: -0.2, rightLegRot: 0.2, torsoY: 0, torsoRot: -0.2, headRot: 0, weaponRot: 0 },
    { time: 0.15, leftArmRot: -1.8, rightArmRot: 0.4, leftLegRot: -0.35, rightLegRot: 0.35, torsoY: 0.06, torsoRot: -0.45, headRot: -0.15, weaponRot: -1.6 },
    { time: 0.35, leftArmRot: 0.9, rightArmRot: -0.6, leftLegRot: 0.35, rightLegRot: -0.25, torsoY: -0.1, torsoRot: 0.45, headRot: -0.22, weaponRot: 1.3 },
    { time: 0.55, leftArmRot: 1.3, rightArmRot: 0.9, leftLegRot: 0.15, rightLegRot: -0.12, torsoY: -0.04, torsoRot: 0.18, headRot: -0.1, weaponRot: 0.7 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0, weaponRot: 0 },
  ],
  stunned: [
    { time: 0, leftArmRot: 0.8, rightArmRot: -0.8, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.1, torsoRot: 0.2, headRot: 0.5 },
    { time: 0.2, leftArmRot: -0.6, rightArmRot: 0.6, leftLegRot: -0.18, rightLegRot: 0.18, torsoY: -0.06, torsoRot: -0.3, headRot: -0.45 },
    { time: 0.45, leftArmRot: 0.7, rightArmRot: -0.7, leftLegRot: 0.22, rightLegRot: -0.22, torsoY: -0.14, torsoRot: 0.22, headRot: 0.4 },
    { time: 0.7, leftArmRot: -0.4, rightArmRot: 0.4, leftLegRot: -0.12, rightLegRot: 0.12, torsoY: -0.08, torsoRot: -0.15, headRot: -0.3 },
    { time: 1, leftArmRot: 0.8, rightArmRot: -0.8, leftLegRot: 0.2, rightLegRot: -0.2, torsoY: -0.1, torsoRot: 0.2, headRot: 0.5 },
  ],
  hurt: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.1, leftArmRot: 0.7, rightArmRot: -0.5, leftLegRot: -0.12, rightLegRot: 0.12, torsoY: -0.1, torsoRot: 0.35, headRot: 0.45 },
    { time: 0.3, leftArmRot: 0.4, rightArmRot: -0.7, leftLegRot: 0.18, rightLegRot: -0.12, torsoY: -0.15, torsoRot: -0.25, headRot: -0.35 },
    { time: 0.55, leftArmRot: 0.18, rightArmRot: -0.25, leftLegRot: 0.06, rightLegRot: -0.06, torsoY: -0.05, torsoRot: 0.12, headRot: 0.12 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
  death: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.15, leftArmRot: 0.3, rightArmRot: -0.3, leftLegRot: 0.05, rightLegRot: -0.05, torsoY: -0.05, torsoRot: 0.15, headRot: 0.25 },
    { time: 0.35, leftArmRot: 0.8, rightArmRot: -0.7, leftLegRot: 0.15, rightLegRot: -0.1, torsoY: -0.2, torsoRot: 0.6, headRot: 0.5 },
    { time: 0.6, leftArmRot: 1.2, rightArmRot: -1.0, leftLegRot: 0.3, rightLegRot: -0.2, torsoY: -0.35, torsoRot: 1.1, headRot: 0.65 },
    { time: 1, leftArmRot: 1.5, rightArmRot: -1.3, leftLegRot: 0.5, rightLegRot: -0.3, torsoY: -0.55, torsoRot: 1.57, headRot: 0.8 },
  ],
  special: [
    { time: 0, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
    { time: 0.12, leftArmRot: -2.2, rightArmRot: -2.2, leftLegRot: -0.3, rightLegRot: 0.3, torsoY: 0.22, torsoRot: 0.55, headRot: -0.6 },
    { time: 0.3, leftArmRot: -1.8, rightArmRot: -1.8, leftLegRot: 0.05, rightLegRot: -0.05, torsoY: 0.35, torsoRot: -0.35, headRot: -0.45 },
    { time: 0.5, leftArmRot: 1.6, rightArmRot: 1.6, leftLegRot: 0.25, rightLegRot: -0.25, torsoY: -0.12, torsoRot: 0.08, headRot: 0.25 },
    { time: 0.72, leftArmRot: 0.6, rightArmRot: 0.6, leftLegRot: 0.12, rightLegRot: -0.12, torsoY: 0.06, torsoRot: 0.12, headRot: 0.05 },
    { time: 1, leftArmRot: 0, rightArmRot: 0, leftLegRot: 0, rightLegRot: 0, torsoY: 0, torsoRot: 0, headRot: 0 },
  ],
};

const GLB_ASSETS: Record<string, string> = {
  'Town Center': '/models/rts/Town Center.glb',
  'Barracks': '/models/rts/Barracks.glb',
  'Farm': '/models/rts/Farm.glb',
  'Mine': '/models/rts/Mine.glb',
  'Watch Tower': '/models/rts/Watch Tower.glb',
  'Trees': '/models/rts/Trees.glb',
  'Gold Rocks': '/models/rts/Gold Rocks.glb',
  'Castle': '/models/rts/Castle.glb',
  'Temple': '/models/rts/Temple.glb',
  'Archery Range': '/models/rts/Archery Training Grounds.glb',
  'Fortress': '/models/rts/Wooden Fortress.glb',
  'House': '/models/rts/House.glb',
  'Storage': '/models/rts/Storage House.glb',
  'Windmill': '/models/rts/Windmill.glb',
};

const UNIT_TYPES = ['Peasant', 'Footman', 'Archer', 'Knight', 'Mage', 'Paladin'] as const;
type UnitTypeName = typeof UNIT_TYPES[number];

const UNIT_COLORS: Record<UnitTypeName, { primary: number; secondary: number; weapon: string }> = {
  Peasant: { primary: 0x8B6914, secondary: 0xD2B48C, weapon: 'pickaxe' },
  Footman: { primary: 0x2244AA, secondary: 0x6688CC, weapon: 'sword' },
  Archer: { primary: 0x228B22, secondary: 0x90EE90, weapon: 'bow' },
  Knight: { primary: 0xC0C0C0, secondary: 0xFFD700, weapon: 'lance' },
  Mage: { primary: 0x6A0DAD, secondary: 0xBA55D3, weapon: 'staff' },
  Paladin: { primary: 0xFFD700, secondary: 0xFFFFFF, weapon: 'hammer' },
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function sampleAnim(keyframes: AnimKeyframe[], t: number): AnimKeyframe {
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

interface ArticulatedParts {
  root: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weapon?: THREE.Mesh;
}

function createArticulatedUnit(unitType: UnitTypeName, factionColor: number = 0x2244AA): ArticulatedParts {
  const colors = UNIT_COLORS[unitType];
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colors.primary, roughness: 0.6, metalness: 0.3 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFDBB5, roughness: 0.8 });
  const accentMat = new THREE.MeshStandardMaterial({ color: colors.secondary, roughness: 0.5, metalness: 0.4 });
  const factionMat = new THREE.MeshStandardMaterial({ color: factionColor, roughness: 0.5 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), bodyMat);
  torso.position.y = 0.9;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skinMat);
  head.position.y = 1.45;
  root.add(head);

  if (unitType === 'Mage') {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 6), accentMat);
    hat.position.y = 1.72;
    root.add(hat);
  }
  if (unitType === 'Knight' || unitType === 'Paladin') {
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), accentMat);
    helmet.position.y = 1.48;
    helmet.scale.set(1, 0.8, 1);
    root.add(helmet);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    visor.position.set(0, 1.42, 0.18);
    root.add(visor);
  }

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.32), accentMat);
  belt.position.y = 0.62;
  root.add(belt);

  const tabard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.02), factionMat);
  tabard.position.set(0, 0.78, 0.16);
  root.add(tabard);

  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), accentMat);
  shoulderL.position.set(-0.35, 1.15, 0);
  root.add(shoulderL);
  const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), accentMat);
  shoulderR.position.set(0.35, 1.15, 0);
  root.add(shoulderR);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 1.1, 0);
  const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), bodyMat);
  lArmMesh.position.y = -0.22;
  leftArm.add(lArmMesh);
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), skinMat);
  lHand.position.y = -0.48;
  leftArm.add(lHand);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 1.1, 0);
  const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), bodyMat);
  rArmMesh.position.y = -0.22;
  rightArm.add(rArmMesh);
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), skinMat);
  rHand.position.y = -0.48;
  rightArm.add(rHand);
  root.add(rightArm);

  let weapon: THREE.Mesh | undefined;
  if (colors.weapon === 'sword') {
    weapon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8, roughness: 0.2 }));
    weapon.position.set(0, -0.7, 0);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0x8B7355 }));
    guard.position.y = 0.08;
    weapon.add(guard);
    rightArm.add(weapon);
  } else if (colors.weapon === 'pickaxe') {
    weapon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), new THREE.MeshStandardMaterial({ color: 0x8B7355 }));
    weapon.position.set(0, -0.65, 0);
    const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7 }));
    head2.position.y = 0.1;
    weapon.add(head2);
    rightArm.add(weapon);
  } else if (colors.weapon === 'bow') {
    weapon = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 6, 12, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    weapon.position.set(0, -0.4, 0.1);
    weapon.rotation.z = Math.PI / 2;
    rightArm.add(weapon);
  } else if (colors.weapon === 'staff') {
    weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    weapon.position.set(0, -0.7, 0);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0x44AAFF, emissive: 0x2266CC, emissiveIntensity: 0.5 }));
    orb.position.y = 0.5;
    weapon.add(orb);
    rightArm.add(weapon);
  } else if (colors.weapon === 'lance') {
    weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.7 }));
    weapon.position.set(0, -0.7, 0);
    rightArm.add(weapon);
  } else if (colors.weapon === 'hammer') {
    weapon = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x8B7355 }));
    weapon.position.set(0, -0.65, 0);
    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.6 }));
    hammerHead.position.y = 0.12;
    weapon.add(hammerHead);
    rightArm.add(weapon);
  }

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.58, 0);
  const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), bodyMat);
  lLegMesh.position.y = -0.25;
  leftLeg.add(lLegMesh);
  const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.2), new THREE.MeshStandardMaterial({ color: 0x4A3728 }));
  lBoot.position.set(0, -0.52, 0.03);
  leftLeg.add(lBoot);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.58, 0);
  const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), bodyMat);
  rLegMesh.position.y = -0.25;
  rightLeg.add(rLegMesh);
  const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.2), new THREE.MeshStandardMaterial({ color: 0x4A3728 }));
  rBoot.position.set(0, -0.52, 0.03);
  rightLeg.add(rBoot);
  root.add(rightLeg);

  torso.userData.partName = 'torso';
  head.userData.partName = 'head';
  leftArm.userData.partName = 'leftArm';
  rightArm.userData.partName = 'rightArm';
  leftLeg.userData.partName = 'leftLeg';
  rightLeg.userData.partName = 'rightLeg';
  if (weapon) weapon.userData.partName = 'weapon';

  root.castShadow = true;
  root.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; } });

  return { root, torso, head, leftArm, rightArm, leftLeg, rightLeg, weapon };
}

function applyAnimFrame(model: ArticulatedParts, frame: AnimKeyframe) {
  model.leftArm.rotation.x = frame.leftArmRot;
  model.rightArm.rotation.x = frame.rightArmRot;
  model.leftLeg.rotation.x = frame.leftLegRot;
  model.rightLeg.rotation.x = frame.rightLegRot;
  model.torso.position.y = 0.9 + frame.torsoY;
  model.torso.rotation.z = frame.torsoRot;
  model.head.rotation.x = frame.headRot;
  if (model.weapon && frame.weaponRot !== undefined) {
    model.weapon.rotation.x = frame.weaponRot;
  }
}

const ANIM_ICONS: Record<AnimStateName, typeof Sword> = {
  idle: Eye, mining: Pickaxe, building: Hammer, attack1: Sword,
  attack2: Zap, stunned: Shield, hurt: Heart, death: Skull, special: Sparkles,
};

export default function GGEScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number>(0);
  const modelRef = useRef<ArticulatedParts | null>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);
  const loadedAssetsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  const [editorMode, setEditorMode] = useState<EditorMode>('scene');
  const [selectedAnim, setSelectedAnim] = useState<AnimStateName>('idle');
  const [animSpeed, setAnimSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animTime, setAnimTime] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<UnitTypeName>('Footman');
  const [factionColor, setFactionColor] = useState('#2244AA');
  const [sceneAssets, setSceneAssets] = useState<SceneAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({ hierarchy: true, properties: true, animations: true, assets: true });
  const [showGrid, setShowGrid] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const togglePanel = (key: string) => setExpandedPanels(p => ({ ...p, [key]: !p[key] }));

  const initScene = useCallback(() => {
    if (!containerRef.current || sceneRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.set(5, 4, 8);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    const canvas = document.createElement('canvas');
    containerRef.current.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'default', failIfMajorPerformanceCaveat: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    try {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    } catch (e) { /* shadow/tone mapping may not be supported */ }
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0x6688aa, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    dirLight.position.set(8, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4488cc, 0.4);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(60, 60, 0x3a6b25, 0x3a6b25);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).opacity = 0.3;
    (grid.material as THREE.Material).transparent = true;
    gridRef.current = grid;
    scene.add(grid);

    setSceneLoaded(true);
  }, []);

  const setupModelEditor = useCallback(() => {
    if (!sceneRef.current) return;
    if (modelRef.current) sceneRef.current.remove(modelRef.current.root);
    const hexColor = parseInt(factionColor.replace('#', ''), 16);
    const model = createArticulatedUnit(selectedUnit, hexColor);
    model.root.position.set(0, 0, 0);
    sceneRef.current.add(model.root);
    modelRef.current = model;
    if (cameraRef.current) {
      cameraRef.current.position.set(2, 2, 3);
      controlsRef.current?.target.set(0, 0.8, 0);
    }
  }, [selectedUnit, factionColor]);

  const setupSceneEditor = useCallback(() => {
    if (!sceneRef.current) return;
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current.root);
      modelRef.current = null;
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(12, 10, 15);
      controlsRef.current?.target.set(0, 0, 0);
    }
  }, []);

  const addAssetToScene = useCallback((name: string, type: SceneAsset['type']) => {
    if (!sceneRef.current) return;
    const id = Math.random().toString(36).substr(2, 9);
    const asset: SceneAsset = {
      id, name, type,
      position: { x: (Math.random() - 0.5) * 10, y: 0, z: (Math.random() - 0.5) * 10 },
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
      scale: 1, visible: true, glbPath: GLB_ASSETS[name],
    };

    if (asset.glbPath) {
      const cached = loadedAssetsRef.current.get(asset.glbPath);
      if (cached) {
        const clone = cached.clone();
        clone.position.set(asset.position.x, asset.position.y, asset.position.z);
        clone.rotation.set(asset.rotation.x, asset.rotation.y, asset.rotation.z);
        sceneRef.current.add(clone);
        asset.mesh = clone;
      } else {
        if (!loaderRef.current) loaderRef.current = new GLTFLoader();
        loaderRef.current.load(asset.glbPath, (gltf) => {
          const model = gltf.scene;
          model.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; } });
          loadedAssetsRef.current.set(asset.glbPath!, model.clone());
          model.position.set(asset.position.x, asset.position.y, asset.position.z);
          model.rotation.set(asset.rotation.x, asset.rotation.y, asset.rotation.z);
          sceneRef.current?.add(model);
          asset.mesh = model;
          setSceneAssets(prev => prev.map(a => a.id === id ? { ...a, mesh: model } : a));
        });
      }
    } else if (type === 'unit') {
      const unitModel = createArticulatedUnit(name as UnitTypeName);
      unitModel.root.position.set(asset.position.x, asset.position.y, asset.position.z);
      sceneRef.current.add(unitModel.root);
      asset.mesh = unitModel.root;
    }

    setSceneAssets(prev => [...prev, asset]);
    setSelectedAssetId(id);
  }, []);

  const removeAsset = useCallback((id: string) => {
    setSceneAssets(prev => {
      const a = prev.find(x => x.id === id);
      if (a?.mesh) sceneRef.current?.remove(a.mesh);
      return prev.filter(x => x.id !== id);
    });
    if (selectedAssetId === id) setSelectedAssetId(null);
  }, [selectedAssetId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { initScene(); } catch (e) { console.warn('Scene init error:', e); }
    }, 100);
    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose();
    };
  }, [initScene]);

  useEffect(() => {
    if (!sceneLoaded) return;
    if (editorMode === 'model' || editorMode === 'animation') {
      setupModelEditor();
    } else {
      setupSceneEditor();
    }
  }, [editorMode, sceneLoaded, setupModelEditor, setupSceneEditor]);

  useEffect(() => {
    if (!sceneLoaded || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = clockRef.current.getDelta();
      controlsRef.current?.update();

      if (modelRef.current && (editorMode === 'model' || editorMode === 'animation')) {
        const spd = isPlaying ? animSpeed : 0;
        const newTime = (animTime + dt * spd) % 1;
        if (isPlaying) setAnimTime(newTime);
        const frame = sampleAnim(ANIM_LIBRARY[selectedAnim], isPlaying ? newTime : animTime);
        applyAnimFrame(modelRef.current, frame);
      }

      sceneAssets.forEach(asset => {
        if (asset.mesh && asset.type === 'unit') {
          const t = (clockRef.current.elapsedTime * 0.5) % 1;
          const frame = sampleAnim(ANIM_LIBRARY.idle, t);
          const parts = extractParts(asset.mesh as THREE.Group);
          if (parts) applyAnimFrame(parts, frame);
        }
      });

      if (gridRef.current) gridRef.current.visible = showGrid;

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };
    animate();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [sceneLoaded, editorMode, selectedAnim, animSpeed, isPlaying, animTime, showGrid, sceneAssets]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function extractParts(group: THREE.Group): ArticulatedParts | null {
    const findPart = (name: string) => {
      let found: THREE.Object3D | undefined;
      group.traverse(c => { if (c.userData.partName === name) found = c; });
      return found;
    };
    const torso = findPart('torso') as THREE.Mesh;
    const head = findPart('head') as THREE.Mesh;
    const leftArm = findPart('leftArm') as THREE.Group;
    const rightArm = findPart('rightArm') as THREE.Group;
    const leftLeg = findPart('leftLeg') as THREE.Group;
    const rightLeg = findPart('rightLeg') as THREE.Group;
    const weapon = findPart('weapon') as THREE.Mesh | undefined;
    if (!torso || !head || !leftArm || !rightArm || !leftLeg || !rightLeg) return null;
    return { root: group, torso, head, leftArm, rightArm, leftLeg, rightLeg, weapon };
  }

  const selectedAsset = sceneAssets.find(a => a.id === selectedAssetId);

  const renderPanel = (title: string, key: string, Icon: typeof Layers, children: JSX.Element) => (
    <div className="border-b border-gray-700">
      <button onClick={() => togglePanel(key)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-700/50 transition-colors">
        {expandedPanels[key] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Icon className="w-3 h-3" />
        <span className="uppercase tracking-wider">{title}</span>
      </button>
      {expandedPanels[key] && <div className="px-3 pb-3">{children}</div>}
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3 gap-2 shrink-0">
        <Link href="/wargus">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-gray-300 hover:text-white">
            <ArrowLeft className="w-3 h-3" /> Play Game
          </Button>
        </Link>
        <div className="h-5 w-px bg-gray-600" />
        <span className="text-sm font-bold text-amber-400">GGE</span>
        <span className="text-xs text-gray-400">Grudge Game Engine - RTS Scene</span>
        <div className="flex-1" />
        <div className="flex gap-1">
          {(['scene', 'model', 'animation', 'game'] as EditorMode[]).map(mode => (
            <Button key={mode} variant={editorMode === mode ? 'default' : 'ghost'} size="sm"
              className={`h-7 text-xs capitalize ${editorMode === mode ? 'bg-amber-600 hover:bg-amber-700' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setEditorMode(mode)}>
              {mode === 'scene' && <Layers className="w-3 h-3 mr-1" />}
              {mode === 'model' && <Box className="w-3 h-3 mr-1" />}
              {mode === 'animation' && <Play className="w-3 h-3 mr-1" />}
              {mode === 'game' && <Sword className="w-3 h-3 mr-1" />}
              {mode}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {editorMode !== 'game' && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto shrink-0">
            {(editorMode === 'scene') && (
              <>
                {renderPanel('Scene Hierarchy', 'hierarchy', Layers, (
                  <div className="space-y-1">
                    {sceneAssets.length === 0 && <p className="text-xs text-gray-500 italic">No assets placed</p>}
                    {sceneAssets.map(asset => (
                      <div key={asset.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${selectedAssetId === asset.id ? 'bg-amber-600/30 text-amber-300' : 'hover:bg-gray-700 text-gray-400'}`}
                        onClick={() => setSelectedAssetId(asset.id)}>
                        {asset.type === 'building' && <HomeIcon className="w-3 h-3" />}
                        {asset.type === 'environment' && <TreePine className="w-3 h-3" />}
                        {asset.type === 'unit' && <Sword className="w-3 h-3" />}
                        <span className="truncate flex-1">{asset.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }} className="opacity-50 hover:opacity-100 text-red-400">x</button>
                      </div>
                    ))}
                  </div>
                ))}

                {renderPanel('Add Assets', 'assets', Box, (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-semibold">Buildings (GLB)</p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.keys(GLB_ASSETS).map(name => (
                        <button key={name} onClick={() => addAssetToScene(name, name.includes('Tree') || name.includes('Rock') || name.includes('Gold') ? 'environment' : 'building')}
                          className="text-[10px] px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 truncate transition-colors">
                          {name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mt-2">Units</p>
                    <div className="grid grid-cols-2 gap-1">
                      {UNIT_TYPES.map(name => (
                        <button key={name} onClick={() => addAssetToScene(name, 'unit')}
                          className="text-[10px] px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 truncate transition-colors">
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {selectedAsset && renderPanel('Properties', 'properties', Settings, (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-gray-500">Name</label>
                      <p className="text-gray-200">{selectedAsset.name}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Position</label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        {(['x', 'y', 'z'] as const).map(axis => (
                          <div key={axis}>
                            <span className="text-gray-600 text-[10px]">{axis.toUpperCase()}</span>
                            <input type="number" step="0.5" value={selectedAsset.position[axis].toFixed(1)}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setSceneAssets(prev => prev.map(a => {
                                  if (a.id !== selectedAssetId) return a;
                                  const newPos = { ...a.position, [axis]: val };
                                  if (a.mesh) a.mesh.position.set(newPos.x, newPos.y, newPos.z);
                                  return { ...a, position: newPos };
                                }));
                              }}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500">Scale</label>
                      <input type="range" min="0.1" max="5" step="0.1" value={selectedAsset.scale}
                        onChange={(e) => {
                          const s = parseFloat(e.target.value);
                          setSceneAssets(prev => prev.map(a => {
                            if (a.id !== selectedAssetId) return a;
                            if (a.mesh) a.mesh.scale.setScalar(s);
                            return { ...a, scale: s };
                          }));
                        }}
                        className="w-full"
                      />
                      <span className="text-gray-400">{selectedAsset.scale.toFixed(1)}x</span>
                    </div>
                    <div>
                      <label className="text-gray-500">Rotation Y</label>
                      <input type="range" min="0" max="6.28" step="0.1" value={selectedAsset.rotation.y}
                        onChange={(e) => {
                          const r = parseFloat(e.target.value);
                          setSceneAssets(prev => prev.map(a => {
                            if (a.id !== selectedAssetId) return a;
                            if (a.mesh) a.mesh.rotation.y = r;
                            return { ...a, rotation: { ...a.rotation, y: r } };
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs"
                      onClick={() => removeAsset(selectedAsset.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </>
            )}

            {(editorMode === 'model') && (
              <>
                {renderPanel('Unit Type', 'unitType', Box, (
                  <div className="space-y-1">
                    {UNIT_TYPES.map(type => (
                      <button key={type} onClick={() => setSelectedUnit(type)}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${selectedUnit === type ? 'bg-amber-600/30 text-amber-300' : 'hover:bg-gray-700 text-gray-400'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                ))}
                {renderPanel('Faction Color', 'factionColor', Paintbrush, (
                  <div className="flex gap-2 flex-wrap">
                    {['#2244AA', '#AA2222', '#22AA22', '#AA8800', '#8822AA', '#22AAAA'].map(c => (
                      <button key={c} onClick={() => setFactionColor(c)}
                        className={`w-7 h-7 rounded border-2 transition-colors ${factionColor === c ? 'border-white' : 'border-gray-600'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input type="color" value={factionColor} onChange={(e) => setFactionColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-gray-600" />
                  </div>
                ))}
                {renderPanel('Model Info', 'modelInfo', Settings, (
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Parts: torso, head, arms(2), legs(2), weapon</p>
                    <p>Material: MeshStandard PBR</p>
                    <p>Weapon: {UNIT_COLORS[selectedUnit].weapon}</p>
                    <p>Poly Count: ~450 tris</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={showWireframe} onChange={(e) => {
                        setShowWireframe(e.target.checked);
                        if (modelRef.current) {
                          modelRef.current.root.traverse(c => {
                            if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                              c.material.wireframe = e.target.checked;
                            }
                          });
                        }
                      }} />
                      <span>Wireframe</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {(editorMode === 'animation') && (
              <>
                {renderPanel('Unit Type', 'unitType', Box, (
                  <div className="space-y-1">
                    {UNIT_TYPES.map(type => (
                      <button key={type} onClick={() => setSelectedUnit(type)}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${selectedUnit === type ? 'bg-amber-600/30 text-amber-300' : 'hover:bg-gray-700 text-gray-400'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                ))}
                {renderPanel('Animations', 'animations', Play, (
                  <div className="space-y-1">
                    {(Object.keys(ANIM_LIBRARY) as AnimStateName[]).map(anim => {
                      const Icon = ANIM_ICONS[anim];
                      return (
                        <button key={anim} onClick={() => { setSelectedAnim(anim); setAnimTime(0); }}
                          className={`w-full flex items-center gap-2 text-left text-xs px-2 py-1.5 rounded transition-colors ${selectedAnim === anim ? 'bg-amber-600/30 text-amber-300' : 'hover:bg-gray-700 text-gray-400'}`}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{anim}</span>
                          <span className="ml-auto text-[10px] text-gray-600">{ANIM_LIBRARY[anim].length}kf</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
                {renderPanel('Playback', 'playback', Settings, (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setAnimTime(0)}>
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                      <span className="text-[10px] text-gray-500 ml-auto">{(animTime * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Timeline</label>
                      <input type="range" min="0" max="1" step="0.01" value={animTime}
                        onChange={(e) => { setAnimTime(parseFloat(e.target.value)); setIsPlaying(false); }}
                        className="w-full" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Speed: {animSpeed.toFixed(1)}x</label>
                      <input type="range" min="0.1" max="3" step="0.1" value={animSpeed}
                        onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
                        className="w-full" />
                    </div>
                  </div>
                ))}
                {renderPanel('Keyframe Data', 'keyframes', Layers, (
                  <div className="space-y-1 text-[10px] font-mono text-gray-500">
                    {ANIM_LIBRARY[selectedAnim].map((kf, i) => (
                      <div key={i} className={`px-1 py-0.5 rounded ${Math.abs(animTime - kf.time) < 0.05 ? 'bg-amber-600/20 text-amber-300' : ''}`}>
                        t:{kf.time.toFixed(2)} LA:{kf.leftArmRot.toFixed(1)} RA:{kf.rightArmRot.toFixed(1)} LL:{kf.leftLegRot.toFixed(1)} RL:{kf.rightLegRot.toFixed(1)}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <div className="flex-1 relative">
          {editorMode === 'game' ? (
            <iframe src="/wargus" className="w-full h-full border-0" title="Wargus RTS" />
          ) : (
            <div ref={containerRef} className="w-full h-full" />
          )}

          {editorMode !== 'game' && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs bg-gray-800/80 text-gray-300 hover:text-white" onClick={() => setShowGrid(!showGrid)}>
                  {showGrid ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  Grid
                </Button>
              </div>
              <div className="bg-gray-800/80 rounded px-3 py-1 text-[10px] text-gray-400">
                {editorMode === 'scene' && `${sceneAssets.length} objects`}
                {editorMode === 'model' && `${selectedUnit} - ${UNIT_COLORS[selectedUnit].weapon}`}
                {editorMode === 'animation' && `${selectedAnim} - ${ANIM_LIBRARY[selectedAnim].length} keyframes - ${(animTime * 100).toFixed(0)}%`}
              </div>
            </div>
          )}

          {(editorMode === 'model' || editorMode === 'animation') && (
            <div className="absolute top-3 right-3 bg-gray-800/90 rounded-lg p-2 text-xs text-gray-400 space-y-1">
              <p className="text-amber-400 font-semibold">{selectedUnit}</p>
              <p>Anim: <span className="text-gray-200 capitalize">{selectedAnim}</span></p>
              {editorMode === 'animation' && (
                <>
                  <p>Frame: <span className="text-gray-200">{(animTime * ANIM_LIBRARY[selectedAnim].length).toFixed(1)}</span></p>
                  <p>Speed: <span className="text-gray-200">{animSpeed}x</span></p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}