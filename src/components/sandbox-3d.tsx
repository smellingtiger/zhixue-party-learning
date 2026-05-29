'use client';

import { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 15)) / 2147483647;
}
function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(ix, iy), n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1), n11 = hash(ix + 1, iy + 1);
  return n00 + (n10 - n00) * sx + (n01 - n00) * sy + (n11 - n10 - n01 + n00) * sx * sy;
}
function fbm(x: number, y: number): number {
  let value = 0, amp = 1, freq = 1;
  for (let i = 0; i < 3; i++) { value += amp * smoothNoise(x * freq, y * freq); amp *= 0.5; freq *= 2; }
  return value;
}

export type EntityType =
  | 'sensor' | 'team' | 'vehicle' | 'shelter'
  | 'hospital' | 'fire_station' | 'police_station'
  | 'ambulance' | 'fire_truck' | 'police_car'
  | 'traffic_light' | 'building' | 'fire_hydrant';

export interface MapEntity3D {
  id: string;
  x: number;
  z: number;
  type: EntityType;
  status?: 'normal' | 'warning' | 'danger';
  label?: string;
}

interface Sandbox3DProps {
  entities?: MapEntity3D[];
  showDangerZone?: boolean;
  onEntityClick?: (id: string) => void;
}

interface SceneStore {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any;
  entityMap: Map<string, THREE.Group>;
  dangerGroup: THREE.Group | null;
  animId: number;
  onCanvasClick: (event: MouseEvent) => void;
  container: HTMLDivElement;
  ro: ResizeObserver;
  trafficLightGroups: { group: THREE.Group; lights: THREE.Mesh[]; timer: number }[];
}

const DEFAULT_ENTITIES: MapEntity3D[] = [
  { id: 'sensor-1', x: -5, z: 3, type: 'sensor', status: 'normal', label: '水位站A' },
  { id: 'sensor-2', x: 7, z: -2, type: 'sensor', status: 'normal', label: '水位站B' },
  { id: 'amb-1', x: -18, z: -18, type: 'ambulance', label: '急救车A' },
  { id: 'ft-1', x: 18, z: -18, type: 'fire_truck', label: '消防车A' },
  { id: 'pc-1', x: -18, z: 18, type: 'police_car', label: '警车A' },
];

// ----- simple seeded RNG for consistent city layout -----
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rng = createRng(42);

// ----- entity colour helpers -----
function getEntityColor(type: EntityType, status?: string): number {
  if (type === 'sensor') {
    if (status === 'danger') return 0xef4444;
    if (status === 'warning') return 0xf59e0b;
    return 0x22d3ee;
  }
  if (type === 'team') return 0x3b82f6;
  if (type === 'vehicle') return 0xef4444;
  if (type === 'shelter') return 0x10b981;
  if (type === 'hospital') return 0xffffff;
  if (type === 'fire_station') return 0xdc2626;
  if (type === 'police_station') return 0x2563eb;
  if (type === 'ambulance') return 0xf8fafc;
  if (type === 'fire_truck') return 0xdc2626;
  if (type === 'police_car') return 0x1e3a5f;
  if (type === 'traffic_light') return 0x1e293b;
  if (type === 'building') return 0x334155;
  if (type === 'fire_hydrant') return 0xef4444;
  return 0xffffff;
}

