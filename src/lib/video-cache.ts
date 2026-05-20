import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join('E:', '社院课程stt', 'video_cache');
const MAX_CACHE_SIZE = 20 * 1024 * 1024 * 1024;
const META_FILE = path.join(CACHE_DIR, 'cache_meta.json');

interface CacheEntry {
  size: number;
  lastAccess: number;
}

let initialized = false;
const cacheMeta = new Map<string, CacheEntry>();
let evictionInProgress = false;

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadMeta(): void {
  try {
    if (fs.existsSync(META_FILE)) {
      const data = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
      for (const [key, value] of Object.entries(data)) {
        cacheMeta.set(key, value as CacheEntry);
      }
    }
  } catch {
    // 元数据损坏，重新扫描
    cacheMeta.clear();
  }
}

function saveMetaSync(): void {
  try {
    ensureCacheDir();
    const obj: Record<string, CacheEntry> = {};
    for (const [key, value] of cacheMeta.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(META_FILE, JSON.stringify(obj), 'utf-8');
  } catch {
    // 保存失败不影响缓存功能
  }
}

function saveMetaAsync(): void {
  setImmediate(() => saveMetaSync());
}

function getTotalCacheSize(): number {
  let total = 0;
  for (const entry of cacheMeta.values()) {
    total += entry.size;
  }
  return total;
}

function evictLRU(neededSpace: number): void {
  if (evictionInProgress) return;
  evictionInProgress = true;

  try {
    const entries = Array.from(cacheMeta.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    let freed = 0;
    for (const [code, entry] of entries) {
      if (getTotalCacheSize() - freed + neededSpace <= MAX_CACHE_SIZE) {
        break;
      }

      const cachePath = path.join(CACHE_DIR, `${code}.mp4`);
      try {
        if (fs.existsSync(cachePath)) {
          fs.unlinkSync(cachePath);
        }
        freed += entry.size;
        cacheMeta.delete(code);
        console.log(`[视频缓存] LRU淘汰: ${code} (${(entry.size / 1024 / 1024).toFixed(1)}MB)`);
      } catch {
        cacheMeta.delete(code);
      }
    }

    if (freed > 0) {
      saveMetaAsync();
    }
  } finally {
    evictionInProgress = false;
  }
}

export function initVideoCache(): void {
  if (initialized) return;

  ensureCacheDir();
  loadMeta();

  // 清理元数据中不存在的文件
  let cleaned = false;
  for (const [code] of cacheMeta.entries()) {
    const cachePath = path.join(CACHE_DIR, `${code}.mp4`);
    if (!fs.existsSync(cachePath)) {
      cacheMeta.delete(code);
      cleaned = true;
    }
  }

  // 扫描缓存目录中未被元数据记录的文件
  try {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      if (!file.endsWith('.mp4')) continue;
      const code = file.replace('.mp4', '');
      if (!cacheMeta.has(code)) {
        const cachePath = path.join(CACHE_DIR, file);
        try {
          const stat = fs.statSync(cachePath);
          cacheMeta.set(code, {
            size: stat.size,
            lastAccess: stat.mtimeMs,
          });
          cleaned = true;
        } catch {
          // 跳过无法读取的文件
        }
      }
    }
  } catch {
    // 扫描失败不影响
  }

  if (cleaned) {
    saveMetaAsync();
  }

  const totalMB = getTotalCacheSize() / (1024 * 1024);
  console.log(`[视频缓存] 初始化完成: ${cacheMeta.size} 个文件, ${totalMB.toFixed(0)}MB / ${(MAX_CACHE_SIZE / 1024 / 1024).toFixed(0)}MB`);

  initialized = true;
}

export function getCachePath(courseCode: string): string | null {
  initVideoCache();

  const cachePath = path.join(CACHE_DIR, `${courseCode}.mp4`);
  if (fs.existsSync(cachePath)) {
    const now = Date.now();
    const entry = cacheMeta.get(courseCode);
    if (entry) {
      entry.lastAccess = now;
    } else {
      try {
        const stat = fs.statSync(cachePath);
        cacheMeta.set(courseCode, {
          size: stat.size,
          lastAccess: now,
        });
      } catch {
        return null;
      }
    }

    // 更新时间戳（降级到可读模式，每60秒写一次）
    if (now - lastMetaSave > 60000) {
      lastMetaSave = now;
      saveMetaAsync();
    }
    return cachePath;
  }

  // 文件被意外删除，清理元数据
  cacheMeta.delete(courseCode);
  return null;
}

let lastMetaSave = 0;

export function cacheVideo(courseCode: string, nasPath: string): void {
  initVideoCache();

  const cachePath = path.join(CACHE_DIR, `${courseCode}.mp4`);

  // 如果已在缓存中，只更新时间
  if (fs.existsSync(cachePath)) {
    const entry = cacheMeta.get(courseCode);
    if (entry) {
      entry.lastAccess = Date.now();
    }
    return;
  }

  // 后台异步拷贝
  setImmediate(() => {
    try {
      const nasStat = fs.statSync(nasPath);
      const fileSize = nasStat.size;

      // 先淘汰旧文件腾空间
      evictLRU(fileSize);

      // 拷贝文件
      ensureCacheDir();
      const tmpPath = cachePath + '.tmp';
      fs.copyFileSync(nasPath, tmpPath);
      fs.renameSync(tmpPath, cachePath);

      cacheMeta.set(courseCode, {
        size: fileSize,
        lastAccess: Date.now(),
      });

      saveMetaAsync();
      console.log(`[视频缓存] 已缓存: ${courseCode} (${(fileSize / 1024 / 1024).toFixed(1)}MB)`);
    } catch (err) {
      console.error(`[视频缓存] 拷贝失败 ${courseCode}:`, err);
      // 清理临时文件
      const tmpPath = cachePath + '.tmp';
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {
        // 忽略
      }
    }
  });
}

export function getCacheStats(): { count: number; totalSize: number; maxSize: number } {
  initVideoCache();
  return {
    count: cacheMeta.size,
    totalSize: getTotalCacheSize(),
    maxSize: MAX_CACHE_SIZE,
  };
}
