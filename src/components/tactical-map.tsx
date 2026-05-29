'use client';

import { useEffect, useRef, memo, useCallback, useState } from 'react';

export type EntityType =
  | 'sensor' | 'team' | 'vehicle' | 'shelter'
  | 'hospital' | 'fire_station' | 'police_station'
  | 'ambulance' | 'fire_truck' | 'police_car';

export interface MapEntity2D {
  id: string;
  x: number;
  z: number;
  type: EntityType;
  status?: 'normal' | 'warning' | 'danger';
  label?: string;
}

export interface FlowLine {
  id: string;
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  size: number;
  color: string;
  label: string;
  createdAt: number;
  duration: number;
}

interface TacticalMapProps {
  entities?: MapEntity2D[];
  flowLines?: FlowLine[];
  showDangerZone?: boolean;
  onEntityClick?: (id: string) => void;
}

const WORLD_SIZE = 200;

function createRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}
const rng = createRng(42);

// ----- road network -----
interface RoadSegment {
  x1: number; z1: number; x2: number; z2: number;
  width: number; color: string; glow: boolean;
}

function generateRoads(): RoadSegment[] {
  const roads: RoadSegment[] = [];
  const MAIN_GAP = WORLD_SIZE / 5;
  const STEP = 4;

  for (let row = 1; row < 5; row++) {
    const baseZ = row * MAIN_GAP;
    for (let x = 0; x < WORLD_SIZE - STEP; x += STEP) {
      const nx = x + STEP + (rng() - 0.5) * 2;
      const nz = baseZ + (rng() - 0.5) * 1.2;
      roads.push({ x1: x, z1: baseZ + (rng() - 0.5) * 0.8, x2: Math.min(nx, WORLD_SIZE), z2: nz, width: 2.8, color: '#22d3ee', glow: true });
    }
    if (row < 4) {
      const sz = baseZ + MAIN_GAP / 2 + (rng() - 0.5) * 1;
      for (let x = 0; x < WORLD_SIZE - STEP * 1.5; x += STEP * 1.5) {
        roads.push({ x1: x, z1: sz + (rng() - 0.5) * 0.6, x2: x + STEP * 1.5 + (rng() - 0.5) * 0.8, z2: sz + (rng() - 0.5) * 0.6, width: 1.2, color: '#475569', glow: false });
      }
    }
  }

  for (let col = 1; col < 5; col++) {
    const baseX = col * MAIN_GAP;
    for (let z = 0; z < WORLD_SIZE - STEP; z += STEP) {
      const nz = z + STEP + (rng() - 0.5) * 2;
      const nx = baseX + (rng() - 0.5) * 1.2;
      roads.push({ x1: baseX + (rng() - 0.5) * 0.8, z1: z, x2: nx, z2: Math.min(nz, WORLD_SIZE), width: 2.8, color: '#22d3ee', glow: true });
    }
    if (col < 4) {
      const sx = baseX + MAIN_GAP / 2 + (rng() - 0.5) * 1;
      for (let z = 0; z < WORLD_SIZE - STEP * 1.5; z += STEP * 1.5) {
        roads.push({ x1: sx + (rng() - 0.5) * 0.6, z1: z, x2: sx + (rng() - 0.5) * 0.6, z2: z + STEP * 1.5 + (rng() - 0.5) * 0.8, width: 1.2, color: '#475569', glow: false });
      }
    }
  }

  return roads;
}

// ----- buildings -----
interface Building2D { x: number; z: number; w: number; d: number; color: string; }

function generateBuildings(): Building2D[] {
  const bldgs: Building2D[] = [];
  const rng2 = createRng(137);
  const GAP = WORLD_SIZE / 5;
  const colors = ['#1e293b','#334155','#1e1e3a','#2d1b2e','#2e2d1b','#1a2a3a','#2a1a3a','#3a2a1a'];

  for (let bx = 0; bx < WORLD_SIZE; bx += GAP) {
    for (let bz = 0; bz < WORLD_SIZE; bz += GAP) {
      if (rng2() < 0.08) continue;
      const cx = bx + GAP / 2, cz = bz + GAP / 2;
      const n = 1 + Math.floor(rng2() * 2);
      for (let i = 0; i < n; i++) {
        bldgs.push({
          x: cx - 6 + rng2() * 12,
          z: cz - 6 + rng2() * 12,
          w: 4 + rng2() * 6,
          d: 4 + rng2() * 6,
          color: colors[Math.floor(rng2() * colors.length)],
        });
      }
    }
  }
  return bldgs;
}