// ----- create a 3D entity marker group -----
function createEntityGroup(entity: MapEntity3D): THREE.Group {
  const group = new THREE.Group();
  if (entity.type === 'fire_truck' || entity.type === 'ambulance' || entity.type === 'police_car') {
    const ROAD_SPACING = 8;
    const ROAD_HALF = 1;
    let clampedX = entity.x;
    let clampedZ = entity.z;
    const nearestRoadX = Math.round(entity.x / ROAD_SPACING) * ROAD_SPACING;
    if (Math.abs(entity.x - nearestRoadX) < 1.5) {
      clampedX = nearestRoadX + (entity.x >= nearestRoadX ? ROAD_HALF + 1 : -ROAD_HALF - 1);
    }
    const nearestRoadZ = Math.round(entity.z / ROAD_SPACING) * ROAD_SPACING;
    if (Math.abs(entity.z - nearestRoadZ) < 1.5) {
      clampedZ = nearestRoadZ + (entity.z >= nearestRoadZ ? ROAD_HALF + 1 : -ROAD_HALF - 1);
    }
    group.position.set(clampedX, 0, clampedZ);
  } else {
    group.position.set(entity.x, 0, entity.z);
  }
  group.userData = { entityId: entity.id, entityType: entity.type, entityStatus: entity.status };

  const isDanger = entity.status === 'danger';
  const color = getEntityColor(entity.type, entity.status);

  if (isDanger) {
    const dl = new THREE.PointLight(0xef4444, 2, 6, 2);
    dl.position.y = 2;
    group.add(dl);
    const rg = new THREE.RingGeometry(0.8, 1.2, 32);
    const rm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(rg, rm);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);
  }

  // ----- model switch -----
  if (entity.type === 'sensor') {
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 1.0, 12),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, metalness: 0.6, roughness: 0.3 })
    );
    cyl.position.y = 0.5;
    cyl.castShadow = true;
    group.add(cyl);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 12),
      new THREE.MeshBasicMaterial({ color: isDanger ? 0xef4444 : 0x00d4ff })
    );
    sphere.position.y = 1.15;
    group.add(sphere);

  } else if (entity.type === 'shelter') {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.35, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.15, roughness: 0.5, metalness: 0.3 })
    );
    box.position.y = 0.18;
    box.castShadow = true;
    group.add(box);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 0.25, 4),
      new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.6 })
    );
    roof.position.y = 0.38;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

  } else if (entity.type === 'team') {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.35, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.2, metalness: 0.4, roughness: 0.4 })
    );
    body.position.y = 0.18;
    body.castShadow = true;
    group.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24 })
    );
    head.position.y = 0.45;
    group.add(head);

  } else if (entity.type === 'vehicle' || entity.type === 'ambulance' || entity.type === 'fire_truck' || entity.type === 'police_car') {
    const bodyColor = entity.type === 'ambulance' ? 0xf8fafc : entity.type === 'fire_truck' ? 0xdc2626 : entity.type === 'police_car' ? 0x1e3a5f : 0xef4444;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.35, 0.55),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.4, metalness: 0.3 })
    );
    cabin.position.y = 0.18;
    cabin.castShadow = true;
    group.add(cabin);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.2, 0.4),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.2 })
    );
    top.position.set(-0.1, 0.43, 0);
    group.add(top);
    if (entity.type === 'ambulance') {
      const cross = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.02),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      cross.position.set(0.2, 0.4, 0.28);
      group.add(cross);
    }
    if (entity.type === 'police_car') {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.06, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 })
      );
      bar.position.set(0, 0.5, 0);
      group.add(bar);
      const bar2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.06, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 })
      );
      bar2.position.set(0, 0.5, 0);
      bar2.rotation.z = Math.PI / 2;
      group.add(bar2);
    }

  } else if (entity.type === 'hospital' || entity.type === 'fire_station' || entity.type === 'police_station') {
    const baseColor = entity.type === 'hospital' ? 0xf1f5f9 : entity.type === 'fire_station' ? 0xdc2626 : 0x2563eb;
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 1.4),
      new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.6, metalness: 0.1 })
    );
    base.position.y = 0.4;
    base.castShadow = true;
    group.add(base);
    if (entity.type === 'hospital') {
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.04), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      crossH.position.set(0, 0.9, 0.71);
      group.add(crossH);
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.04), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      crossV.position.set(0, 0.9, 0.71);
      group.add(crossV);
    }
    if (entity.type === 'fire_station') {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.04), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
      door.position.set(0, 0.3, 0.71);
      group.add(door);
    }
    if (entity.type === 'police_station') {
      const badge = new THREE.Mesh(new THREE.CircleGeometry(0.15, 6), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
      badge.position.set(0, 0.75, 0.71);
      group.add(badge);
    }

  } else if (entity.type === 'traffic_light') {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 })
    );
    pole.position.y = 0.3;
    group.add(pole);
    const colors = [0xef4444, 0xfbbf24, 0x22c55e];
    for (let i = 0; i < 3; i++) {
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.2 })
      );
      light.position.set(0, 0.55 - i * 0.1, 0.06);
      group.add(light);
    }

  } else if (entity.type === 'building') {
    const h = 0.6 + rng() * 1.5;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, h, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.2 })
    );
    body.position.y = h / 2;
    body.castShadow = true;
    group.add(body);

  } else if (entity.type === 'fire_hydrant') {
    const hydrant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6, metalness: 0.3 })
    );
    hydrant.position.y = 0.2;
    hydrant.castShadow = true;
    group.add(hydrant);
  }

  // label ring
  const ringGeo = new THREE.RingGeometry(0.35, 0.4, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: getEntityColor(entity.type, entity.status),
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const labelRing = new THREE.Mesh(ringGeo, ringMat);
  labelRing.rotation.x = -Math.PI / 2;
  labelRing.position.y = 0.01;
  group.add(labelRing);

  return group;
}

