// ============================================
// Grudge RTS — 3D Model Showcase
// Three.js GLB viewer with Grudge Platform API
// ============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { checkApiHealth, startDiscordLogin, exchangeDiscordCode } from './grudge-api.js';

// ─── Model Manifest ────────────────────────────────────────
const MODELS = [
  { name: 'Town Center',              file: 'Town Center.glb',              icon: 'fa-solid fa-landmark' },
  { name: 'Castle',                   file: 'Castle.glb',                   icon: 'fa-solid fa-chess-rook' },
  { name: 'Wooden Fortress',          file: 'Wooden Fortress.glb',          icon: 'fa-solid fa-fort-awesome' },
  { name: 'House',                    file: 'House.glb',                    icon: 'fa-solid fa-house' },
  { name: 'Barracks',                 file: 'Barracks.glb',                 icon: 'fa-solid fa-shield-halved' },
  { name: 'Archery Training Grounds', file: 'Archery Training Grounds.glb', icon: 'fa-solid fa-bullseye' },
  { name: 'Watch Tower',              file: 'Watch Tower.glb',              icon: 'fa-solid fa-tower-observation' },
  { name: 'Temple',                   file: 'Temple.glb',                   icon: 'fa-solid fa-place-of-worship' },
  { name: 'Farm',                     file: 'Farm.glb',                     icon: 'fa-solid fa-wheat-awn' },
  { name: 'Windmill',                 file: 'Windmill.glb',                 icon: 'fa-solid fa-wind' },
  { name: 'Mine',                     file: 'Mine.glb',                     icon: 'fa-solid fa-helmet-safety' },
  { name: 'Storage House',            file: 'Storage House.glb',            icon: 'fa-solid fa-warehouse' },
  { name: 'Gold Rocks',               file: 'Gold Rocks.glb',               icon: 'fa-solid fa-gem' },
  { name: 'Rock',                     file: 'Rock.glb',                     icon: 'fa-solid fa-mountain' },
  { name: 'Trees',                    file: 'Trees.glb',                    icon: 'fa-solid fa-tree' },
  { name: 'Logs',                     file: 'Logs.glb',                     icon: 'fa-solid fa-align-left' },
];

// ─── DOM References ────────────────────────────────────────
const canvas          = document.getElementById('viewport');
const container       = document.getElementById('viewport-container');
const modelListEl     = document.getElementById('model-list');
const modelCountEl    = document.getElementById('model-count');
const modelInfoEl     = document.getElementById('model-info');
const modelNameEl     = document.getElementById('model-name');
const modelTrisEl     = document.getElementById('model-triangles');
const modelMeshesEl   = document.getElementById('model-meshes');
const loadingOverlay  = document.getElementById('loading-overlay');
const btnResetCam     = document.getElementById('btn-reset-cam');
const btnWireframe    = document.getElementById('btn-wireframe');
const btnRotate       = document.getElementById('btn-rotate');
const btnFullscreen   = document.getElementById('btn-fullscreen');
const btnLogin        = document.getElementById('btn-login');
const btnApiStatus    = document.getElementById('btn-api-status');
const apiStatusDot    = document.getElementById('api-status-dot');
const userBadge       = document.getElementById('user-badge');
const userAvatar      = document.getElementById('user-avatar');
const userNameEl      = document.getElementById('user-name');

// ─── Three.js Setup ────────────────────────────────────────
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x0e1420, 1);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;
controls.maxPolarAngle = Math.PI * 0.85;
controls.minDistance = 1;
controls.maxDistance = 100;

// Lighting — warm fantasy tone
const ambientLight = new THREE.AmbientLight(0xfff0d4, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeaba, 1.4);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8090b0, 0.4);
fillLight.position.set(-4, 3, -5);
scene.add(fillLight);

// Ground plane (subtle grid)
const gridHelper = new THREE.GridHelper(20, 20, 0x2a2a3a, 0x1a1a2a);
gridHelper.material.opacity = 0.4;
gridHelper.material.transparent = true;
scene.add(gridHelper);

