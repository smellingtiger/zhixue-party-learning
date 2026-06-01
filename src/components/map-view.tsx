'use client';

import { useEffect, useRef, memo, useCallback, useState } from 'react';
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

interface MapViewProps {
  entities?: MapEntity2D[];
  dangerZones?: DangerZone[];
  flowLines?: FlowLine[];
  movingResources?: MovingResource[];
  showDangerZone?: boolean;
  onEntityClick?: (id: string) => void;
  // 战役模式控制
  campaignCenter?: { lat: number; lng: number } | null;
  campaignZoom?: number | null;
  highlightEntityIds?: string[];
  // 自定义定位点标记
  locationMarkers?: Array<{
    id: string;
    lat: number;
    lng: number;
    label: string;
    offsetLat?: number;
    offsetLng?: number;
    zIndex?: number;
    highlightRadius?: number;
    highlightColor?: string;
  }>;
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

  // 危险区域颜色配置
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

        {/* 真实危险区域 */}
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

        {/* 默认危险区域（向后兼容） */}
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
              {/* Popup 显示详细信息 */}
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

        {/* 自定义定位点标记 */}
        {locationMarkers.map(marker => {
          const displayLat = marker.offsetLat ?? marker.lat;
          const displayLng = marker.offsetLng ?? marker.lng;
          return (
            <div key={marker.id}>
              {/* 高亮锚定圆圈（第四步） */}
              {marker.highlightRadius && (
                <Circle
                  center={[displayLat, displayLng]}
                  radius={marker.highlightRadius}
                  pathOptions={{
                    color: marker.highlightColor || '#38bdf8',
                    fillColor: marker.highlightColor || '#38bdf8',
                    fillOpacity: 0.1,
                    weight: 2,
                    opacity: 0.4,
                    dashArray: '6,4',
                  }}
                />
              )}
              {/* 标记点（第三步） */}
              <Marker
                position={[displayLat, displayLng]}
                zIndexOffset={marker.zIndex || 1000}
                icon={new L.DivIcon({
                  html: `<div style="
                    display:flex;align-items:center;justify-content:center;
                    width:32px;height:32px;
                    background:linear-gradient(135deg, #38bdf8, #818cf8);
                    border-radius:50%;
                    box-shadow:0 0 12px rgba(56,189,248,0.6);
                    border:2px solid white;
                    animation:marker-pulse 2s infinite;
                  ">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style="
                    position:absolute;top:100%;left:50%;transform:translateX(-50%);
                    margin-top:4px;padding:2px 8px;
                    background:rgba(15,23,42,0.9);
                    border:1px solid #38bdf8;
                    border-radius:4px;
                    color:#e2e8f0;
                    font-size:11px;
                    font-weight:600;
                    white-space:nowrap;
                    text-shadow:0 1px 3px rgba(0,0,0,0.8);
                  ">${marker.label}</div>
                  <style>@keyframes marker-pulse{0%,100%{box-shadow:0 0 12px rgba(56,189,248,0.6)}50%{box-shadow:0 0 24px rgba(56,189,248,0.9)}}</style>`,
                  className: '',
                  iconSize: [32, 48],
                  iconAnchor: [16, 16],
                })}
              >
                <Tooltip permanent direction="top" offset={[0, -16]}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 11,
                    color: '#38bdf8',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                  }}>
                    📍 {marker.label}
                  </span>
                </Tooltip>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      <div style={{
        position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 8,
        fontSize: 10, fontFamily: 'monospace', opacity: 0.25, color: '#22d3ee',
        pointerEvents: 'none', zIndex: 1000,
      }}>
        <span>REAL MAP v2</span>
        <span>·</span>
        <span>Leaflet + CartoDB</span>
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
      `}</style>
    </div>
  );
});

export default MapView;
