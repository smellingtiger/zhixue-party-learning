/**
 * 地图镜头与标记绝对视觉协议（Camera & Marker Protocol）
 * 
 * 核心原则：原子化操作
 * 所有地图视角切换必须通过 focusOnTarget 函数，严禁在业务代码中直接调用 setZoom/panTo/addMarker。
 */

export type MarkerEffectType = 'danger_pulse' | 'breathing_glow' | 'floating_bounce' | 'none';

export interface TargetData {
  coordinates: [number, number];     // [lat, lng] 绝对经纬度
  zoomLevel: number;                 // 强制缩放层级
  labelName: string;                 // 标记点显示文字名称
  markerColor?: string;              // 标记颜色（默认蓝色渐变）
  highlightRadius?: number;          // 高亮锚定半径（米），0表示不绘制
  highlightColor?: string;           // 高亮颜色（默认蓝色）
  effectType?: MarkerEffectType;     // 标记特效类型
  emotion?: string;                  // 情绪标签
  highlightMessage?: string;         // 高亮消息内容
}

// ==================== 缩放层级绝对标准 ====================
export const ZOOM_LEVELS = {
  GLOBAL_OVERVIEW: 11,    // 全域概览：序章或展示全武汉三镇格局
  DISTRICT_VIEW: 14,      // 片区态势：跨区调度，看清主要干道
  STREET_DETAIL: 16,      // 街道特写（默认标准）：看清街道名称、建筑物轮廓
  MICRO_POINT: 18,        // 微观定点：具体到小区门口、涵洞积水点特写
} as const;

// 强制最小缩放级别，防止镜头拉太远
export const MIN_ZOOM_LEVEL = 14;

/**
 * 修正缩放级别：确保不低于最小标准
 * 
 * 规则：
 * - zoom 9-10.5：过于宏观，调整为全域概览级 11
 * - zoom 11-13：调整为片区态势级 14
 * - zoom 14+：保持原值
 * - undefined/null：使用默认街道级 16
 */
export function normalizeZoomLevel(zoom?: number, defaultZoom: number = ZOOM_LEVELS.STREET_DETAIL): number {
  if (zoom === undefined || zoom === null) return defaultZoom;
  
  // zoom 9-10.5 过于宏观，提升到全域概览
  if (zoom <= 10.5) return ZOOM_LEVELS.GLOBAL_OVERVIEW;
  
  // zoom 11-13 提升到片区态势
  if (zoom < ZOOM_LEVELS.DISTRICT_VIEW) return ZOOM_LEVELS.DISTRICT_VIEW;
  
  // 其他保持原值
  return zoom;
}

/**
 * 从 ScenarioEvent 的 location 字段转换为 TargetData
 */
export function locationToTargetData(
  lat: number,
  lng: number,
  label: string,
  zoom?: number
): TargetData {
  return {
    coordinates: [lat, lng],
    zoomLevel: normalizeZoomLevel(zoom),
    labelName: label,
  };
}

/**
 * 定位点标记数据结构（用于传递给 MapView）
 */
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

/**
 * 定位点管理器：管理当前地图上的所有标记
 * 遵循"清理旧战场"原则 — 每次 focusOnTarget 时先清理旧标记，只保留当前焦点
 */
export class LocationMarkerManager {
  private markers: LocationMarkerData[] = [];
  private counter = 0;
  private positionCounts = new Map<string, number>();
  private readonly offsetRadius = 0.002; // 约200米偏移

  /**
   * 聚焦到目标位置（原子化操作）
   * 
   * 执行流水线：
   * 1. 清理旧战场 — 移除所有旧标记
   * 2. 计算偏移 — 处理重叠位置
   * 3. 创建新标记 — 带标签和 z-index
   * 4. 返回更新后的标记列表 + 镜头参数
   */
  focusOnTarget(target: TargetData): {
    markers: LocationMarkerData[];
    center: { lat: number; lng: number };
    zoom: number;
  } {
    const [lat, lng] = target.coordinates;

    // 第一步：清理旧战场
    this.markers = [];
    this.positionCounts.clear();

    // 第二步：计算偏移（处理重叠位置）
    const positionKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const currentCount = this.positionCounts.get(positionKey) || 0;
    this.positionCounts.set(positionKey, currentCount + 1);

    const angle = (currentCount * Math.PI * 2) / Math.max(currentCount + 1, 4);
    const offsetLat = lat + Math.cos(angle) * this.offsetRadius;
    const offsetLng = lng + Math.sin(angle) * this.offsetRadius;

    // 第三步：创建新标记
    const newMarker: LocationMarkerData = {
      id: `marker-${this.counter++}`,
      lat,
      lng,
      label: target.labelName,
      zoom: target.zoomLevel,
      offsetLat: currentCount > 0 ? offsetLat : lat,
      offsetLng: currentCount > 0 ? offsetLng : lng,
      zIndex: 1000 + this.counter,
      highlightRadius: target.highlightRadius,
      highlightColor: target.highlightColor,
      highlightMessage: target.highlightMessage,
      effectType: target.effectType,
      emotion: target.emotion,
    };

    this.markers = [newMarker];

    // 第四步：返回结果
    return {
      markers: [...this.markers],
      center: { lat, lng },
      zoom: target.zoomLevel,
    };
  }

  /**
   * 批量聚焦（用于需要在地图上同时显示多个标记的场景）
   */
  focusOnMultipleTargets(targets: TargetData[]): {
    markers: LocationMarkerData[];
    center: { lat: number; lng: number };
    zoom: number;
  } {
    // 清理旧标记
    this.markers = [];
    this.positionCounts.clear();

    // 创建所有标记
    targets.forEach((target, index) => {
      const [lat, lng] = target.coordinates;
      const positionKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      const currentCount = this.positionCounts.get(positionKey) || 0;
      this.positionCounts.set(positionKey, currentCount + 1);

      const angle = (currentCount * Math.PI * 2) / Math.max(currentCount + 1, 4);
      const offsetLat = lat + Math.cos(angle) * this.offsetRadius;
      const offsetLng = lng + Math.sin(angle) * this.offsetRadius;

      this.markers.push({
        id: `marker-${this.counter++}`,
        lat,
        lng,
        label: target.labelName,
        zoom: target.zoomLevel,
        offsetLat: currentCount > 0 ? offsetLat : lat,
        offsetLng: currentCount > 0 ? offsetLng : lng,
        zIndex: 1000 + this.counter + index,
        highlightRadius: target.highlightRadius,
        highlightColor: target.highlightColor,
        highlightMessage: target.highlightMessage,
        effectType: target.effectType,
        emotion: target.emotion,
      });
    });

    // 计算中心点（所有标记的平均位置）
    const avgLat = targets.reduce((s, t) => s + t.coordinates[0], 0) / targets.length;
    const avgLng = targets.reduce((s, t) => s + t.coordinates[1], 0) / targets.length;
    const minZoom = Math.min(...targets.map(t => t.zoomLevel));

    return {
      markers: [...this.markers],
      center: { lat: avgLat, lng: avgLng },
      zoom: minZoom,
    };
  }

  /**
   * 清除所有标记
   */
  clearAll(): LocationMarkerData[] {
    this.markers = [];
    this.positionCounts.clear();
    return [];
  }

  /**
   * 获取当前标记列表
   */
  getMarkers(): LocationMarkerData[] {
    return [...this.markers];
  }
}