// ----- draw helpers (all operate in world coordinates, ctx already transformed) -----
function drawRoad(ctx: CanvasRenderingContext2D, r: RoadSegment) {
  ctx.beginPath();
  ctx.moveTo(r.x1, r.z1);
  ctx.lineTo(r.x2, r.z2);
  ctx.strokeStyle = r.color;
  ctx.lineWidth = r.width;
  ctx.lineCap = 'round';
  ctx.globalAlpha = r.glow ? 0.45 : 0.2;
  ctx.stroke();
  if (r.glow) {
    ctx.beginPath();
    ctx.moveTo(r.x1, r.z1);
    ctx.lineTo(r.x2, r.z2);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = r.width + 1.5;
    ctx.globalAlpha = 0.06;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

function drawBuilding(ctx: CanvasRenderingContext2D, b: Building2D) {
  ctx.fillStyle = b.color;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(b.x - b.w / 2, b.z - b.d / 2, b.w, b.d);
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 0.25;
  ctx.globalAlpha = 0.1;
  ctx.strokeRect(b.x - b.w / 2, b.z - b.d / 2, b.w, b.d);
  ctx.globalAlpha = 1;
}

function drawEntityIcon(ctx: CanvasRenderingContext2D, e: MapEntity2D, hovered: boolean) {
  const { x, z, type, status } = e;
  const s = hovered ? 9 : 6;
  const danger = status === 'danger', warn = status === 'warning';

  ctx.save();
  if (hovered) { ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 14; }

  if (danger) {
    ctx.beginPath(); ctx.arc(x, z, s + 6, 0, Math.PI * 2); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.55; ctx.stroke();
  } else if (warn) {
    ctx.beginPath(); ctx.arc(x, z, s + 4, 0, Math.PI * 2); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const c = danger ? '#ef4444' : warn ? '#f59e0b' : undefined;

  switch (type) {
    case 'sensor': {
      ctx.beginPath(); ctx.arc(x, z, s, 0, Math.PI * 2); ctx.fillStyle = c || '#22d3ee'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, z, s * 0.4, 0, Math.PI * 2); ctx.fillStyle = danger ? '#fff' : '#0a0e1a'; ctx.fill();
      break;
    }
    case 'hospital': {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s, z - s, s * 2, s * 2);
      ctx.fillStyle = '#ef4444'; ctx.fillRect(x - s * 0.5, z - 1, s, 2); ctx.fillRect(x - 1, z - s * 0.5, 2, s);
      break;
    }
    case 'fire_station': {
      ctx.fillStyle = '#ef4444'; ctx.fillRect(x - s, z - s, s * 2, s * 2);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(x - s * 0.35, z + s * 0.5 - s * 0.65, s * 0.7, s * 0.7);
      break;
    }
    case 'police_station': {
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(x - s, z - s, s * 2, s * 2);
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x, z, s * 0.38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(x, z, s * 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'shelter': {
      ctx.fillStyle = '#10b981'; ctx.fillRect(x - s, z - s * 0.55, s * 2, s * 1.55);
      ctx.beginPath(); ctx.moveTo(x - s - 2.5, z - s * 0.55); ctx.lineTo(x, z - s - 2.5); ctx.lineTo(x + s + 2.5, z - s * 0.55); ctx.closePath(); ctx.fillStyle = '#34d399'; ctx.fill();
      break;
    }
    case 'team': {
      ctx.beginPath(); ctx.moveTo(x, z - s); ctx.lineTo(x + s, z + s); ctx.lineTo(x - s, z + s); ctx.closePath(); ctx.fillStyle = '#60a5fa'; ctx.fill();
      break;
    }
    default: {
      const vc = type === 'ambulance' ? '#f8fafc' : type === 'fire_truck' ? '#ef4444' : type === 'police_car' ? '#3b82f6' : '#f59e0b';
      ctx.fillStyle = vc; ctx.fillRect(x - s, z - s * 0.45, s * 2, s * 0.9);
      ctx.fillRect(x - s * 0.45, z - s * 0.95, s * 0.9, s * 0.55);
      if (type === 'ambulance') { ctx.fillStyle = '#ef4444'; ctx.fillRect(x - 1.2, z - 1.2, 2.4, 2.4); }
      break;
    }
  }

  if (e.label) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${hovered ? 11 : 10}px "Noto Serif SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = hovered ? 1 : 0.55;
    ctx.fillText(e.label, x, z + s + 14);
  }
  ctx.restore();
}

function drawFlowLine(ctx: CanvasRenderingContext2D, f: FlowLine, now: number) {
  const elapsed = now - f.createdAt;
  const { fromX: x1, fromZ: z1, toX: x2, toZ: z2 } = f;

  ctx.save();
  ctx.shadowColor = f.color; ctx.shadowBlur = 12;

  const dashLen = 7 + f.size * 0.6;
  ctx.setLineDash([dashLen, dashLen * 0.55]);
  ctx.lineDashOffset = -elapsed * 0.09;
  ctx.beginPath(); ctx.moveTo(x1, z1); ctx.lineTo(x2, z2);
  ctx.strokeStyle = f.color; ctx.lineWidth = 1.8 + f.size * 0.35; ctx.globalAlpha = 0.7; ctx.lineCap = 'round'; ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, z1); ctx.lineTo(x2, z2);
  ctx.strokeStyle = f.color; ctx.lineWidth = 1 + f.size * 0.18; ctx.globalAlpha = 0.18; ctx.stroke();

  // arrow
  const angle = Math.atan2(z2 - z1, x2 - x1);
  const alen = 9 + f.size;
  ctx.beginPath(); ctx.moveTo(x2, z2);
  ctx.lineTo(x2 - alen * Math.cos(angle - 0.4), z2 - alen * Math.sin(angle - 0.4));
  ctx.moveTo(x2, z2);
  ctx.lineTo(x2 - alen * Math.cos(angle + 0.4), z2 - alen * Math.sin(angle + 0.4));
  ctx.strokeStyle = f.color; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.85; ctx.stroke();

  // pulse at end
  const pr = 5 + Math.sin(elapsed * 0.005) * 3.5;
  ctx.beginPath(); ctx.arc(x2, z2, pr, 0, Math.PI * 2);
  ctx.strokeStyle = f.color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.55; ctx.stroke();
  ctx.beginPath(); ctx.arc(x2, z2, pr * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = f.color; ctx.globalAlpha = 0.4; ctx.fill();

  // label
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  ctx.fillStyle = f.color; ctx.font = '10px "Noto Serif SC", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(f.label, (x1 + x2) / 2, (z1 + z2) / 2 - 11);

  ctx.restore();
}

// ======================== Component ========================

export const TacticalMap = memo(function TacticalMap({
  entities = [],
  flowLines = [],
  showDangerZone = false,
  onEntityClick,
}: TacticalMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animId = useRef(0);

  const roads = useRef(generateRoads());
  const buildings = useRef(generateBuildings());

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // viewport: all values are in SCREEN pixel space
  // transform chain: worldCoord -> (worldCoord * scale + offsetX) -> screenPixel
  const vp = useRef({ offsetX: 0, offsetY: 0, scale: 1, dragging: false, lastSX: 0, lastSY: 0 });

  const entsRef = useRef(entities); entsRef.current = entities;
  const flowsRef = useRef(flowLines); flowsRef.current = flowLines;
  const clickCb = useRef(onEntityClick); clickCb.current = onEntityClick;

  // ---- resize: canvas always matches container pixel-perfect ----
  useEffect(() => {
    const el = containerRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;

    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;

      // center map on first resize
      if (vp.current.offsetX === 0 && vp.current.offsetY === 0) {
        vp.current.scale = Math.min(w, h) / (WORLD_SIZE * 0.55);
        vp.current.offsetX = (w - WORLD_SIZE * vp.current.scale) / 2;
        vp.current.offsetY = (h - WORLD_SIZE * vp.current.scale) / 2;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- render loop ----
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const loop = () => {
      animId.current = requestAnimationFrame(loop);
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      const w = cv.clientWidth;
      const h = cv.clientHeight;
      const { offsetX, offsetY, scale } = vp.current;

      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save();

      // apply viewport transform: world -> screen
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // background (fill entire visible area in world coords)
      const invScale = 1 / scale;
      ctx.fillStyle = '#080c16';
      ctx.fillRect(-offsetX * invScale, -offsetY * invScale, w * invScale, h * invScale);

      // grid dots
      ctx.fillStyle = '#22d3ee';
      ctx.globalAlpha = 0.05;
      for (let gx = 0; gx <= WORLD_SIZE; gx += 10) {
        for (let gz = 0; gz <= WORLD_SIZE; gz += 10) {
          ctx.beginPath(); ctx.arc(gx, gz, 0.6, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // buildings
      for (const b of buildings.current) drawBuilding(ctx, b);

      // roads
      for (const r of roads.current) drawRoad(ctx, r);

      // intersection markers
      const MG = WORLD_SIZE / 5;
      for (let ix = 1; ix < 5; ix++) {
        for (let iz = 1; iz < 5; iz++) {
          ctx.beginPath(); ctx.arc(ix * MG, iz * MG, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#22d3ee'; ctx.globalAlpha = 0.28; ctx.fill(); ctx.globalAlpha = 1;
        }
      }

      // danger zone
      if (showDangerZone) {
        const dcx = WORLD_SIZE / 2, dcz = WORLD_SIZE / 2, dr = WORLD_SIZE * 0.08;
        ctx.beginPath(); ctx.arc(dcx, dcz, dr, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.globalAlpha = 0.06; ctx.fill();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.35; ctx.stroke();
        ctx.beginPath(); ctx.arc(dcx, dcz, dr, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 7]); ctx.lineDashOffset = -Date.now() * 0.03;
        ctx.globalAlpha = 0.6; ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      // flow lines
      const now = Date.now();
      for (const f of flowsRef.current) drawFlowLine(ctx, f, now);

      // entities
      for (const e of entsRef.current) drawEntityIcon(ctx, e, hoveredId === e.id);

      ctx.restore();
    };

    loop();
    return () => cancelAnimationFrame(animId.current);
  }, [showDangerZone, hoveredId]);

  // ---- coordinate conversion helpers ----
  // screen pixel -> world coord
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const v = vp.current;
    return { x: (sx - v.offsetX) / v.scale, y: (sy - v.offsetY) / v.scale };
  }, []);

  // ---- mouse handlers ----
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const v = vp.current;
    v.dragging = true;
    v.lastSX = e.clientX;
    v.lastSY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const v = vp.current;
    if (v.dragging) {
      v.offsetX += e.clientX - v.lastSX;
      v.offsetY += e.clientY - v.lastSY;
      v.lastSX = e.clientX;
      v.lastSY = e.clientY;
      return;
    }

    // hover detection
    const rect = canvasRef.current!.getBoundingClientRect();
    const wx = screenToWorld(e.clientX - rect.left, e.clientY - rect.top).x;
    const wy = screenToWorld(e.clientX - rect.left, e.clientY - rect.top).y;
    let found: string | null = null;
    for (const ent of entsRef.current) {
      if ((wx - ent.x) ** 2 + (wy - ent.z) ** 2 < 120) { found = ent.id; break; }
    }
    setHoveredId(found);
    canvasRef.current!.style.cursor = found ? 'pointer' : 'grab';
  }, [screenToWorld]);

  const handleMouseUp = useCallback(() => { vp.current.dragging = false; }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (vp.current.dragging) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const { x: wx, y: wy } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    for (const ent of entsRef.current) {
      if ((wx - ent.x) ** 2 + (wy - ent.z) ** 2 < 120) { clickCb.current?.(ent.id); return; }
    }
  }, [screenToWorld]);

  // ---- wheel: zoom centered on mouse cursor ----
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const v = vp.current;
    const factor = e.deltaY > 0 ? 0.88 : 1.13;
    const newScale = Math.min(Math.max(v.scale * factor, 0.15), 5);

    // get mouse pos in screen pixels relative to canvas
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // world point under mouse BEFORE zoom
    const worldBeforeX = (mx - v.offsetX) / v.scale;
    const worldBeforeY = (my - v.offsetY) / v.scale;

    // apply new scale
    v.scale = newScale;

    // recompute offset so that same world point stays under mouse
    v.offsetX = mx - worldBeforeX * newScale;
    v.offsetY = my - worldBeforeY * newScale;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 400, background: '#080c16', overflow: 'hidden', position: 'relative' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', cursor: 'grab' }} />
      {/* HUD overlay */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        display: 'flex', gap: 8, alignItems: 'center',
        fontSize: 10, fontFamily: 'monospace', opacity: 0.25, color: '#22d3ee',
        pointerEvents: 'none'
      }}>
        <span>TACTICAL MAP v2</span>
        <span>·</span>
        <span>{WORLD_SIZE}×{WORLD_SIZE}</span>
      </div>
    </div>
  );
});

export default TacticalMap;