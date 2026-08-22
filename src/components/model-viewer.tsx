import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface ModelEntry {
  name: string;
  file: string;
  scale?: number;
}

interface ModelViewerProps {
  models: ModelEntry[];
  showGrid?: boolean;
  autoRotate?: boolean;
  backgroundColor?: number;
  onModelLoad?: (stats: { triangles: number; meshes: number }) => void;
}

export default function ModelViewer({
  models,
  showGrid = true,
  autoRotate = true,
  backgroundColor = 0x0e1420,
  onModelLoad,
}: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(backgroundColor, 1);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.5;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minDistance = 1;
    controls.maxDistance = 150;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff0d4, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeaba, 1.4);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8090b0, 0.4);
    fillLight.position.set(-4, 3, -5);
    scene.add(fillLight);

    // Ground grid
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(50, 50, 0x2a2a3a, 0x1a1a2a);
      gridHelper.material.opacity = 0.4;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
    }

    camera.position.set(10, 8, 10);
    controls.target.set(0, 0, 0);
    controls.update();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener('resize', onResize);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Load models
    const gltfLoader = new GLTFLoader();
    const loadedModels: THREE.Group[] = [];

    const loadAllModels = async () => {
      let totalTris = 0;
      let totalMeshes = 0;
      const spacing = 8;
      const itemsPerRow = Math.ceil(Math.sqrt(models.length));

      for (let i = 0; i < models.length; i++) {
        const entry = models[i];
        const url = `/public/models/rts/${encodeURIComponent(entry.file)}`;

        try {
          const gltf = await new Promise<any>((resolve, reject) => {
            gltfLoader.load(url, resolve, undefined, reject);
          });

          const model = gltf.scene;

          // Calculate position in grid
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const offsetX = (col - itemsPerRow / 2) * spacing;
          const offsetZ = (row - Math.ceil(models.length / itemsPerRow) / 2) * spacing;

          // Get model bounds
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          
          // Apply custom scale or calculate relative scale
          const targetScale = entry.scale || 1;
          model.scale.setScalar(targetScale);

          // Center and position
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(
            offsetX - (center.x * targetScale),
            -(box.min.y * targetScale),
            offsetZ - (center.z * targetScale)
          );

          scene.add(model);
          loadedModels.push(model);

          // Count stats
          model.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
              totalMeshes++;
              const geo = (child as THREE.Mesh).geometry;
              totalTris += geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
            }
          });
        } catch (err) {
          console.error(`Failed to load model ${entry.name}:`, err);
        }
      }

      onModelLoad?.({ triangles: Math.round(totalTris), meshes: totalMeshes });

      // Adjust camera to fit all models
      if (loadedModels.length > 0) {
        const boundingBox = new THREE.Box3();
        loadedModels.forEach(model => boundingBox.expandByObject(model));
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.5;
        
        camera.position.set(distance, distance * 0.6, distance);
        controls.target.copy(center);
        controls.update();
      }
    };

    loadAllModels();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      loadedModels.forEach(model => {
        scene.remove(model);
        model.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).geometry?.dispose();
            const material = (child as THREE.Mesh).material;
            if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
            } else {
              material?.dispose();
            }
          }
        });
      });
      renderer.dispose();
      controls.dispose();
    };
  }, [models, showGrid, autoRotate, backgroundColor, onModelLoad]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
