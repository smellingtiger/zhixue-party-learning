'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MapEntity3D {
  id: string;
  x: number;
  z: number;
  type: 'sensor' | 'team' | 'vehicle' | 'shelter';
  status?: 'normal' | 'warning' | 'danger';
}

interface Sandbox3DProps {
  entities?: MapEntity3D[];
  showDangerZone?: boolean;
  onEntityClick?: (id: string) => void;
}

function createEntityMesh(entity: MapEntity3D): THREE.Group {
  const group = new THREE.Group();
  group.position.set(entity.x, 0, entity.z);
  group.userData = { entityId: entity.id, entityType: entity.type };

  const isDanger = entity.status === 'danger';

  const colorMap: Record<string, number> = {
    danger: 0xef4444,
    warning: 0xf59e0b,
    normal: 0x22d3ee,
    team: 0x3b82f6,
    vehicle: 0xef4444,
    shelter: 0x10b981,
  };

  let hexColor: number;
  if (entity.type === 'sensor') {
    hexColor = isDanger ? colorMap.danger : entity.status === 'warning' ? colorMap.warning : colorMap.normal;
  } else {
    hexColor = colorMap[entity.type] || 0xffffff;
  }

  if (isDanger) {
    const dl = new THREE.PointLight(0xef4444, 3, 8, 2);
    dl.position.y = 2;
    group.add(dl);

    const rg = new THREE.RingGeometry(1.0, 1.4, 32);
    const rm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rg, rm);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);
  }

  let geo: THREE.BufferGeometry;
  if (entity.type === 'sensor') {
    geo = new THREE.CylinderGeometry(0.28, 0.38, 1.2, 16);
  } else if (entity.type === 'shelter') {
    geo = new THREE.BoxGeometry(1.2, 0.45, 1.2);
  } else {
    geo = new THREE.BoxGeometry(0.65, 0.55, 0.85);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: hexColor,
    emissive: hexColor,
    emissiveIntensity: isDanger ? 0.9 : 0.35,
    roughness: 0.25,
    metalness: 0.65,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = entity.type === 'sensor' ? 0.7 : 0.22;
  mesh.castShadow = true;
  group.add(mesh);

  if (entity.type === 'sensor') {
    const sg = new THREE.SphereGeometry(0.18, 16, 16);
    const sm = new THREE.MeshBasicMaterial({ color: isDanger ? 0xef4444 : 0x00d4ff });
    const sphere = new THREE.Mesh(sg, sm);
    sphere.position.y = 1.4;
    group.add(sphere);
  }

  return group;
}

