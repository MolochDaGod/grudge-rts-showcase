import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, FastForward } from "lucide-react";
import { Link } from "wouter";
import * as THREE from 'three';

interface Tower {
  mesh: THREE.Group;
  type: 'dart' | 'frost' | 'bash' | 'pellet' | 'squirt' | 'swarm' | 'snap' | 'boost';
  position: THREE.Vector3;
  range: number;
  damage: number;
  fireRate: number;
  lastFire: number;
  level: number;
  cost: number;
}

interface Creep {
  mesh: THREE.Group;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  position: THREE.Vector3;
  type: 'normal' | 'fast' | 'immune' | 'flying' | 'spawn' | 'dark';
  reward: number;
  effects: { slow?: number; burn?: number };
}

interface Bullet {
  mesh: THREE.Mesh;
  target: Creep | null;
  velocity: THREE.Vector3;
  damage: number;
  type: string;
  lifetime: number;
}

const TOWER_DATA: Record<string, { name: string; cost: number; damage: number; range: number; fireRate: number; color: number; description: string }> = {
  dart: { name: 'Dart', cost: 50, damage: 10, range: 5, fireRate: 0.8, color: 0x00ff00, description: 'Basic tower, fast attack' },
  frost: { name: 'Frost', cost: 75, damage: 5, range: 4, fireRate: 1.2, color: 0x00ffff, description: 'Slows enemies' },
  bash: { name: 'Bash', cost: 100, damage: 25, range: 3, fireRate: 2.0, color: 0xff8800, description: 'High damage, slow attack' },
  pellet: { name: 'Pellet', cost: 60, damage: 8, range: 6, fireRate: 0.5, color: 0xffff00, description: 'Long range sniper' },
  squirt: { name: 'Squirt', cost: 80, damage: 3, range: 4, fireRate: 0.2, color: 0x0088ff, description: 'Rapid fire stream' },
  swarm: { name: 'Swarm', cost: 90, damage: 15, range: 5, fireRate: 1.5, color: 0xff00ff, description: 'Hits multiple targets' },
  snap: { name: 'Snap', cost: 120, damage: 40, range: 7, fireRate: 3.0, color: 0xff0000, description: 'Explosive damage' },
  boost: { name: 'Boost', cost: 150, damage: 0, range: 4, fireRate: 0, color: 0xffffff, description: 'Buffs nearby towers' }
};

const PATH_POINTS = [
  new THREE.Vector3(-15, 0, 0),
  new THREE.Vector3(-10, 0, 0),
  new THREE.Vector3(-10, 0, 8),
  new THREE.Vector3(0, 0, 8),
  new THREE.Vector3(0, 0, -8),
  new THREE.Vector3(10, 0, -8),
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(15, 0, 0)
];

