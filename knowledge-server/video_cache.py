import os
import json
import shutil
import threading
import time
from pathlib import Path
from typing import Optional

CACHE_DIR = Path(r"E:\社院课程stt\video_cache")
MAX_CACHE_SIZE = 20 * 1024 * 1024 * 1024
META_FILE = CACHE_DIR / "cache_meta.json"

_cache_meta: dict[str, dict] = {}
_lock = threading.Lock()
_initialized = False
_eviction_in_progress = False
_last_meta_save = 0


def _ensure_cache_dir():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _load_meta():
    global _cache_meta
    try:
        if META_FILE.exists():
            with open(META_FILE, "r", encoding="utf-8") as f:
                _cache_meta = json.load(f)
    except Exception:
        _cache_meta = {}


def _save_meta():
    try:
        _ensure_cache_dir()
        with open(META_FILE, "w", encoding="utf-8") as f:
            json.dump(_cache_meta, f, ensure_ascii=False)
    except Exception:
        pass


def _get_total_size() -> int:
    return sum(entry.get("size", 0) for entry in _cache_meta.values())


def _evict_lru(needed_space: int):
    global _eviction_in_progress
    if _eviction_in_progress:
        return
    _eviction_in_progress = True

    try:
        entries = sorted(
            _cache_meta.items(),
            key=lambda x: x[1].get("lastAccess", 0),
        )

        freed = 0
        for code, entry in entries:
            if _get_total_size() - freed + needed_space <= MAX_CACHE_SIZE:
                break

            cache_path = CACHE_DIR / f"{code}.mp4"
            try:
                if cache_path.exists():
                    cache_path.unlink()
                freed += entry.get("size", 0)
                del _cache_meta[code]
                size_mb = entry.get("size", 0) / (1024 * 1024)
                print(f"[视频缓存] LRU淘汰: {code} ({size_mb:.1f}MB)")
            except Exception:
                if code in _cache_meta:
                    del _cache_meta[code]

        if freed > 0:
            _save_meta()
    finally:
        _eviction_in_progress = False


def init_video_cache():
    global _initialized
    if _initialized:
        return

    with _lock:
        if _initialized:
            return

        _ensure_cache_dir()
        _load_meta()

        cleaned = False

        for code in list(_cache_meta.keys()):
            cache_path = CACHE_DIR / f"{code}.mp4"
            if not cache_path.exists():
                del _cache_meta[code]
                cleaned = True

        try:
            for f in CACHE_DIR.iterdir():
                if not f.name.endswith(".mp4"):
                    continue
                code = f.name.replace(".mp4", "")
                if code not in _cache_meta:
                    stat = f.stat()
                    _cache_meta[code] = {
                        "size": stat.st_size,
                        "lastAccess": stat.st_mtime * 1000,
                    }
                    cleaned = True
        except Exception:
            pass

        if cleaned:
            _save_meta()

        total_mb = _get_total_size() / (1024 * 1024)
        max_mb = MAX_CACHE_SIZE / (1024 * 1024)
        print(f"[视频缓存] 初始化完成: {len(_cache_meta)} 个文件, {total_mb:.0f}MB / {max_mb:.0f}MB")

        _initialized = True


def get_cache_path(course_code: str) -> Optional[str]:
    global _last_meta_save
    init_video_cache()

    cache_path = CACHE_DIR / f"{course_code}.mp4"

    with _lock:
        if cache_path.exists():
            now = time.time() * 1000
            if course_code in _cache_meta:
                _cache_meta[course_code]["lastAccess"] = now
            else:
                try:
                    stat = cache_path.stat()
                    _cache_meta[course_code] = {
                        "size": stat.st_size,
                        "lastAccess": now,
                    }
                except Exception:
                    return None

            if now - _last_meta_save > 60000:
                _last_meta_save = now
                _save_meta()

            return str(cache_path)

        if course_code in _cache_meta:
            del _cache_meta[course_code]

    return None


def cache_video(course_code: str, nas_path: str):
    init_video_cache()

    cache_path = CACHE_DIR / f"{course_code}.mp4"

    with _lock:
        if cache_path.exists():
            if course_code in _cache_meta:
                _cache_meta[course_code]["lastAccess"] = time.time() * 1000
            return

    def _copy():
        try:
            nas = Path(nas_path)
            file_size = nas.stat().st_size

            with _lock:
                _evict_lru(file_size)

            _ensure_cache_dir()
            tmp_path = CACHE_DIR / f"{course_code}.mp4.tmp"
            shutil.copy2(str(nas), str(tmp_path))
            tmp_path.replace(cache_path)

            with _lock:
                _cache_meta[course_code] = {
                    "size": file_size,
                    "lastAccess": time.time() * 1000,
                }
                _save_meta()

            print(f"[视频缓存] 已缓存: {course_code} ({file_size / (1024 * 1024):.1f}MB)")
        except Exception as e:
            print(f"[视频缓存] 拷贝失败 {course_code}: {e}")
            tmp_path = CACHE_DIR / f"{course_code}.mp4.tmp"
            try:
                if tmp_path.exists():
                    tmp_path.unlink()
            except Exception:
                pass

    threading.Thread(target=_copy, daemon=True).start()


def get_cache_stats() -> dict:
    init_video_cache()
    with _lock:
        return {
            "count": len(_cache_meta),
            "totalSize": _get_total_size(),
            "maxSize": MAX_CACHE_SIZE,
        }
