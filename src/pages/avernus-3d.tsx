import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type WeaponType = 'greatsword' | 'bow' | 'sabres' | 'scythe' | 'runeblade';
type AbilityKey = 'Q' | 'E' | 'R' | 'F';

interface Ability {
  key: AbilityKey;
  name: string;
  cooldown: number;
  maxCooldown: number;
  cost: number;
  costType: 'mana' | 'rage' | 'energy';
  description: string;
  unlocked: boolean;
}

interface WeaponData {
  type: WeaponType;
  name: string;
  icon: string;
  subclass: string;
  abilities: Ability[];
  resourceType: 'mana' | 'rage' | 'energy';
  color: string;
}

interface Unit {
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  team: 'player' | 'enemy';
  type: 'minion' | 'elite' | 'tower' | 'inhibitor';
  position: THREE.Vector3;
  target?: THREE.Vector3;
}

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  team: 'player' | 'enemy';
  type: string;
  lifetime: number;
}

const WEAPONS: WeaponData[] = [
  {
    type: 'greatsword',
    name: 'Greatsword',
    icon: '💎',
    subclass: 'IMMORTAL',
    color: '#00bfff',
    resourceType: 'rage',
    abilities: [
      { key: 'Q', name: 'Fullguard', cooldown: 0, maxCooldown: 7, cost: 0, costType: 'rage', description: 'Block all damage for 3s', unlocked: true },
      { key: 'E', name: 'Charge', cooldown: 0, maxCooldown: 8, cost: 0, costType: 'rage', description: 'Dash forward, gain 25 rage', unlocked: false },
      { key: 'R', name: 'Colossus Strike', cooldown: 0, maxCooldown: 5, cost: 25, costType: 'rage', description: 'Lightning bolt scales with rage', unlocked: false },
      { key: 'F', name: 'Divine Wind', cooldown: 0, maxCooldown: 1.5, cost: 10, costType: 'rage', description: 'Launch sword, 120 piercing damage', unlocked: false },
    ]
  },
  {
    type: 'bow',
    name: 'Bow',
    icon: '🏹',
    subclass: 'VIPER',
    color: '#00ff00',
    resourceType: 'energy',
    abilities: [
      { key: 'Q', name: 'Frost Bite', cooldown: 0, maxCooldown: 5, cost: 50, costType: 'energy', description: 'Fire 5 arrows, apply SLOW', unlocked: true },
      { key: 'E', name: 'Cobra Shot', cooldown: 0, maxCooldown: 2, cost: 60, costType: 'energy', description: 'Apply VENOM DoT', unlocked: false },
      { key: 'R', name: 'Viper Sting', cooldown: 0, maxCooldown: 2, cost: 60, costType: 'energy', description: 'Piercing arrow returns to heal', unlocked: false },
      { key: 'F', name: 'Cloudkill', cooldown: 0, maxCooldown: 4, cost: 40, costType: 'energy', description: 'Arrow barrage from sky', unlocked: false },
    ]
  },
  {
    type: 'sabres',
    name: 'Sabres',
    icon: '⚔️',
    subclass: 'ASSASSIN',
    color: '#ff4444',
    resourceType: 'energy',
    abilities: [
      { key: 'Q', name: 'Backstab', cooldown: 0, maxCooldown: 2, cost: 60, costType: 'energy', description: '75 dmg, 175 from behind', unlocked: true },
      { key: 'E', name: 'Flourish', cooldown: 0, maxCooldown: 1.5, cost: 35, costType: 'energy', description: 'Flurry, stacks to STUN', unlocked: false },
      { key: 'R', name: 'Divebomb', cooldown: 0, maxCooldown: 6, cost: 40, costType: 'energy', description: 'Leap crash, STUN 2s', unlocked: false },
      { key: 'F', name: 'Shadow Step', cooldown: 0, maxCooldown: 10, cost: 0, costType: 'energy', description: 'INVISIBLE 5s', unlocked: false },
    ]
  },
  {
    type: 'scythe',
    name: 'Scythe',
    icon: '🦋',
    subclass: 'WEAVER',
    color: '#4169e1',
    resourceType: 'mana',
    abilities: [
      { key: 'Q', name: 'Sunwell', cooldown: 0, maxCooldown: 1, cost: 30, costType: 'mana', description: 'Heal 60 HP', unlocked: true },
      { key: 'E', name: 'Coldsnap', cooldown: 0, maxCooldown: 12, cost: 50, costType: 'mana', description: 'FREEZE enemies 6s', unlocked: false },
      { key: 'R', name: 'Crossentropy', cooldown: 0, maxCooldown: 2, cost: 40, costType: 'mana', description: 'Plasma bolt, +10 per BURN stack', unlocked: false },
      { key: 'F', name: 'Mantra', cooldown: 0, maxCooldown: 5, cost: 75, costType: 'mana', description: 'Healing totem 8s', unlocked: false },
    ]
  },
  {
    type: 'runeblade',
    name: 'Runeblade',
    icon: '🔮',
    subclass: 'TEMPLAR',
    color: '#9400d3',
    resourceType: 'mana',
    abilities: [
      { key: 'Q', name: 'Void Grasp', cooldown: 0, maxCooldown: 5, cost: 35, costType: 'mana', description: 'Pull enemy towards you', unlocked: true },
      { key: 'E', name: 'Wraithblade', cooldown: 0, maxCooldown: 3, cost: 35, costType: 'mana', description: 'CORRUPTED, 90% slow', unlocked: false },
      { key: 'R', name: 'Hexed Smite', cooldown: 0, maxCooldown: 3, cost: 45, costType: 'mana', description: 'AoE damage, heal same amount', unlocked: false },
      { key: 'F', name: 'Heartrend', cooldown: 0, maxCooldown: 0, cost: 24, costType: 'mana', description: 'Toggle: +45% crit, +75% crit dmg', unlocked: false },
    ]
  }
];

