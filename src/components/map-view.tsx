'use client';

import { useEffect, useRef, memo, useCallback, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type EntityType =
  | 'sensor' | 'team' | 'vehicle' | 'shelter'
  | 'hospital' | 'fire_station' | 'police_station'
  | 'ambulance' | 'fire_truck' | 'police_car';

export interface MapEntity2D {
  id: string;
  lat: number;
  lng: number;
  type: EntityType;
  status?: 'normal' | 'warning' | 'danger';
  label?: string;
  data?: any;
}

export interface DangerZone {
  center: { lat: number; lng: number };
  radius: number;
  level: 'high' | 'medium' | 'low';
}

export interface FlowLine {
  id: string;
  fromLat: number; fromLng: number;
  toLat: number; toLng: number;
  size: number;
  color: string;
  label: string;
  createdAt: number;
  duration: number;
}

export interface MovingResource {
  id: string;
  name: string;
  color: string;
  startLat: number; startLng: number;
  endLat: number; endLng: number;
  progress: number;
  status: 'moving' | 'arrived';
  startTime: number;
  duration: number;
}

export type MarkerEffectType = 'danger_pulse' | 'breathing_glow' | 'floating_bounce' | 'none';

export interface LocationMarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  zoom: number;
  offsetLat?: number;
  offsetLng?: number;
  zIndex?: number;
  highlightRadius?: number;
  highlightColor?: string;
  highlightMessage?: string;
  effectType?: MarkerEffectType;
  emotion?: string;
}

export interface StoryBubbleData {
  id: string;
  lat: number;
  lng: number;
  agentName: string;
  agentDepartment: string;
  agentEmotion: string;
  message: string;
  action?: string;
  timestamp: number;
  isActive: boolean;
  onClose?: (id: string) => void;
  onAction?: (id: string) => void;
}

interface MapViewProps {
  entities?: MapEntity2D[];
  dangerZones?: DangerZone[];
  flowLines?: FlowLine[];
  movingResources?: MovingResource[];
  showDangerZone?: boolean;
  onEntityClick?: (id: string) => void;
  campaignCenter?: { lat: number; lng: number } | null;
  campaignZoom?: number | null;
  highlightEntityIds?: string[];
  locationMarkers?: LocationMarkerData[];
  storyBubbles?: StoryBubbleData[];
  onBubbleClose?: (id: string) => void;
  onBubbleAction?: (id: string) => void;
}

function createIcon(type: EntityType, status?: string): L.DivIcon {
  const colors: Record<string, string> = {
    sensor: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22d3ee',
    hospital: '#ffffff', fire_station: '#ef4444', police_station: '#3b82f6',
    shelter: '#10b981', team: '#60a5fa', vehicle: '#f59e0b',
    ambulance: '#f8fafc', fire_truck: '#ef4444', police_car: '#3b82f6',
  };

  const bg = colors[type] || '#ffffff';
  const isDanger = status === 'danger';

  let svgPath = '';
  let viewBox = '0 0 24 24';

  switch (type) {
    case 'sensor':
      svgPath = `<circle cx="12" cy="12" r="9" fill="${bg}" stroke="${bg}" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="3" fill="${isDanger ? '#fff' : '#0a0e1a'}"/>`;
      break;
    case 'hospital':
      svgPath = `<rect x="4" y="4" width="16" height="16" rx="2" fill="#fff" stroke="#ef4444" stroke-width="1.5"/>
        <rect x="10" y="6" width="4" height="12" fill="#ef4444"/>
        <rect x="6" y="10" width="12" height="4" fill="#ef4444"/>`;
      break;
    case 'fire_station':
      svgPath = `<rect x="4" y="4" width="16" height="16" rx="2" fill="#ef4444"/>
        <rect x="9" y="14" width="6" height="4" rx="1" fill="#fbbf24"/>
        <circle cx="12" cy="7" r="2.5" fill="#fbbf24"/>`;
      break;
    case 'police_station':
      svgPath = `<rect x="4" y="4" width="16" height="16" rx="2" fill="#3b82f6"/>
        <polygon points="12,6 15,11 9,11" fill="#fbbf24"/>
        <circle cx="12" cy="14" r="2.5" fill="#3b82f6" stroke="#fbbf24" stroke-width="1.5"/>`;
      break;
    case 'shelter':
      svgPath = `<path d="M4 18 L12 6 L20 18 Z" fill="#10b981" stroke="#34d399" stroke-width="1.5"/>
        <line x1="4" y1="14" x2="20" y2="14" stroke="#34d399" stroke-width="1.5"/>`;
      break;
    case 'team':
      svgPath = `<path d="M12 4 L20 20 L4 20 Z" fill="#60a5fa" stroke="#93c5fd" stroke-width="1.5"/>`;
      break;
    default:
      const vc = bg;
      svgPath = `<rect x="3" y="10" width="18" height="8" rx="1.5" fill="${vc}" stroke="${vc}" stroke-width="1"/>
        <rect x="7" y="6" width="10" height="6" rx="1" fill="${vc}"/>
        ${type === 'ambulance' ? '<rect x="10" y="11" width="4" height="6" fill="#ef4444"/>' :
          type === 'police_car' ? '<rect x="9" y="7" width="6" height="2" rx="0.5" fill="#3b82f6"/><rect x="11" y="7" width="2" height="2" rx="0.5" fill="#ef4444"/>' : ''}`;
      break;
  }

  return new L.DivIcon({
    html: `<div style="
      width:28px;height:28px;display:flex;align-items:center;justify-content:center;
      filter:${isDanger ? 'drop-shadow(0 0 6px #ef4444)' : 'none'};
      animation:${isDanger ? 'pulse 1.5s infinite' : 'none'}
    ">
      <svg width="24" height="24" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${svgPath}</svg>
    </div>
    <style>
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    </style>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const iconCache = new Map<string, L.DivIcon>();
function getIcon(type: EntityType, status?: string): L.DivIcon {
  const key = `${type}-${status || ''}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, createIcon(type, status));
  }
  return iconCache.get(key)!;
}