function disposeGroup(group: THREE.Group) {
  group.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material?.dispose();
    }
    if (obj instanceof THREE.PointLight) obj.dispose();
  });
  group.removeFromParent();
}

// ----- static city generation -----
function buildCity(scene: THREE.Scene): { trafficLightGroups: SceneStore['trafficLightGroups'] } {
  const trafficLightGroups: SceneStore['trafficLightGroups'] = [];

  // road grid parameters
  const ROAD_SPACING = 8;
  const ROAD_HALF = 1;
  const CITY_HALF = 28;
  const LANE_MARK_INTERVAL = 2.5;

  // ---------- ground (dark asphalt) ----------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(CITY_HALF * 2, CITY_HALF * 2),
    new THREE.MeshStandardMaterial({ color: '#dce1e8', roughness: 0.4, metalness: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.015;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- road surfaces ----------
  const roadMat = new THREE.MeshStandardMaterial({ color: '#2a2a35', roughness: 0.85, metalness: 0.05 });

  const edgeMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
  for (let i = -CITY_HALF; i <= CITY_HALF; i += ROAD_SPACING) {
    // horizontal
    const offset = (fbm(i * 0.05, 0) - 0.5) * 3;
    const h = new THREE.Mesh(new THREE.PlaneGeometry(CITY_HALF * 2, ROAD_HALF * 2), roadMat);
    h.rotation.x = -Math.PI / 2;
    h.position.set(0, 0.005, i + offset);
    h.receiveShadow = true;
    scene.add(h);
    // glow edges for horizontal road
    const hEdge1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-CITY_HALF, 0.006, i + offset - ROAD_HALF), new THREE.Vector3(CITY_HALF, 0.006, i + offset - ROAD_HALF)]),
      edgeMat
    );
    scene.add(hEdge1);
    const hEdge2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-CITY_HALF, 0.006, i + offset + ROAD_HALF), new THREE.Vector3(CITY_HALF, 0.006, i + offset + ROAD_HALF)]),
      edgeMat
    );
    scene.add(hEdge2);
    // vertical
    const vOffset = (fbm(0, i * 0.05) - 0.5) * 3;
    const v = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2, CITY_HALF * 2), roadMat);
    v.rotation.x = -Math.PI / 2;
    v.position.set(i + vOffset, 0.005, 0);
    v.receiveShadow = true;
    scene.add(v);
    // glow edges for vertical road
    const vEdge1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i + vOffset - ROAD_HALF, 0.006, -CITY_HALF), new THREE.Vector3(i + vOffset - ROAD_HALF, 0.006, CITY_HALF)]),
      edgeMat
    );
    scene.add(vEdge1);
    const vEdge2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i + vOffset + ROAD_HALF, 0.006, -CITY_HALF), new THREE.Vector3(i + vOffset + ROAD_HALF, 0.006, CITY_HALF)]),
      edgeMat
    );
    scene.add(vEdge2);
  }

  // ---------- road markings (white dashes) ----------
  const markMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });

  for (let i = -CITY_HALF; i <= CITY_HALF; i += ROAD_SPACING) {
    for (let d = -CITY_HALF + 2; d < CITY_HALF - 1; d += LANE_MARK_INTERVAL) {
      const m1 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.6), markMat);
      m1.rotation.x = -Math.PI / 2;
      m1.position.set(d, 0.008, i);
      scene.add(m1);
      const m2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.08), markMat);
      m2.rotation.x = -Math.PI / 2;
      m2.position.set(i, 0.008, d);
      scene.add(m2);
    }
  }

  // ---------- intersection stop lines ----------
  const stopMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.7 });
  for (let ix = -CITY_HALF + ROAD_SPACING; ix < CITY_HALF; ix += ROAD_SPACING) {
    for (let iz = -CITY_HALF + ROAD_SPACING; iz < CITY_HALF; iz += ROAD_SPACING) {
      const sl = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2 - 0.3, 0.1), stopMat);
      sl.rotation.x = -Math.PI / 2;
      sl.position.set(ix + ROAD_SPACING / 2 - 0.8, 0.008, iz);
      scene.add(sl);
    }
  }

  // ---------- building blocks ----------
  const buildingColors = [
    0xe2e8f0, 0xf1f5f9, 0xfef9c3, 0xfce7f3, 0xdbeafe,
    0xf3e8ff, 0xfef3c7, 0xd1fae5, 0xffe4e6, 0xf5f5f4,
  ];

  for (let bx = -CITY_HALF; bx < CITY_HALF; bx += ROAD_SPACING) {
    for (let bz = -CITY_HALF; bz < CITY_HALF; bz += ROAD_SPACING) {
      const blockCenterX = bx + ROAD_SPACING / 2 + 0.3;
      const blockCenterZ = bz + ROAD_SPACING / 2 + 0.3;
      const blockW = ROAD_SPACING - ROAD_HALF * 2 - 0.6;
      const blockD = ROAD_SPACING - ROAD_HALF * 2 - 0.6;

      const isEdge = bx === -CITY_HALF || bx + ROAD_SPACING >= CITY_HALF || bz === -CITY_HALF || bz + ROAD_SPACING >= CITY_HALF;

      // determine if this block should be empty (park / square)
      const isEmpty = !isEdge && rng() < 0.12;
      if (isEmpty) {
        const green = new THREE.Mesh(
          new THREE.PlaneGeometry(blockW - 0.3, blockD - 0.3),
          new THREE.MeshBasicMaterial({ color: 0x86efac, transparent: true, opacity: 0.3 })
        );
        green.rotation.x = -Math.PI / 2;
        green.position.set(blockCenterX, 0.006, blockCenterZ);
        scene.add(green);
        continue;
      }

      // generate 1-3 buildings per block
      const numB = isEdge ? 1 : 1 + Math.floor(rng() * 2);
      for (let i = 0; i < numB; i++) {
        const bw = 1.2 + rng() * 2.0;
        const bd = 1.2 + rng() * 2.0;
        const bh = 0.8 + rng() * (isEdge ? 2.0 : 5.0);
        const col = buildingColors[Math.floor(rng() * buildingColors.length)];

        // position within block
        const px = blockCenterX - blockW / 2 + 0.6 + rng() * (blockW - bw - 1.2);
        const pz = blockCenterZ - blockD / 2 + 0.6 + rng() * (blockD - bd - 1.2);

        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(bw, bh, bd),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.05 })
        );
        mesh.position.set(px, bh / 2, pz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // window glow (small emissive faces)
        if (bh > 1.5) {
          const winMat = new THREE.MeshBasicMaterial({
            color: 0x93c5fd,
            transparent: true,
            opacity: 0.15 + rng() * 0.15,
            depthWrite: false,
          });
          for (let wy = 0.6; wy < bh - 0.4; wy += 0.5) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.15), winMat);
            win.position.set(px + bw / 2 + 0.001, wy, pz);
            scene.add(win);
            const win2 = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.15), winMat);
            win2.position.set(px - bw / 2 - 0.001, wy, pz);
            scene.add(win2);
          }
        }
      }
    }
  }

  // ---------- landmark buildings (hospitals, stations) ----------
  function placeLandmark(x: number, z: number, type: 'hospital' | 'fire_station' | 'police_station') {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    if (type === 'hospital') {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 1.2, 2.4),
        new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.05 })
      );
      base.position.y = 0.6;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.12, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xdc2626 })
      );
      sign.position.set(0, 1.3, 1.21);
      group.add(sign);
      const signV = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.8, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xdc2626 })
      );
      signV.position.set(0, 1.3, 1.21);
      group.add(signV);
    } else if (type === 'fire_station') {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.8, 2.4),
        new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4, metalness: 0.1 })
      );
      base.position.y = 0.4;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1.6, 8),
        new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.5, roughness: 0.3 })
      );
      tower.position.set(1.2, 1.0, 0);
      group.add(tower);
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      lamp.position.set(1.2, 1.85, 0);
      group.add(lamp);
    } else if (type === 'police_station') {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.9, 2.2),
        new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.4, metalness: 0.1 })
      );
      base.position.y = 0.45;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.15, 2.0),
        new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3, metalness: 0.2 })
      );
      roof.position.y = 0.9;
      group.add(roof);
    }

    scene.add(group);
  }

  // place landmarks at specific city blocks
  placeLandmark(-20, -20, 'hospital');
  placeLandmark(20, -20, 'fire_station');
  placeLandmark(-20, 20, 'police_station');

  // ---------- traffic lights at inner intersections ----------
  for (let tx = -CITY_HALF + ROAD_SPACING; tx < CITY_HALF; tx += ROAD_SPACING) {
    for (let tz = -CITY_HALF + ROAD_SPACING; tz < CITY_HALF; tz += ROAD_SPACING) {
      if (rng() < 0.3) continue; // skip some intersections

      const tlGroup = new THREE.Group();
      tlGroup.position.set(tx, 0, tz);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.4, roughness: 0.4 })
      );
      pole.position.y = 0.4;
      tlGroup.add(pole);

      const arm1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.4, roughness: 0.4 })
      );
      arm1.rotation.z = Math.PI / 2;
      arm1.position.set(0.15, 0.7, 0);
      tlGroup.add(arm1);

      const colors = [0xef4444, 0xfbbf24, 0x22c55e];
      const lights: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const l = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.15 })
        );
        l.position.set(0.26, 0.75 - i * 0.09, 0);
        tlGroup.add(l);
        lights.push(l);
      }

      scene.add(tlGroup);
      trafficLightGroups.push({ group: tlGroup, lights, timer: Math.floor(rng() * 120) });
    }
  }

  // ---------- street lamps ----------
  const lampMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.3, roughness: 0.4 });
  for (let lx = -CITY_HALF + ROAD_SPACING / 2; lx < CITY_HALF; lx += ROAD_SPACING) {
    for (let lz = -CITY_HALF + ROAD_SPACING / 2; lz < CITY_HALF; lz += ROAD_SPACING) {
      if (rng() < 0.4) continue;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.5, 6), lampMat);
      post.position.set(lx + 0.8, 0.25, lz + 0.8);
      scene.add(post);
    }
  }

  // ---------- fire hydrants along main roads ----------
  const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6, metalness: 0.3 });
  for (let d = -CITY_HALF + 2; d <= CITY_HALF - 2; d += 15) {
    const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), hydrantMat);
    h1.position.set(-ROAD_HALF - 0.3, 0.2, d);
    h1.castShadow = true;
    scene.add(h1);
    const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), hydrantMat);
    h2.position.set(ROAD_HALF + 0.3, 0.2, d);
    h2.castShadow = true;
    scene.add(h2);
    const h3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), hydrantMat);
    h3.position.set(d, 0.2, -ROAD_HALF - 0.3);
    h3.castShadow = true;
    scene.add(h3);
    const h4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), hydrantMat);
    h4.position.set(d, 0.2, ROAD_HALF + 0.3);
    h4.castShadow = true;
    scene.add(h4);
  }

  return { trafficLightGroups };
}