export default function Avernus3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInitializedRef = useRef(false);
  const gameLoopIdRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [selectedWeapons, setSelectedWeapons] = useState<{ primary: WeaponType | null; secondary: WeaponType | null }>({ primary: null, secondary: null });
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType | null>(null);
  
  const [playerHealth, setPlayerHealth] = useState(1000);
  const [maxHealth, setMaxHealth] = useState(1000);
  const [playerShield, setPlayerShield] = useState(100);
  const [maxShield, setMaxShield] = useState(100);
  const [resource, setResource] = useState(100);
  const [maxResource, setMaxResource] = useState(100);
  
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [skillPoints, setSkillPoints] = useState(2);
  const [kills, setKills] = useState(0);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const unitsRef = useRef<Unit[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const playerVelRef = useRef(new THREE.Vector3(0, 0, 0));
  const playerRotRef = useRef(0);

  const handleWeaponSelect = useCallback((weapon: WeaponType) => {
    setSelectedWeapons(prev => {
      if (prev.primary === weapon) {
        return { ...prev, primary: null };
      }
      if (prev.secondary === weapon) {
        return { ...prev, secondary: null };
      }
      if (!prev.primary) {
        return { ...prev, primary: weapon };
      }
      if (!prev.secondary) {
        return { ...prev, secondary: weapon };
      }
      return prev;
    });
  }, []);

  const startGame = useCallback(() => {
    if (!selectedWeapons.primary || !selectedWeapons.secondary) return;
    setCurrentWeapon(selectedWeapons.primary);
    setGameState('playing');
    setPlayerHealth(1000);
    setPlayerShield(100);
    setResource(100);
    setLevel(1);
    setExperience(0);
    setSkillPoints(2);
    setKills(0);
  }, [selectedWeapons]);

  const createWeaponModel = useCallback((type: WeaponType): THREE.Group => {
    const group = new THREE.Group();
    const weapon = WEAPONS.find(w => w.type === type);
    const color = weapon ? weapon.color : '#ffffff';
    
    if (type === 'greatsword') {
      const bladeGeom = new THREE.BoxGeometry(0.15, 2.5, 0.08);
      const bladeMat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.2 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.y = 1.5;
      group.add(blade);
      
      const guardGeom = new THREE.BoxGeometry(0.6, 0.1, 0.15);
      const guard = new THREE.Mesh(guardGeom, bladeMat);
      guard.position.y = 0.2;
      group.add(guard);
      
      const handleGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const handle = new THREE.Mesh(handleGeom, handleMat);
      handle.position.y = -0.1;
      group.add(handle);
    } else if (type === 'bow') {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.8, 0.3),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.8, 0.3)
      ]);
      const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);
      const bowMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const bow = new THREE.Mesh(tubeGeom, bowMat);
      group.add(bow);
      
      const stringGeom = new THREE.CylinderGeometry(0.005, 0.005, 1.6, 4);
      const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const string = new THREE.Mesh(stringGeom, stringMat);
      string.position.z = 0.15;
      group.add(string);
    } else if (type === 'sabres') {
      for (let i = 0; i < 2; i++) {
        const bladeGeom = new THREE.BoxGeometry(0.08, 1.2, 0.02);
        const bladeMat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.1 });
        const blade = new THREE.Mesh(bladeGeom, bladeMat);
        blade.position.set(i === 0 ? -0.15 : 0.15, 0.8, 0);
        blade.rotation.z = i === 0 ? 0.1 : -0.1;
        group.add(blade);
      }
    } else if (type === 'scythe') {
      const staffGeom = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8);
      const staffMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
      const staff = new THREE.Mesh(staffGeom, staffMat);
      group.add(staff);
      
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0);
      bladeShape.quadraticCurveTo(0.8, 0.2, 1.2, 0);
      bladeShape.quadraticCurveTo(0.8, -0.1, 0, -0.15);
      const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.02, bevelEnabled: false });
      const bladeMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.set(0, 1.25, 0);
      blade.rotation.z = -Math.PI / 6;
      group.add(blade);
    } else if (type === 'runeblade') {
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0);
      bladeShape.lineTo(-0.1, 0.1);
      bladeShape.quadraticCurveTo(0.8, 0.05, 1.8, 0.2);
      bladeShape.lineTo(1.8, -0.1);
      bladeShape.quadraticCurveTo(0.8, -0.2, 0, -0.15);
      bladeShape.lineTo(0, 0);
      const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
      const bladeMat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3, emissive: color, emissiveIntensity: 0.3 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.rotation.z = -Math.PI / 4;
      blade.position.y = 0.5;
      group.add(blade);
    }
    
    return group;
  }, []);

  const createPlayerModel = useCallback((): THREE.Group => {
    const group = new THREE.Group();
    
    const bodyGeom = new THREE.CapsuleGeometry(0.3, 1.0, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.3, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    group.add(body);
    
    const headGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = 1.9;
    head.castShadow = true;
    group.add(head);
    
    const helmetGeom = new THREE.ConeGeometry(0.25, 0.3, 8);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
    const helmet = new THREE.Mesh(helmetGeom, helmetMat);
    helmet.position.y = 2.1;
    helmet.castShadow = true;
    group.add(helmet);
    
    for (let i = 0; i < 2; i++) {
      const armGeom = new THREE.CapsuleGeometry(0.08, 0.5, 4, 8);
      const arm = new THREE.Mesh(armGeom, bodyMat);
      arm.position.set(i === 0 ? -0.4 : 0.4, 1.2, 0);
      arm.rotation.z = i === 0 ? 0.3 : -0.3;
      arm.castShadow = true;
      group.add(arm);
    }
    
    return group;
  }, []);

  const createArena = useCallback((scene: THREE.Scene) => {
    const groundGeom = new THREE.CircleGeometry(30, 64);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const lavaGeom = new THREE.RingGeometry(30, 50, 64);
    const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const lava = new THREE.Mesh(lavaGeom, lavaMat);
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = -0.1;
    scene.add(lava);
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const pillarGeom = new THREE.CylinderGeometry(1, 1.2, 4, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(Math.cos(angle) * 25, 2, Math.sin(angle) * 25);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
    }
    
    for (let side = 0; side < 2; side++) {
      const towerGeom = new THREE.CylinderGeometry(2, 2.5, 8, 8);
      const towerMat = new THREE.MeshStandardMaterial({ 
        color: side === 0 ? 0x0066ff : 0xff3300,
        metalness: 0.5,
        roughness: 0.5
      });
      const tower = new THREE.Mesh(towerGeom, towerMat);
      tower.position.set(side === 0 ? -20 : 20, 4, 0);
      tower.castShadow = true;
      scene.add(tower);
      
      unitsRef.current.push({
        mesh: tower as unknown as THREE.Group,
        health: 5000,
        maxHealth: 5000,
        team: side === 0 ? 'player' : 'enemy',
        type: 'tower',
        position: tower.position.clone()
      });
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !containerRef.current || gameInitializedRef.current) return;
    
    gameInitializedRef.current = true;
    const container = containerRef.current;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 60);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xff6600, 1.0);
    sunLight.position.set(10, 30, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    scene.add(sunLight);
    
    const fillLight = new THREE.PointLight(0x4466ff, 0.5, 50);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
    
    createArena(scene);
    
    const player = createPlayerModel();
    player.position.set(-15, 0, 0);
    playerPosRef.current.copy(player.position);
    scene.add(player);
    playerRef.current = player;
    
    if (currentWeapon) {
      const weaponModel = createWeaponModel(currentWeapon);
      weaponModel.position.set(0.5, 1.0, 0.3);
      weaponModel.scale.set(0.5, 0.5, 0.5);
      player.add(weaponModel);
    }
    
    const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onMouseDown = () => { mouseRef.current.down = true; };
    const onMouseUp = () => { mouseRef.current.down = false; };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    
    const animate = () => {
      const delta = clockRef.current.getDelta();
      const keys = keysRef.current;
      
      const moveSpeed = 8 * delta;
      const moveDir = new THREE.Vector3();
      
      if (keys['KeyW'] || keys['ArrowUp']) moveDir.z -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveDir.z += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveDir.x -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveDir.x += 1;
      
      if (moveDir.length() > 0) {
        moveDir.normalize().multiplyScalar(moveSpeed);
        playerPosRef.current.add(moveDir);
        
        const maxDist = 28;
        if (playerPosRef.current.length() > maxDist) {
          playerPosRef.current.normalize().multiplyScalar(maxDist);
        }
        
        playerRotRef.current = Math.atan2(moveDir.x, moveDir.z);
      }
      
      if (playerRef.current) {
        playerRef.current.position.lerp(playerPosRef.current, 0.15);
        playerRef.current.rotation.y = playerRotRef.current;
      }
      
      if (camera && playerRef.current) {
        const targetCamPos = new THREE.Vector3(
          playerRef.current.position.x,
          12,
          playerRef.current.position.z + 15
        );
        camera.position.lerp(targetCamPos, 0.05);
        camera.lookAt(playerRef.current.position);
      }
      
      projectilesRef.current.forEach((proj, i) => {
        proj.mesh.position.add(proj.velocity.clone().multiplyScalar(delta));
        proj.lifetime -= delta;
        
        if (proj.lifetime <= 0 || proj.mesh.position.length() > 50) {
          scene.remove(proj.mesh);
          projectilesRef.current.splice(i, 1);
        }
      });
      
      renderer.render(scene, camera);
      gameLoopIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      
      if (gameLoopIdRef.current) {
        cancelAnimationFrame(gameLoopIdRef.current);
      }
      
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      gameInitializedRef.current = false;
    };
  }, [gameState, currentWeapon, createArena, createPlayerModel, createWeaponModel]);

  const getCurrentWeaponData = useCallback(() => {
    return WEAPONS.find(w => w.type === currentWeapon);
  }, [currentWeapon]);

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <div className="absolute top-4 left-4 z-10">
          <Link href="/super-engine">
            <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500">
            🌋 AVERNUS
          </h1>
          <p className="text-xl text-gray-300 mb-8">1v1 PVP 3D Action Combat</p>
          
          <div className="bg-gray-900/80 p-6 rounded-xl border border-purple-500/50 max-w-4xl w-full">
            <h2 className="text-xl font-semibold text-center text-purple-400 mb-4">
              SELECT 2 WEAPONS
            </h2>
            <p className="text-center text-gray-400 text-sm mb-6">
              Primary (1) | Secondary (2)
            </p>
            
            <div className="grid grid-cols-5 gap-3 mb-6">
              {WEAPONS.map(weapon => {
                const isPrimary = selectedWeapons.primary === weapon.type;
                const isSecondary = selectedWeapons.secondary === weapon.type;
                const isSelected = isPrimary || isSecondary;
                const canSelect = !isSelected && !selectedWeapons.primary || !isSelected && !selectedWeapons.secondary || isSelected;
                
                return (
                  <div
                    key={weapon.type}
                    onClick={() => handleWeaponSelect(weapon.type)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30' 
                        : canSelect 
                          ? 'border-gray-600 bg-gray-800/50 hover:border-gray-400' 
                          : 'border-gray-700 bg-gray-900/50 opacity-50'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{weapon.icon}</div>
                      <h3 className="font-bold text-sm">{weapon.name}</h3>
                      <p className="text-xs text-gray-400">{weapon.subclass}</p>
                      {isSelected && (
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${isPrimary ? 'bg-blue-600' : 'bg-orange-600'}`}>
                          {isPrimary ? 'Primary' : 'Secondary'}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex justify-center gap-1">
                      {weapon.abilities.map(ability => (
                        <div
                          key={ability.key}
                          className="w-6 h-6 rounded border border-gray-600 bg-gray-700 flex items-center justify-center text-xs"
                          title={`${ability.key}: ${ability.name}`}
                        >
                          {ability.key}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={startGame}
                disabled={!selectedWeapons.primary || !selectedWeapons.secondary}
                className={`px-8 py-3 text-lg font-bold ${
                  selectedWeapons.primary && selectedWeapons.secondary
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                ENTER AVERNUS
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" data-testid="game-canvas" />
      
      <div className="absolute top-4 left-4 z-10">
        <Link href="/super-engine">
          <Button variant="outline" size="sm" className="border-white/50 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Exit
          </Button>
        </Link>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Level {level}</div>
          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500"
              style={{ width: `${(experience / (level * 100)) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-white font-bold">Kills: {kills}</div>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-sm">HP</span>
          <div className="w-48 h-4 bg-gray-800 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400"
              style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
            />
          </div>
          <span className="text-white text-sm">{playerHealth}/{maxHealth}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-sm">Shield</span>
          <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${(playerShield / maxShield) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm">
            {getCurrentWeaponData()?.resourceType.toUpperCase()}
          </span>
          <div className="w-48 h-3 bg-gray-800 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
              style={{ width: `${(resource / maxResource) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        {selectedWeapons.primary && (
          <div className={`px-4 py-2 rounded border-2 ${currentWeapon === selectedWeapons.primary ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600 bg-gray-800/50'}`}>
            <span className="text-xs text-gray-400 block">1</span>
            <span className="text-2xl">{WEAPONS.find(w => w.type === selectedWeapons.primary)?.icon}</span>
          </div>
        )}
        {selectedWeapons.secondary && (
          <div className={`px-4 py-2 rounded border-2 ${currentWeapon === selectedWeapons.secondary ? 'border-orange-500 bg-orange-500/20' : 'border-gray-600 bg-gray-800/50'}`}>
            <span className="text-xs text-gray-400 block">2</span>
            <span className="text-2xl">{WEAPONS.find(w => w.type === selectedWeapons.secondary)?.icon}</span>
          </div>
        )}
        
        <div className="flex gap-2 ml-4">
          {getCurrentWeaponData()?.abilities.map(ability => (
            <div
              key={ability.key}
              className={`w-12 h-12 rounded border-2 flex flex-col items-center justify-center ${
                ability.unlocked ? 'border-purple-500 bg-purple-500/20' : 'border-gray-600 bg-gray-800/50 opacity-50'
              }`}
            >
              <span className="text-xs font-bold">{ability.key}</span>
              <span className="text-[10px] text-gray-400 truncate w-full text-center">{ability.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 z-10 text-right text-white text-sm">
        <div>WASD - Move</div>
        <div>Mouse - Aim</div>
        <div>Click - Attack</div>
        <div>Q/E/R/F - Abilities</div>
        <div>1/2 - Switch Weapon</div>
      </div>
    </div>
  );
}