function createMovingIcon(color: string): L.DivIcon {
  return new L.DivIcon({
    html: `<div style="
      width:32px;height:32px;display:flex;align-items:center;justify-content:center;
      filter:drop-shadow(0 0 8px ${color});
      animation:moving-pulse 1s ease-in-out infinite;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 5l7 7-7 7" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 19h14" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
    <style>@keyframes moving-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}</style>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const movingIconCache = new Map<string, L.DivIcon>();
function getMovingIcon(color: string): L.DivIcon {
  if (!movingIconCache.has(color)) {
    movingIconCache.set(color, createMovingIcon(color));
  }
  return movingIconCache.get(color)!;
}

function MapController({ entities, campaignCenter, campaignZoom }: {
  entities: MapEntity2D[];
  campaignCenter?: { lat: number; lng: number } | null;
  campaignZoom?: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (campaignCenter && campaignZoom) {
      map.flyTo([campaignCenter.lat, campaignCenter.lng], campaignZoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    } else if (entities.length > 0) {
      const bounds = L.latLngBounds(entities.map(e => [e.lat, e.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [entities, campaignCenter, campaignZoom]);

  return null;
}

function getEffectStyles(effectType: MarkerEffectType, emotion?: string): { iconGradient: string; iconShadow: string; animationStyle: string; iconSize: number; borderWidth: number } {
  switch (effectType) {
    case 'danger_pulse':
      return {
        iconGradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
        iconShadow: '0 0 40px rgba(239,68,68,0.95), 0 0 80px rgba(239,68,68,0.5)',
        animationStyle: '@keyframes marker-pulse{0%,100%{box-shadow:0 0 30px rgba(239,68,68,0.8),0 0 60px rgba(239,68,68,0.4);transform:scale(1)}50%{box-shadow:0 0 60px rgba(239,68,68,1),0 0 100px rgba(239,68,68,0.7);transform:scale(1.15)}}',
        iconSize: 48,
        borderWidth: 3,
      };
    case 'breathing_glow':
      return {
        iconGradient: 'linear-gradient(135deg, #38bdf8, #6366f1)',
        iconShadow: '0 0 35px rgba(56,189,248,0.85), 0 0 70px rgba(99,102,241,0.4)',
        animationStyle: '@keyframes marker-pulse{0%,100%{box-shadow:0 0 25px rgba(56,189,248,0.7),0 0 50px rgba(99,102,241,0.3);transform:scale(1)}50%{box-shadow:0 0 50px rgba(56,189,248,0.95),0 0 80px rgba(99,102,241,0.6);transform:scale(1.1)}}',
        iconSize: 44,
        borderWidth: 2.5,
      };
    case 'floating_bounce':
      return {
        iconGradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        iconShadow: '0 0 30px rgba(251,191,36,0.8), 0 0 60px rgba(251,191,36,0.3)',
        animationStyle: '@keyframes marker-pulse{0%,100%{box-shadow:0 0 20px rgba(251,191,36,0.7),0 0 40px rgba(251,191,36,0.3);transform:scale(1)}50%{box-shadow:0 0 40px rgba(251,191,36,0.9),0 0 70px rgba(251,191,36,0.5);transform:scale(1.12)}} @keyframes float-up{0%,100%{margin-top:0}50%{margin-top:-14px}}',
        iconSize: 42,
        borderWidth: 2.5,
      };
    default:
      return {
        iconGradient: 'linear-gradient(135deg, #38bdf8, #818cf8)',
        iconShadow: '0 0 20px rgba(56,189,248,0.6)',
        animationStyle: '@keyframes marker-pulse{0%,100%{box-shadow:0 0 15px rgba(56,189,248,0.5)}50%{box-shadow:0 0 30px rgba(56,189,248,0.8)}}',
        iconSize: 36,
        borderWidth: 2,
      };
  }
}

function getEmotionBadge(emotion: string): { text: string; bg: string } {
  const map: Record<string, { text: string; bg: string }> = {
    urgent: { text: '🔴 紧急', bg: 'rgba(239,68,68,0.2)' },
    worried: { text: '🟠 担忧', bg: 'rgba(251,146,60,0.2)' },
    concerned: { text: '🟡 关切', bg: 'rgba(250,204,21,0.2)' },
    confident: { text: '🟢 自信', bg: 'rgba(34,197,94,0.2)' },
    calm: { text: '🔵 冷静', bg: 'rgba(56,189,248,0.2)' },
  };
  return map[emotion] || { text: '🔵 通报', bg: 'rgba(56,189,248,0.2)' };
}

function StoryBubbleLayer({ bubbles, onClose, onAction }: {
  bubbles: StoryBubbleData[];
  onClose?: (id: string) => void;
  onAction?: (id: string) => void;
}) {
  const map = useMap();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    map.on('move', handler);
    map.on('zoom', handler);
    map.on('resize', handler);
    return () => {
      map.off('move', handler);
      map.off('zoom', handler);
      map.off('resize', handler);
    };
  }, [map]);

  const stackedBubbles = useMemo(() => {
    const result: Array<StoryBubbleData & { stackIndex: number }> = [];
    const positionCounts = new Map<string, number>();

    const activeBubble = bubbles.find(b => b.isActive);
    const activeBubbles = bubbles.filter(b => b.isActive);
    const inactiveBubbles = bubbles.filter(b => !b.isActive);

    const allSorted = [...activeBubbles, ...inactiveBubbles.slice(-3)];

    allSorted.forEach(bubble => {
      const key = `${bubble.lat.toFixed(4)},${bubble.lng.toFixed(4)}`;
      const count = positionCounts.get(key) || 0;
      positionCounts.set(key, count + 1);
      result.push({ ...bubble, stackIndex: count });
    });

    return result;
  }, [bubbles]);

  const MARKER_SIZE = 48;
  const GAP = 28;
  const BUBBLE_MAX_HEIGHT_VH = 60;

  return (
    <>
      {stackedBubbles.map(bubble => {
        const point = map.latLngToContainerPoint([bubble.lat, bubble.lng]);
        const mapSize = map.getSize();
        const mapHeight = mapSize.y;
        const mapWidth = mapSize.x;
        const isActive = bubble.isActive;

        if (!isActive) {
          // Mini collapsed bubble — anchored above marker
          const miniLeft = point.x - 110;
          const aboveSpace = point.y;
          const flipped = aboveSpace < 90;

          let miniTop: number;
          if (flipped) {
            miniTop = point.y + MARKER_SIZE / 2 + GAP + bubble.stackIndex * 48;
          } else {
            miniTop = point.y - MARKER_SIZE / 2 - GAP - 36 - bubble.stackIndex * 48;
          }

          return (
            <div
              key={bubble.id}
              style={{
                position: 'absolute',
                left: `${Math.max(4, miniLeft)}px`,
                top: `${miniTop}px`,
                width: '220px',
                zIndex: 9980,
                pointerEvents: 'auto',
                transition: 'all 0.4s ease',
              }}
            >
              <div
                onClick={() => onClose?.(bubble.id)}
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {bubble.agentName.charAt(0)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bubble.agentName}
                </span>
                <span style={{ fontSize: 18, opacity: 0.4 }}>📌</span>
              </div>
              {!flipped && (
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '10px solid rgba(15,23,42,0.9)',
                  margin: '0 auto',
                }} />
              )}
              {flipped && (
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '10px solid rgba(15,23,42,0.9)',
                  margin: '0 auto',
                  marginTop: '-12px',
                }} />
              )}
            </div>
          );
        }

        // === Active bubble — 3-direction placement ===
        const emotion = getEmotionBadge(bubble.agentEmotion);
        const borderColor = bubble.agentEmotion === 'urgent' ? 'rgba(239,68,68,0.8)' :
          bubble.agentEmotion === 'worried' || bubble.agentEmotion === 'concerned' ? 'rgba(251,146,60,0.6)' :
          'rgba(56,189,248,0.6)';
        const glowColor = bubble.agentEmotion === 'urgent' ? 'rgba(239,68,68,0.35)' :
          'rgba(56,189,248,0.3)';

        const bubbleW = 400;
        const bubbleMaxH = (mapHeight * BUBBLE_MAX_HEIGHT_VH) / 100;

        // Decide direction: above → left → right
        type Direction = 'above' | 'left' | 'right';
        let dir: Direction = 'above';

        const aboveOk = point.y - MARKER_SIZE / 2 >= bubbleMaxH + GAP + 30;
        const leftOk = point.x - MARKER_SIZE / 2 >= bubbleW + GAP;
        const rightOk = point.x + MARKER_SIZE / 2 + bubbleW + GAP <= mapWidth;

        if (aboveOk) {
          dir = 'above';
        } else if (leftOk) {
          dir = 'left';
        } else {
          dir = 'right';
        }

        // Position calculation
        let sLeft: number | string, sTop: number | string, sBottom: number | string, sRight: number | string;
        sLeft = 'auto'; sTop = 'auto'; sBottom = 'auto'; sRight = 'auto';

        if (dir === 'above') {
          sLeft = point.x - bubbleW / 2;
          sBottom = mapHeight - (point.y - MARKER_SIZE / 2 - GAP);
        } else if (dir === 'left') {
          sRight = mapWidth - (point.x - MARKER_SIZE / 2 - GAP);
          sTop = point.y - bubbleMaxH / 2;
        } else {
          sLeft = point.x + MARKER_SIZE / 2 + GAP;
          sTop = point.y - bubbleMaxH / 2;
        }

        // Clamp left
        if (dir === 'above' || dir === 'right') {
          const l = typeof sLeft === 'number' ? sLeft : 0;
          if (l < 8) sLeft = 8;
          if (l + bubbleW > mapWidth - 8) sLeft = mapWidth - bubbleW - 8;
        }

        return (
          <div
            key={bubble.id}
            className="story-bubble-wrapper"
            style={{
              position: 'absolute',
              left: typeof sLeft === 'number' ? `${sLeft}px` : 'auto',
              top: typeof sTop === 'number' ? `${sTop}px` : 'auto',
              bottom: typeof sBottom === 'number' ? `${sBottom}px` : 'auto',
              right: typeof sRight === 'number' ? `${sRight}px` : 'auto',
              width: `${bubbleW}px`,
              maxWidth: 'min(400px, 90vw)',
              zIndex: 9999,
              pointerEvents: 'auto',
              animation: 'bubble-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            {/* Arrow: left-side placement → arrow points right ► */}
            {dir === 'left' && (
              <div className="bubble-arrow" style={{
                position: 'absolute',
                right: -12, top: '50%', transform: 'translateY(-50%)',
                width: 0, height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: `14px solid ${borderColor}`,
                zIndex: 2,
              }} />
            )}

            {/* Arrow: right-side placement → arrow points left ◄ */}
            {dir === 'right' && (
              <div className="bubble-arrow" style={{
                position: 'absolute',
                left: -12, top: '50%', transform: 'translateY(-50%)',
                width: 0, height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderRight: `14px solid ${borderColor}`,
                zIndex: 2,
              }} />
            )}

            <div style={{
              background: 'rgba(20,25,40,0.95)',
              border: `3px solid ${borderColor}`,
              borderRadius: '18px',
              boxShadow: `0 10px 25px rgba(0,0,0,0.5), 0 0 50px ${glowColor}, 0 0 80px rgba(0,0,0,0.4)`,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: `${BUBBLE_MAX_HEIGHT_VH}vh`,
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'linear-gradient(180deg, rgba(56,189,248,0.15), rgba(56,189,248,0.03))',
                borderBottom: `1px solid ${borderColor.replace('0.8', '0.3').replace('0.6', '0.2')}`,
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800, color: '#fff',
                    boxShadow: '0 0 20px rgba(99,102,241,0.6)', flexShrink: 0,
                  }}>
                    {bubble.agentName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', lineHeight: 1.3, letterSpacing: '0.5px' }}>
                      {bubble.agentName}
                    </div>
                    <div style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.3, marginTop: 2 }}>
                      {bubble.agentDepartment}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: 16, fontWeight: 700, padding: '6px 16px',
                    borderRadius: '9999px', background: emotion.bg, color: '#f8fafc',
                    border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.5px',
                  }}>
                    {emotion.text}
                  </span>
                  {onClose && (
                    <button onClick={() => onClose(bubble.id)} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#94a3b8', cursor: 'pointer',
                      fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>✕</button>
                  )}
                </div>
              </div>

              <div style={{
                padding: '20px', fontSize: 20, lineHeight: 1.7, color: '#e2e8f0',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 400,
                letterSpacing: '0.3px', overflowY: 'auto', flex: '1 1 auto',
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent',
              }}>
                {bubble.message}
              </div>

              {bubble.action && (
                <div style={{
                  padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                }}>
                  <span style={{ fontSize: 18, color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚡ {bubble.action}
                  </span>
                  {onAction && (
                    <button onClick={() => onAction(bubble.id)} style={{
                      marginLeft: 'auto', padding: '10px 24px',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      border: 'none', borderRadius: '12px', color: '#fff', fontSize: 18,
                      fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.5)', letterSpacing: '0.5px',
                    }}>执行</button>
                  )}
                </div>
              )}

              <div style={{
                padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: 14, color: '#64748b', textAlign: 'right', flexShrink: 0,
              }}>
                {new Date(bubble.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            {/* Arrow: above placement → triangle below ▼ */}
            {dir === 'above' && (
              <div style={{
                width: 0, height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: `16px solid ${borderColor}`,
                margin: '0 auto', marginTop: '-1px',
              }} />
            )}
          </div>
        );
      })}
    </>
  );
}

export const MapView = memo(function MapView({
  entities = [],
  dangerZones = [],
  flowLines = [],
  movingResources = [],
  showDangerZone = false,
  onEntityClick,
  campaignCenter,
  campaignZoom,
  highlightEntityIds = [],
  locationMarkers = [],
  storyBubbles = [],
  onBubbleClose,
  onBubbleAction,
}: MapViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const onEntityClickRef = useRef(onEntityClick);
  onEntityClickRef.current = onEntityClick;

  const handleMarkerClick = useCallback((id: string) => {
    setActiveId(prev => prev === id ? null : id);
    onEntityClickRef.current?.(id);
  }, []);

  const center: [number, number] = [30.5728, 104.0668];
  if (entities.length > 0) {
    const avgLat = entities.reduce((s, e) => s + e.lat, 0) / entities.length;
    const avgLng = entities.reduce((s, e) => s + e.lng, 0) / entities.length;
    center[0] = avgLat;
    center[1] = avgLng;
  }

  const dangerZoneColors = {
    high: { color: '#ef4444', fillOpacity: 0.12, weight: 2 },
    medium: { color: '#f59e0b', fillOpacity: 0.08, weight: 1.5 },
    low: { color: '#3b82f6', fillOpacity: 0.05, weight: 1 },
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400, background: '#080c16', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        className="tactical-map"
      >
        <TileLayer
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains="1234"
          maxZoom={18}
          attribution='&copy; <a href="https://www.amap.com">高德地图</a>'
        />

        <MapController entities={entities} campaignCenter={campaignCenter} campaignZoom={campaignZoom} />

        {showDangerZone && dangerZones.map((zone, idx) => {
          const colors = dangerZoneColors[zone.level];
          return (
            <Circle
              key={`danger-zone-${idx}`}
              center={[zone.center.lat, zone.center.lng]}
              radius={zone.radius}
              pathOptions={{
                color: colors.color,
                fillColor: colors.color,
                fillOpacity: colors.fillOpacity,
                weight: colors.weight,
                opacity: 0.4,
                dashArray: zone.level === 'high' ? '8,6' : '4,4',
              }}
            />
          );
        })}

        {showDangerZone && dangerZones.length === 0 && (
          <>
            <Circle
              center={[30.58, 104.07]}
              radius={800}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.08,
                weight: 2,
                opacity: 0.35,
                dashArray: '8,6',
                dashOffset: String(Math.floor(Date.now() / 200) % 14),
              }}
            />
            <Circle
              center={[30.58, 104.07]}
              radius={1200}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.03, weight: 0.5, opacity: 0.15 }}
            />
          </>
        )}

        {flowLines.map(flow => {
          const elapsed = Date.now() - flow.createdAt;
          const progress = Math.min(elapsed / flow.duration, 1);
          const positions: [number, number][] = [
            [flow.fromLat, flow.fromLng],
            [flow.toLat, flow.toLng],
          ];
          return (
            <Polyline
              key={flow.id}
              positions={positions}
              pathOptions={{
                color: flow.color,
                weight: 1.5 + flow.size * 0.4,
                opacity: 0.85 * (1 - progress * 0.4),
                dashArray: '8,5',
                dashOffset: String(-elapsed * 0.05),
              }}
            />
          );
        })}

        {movingResources.map(mr => {
          const elapsed = Date.now() - mr.startTime;
          const progress = Math.min(elapsed / mr.duration, 1);
          const curLat = mr.startLat + (mr.endLat - mr.startLat) * progress;
          const curLng = mr.startLng + (mr.endLng - mr.startLng) * progress;

          const trailPositions: [number, number][] = [];
          for (let i = 0; i <= Math.min(progress * 20, 20); i++) {
            const t = i / 20;
            trailPositions.push([
              mr.startLat + (mr.endLat - mr.startLat) * t,
              mr.startLng + (mr.endLng - mr.startLng) * t,
            ]);
          }

          return (
            <div key={mr.id}>
              {trailPositions.length > 1 && (
                <Polyline
                  positions={trailPositions}
                  pathOptions={{
                    color: mr.color,
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '4,4',
                    dashOffset: String(-Date.now() * 0.08),
                  }}
                />
              )}
              <Marker
                position={[curLat, curLng]}
                icon={getMovingIcon(mr.color)}
                zIndexOffset={1000}
              >
                <Tooltip permanent direction="top" offset={[0, -14]}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 11,
                    color: mr.color,
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                  }}>
                    🚀 {mr.name}
                  </span>
                </Tooltip>
              </Marker>
            </div>
          );
        })}

        {entities.map(entity => {
          const isActive = activeId === entity.id;
          const isHighlighted = highlightEntityIds.includes(entity.id);
          const isEvent = entity.type === 'sensor' && (entity.status === 'danger' || entity.status === 'warning');
          return (
            <Marker
              key={entity.id}
              position={[entity.lat, entity.lng]}
              icon={getIcon(entity.type, isHighlighted ? 'danger' : entity.status)}
              eventHandlers={{
                click: () => handleMarkerClick(entity.id),
              }}
              zIndexOffset={isHighlighted ? 1000 : isEvent ? 500 : 100}
            >
              <Tooltip permanent direction={isEvent ? 'top' : 'bottom'} offset={[0, isEvent ? -14 : 6]}>
                <span style={{
                  fontWeight: isEvent ? 700 : 600,
                  fontSize: isEvent ? 12 : 11,
                  color: isEvent
                    ? (entity.status === 'danger' ? '#fca5a5' : '#fcd34d')
                    : '#e2e8f0',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                  padding: isEvent ? '2px 8px' : '1px 4px',
                  background: isEvent
                    ? (entity.status === 'danger' ? 'rgba(220,38,38,0.15)' : 'rgba(245,158,11,0.15)')
                    : 'transparent',
                  borderRadius: 4,
                }}>
                  {entity.label || entity.type}
                </span>
              </Tooltip>
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 'bold', color: '#e2e8f0' }}>
                    {entity.label}
                  </h4>
                  {entity.data && (
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                      {entity.data.capacity && (
                        <p style={{ margin: '2px 0' }}>容量: {entity.data.capacity}</p>
                      )}
                      {entity.data.description && (
                        <p style={{ margin: '2px 0' }}>{entity.data.description}</p>
                      )}
                      {entity.data.arrivalTime && (
                        <p style={{ margin: '2px 0' }}>到达时间: {entity.data.arrivalTime}</p>
                      )}
                      {entity.data.strength && (
                        <p style={{ margin: '2px 0' }}>兵力: {entity.data.strength}</p>
                      )}
                      {entity.data.type && (
                        <p style={{ margin: '2px 0' }}>
                          类型: {(() => {
                            const typeMap: Record<string, string> = {
                              hospital: '医院', fire_station: '消防站', police_station: '警察局',
                              shelter: '避难所', command_center: '指挥中心', school: '学校',
                              army_base: '军事基地', airport: '机场',
                              fire_brigade: '消防队', armed_police: '武警', army: '解放军',
                              militia: '民兵', medical_team: '医疗队', engineering: '工程队', volunteer: '志愿者'
                            };
                            return typeMap[entity.data.type as string] || entity.data.type;
                          })()}
                        </p>
                      )}
                    </div>
                  )}
                  <p style={{ margin: '6px 0 0 0', fontSize: 11, color: '#64748b' }}>
                    坐标: {entity.lat.toFixed(4)}, {entity.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {locationMarkers.map(marker => {
          const displayLat = marker.offsetLat ?? marker.lat;
          const displayLng = marker.offsetLng ?? marker.lng;
          const effects = getEffectStyles(marker.effectType || 'none', marker.emotion);
          const sz = effects.iconSize;
          const svgSz = Math.round(sz * 0.5);
          const isDanger = marker.effectType === 'danger_pulse';
          const isFloat = marker.effectType === 'floating_bounce';

          return (
            <div key={marker.id}>
              {/* Highlight anchor circle */}
              {marker.highlightRadius && (
                <Circle
                  center={[displayLat, displayLng]}
                  radius={marker.highlightRadius}
                  pathOptions={{
                    color: marker.highlightColor || '#38bdf8',
                    fillColor: marker.highlightColor || '#38bdf8',
                    fillOpacity: 0.15,
                    weight: 2,
                    opacity: 0.5,
                    dashArray: '8,6',
                  }}
                />
              )}

              {/* Danger ripple - 3 concentric animated circles */}
              {isDanger && (
                <>
                  <Circle
                    center={[displayLat, displayLng]}
                    radius={300}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 3, opacity: 0.5 }}
                    className="danger-ripple danger-ripple-1"
                  />
                  <Circle
                    center={[displayLat, displayLng]}
                    radius={200}
                    pathOptions={{ color: '#f87171', fillColor: '#f87171', fillOpacity: 0.08, weight: 2, opacity: 0.45 }}
                    className="danger-ripple danger-ripple-2"
                  />
                  <Circle
                    center={[displayLat, displayLng]}
                    radius={100}
                    pathOptions={{ color: '#fca5a5', fillColor: '#fca5a5', fillOpacity: 0.05, weight: 1.5, opacity: 0.4 }}
                    className="danger-ripple danger-ripple-3"
                  />
                </>
              )}

              {/* Breathing glow circle for active markers */}
              {marker.effectType === 'breathing_glow' && (
                <Circle
                  center={[displayLat, displayLng]}
                  radius={250}
                  pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.08, weight: 2, opacity: 0.4 }}
                  className="breathing-glow-ring"
                />
              )}

              {/* Marker dot */}
              <Marker
                position={[displayLat, displayLng]}
                zIndexOffset={marker.zIndex || 1000}
                icon={new L.DivIcon({
                  html: `<div style="
                    display:flex;align-items:center;justify-content:center;
                    width:${sz}px;height:${sz}px;
                    background:${effects.iconGradient};
                    border-radius:50%;
                    box-shadow:${effects.iconShadow};
                    border:${effects.borderWidth}px solid rgba(255,255,255,0.9);
                    animation:marker-pulse 1.5s ease-in-out infinite;
                    ${isFloat ? 'animation: marker-pulse 1.5s ease-in-out infinite, float-up 1.8s ease-in-out infinite;' : ''}
                  ">
                    <svg width="${svgSz}" height="${svgSz}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${isDanger ? 3 : 2.5}" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style="
                    position:absolute;top:100%;left:50%;transform:translateX(-50%);
                    margin-top:6px;padding:3px 10px;
                    background:rgba(8,14,26,0.95);
                    border:1px solid rgba(255,255,255,0.3);
                    border-radius:6px;
                    color:#f1f5f9;
                    font-size:14px;
                    font-weight:700;
                    white-space:nowrap;
                    text-shadow:0 2px 6px rgba(0,0,0,0.9);
                    letter-spacing:0.5px;
                  ">${marker.label}</div>
                  <style>${effects.animationStyle} @keyframes float-up{0%,100%{margin-top:0}50%{margin-top:-14px}}</style>`,
                  className: isFloat ? 'marker-float' : '',
                  iconSize: [sz, sz + 24],
                  iconAnchor: [Math.round(sz / 2), Math.round(sz / 2)],
                })}
              />
            </div>
          );
        })}

        <StoryBubbleLayer
          bubbles={storyBubbles}
          onClose={onBubbleClose}
          onAction={onBubbleAction}
        />
      </MapContainer>

      <div style={{
        position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 8,
        fontSize: 10, fontFamily: 'monospace', opacity: 0.25, color: '#22d3ee',
        pointerEvents: 'none', zIndex: 1000,
      }}>
        <span>TACTICAL MAP</span>
        <span>·</span>
        <span>Leaflet + Amap</span>
      </div>

      <style>{`
        .tactical-map .leaflet-control-zoom { display: none; }
        .tactical-map .leaflet-popup-content-wrapper {
          background: rgba(15,23,42,0.95);
          border: 1px solid #334155;
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
        }
        .tactical-map .leaflet-popup-tip { background: rgba(15,23,42,0.95); border: 1px solid #334155; }
        .tactical-map .leaflet-popup-content { margin: 8px 12px; color: #e2e8f0; font-size: 13px; line-height: 1.5; }
        .tactical-map .leaflet-tooltip-left::before { border-left-color: rgba(15,23,42,0.92); }
        .tactical-map .leaflet-tooltip-right::before { border-right-color: rgba(15,23,42,0.92); }
        .tactical-map .leaflet-tooltip-bottom::before, .tactical-map .leaflet-tooltip-top::before { border-top-color: rgba(15,23,42,0.92); }
        .tactical-map .leaflet-tooltip {
          background: rgba(15,23,42,0.92) !important;
          border: 1px solid #334155 !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          padding: 3px 8px !important;
          pointer-events: auto !important;
        }

        /* === DRAMATIC VISUAL EFFECTS === */

        /* 3-layer danger ripple - staggered timing for radar-like effect */
        .danger-ripple {
          animation: ripple-expand 2s ease-out infinite;
          pointer-events: none;
        }
        .danger-ripple-1 { animation-delay: 0s; }
        .danger-ripple-2 { animation-delay: 0.5s; }
        .danger-ripple-3 { animation-delay: 1s; }
        @keyframes ripple-expand {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        /* Breathing glow ring */
        .breathing-glow-ring {
          animation: glow-breathe 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes glow-breathe {
          0%, 100% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0.7; }
        }

        /* Bubble entry + custom scrollbar */
        .story-bubble-wrapper {
          animation: bubble-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes bubble-enter {
          0% { opacity: 0; transform: translateY(40px) scale(0.7); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .story-bubble-wrapper ::-webkit-scrollbar {
          width: 5px;
        }
        .story-bubble-wrapper ::-webkit-scrollbar-track {
          background: transparent;
        }
        .story-bubble-wrapper ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 10px;
        }
        .story-bubble-wrapper ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
});

export default MapView;