camera.position.set(5, 4, 5);
controls.target.set(0, 1, 0);
controls.update();

// ─── State ─────────────────────────────────────────────────
let currentModel = null;
let wireframeEnabled = false;
const gltfLoader = new GLTFLoader();

// ─── Resize ────────────────────────────────────────────────
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
onResize();

// ─── Render Loop ───────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ─── Model Loading ─────────────────────────────────────────
function clearCurrentModel() {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material?.dispose();
      }
    });
    currentModel = null;
  }
}

async function loadModel(entry) {
  clearCurrentModel();
  loadingOverlay.classList.remove('hidden');
  modelInfoEl.classList.add('hidden');

  const url = `/public/models/rts/${encodeURIComponent(entry.file)}`;

  try {
    const gltf = await new Promise((resolve, reject) => {
      gltfLoader.load(url, resolve, undefined, reject);
    });

    const model = gltf.scene;

    // Auto-center and scale
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.position.y -= (box.min.y * scale);

    // Apply wireframe if toggled
    if (wireframeEnabled) {
      model.traverse((child) => {
        if (child.isMesh) child.material.wireframe = true;
      });
    }

    scene.add(model);
    currentModel = model;

    // Stats
    let tris = 0, meshCount = 0;
    model.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        const geo = child.geometry;
        tris += geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
      }
    });

    modelNameEl.textContent = entry.name;
    modelTrisEl.textContent = Math.round(tris).toLocaleString();
    modelMeshesEl.textContent = meshCount;
    modelInfoEl.classList.remove('hidden');

    // Reset camera to fit
    controls.target.set(0, (size.y * scale) / 2, 0);
    camera.position.set(5, 4, 5);
    controls.update();
  } catch (err) {
    console.error('Failed to load model:', err);
  } finally {
    loadingOverlay.classList.add('hidden');
  }
}

// ─── Sidebar: Populate Model List ──────────────────────────
function buildModelList() {
  modelListEl.innerHTML = '';
  MODELS.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="${entry.icon}"></i><span>${entry.name}</span>`;
    li.addEventListener('click', () => {
      document.querySelectorAll('#model-list li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      loadModel(entry);
    });
    modelListEl.appendChild(li);
  });
  modelCountEl.textContent = MODELS.length;
}
buildModelList();

// Load first model by default
if (MODELS.length > 0) {
  modelListEl.children[0]?.classList.add('active');
  loadModel(MODELS[0]);
}

// ─── Viewport Controls ─────────────────────────────────────
btnResetCam.addEventListener('click', () => {
  camera.position.set(5, 4, 5);
  controls.target.set(0, 1, 0);
  controls.update();
});

btnWireframe.addEventListener('click', () => {
  wireframeEnabled = !wireframeEnabled;
  btnWireframe.classList.toggle('active', wireframeEnabled);
  if (currentModel) {
    currentModel.traverse((child) => {
      if (child.isMesh) child.material.wireframe = wireframeEnabled;
    });
  }
});

btnRotate.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  btnRotate.classList.toggle('active', controls.autoRotate);
});

btnFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    container.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

// ─── Grudge Platform API ───────────────────────────────────
async function initApi() {
  const online = await checkApiHealth();
  apiStatusDot.classList.toggle('online', online);
  apiStatusDot.classList.toggle('offline', !online);

  // Check for Discord OAuth callback code
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    window.history.replaceState({}, '', '/');
    const user = await exchangeDiscordCode(code);
    if (user) showUser(user);
  }
}

function showUser(user) {
  btnLogin.classList.add('hidden');
  userBadge.classList.remove('hidden');
  userNameEl.textContent = user.username;
  if (user.avatar) {
    userAvatar.src = user.avatar;
    userAvatar.alt = user.username;
  } else {
    userAvatar.style.display = 'none';
  }
}

btnLogin.addEventListener('click', () => startDiscordLogin());

btnApiStatus.addEventListener('click', async () => {
  const online = await checkApiHealth();
  apiStatusDot.classList.toggle('online', online);
  apiStatusDot.classList.toggle('offline', !online);
});

// Boot
initApi();