// ----- main component -----
export const Sandbox3D = memo(function Sandbox3D({ entities = [], showDangerZone = false, onEntityClick }: Sandbox3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<SceneStore | null>(null);
  const onEntityClickRef = useRef(onEntityClick);
  onEntityClickRef.current = onEntityClick;

  // ---- init: create scene, camera, lights, city ----
  useEffect(() => {
    const container = containerRef.current;
    if (!container || storeRef.current) return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8ecf4');
    scene.fog = new THREE.Fog('#dce3ed', 55, 100);

    const camera = new THREE.PerspectiveCamera(45, w / Math.max(h, 1), 0.1, 200);
    camera.position.set(30, 28, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // controls
    let controls: any;
    try {
      const OC = require('three/examples/jsm/controls/OrbitControls.js').OrbitControls;
      controls = new OC(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 10;
      controls.maxDistance = 80;
      controls.maxPolarAngle = Math.PI / 2.15;
      controls.target.set(0, 0, 0);
      controls.update();
    } catch {
      controls = { update: () => {}, dispose: () => {}, target: { set: () => {} }, enableDamping: false };
    }

    // lights
    const ambient = new THREE.AmbientLight('#e0f7fa', 0.7);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight('#87CEEB', '#363636', 0.6);
    scene.add(hemi);
    const dl = new THREE.DirectionalLight('#fff4e6', 1.8);
    dl.position.set(10, 20, 10);
    dl.castShadow = true;
    dl.shadow.mapSize.width = 2048;
    dl.shadow.mapSize.height = 2048;
    dl.shadow.camera.near = 0.5;
    dl.shadow.camera.far = 100;
    dl.shadow.camera.left = -45;
    dl.shadow.camera.right = 45;
    dl.shadow.camera.top = 45;
    dl.shadow.camera.bottom = -45;
    dl.shadow.bias = -0.0005;
    scene.add(dl);
    const fill = new THREE.DirectionalLight('#b3d4ff', 0.5);
    fill.position.set(-15, 20, -10);
    scene.add(fill);
    const back = new THREE.DirectionalLight('#f0e6d3', 0.3);
    back.position.set(-20, 5, 30);
    scene.add(back);

    // build static city
    const { trafficLightGroups } = buildCity(scene);

    // danger zone (initially off)
    let dangerGroup: THREE.Group | null = null;
    if (showDangerZone) {
      dangerGroup = new THREE.Group();
      dangerGroup.position.y = 0.03;
      const cg = new THREE.CircleGeometry(12, 64);
      const cm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(cg, cm);
      circle.rotation.x = -Math.PI / 2;
      dangerGroup.add(circle);
      const rg = new THREE.RingGeometry(11.5, 12, 64);
      const rm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(rg, rm);
      ring.rotation.x = -Math.PI / 2;
      dangerGroup.add(ring);
      scene.add(dangerGroup);
    }

    // raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      storeRef.current?.entityMap.forEach(group => {
        group.traverse(c => { if (c instanceof THREE.Mesh) meshes.push(c); });
      });
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

    // resize
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

    // render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      const s = storeRef.current;

      // animate traffic lights
      if (s) {
        for (const tl of s.trafficLightGroups) {
          tl.timer = (tl.timer + 1) % 180;
          for (let i = 0; i < 3; i++) {
            const active = (tl.timer < 60 && i === 2) || (tl.timer >= 60 && tl.timer < 120 && i === 1) || (tl.timer >= 120 && i === 0);
            tl.lights[i].material.opacity = active ? 0.9 : 0.12;
          }
        }

        // animate danger zone ring pulse
        if (s.dangerGroup) {
          const t = Date.now() * 0.001;
          s.dangerGroup.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial && child.geometry instanceof THREE.RingGeometry) {
              child.material.opacity = 0.4 + Math.sin(t * 2.5) * 0.2;
            }
          });
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    storeRef.current = {
      scene, camera, renderer, controls,
      entityMap: new Map(),
      dangerGroup,
      animId,
      onCanvasClick,
      container,
      ro,
      trafficLightGroups,
    };

    return () => {
      const s = storeRef.current;
      if (!s) return;
      cancelAnimationFrame(s.animId);
      s.renderer.domElement.removeEventListener('click', s.onCanvasClick);
      s.ro.disconnect();
      s.controls.dispose?.();
      s.renderer.dispose();
      if (container.contains(s.renderer.domElement)) container.removeChild(s.renderer.domElement);
      s.scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material?.dispose();
        }
      });
      storeRef.current = null;
    };
  }, []);

  // ---- entities diff update ----
  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    const targetEntities = entities.length > 0 ? entities : DEFAULT_ENTITIES;
    const currentIds = new Set(store.entityMap.keys());
    const targetIds = new Set(targetEntities.map(e => e.id));

    currentIds.forEach(id => {
      if (!targetIds.has(id)) {
        const group = store.entityMap.get(id);
        if (group) { disposeGroup(group); store.entityMap.delete(id); }
      }
    });

    targetEntities.forEach(entity => {
      const existing = store.entityMap.get(entity.id);
      if (existing) {
        const changed =
          existing.position.x !== entity.x ||
          existing.position.z !== entity.z ||
          existing.userData.entityType !== entity.type ||
          existing.userData.entityStatus !== entity.status;
        if (changed) {
          disposeGroup(existing);
          store.scene.remove(existing);
          store.entityMap.delete(entity.id);
        }
      }
    });

    targetEntities.forEach(entity => {
      if (!store.entityMap.has(entity.id)) {
        const group = createEntityGroup(entity);
        group.userData.entityStatus = entity.status;
        store.entityMap.set(entity.id, group);
        store.scene.add(group);
      }
    });
  }, [entities]);

  // ---- danger zone toggle ----
  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    if (showDangerZone && !store.dangerGroup) {
      const dg = new THREE.Group();
      dg.position.y = 0.03;
      const cg = new THREE.CircleGeometry(12, 64);
      const cm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
      const circle = new THREE.Mesh(cg, cm);
      circle.rotation.x = -Math.PI / 2;
      dg.add(circle);
      const rg = new THREE.RingGeometry(11.5, 12, 64);
      const rm = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(rg, rm);
      ring.rotation.x = -Math.PI / 2;
      dg.add(ring);
      store.scene.add(dg);
      store.dangerGroup = dg;
    } else if (!showDangerZone && store.dangerGroup) {
      store.dangerGroup.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material?.dispose();
        }
      });
      store.scene.remove(store.dangerGroup);
      store.dangerGroup = null;
    }
  }, [showDangerZone]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', background: '#f0f4f8', overflow: 'hidden' }}
    />
  );
});

export default Sandbox3D;