export default function TowerDefense() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInitializedRef = useRef(false);
  const gameLoopIdRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu');
  const [lives, setLives] = useState(20);
  const [gold, setGold] = useState(200);
  const [wave, setWave] = useState(0);
  const [maxWaves] = useState(20);
  const [score, setScore] = useState(0);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [waveInProgress, setWaveInProgress] = useState(false);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const towersRef = useRef<Tower[]>([]);
  const creepsRef = useRef<Creep[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const spawnTimerRef = useRef(0);
  const creepsToSpawnRef = useRef(0);
  const gridRef = useRef<THREE.Group | null>(null);
  const pathMeshRef = useRef<THREE.Mesh | null>(null);

  const createTowerMesh = useCallback((type: string): THREE.Group => {
    const group = new THREE.Group();
    const data = TOWER_DATA[type];
    
    const baseGeom = new THREE.CylinderGeometry(0.6, 0.7, 0.3, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.15;
    base.castShadow = true;
    group.add(base);
    
    const towerGeom = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: data.color, metalness: 0.6, roughness: 0.3 });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = 0.9;
    tower.castShadow = true;
    group.add(tower);
    
    const topGeom = new THREE.SphereGeometry(0.25, 8, 8);
    const topMat = new THREE.MeshStandardMaterial({ color: data.color, emissive: data.color, emissiveIntensity: 0.3 });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = 1.6;
    top.castShadow = true;
    group.add(top);
    
    return group;
  }, []);

  const createCreepMesh = useCallback((type: string): THREE.Group => {
    const group = new THREE.Group();
    
    const colors: Record<string, number> = {
      normal: 0x00aa00,
      fast: 0xff6600,
      immune: 0x666666,
      flying: 0x00aaff,
      spawn: 0xaa00aa,
      dark: 0x220022
    };
    
    const bodyGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: colors[type] || colors.normal, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);
    
    const eyeGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const eye1 = new THREE.Mesh(eyeGeom, eyeMat);
    eye1.position.set(-0.15, 0.5, 0.31);
    group.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeom, eyeMat);
    eye2.position.set(0.15, 0.5, 0.31);
    group.add(eye2);
    
    return group;
  }, []);

  const createPath = useCallback((scene: THREE.Scene) => {
    const shape = new THREE.Shape();
    const pathWidth = 1.5;
    
    shape.moveTo(PATH_POINTS[0].x - pathWidth/2, PATH_POINTS[0].z);
    
    for (let i = 0; i < PATH_POINTS.length; i++) {
      const p = PATH_POINTS[i];
      const next = PATH_POINTS[i + 1];
      
      if (next) {
        const dx = next.x - p.x;
        const dz = next.z - p.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        const nx = -dz / len * pathWidth / 2;
        const nz = dx / len * pathWidth / 2;
      }
    }
    
    const pathGeom = new THREE.PlaneGeometry(32, 2);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
    
    for (let i = 0; i < PATH_POINTS.length - 1; i++) {
      const start = PATH_POINTS[i];
      const end = PATH_POINTS[i + 1];
      
      const segGeom = new THREE.PlaneGeometry(
        start.distanceTo(end),
        1.5
      );
      const segment = new THREE.Mesh(segGeom, pathMat);
      segment.rotation.x = -Math.PI / 2;
      segment.position.set(
        (start.x + end.x) / 2,
        0.01,
        (start.z + end.z) / 2
      );
      segment.rotation.z = -Math.atan2(end.z - start.z, end.x - start.x);
      segment.receiveShadow = true;
      scene.add(segment);
    }
  }, []);

  const placeTower = useCallback((x: number, z: number, type: string) => {
    const scene = sceneRef.current;
    if (!scene) return false;
    
    const data = TOWER_DATA[type];
    if (gold < data.cost) return false;
    
    const gridX = Math.round(x / 2) * 2;
    const gridZ = Math.round(z / 2) * 2;
    
    const existingTower = towersRef.current.find(t => 
      Math.abs(t.position.x - gridX) < 1 && Math.abs(t.position.z - gridZ) < 1
    );
    if (existingTower) return false;
    
    const onPath = PATH_POINTS.some((p, i) => {
      if (i === PATH_POINTS.length - 1) return false;
      const next = PATH_POINTS[i + 1];
      const dist = distanceToSegment(new THREE.Vector3(gridX, 0, gridZ), p, next);
      return dist < 1.5;
    });
    if (onPath) return false;
    
    const mesh = createTowerMesh(type);
    mesh.position.set(gridX, 0, gridZ);
    scene.add(mesh);
    
    const tower: Tower = {
      mesh,
      type: type as Tower['type'],
      position: new THREE.Vector3(gridX, 0, gridZ),
      range: data.range,
      damage: data.damage,
      fireRate: data.fireRate,
      lastFire: 0,
      level: 1,
      cost: data.cost
    };
    
    towersRef.current.push(tower);
    setGold(prev => prev - data.cost);
    return true;
  }, [gold, createTowerMesh]);

  const distanceToSegment = (point: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3): number => {
    const ab = b.clone().sub(a);
    const ap = point.clone().sub(a);
    const t = Math.max(0, Math.min(1, ap.dot(ab) / ab.dot(ab)));
    const closest = a.clone().add(ab.multiplyScalar(t));
    return point.distanceTo(closest);
  };

  const spawnWave = useCallback(() => {
    const waveNum = wave + 1;
    setWave(waveNum);
    setWaveInProgress(true);
    creepsToSpawnRef.current = 5 + waveNum * 2;
    spawnTimerRef.current = 0;
  }, [wave]);

  const spawnCreep = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    const types: Creep['type'][] = ['normal', 'fast', 'immune', 'spawn', 'dark'];
    const type = wave > 5 ? types[Math.floor(Math.random() * types.length)] : 'normal';
    
    const stats: Record<string, { health: number; speed: number; reward: number }> = {
      normal: { health: 50 + wave * 10, speed: 2, reward: 10 },
      fast: { health: 30 + wave * 5, speed: 4, reward: 15 },
      immune: { health: 80 + wave * 15, speed: 1.5, reward: 20 },
      flying: { health: 40 + wave * 8, speed: 3, reward: 15 },
      spawn: { health: 60 + wave * 12, speed: 1.8, reward: 25 },
      dark: { health: 100 + wave * 20, speed: 1.2, reward: 30 }
    };
    
    const creepStats = stats[type];
    const mesh = createCreepMesh(type);
    mesh.position.copy(PATH_POINTS[0]);
    scene.add(mesh);
    
    const creep: Creep = {
      mesh,
      health: creepStats.health,
      maxHealth: creepStats.health,
      speed: creepStats.speed,
      pathIndex: 0,
      position: PATH_POINTS[0].clone(),
      type,
      reward: creepStats.reward,
      effects: {}
    };
    
    creepsRef.current.push(creep);
  }, [wave, createCreepMesh]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setLives(20);
    setGold(200);
    setWave(0);
    setScore(0);
    towersRef.current = [];
    creepsRef.current = [];
    bulletsRef.current = [];
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !containerRef.current || gameInitializedRef.current) return;
    
    gameInitializedRef.current = true;
    const container = containerRef.current;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2a1a);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 25, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.0);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);
    
    const groundGeom = new THREE.PlaneGeometry(40, 25);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    createPath(scene);
    
    const gridGroup = new THREE.Group();
    for (let x = -18; x <= 18; x += 2) {
      for (let z = -10; z <= 10; z += 2) {
        const gridGeom = new THREE.PlaneGeometry(1.8, 1.8);
        const gridMat = new THREE.MeshBasicMaterial({ 
          color: 0x3a5a3a, 
          transparent: true, 
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        const gridTile = new THREE.Mesh(gridGeom, gridMat);
        gridTile.rotation.x = -Math.PI / 2;
        gridTile.position.set(x, 0.02, z);
        gridGroup.add(gridTile);
      }
    }
    scene.add(gridGroup);
    gridRef.current = gridGroup;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onClick = (e: MouseEvent) => {
      if (!selectedTower) return;
      
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ground);
      
      if (intersects.length > 0) {
        const point = intersects[0].point;
        placeTower(point.x, point.z, selectedTower);
      }
    };
    
    container.addEventListener('click', onClick);
    
    const animate = () => {
      const delta = clockRef.current.getDelta() * gameSpeed;
      
      if (creepsToSpawnRef.current > 0) {
        spawnTimerRef.current += delta;
        if (spawnTimerRef.current >= 0.5) {
          spawnCreep();
          creepsToSpawnRef.current--;
          spawnTimerRef.current = 0;
        }
      }
      
      creepsRef.current.forEach((creep, i) => {
        if (creep.health <= 0) {
          scene.remove(creep.mesh);
          creepsRef.current.splice(i, 1);
          setGold(prev => prev + creep.reward);
          setScore(prev => prev + creep.reward);
          return;
        }
        
        const target = PATH_POINTS[creep.pathIndex + 1];
        if (!target) {
          scene.remove(creep.mesh);
          creepsRef.current.splice(i, 1);
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameover');
            }
            return newLives;
          });
          return;
        }
        
        const dir = target.clone().sub(creep.position).normalize();
        const speed = creep.effects.slow ? creep.speed * 0.5 : creep.speed;
        creep.position.add(dir.multiplyScalar(speed * delta));
        creep.mesh.position.copy(creep.position);
        creep.mesh.lookAt(target);
        
        if (creep.position.distanceTo(target) < 0.5) {
          creep.pathIndex++;
        }
      });
      
      if (creepsRef.current.length === 0 && creepsToSpawnRef.current === 0 && waveInProgress) {
        setWaveInProgress(false);
        if (wave >= maxWaves) {
          setGameState('victory');
        }
      }
      
      const time = performance.now() / 1000;
      towersRef.current.forEach(tower => {
        if (tower.type === 'boost') return;
        
        const nearestCreep = creepsRef.current
          .filter(c => c.position.distanceTo(tower.position) <= tower.range)
          .sort((a, b) => a.position.distanceTo(tower.position) - b.position.distanceTo(tower.position))[0];
        
        if (nearestCreep && time - tower.lastFire >= tower.fireRate) {
          tower.lastFire = time;
          
          const bulletGeom = new THREE.SphereGeometry(0.1, 8, 8);
          const bulletMat = new THREE.MeshBasicMaterial({ color: TOWER_DATA[tower.type].color });
          const bullet = new THREE.Mesh(bulletGeom, bulletMat);
          bullet.position.copy(tower.position);
          bullet.position.y = 1.5;
          scene.add(bullet);
          
          const dir = nearestCreep.position.clone().sub(tower.position).normalize();
          
          bulletsRef.current.push({
            mesh: bullet,
            target: nearestCreep,
            velocity: dir.multiplyScalar(20),
            damage: tower.damage,
            type: tower.type,
            lifetime: 2
          });
        }
      });
      
      bulletsRef.current.forEach((bullet, i) => {
        bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(delta));
        bullet.lifetime -= delta;
        
        if (bullet.target && bullet.mesh.position.distanceTo(bullet.target.position) < 0.5) {
          bullet.target.health -= bullet.damage;
          if (bullet.type === 'frost') {
            bullet.target.effects.slow = 2;
          }
          scene.remove(bullet.mesh);
          bulletsRef.current.splice(i, 1);
          return;
        }
        
        if (bullet.lifetime <= 0) {
          scene.remove(bullet.mesh);
          bulletsRef.current.splice(i, 1);
        }
      });
      
      creepsRef.current.forEach(creep => {
        if (creep.effects.slow && creep.effects.slow > 0) {
          creep.effects.slow -= delta;
          if (creep.effects.slow <= 0) {
            delete creep.effects.slow;
          }
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
      container.removeEventListener('click', onClick);
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
  }, [gameState, createPath, placeTower, spawnCreep, selectedTower, gameSpeed, wave, maxWaves, waveInProgress]);

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-green-900 text-white flex flex-col items-center justify-center">
        <div className="absolute top-4 left-4">
          <Link href="/super-engine">
            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">
          🏰 Tower Defense
        </h1>
        <p className="text-xl text-gray-300 mb-8">Strategic 3D Tower Defense</p>
        
        <div className="bg-gray-900/80 p-8 rounded-xl border border-green-500/50 max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-green-400">How to Play:</h2>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>• Select a tower type from the sidebar</li>
            <li>• Click on the map to place towers</li>
            <li>• Start waves to send enemies</li>
            <li>• Defend your base from all 20 waves</li>
            <li>• Earn gold from kills to build more</li>
          </ul>
          
          <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover' || gameState === 'victory') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className={`text-5xl font-bold mb-4 ${gameState === 'victory' ? 'text-green-400' : 'text-red-400'}`}>
          {gameState === 'victory' ? '🎉 Victory!' : '💀 Game Over'}
        </h1>
        <p className="text-xl text-gray-300 mb-2">Wave: {wave} / {maxWaves}</p>
        <p className="text-2xl text-yellow-400 mb-8">Score: {score}</p>
        
        <div className="flex gap-4">
          <Button onClick={() => setGameState('menu')} className="bg-gray-700 hover:bg-gray-600">
            Main Menu
          </Button>
          <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" data-testid="td-canvas" />
      
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Link href="/super-engine">
          <Button variant="outline" size="sm" className="border-white/50 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : 1)}
          className="border-white/50 text-white hover:bg-white/20"
        >
          <FastForward className="w-4 h-4" />
          {gameSpeed}x
        </Button>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-6 bg-gray-900/80 px-6 py-3 rounded-lg">
        <div className="text-center">
          <span className="text-red-400 text-sm">Lives</span>
          <div className="text-white font-bold text-xl">{lives}</div>
        </div>
        <div className="text-center">
          <span className="text-yellow-400 text-sm">Gold</span>
          <div className="text-white font-bold text-xl">{gold}</div>
        </div>
        <div className="text-center">
          <span className="text-blue-400 text-sm">Wave</span>
          <div className="text-white font-bold text-xl">{wave}/{maxWaves}</div>
        </div>
        <div className="text-center">
          <span className="text-green-400 text-sm">Score</span>
          <div className="text-white font-bold text-xl">{score}</div>
        </div>
      </div>
      
      <div className="absolute right-4 top-20 z-10 bg-gray-900/90 p-4 rounded-lg w-48">
        <h3 className="text-white font-bold mb-3 text-center">Towers</h3>
        <div className="space-y-2">
          {Object.entries(TOWER_DATA).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setSelectedTower(selectedTower === key ? null : key)}
              disabled={gold < data.cost}
              className={`w-full px-3 py-2 rounded text-left text-sm transition-all ${
                selectedTower === key 
                  ? 'bg-green-600 text-white' 
                  : gold >= data.cost 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{data.name}</span>
                <span className="text-yellow-400">{data.cost}g</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{data.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Button
          onClick={spawnWave}
          disabled={waveInProgress || wave >= maxWaves}
          className={`px-8 py-3 text-lg font-bold ${
            waveInProgress ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {waveInProgress ? `Wave in Progress...` : wave >= maxWaves ? 'All Waves Complete!' : `Start Wave ${wave + 1}`}
        </Button>
      </div>
    </div>
  );
}