export function Sandbox3D({ entities = [], showDangerZone = false, onEntityClick }: Sandbox3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: any;
    entityGroups: THREE.Group[];
    dangerGroup: THREE.Group | null;
    animId: number;
  } | null>(null);

  const onEntityClickRef = useRef(onEntityClick);
  onEntityClickRef.current = onEntityClick;

  const showDangerZoneRef = useRef(showDangerZone);
  showDangerZoneRef.current = showDangerZone;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (sceneRef.current) {
      cleanup();
    }

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a14');
    scene.fog = new THREE.Fog('#0a0a18', 50, 95);

    const camera = new THREE.PerspectiveCamera(50, w / Math.max(h, 1), 0.1, 200);
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // Controls - use OrbitControls directly
    let controls: any;
    try {
      const OC = require('three/examples/jsm/controls/OrbitControls.js').OrbitControls;
      controls = new OC(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 8;
      controls.maxDistance = 70;
      controls.maxPolarAngle = Math.PI / 2.08;
      controls.target.set(0, 0, 0);
      controls.update();
    } catch {
      // OrbitControls not available - scene will be static
      controls = {
        update: () => {},
        dispose: () => {},
        target: { set: () => {} },
        enableDamping: false,
      };
    }

    // Lights
    scene.add(new THREE.AmbientLight('#c8d4ff', 0.8));
    scene.add(new THREE.HemisphereLight('#2a3a6e', '#101828', 0.6));

    const dl = new THREE.DirectionalLight('#ffffff', 1.6);
    dl.position.set(30, 40, 20);
    dl.castShadow = true;
    dl.shadow.mapSize.width = 2048;
    dl.shadow.mapSize.height = 2048;
    dl.shadow.camera.near = 0.5;
    dl.shadow.camera.far = 100;
    dl.shadow.camera.left = -40;
    dl.shadow.camera.right = 40;
    dl.shadow.camera.top = 40;
    dl.shadow.camera.bottom = -40;
    dl.shadow.bias = -0.0001;
    scene.add(dl);

    const dl2 = new THREE.DirectionalLight('#6699ff', 0.5);
    dl2.position.set(-15, 25, -10);
    scene.add(dl2);

    const pl = new THREE.PointLight('#00d4ff', 0.5, 50, 2);
    pl.position.set(0, 10, 0);
    scene.add(pl);

    // Ground
    const gGeo = new THREE.PlaneGeometry(100, 100);
    const gMat = new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.85, metalness: 0.15 });
    const ground = new THREE.Mesh(gGeo, gMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const pg = new THREE.PolarGridHelper(40, 40, 20, 64, 0x00d4ff, 0x00d4ff);
    pg.position.y = 0.01;
    scene.add(pg);

    const pg2 = new THREE.PolarGridHelper(40, 8, 5, 64, 0x00a8cc, 0x00a8cc);
    pg2.position.y = 0.012;
    scene.add(pg2);

    // Danger zone
    let dangerGroup: THREE.Group | null = null;
    if (showDangerZoneRef.current) {
      dangerGroup = new THREE.Group();
      dangerGroup.position.y = 0.03;

      const cg = new THREE.CircleGeometry(12, 64);
      const cm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(cg, cm);
      circle.rotation.x = -Math.PI / 2;
      dangerGroup.add(circle);

      const rg = new THREE.RingGeometry(11.5, 12, 64);
      const rm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(rg, rm);
      ring.rotation.x = -Math.PI / 2;
      dangerGroup.add(ring);

      scene.add(dangerGroup);
    }

    // Entities
    const entityGroups: THREE.Group[] = [];
    const useEntities = entities.length > 0 ? entities : [
      { id: 'e1', x: -10, z: 8, type: 'sensor' as const, status: 'normal' as const },
      { id: 'e2', x: 14, z: -6, type: 'sensor' as const, status: 'normal' as const },
      { id: 'e3', x: 0, z: -14, type: 'shelter' as const },
      { id: 'e4', x: -16, z: -12, type: 'team' as const },
      { id: 'e5', x: 18, z: 10, type: 'vehicle' as const },
    ];

    useEntities.forEach(entity => {
      const group = createEntityMesh(entity);
      entityGroups.push(group);
      scene.add(group);
    });

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      entityGroups.forEach(g => g.traverse(c => { if (c instanceof THREE.Mesh) meshes.push(c); }));
      const hits = raycaster.intersectObjects(meshes, false);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          if (obj.userData?.entityId) {
            onEntityClickRef.current?.(obj.userData.entityId);
            return;
          }
          obj = obj.parent;
        }
      }
    };

    renderer.domElement.addEventListener('click', onCanvasClick);
    renderer.domElement.style.display = 'block';

    // Resize
    const ro = new ResizeObserver(() => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw > 0 && ch > 0) {
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
      }
    });
    ro.observe(container);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      if (dangerGroup) {
        const t = Date.now() * 0.001;
        dangerGroup.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial && child.geometry instanceof THREE.RingGeometry) {
            child.material.opacity = 0.5 + Math.sin(t * 2) * 0.2;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { scene, camera, renderer, controls, entityGroups, dangerGroup, animId };

    function cleanup() {
      const s = sceneRef.current;
      if (!s) return;
      cancelAnimationFrame(s.animId);
      s.renderer.domElement.removeEventListener('click', onCanvasClick);
      ro.disconnect();
      s.controls.dispose?.();
      s.renderer.dispose();
      if (container.contains(s.renderer.domElement)) {
        container.removeChild(s.renderer.domElement);
      }
      s.scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material?.dispose();
        }
      });
      sceneRef.current = null;
    }

    return () => {
      cleanup();
    };
  }, [entities, showDangerZone]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', background: '#0a0a14', overflow: 'hidden' }}
    />
  );
}

export default Sandbox3D;