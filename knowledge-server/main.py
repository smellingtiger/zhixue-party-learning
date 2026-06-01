"""
知识库文件服务器 - 局域网知识库文件浏览服务
扫描 E:\社院课程stt院stt\knowledge_base_txt 目录下的565门课程文本，提供友好的 Web 访问界面
"""

import os
import re
import json
import uuid
import mimetypes
import requests as sync_requests
from pathlib import Path
from typing import Optional
from datetime import datetime


def clean_course_title(title: str) -> str:
    """清洗课程名称：删除开头所有数字、序号、符号，确保第一个字是中文汉字"""
    if not title:
        return title
    # 步骤1: 删除开头的数字、序号模式 (如 "01 ", "1. ", "第1章 ", "(1) ", "① ")
    # 匹配开头的: 纯数字+空格/点/横线、第X章/节/讲、括号数字、圆圈数字等
    patterns = [
        r'^\d+[\.\、\-\s]+',           # "01 ", "1. ", "1、", "1-"
        r'^第[一二三四五六七八九十\d]+[章节讲篇]\s*[\.\、\-\s]*',  # "第一章 ", "第1讲"
            r'^[(（][一二三四五六七八九十\d]+[)）]\s*',  # "(1) ", "（一）"
        r'^[①②③④⑤⑥⑦⑧⑨⑩]\s*',       # 圆圈数字
        r'^[\(\)（）【】\[\]、\.\-]\s*',  # 开头孤立括号、顿号、点、横线
    ]
    cleaned = title
    for _ in range(5):  # 循环多次确保嵌套序号也被清除
        for p in patterns:
            cleaned = re.sub(p, '', cleaned)
        cleaned = cleaned.strip()
    # 步骤2: 如果开头还有非中文字符（英文、数字、符号），继续删除
    # 找到第一个中文字符的位置
    match = re.search(r'[\u4e00-\u9fff]', cleaned)
    if match:
        first_chinese_pos = match.start()
        if first_chinese_pos > 0:
            # 删除第一个汉字之前的所有内容
            cleaned = cleaned[first_chinese_pos:]
    return cleaned.strip()

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
import uvicorn

import video_cache

KNOWLEDGE_BASE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
EMERGENCY_KNOWLEDGE_BASE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt_emergency")
PROCESSED_DIR = Path(r"E:\社院课程stt\knowledge_base_processed")
TITLES_DIR = Path(r"E:\社院课程stt\knowledge_base_titles")
CLASSIFICATION_FILE = Path(r"E:\社院课程stt\classification_result.json")
COURSE_NAME_MAPPING_FILE = Path(r"d:\TraeProject\zhixue-party-learning\knowledge-server\course_name_mapping.json")
NAS_MAPPING_FILE = Path(r"d:\TraeProject\zhixue-party-learning\knowledge-server\course_nas_mapping.json")
EMERGENCY_VIDEO_MAPPING_FILE = Path(r"d:\TraeProject\zhixue-party-learning\knowledge-server\course_emergency_video_mapping.json")
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8080
SERVER_TITLE = "智学知识库"

# 知识库配置
KNOWLEDGE_BASES = {
    "party": {"name": "党政", "dir": KNOWLEDGE_BASE_DIR, "icon": "🏛️", "color": "#dc2626"},
    "emergency": {"name": "安全应急", "dir": EMERGENCY_KNOWLEDGE_BASE_DIR, "icon": "🚨", "color": "#2563eb"},
}

# 加载新的分类数据
_new_categories_cache = None
def load_new_categories():
    global _new_categories_cache
    if _new_categories_cache is None:
        if CLASSIFICATION_FILE.exists():
            try:
                data = json.loads(CLASSIFICATION_FILE.read_text(encoding="utf-8"))
                _new_categories_cache = {u["file"]: u["new_category"] for u in data.get("updates", [])}
            except:
                _new_categories_cache = {}
        else:
            _new_categories_cache = {}
    return _new_categories_cache

# 加载课程名称映射
_course_name_mapping_cache = None
def load_course_name_mapping():
    global _course_name_mapping_cache
    if _course_name_mapping_cache is None:
        if COURSE_NAME_MAPPING_FILE.exists():
            try:
                _course_name_mapping_cache = json.loads(COURSE_NAME_MAPPING_FILE.read_text(encoding="utf-8"))
            except:
                _course_name_mapping_cache = {}
        else:
            _course_name_mapping_cache = {}
    return _course_name_mapping_cache

# 加载NAS视频映射
_nas_mapping_cache = None
def load_nas_mapping():
    global _nas_mapping_cache
    if _nas_mapping_cache is None:
        if NAS_MAPPING_FILE.exists():
            try:
                data = json.loads(NAS_MAPPING_FILE.read_text(encoding="utf-8"))
                # 按course_code建立索引
                _nas_mapping_cache = {}
                for item in data.get("matched", []):
                    _nas_mapping_cache[item["course_code"]] = item
                print(f"已加载 {len(_nas_mapping_cache)} 个课程的NAS视频映射")
            except:
                _nas_mapping_cache = {}
        else:
            _nas_mapping_cache = {}
    return _nas_mapping_cache

# 加载应急课程远程视频映射
_emergency_video_cache = None
def load_emergency_video_mapping():
    global _emergency_video_cache
    if _emergency_video_cache is None:
        if EMERGENCY_VIDEO_MAPPING_FILE.exists():
            try:
                data = json.loads(EMERGENCY_VIDEO_MAPPING_FILE.read_text(encoding="utf-8"))
                _emergency_video_cache = {}
                for item in data.get("matched", []):
                    _emergency_video_cache[item["course_code"]] = item
                print(f"已加载 {len(_emergency_video_cache)} 个课程的远程视频URL")
            except:
                _emergency_video_cache = {}
        else:
            _emergency_video_cache = {}
    return _emergency_video_cache

app = FastAPI(title=SERVER_TITLE, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CourseDoc:
    def __init__(self, filepath: Path, knowledge_base: str = "party"):
        self.filepath = filepath
        self.filename = filepath.name
        self.id = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(filepath)))
        self._parsed = None
        self._processed = None
        self._raw_code = None
        self.knowledge_base = knowledge_base

    def get_course_code(self) -> str:
        if self._raw_code is not None:
            return self._raw_code
        try:
            text = self.filepath.read_text(encoding="utf-8")
            for line in text.split("\n")[:6]:
                m = re.search(r"【课程名称】(.+)", line)
                if m:
                    self._raw_code = m.group(1).strip()
                    return self._raw_code
        except Exception:
            pass
        self._raw_code = self.filepath.stem
        return self._raw_code

    def _load_processed(self) -> Optional[dict]:
        """尝试加载已处理的JSON文件（包含清洗+分段+标题）"""
        if self._processed is not None:
            return self._processed

        json_file = PROCESSED_DIR / f"{self.filepath.stem}.json"
        if json_file.exists():
            try:
                data = json.loads(json_file.read_text(encoding="utf-8"))
                segs = []
                for seg in data.get("segments", []):
                    segs.append({
                        "title": seg.get("title", ""),
                        "time": seg.get("time_start", ""),
                        "time_end": seg.get("time_end", ""),
                        "content": seg.get("content", "")
                    })
                self._processed = {
                    "title": data.get("title", self.filepath.stem),
                    "category": data.get("category", "未分类"),
                    "paragraph_count": data.get("segment_count", len(segs)),
                    "segments": segs,
                }
                return self._processed
            except Exception:
                pass

        # 备选：从旧的titles目录加载标题
        old_json = TITLES_DIR / f"{self.filepath.stem}.json"
        if old_json.exists():
            try:
                data = json.loads(old_json.read_text(encoding="utf-8"))
                titles = [seg.get("title", seg.get("original_title", "")) for seg in data.get("segments", [])]
                self._processed = {"_titles_only": True, "titles": titles}
                return self._processed
            except Exception:
                pass

        self._processed = None
        return None

    def _parse(self):
        if self._parsed:
            return self._parsed

        # 优先使用处理后的数据
        processed = self._load_processed()
        if processed and not processed.get("_titles_only"):
            self._parsed = processed
            # 即使使用处理后的数据,也要应用新分类和名称
            new_cats = load_new_categories()
            if self.filename in new_cats:
                self._parsed["category"] = new_cats[self.filename]
            
            # 应用课程名称映射(将编码替换为中文名称)
            name_mapping = load_course_name_mapping()
            current_title = self._parsed.get("title", "")
            if current_title and current_title in name_mapping:
                self._parsed["title"] = name_mapping[current_title]
            
            # 清洗标题：删除数字前缀，确保第一个字是中文
            self._parsed["title"] = clean_course_title(self._parsed.get("title", ""))
            
            # 党政知识库：未分类归到国家治理
            if self.knowledge_base == "party" and self._parsed.get("category") in ("未分类", "未知"):
                self._parsed["category"] = "国家治理"
            
            # 安全应急知识库：未分类归到安全管理与法规 + 党政分类映射
            if self.knowledge_base == "emergency":
                cat = self._parsed.get("category", "")
                if cat in ("未分类", "未知"):
                    self._parsed["category"] = "安全管理与法规"
                # 将党政相关分类映射到应急分类 + 合并小类别
                PARTY_TO_EMERGENCY_MAP = {
                    "政治理论": "安全管理与法规",
                    "业务能力": "安全管理与法规",
                    "廉政建设": "安全管理与法规",
                    "国际视野": "综合安全",
                    "国家治理": "安全管理与法规",
                    "党建实务": "安全管理与法规",
                    # 合并个位数小类别到大类
                    "焊接与热切割": "综合安全",
                    "起重伤害": "建筑施工安全",
                    "物体打击": "建筑施工安全",
                }
                if cat in PARTY_TO_EMERGENCY_MAP:
                    self._parsed["category"] = PARTY_TO_EMERGENCY_MAP[cat]
            
            return self._parsed

        # 从原始txt解析
        try:
            text = self.filepath.read_text(encoding="utf-8")
        except Exception:
            fallback_cat = "国家治理" if self.knowledge_base == "party" else "未分类"
            self._parsed = {"title": self.filename, "category": fallback_cat, "paragraph_count": 0, "segments": []}
            return self._parsed

        lines = text.split("\n")
        title = ""
        category = ""
        sub_category = ""
        para_count = 0

        for line in lines[:6]:
            m = re.search(r"【课程名称】(.+)", line)
            if m:
                title = m.group(1).strip()
            m = re.search(r"【课程分类】(.+)", line)
            if m:
                category = m.group(1).strip()
            m = re.search(r"【课程子类】(.+)", line)
            if m:
                sub_category = m.group(1).strip()
            m = re.search(r"【段落数量】(.+)", line)
            if m:
                try:
                    para_count = int(m.group(1).strip())
                except ValueError:
                    pass

        seg_start = 0
        for i, line in enumerate(lines):
            if line.strip().startswith("=" * 10):
                seg_start = i + 1
                break

        segments = []
        current_title = ""
        current_time = ""
        current_content = []

        for line in lines[seg_start:]:
            m_bg = re.match(r"【背景[：:]\s*(.+?)[】]", line)
            m_ti = re.match(r"【要求[：:]\s*(.+?)[】]", line)
            m_general = re.match(r"【(.+?)】", line)
            m_tm = re.match(r"\[时间\]\s*([\d:]+)", line)
            m_div = re.match(r"^={10,}", line)

            if m_bg or m_ti:
                if current_title and current_content:
                    segments.append({
                        "title": current_title,
                        "time": current_time,
                        "content": "".join(current_content).strip()
                    })
                current_title = (m_bg or m_ti).group(1).strip()
                current_time = ""
                current_content = []
            elif m_general and not m_tm:
                if current_title and current_content:
                    segments.append({
                        "title": current_title,
                        "time": current_time,
                        "content": "".join(current_content).strip()
                    })
                current_title = m_general.group(1).strip()
                current_time = ""
                current_content = []
            elif m_tm:
                current_time = m_tm.group(1).strip()
            elif m_div:
                if current_title and current_content:
                    segments.append({
                        "title": current_title,
                        "time": current_time,
                        "content": "".join(current_content).strip()
                    })
                current_title = ""
                current_time = ""
                current_content = []
            elif current_title:
                stripped = line.strip()
                if stripped:
                    current_content.append(stripped)

        if current_title and current_content:
            segments.append({
                "title": current_title,
                "time": current_time,
                "content": "".join(current_content).strip()
            })

        # 应用旧的标题JSON（仅标题替换）
        if processed and processed.get("_titles_only"):
            titles = processed.get("titles", [])
            for i, seg in enumerate(segments):
                if i < len(titles) and titles[i]:
                    seg["title"] = titles[i]

        self._parsed = {
            "title": title or self.filename.replace(".txt", ""),
            "category": sub_category or category or "未分类",
            "paragraph_count": para_count or len(segments),
            "segments": segments,
        }
        
        # 应用新的分类数据(覆盖旧分类)
        new_cats = load_new_categories()
        if self.filename in new_cats:
            self._parsed["category"] = new_cats[self.filename]
        
        # 应用课程名称映射(将编码替换为中文名称)
        name_mapping = load_course_name_mapping()
        if title and title in name_mapping:
            self._parsed["title"] = name_mapping[title]
        
        # 清洗标题：删除数字前缀，确保第一个字是中文
        self._parsed["title"] = clean_course_title(self._parsed.get("title", ""))
        
        # 党政知识库：未分类归到国家治理
        if self.knowledge_base == "party" and self._parsed.get("category") in ("未分类", "未知"):
            self._parsed["category"] = "国家治理"
        
        # 安全应急知识库：未分类归到安全管理与法规
        if self.knowledge_base == "emergency" and self._parsed.get("category") in ("未分类", "未知"):
            self._parsed["category"] = "安全管理与法规"
        
        # 安全应急知识库：将党政相关分类映射到应急分类 + 合并小类别
        PARTY_TO_EMERGENCY_MAP = {
            "政治理论": "安全管理与法规",
            "业务能力": "安全管理与法规",
            "廉政建设": "安全管理与法规",
            "国际视野": "综合安全",
            "国家治理": "安全管理与法规",
            "党建实务": "安全管理与法规",
            # 合并个位数小类别到大类
            "焊接与热切割": "综合安全",
            "起重伤害": "建筑施工安全",
            "物体打击": "建筑施工安全",
        }
        if self.knowledge_base == "emergency":
            cat = self._parsed.get("category", "")
            if cat in PARTY_TO_EMERGENCY_MAP:
                self._parsed["category"] = PARTY_TO_EMERGENCY_MAP[cat]
        
        return self._parsed

    @property
    def title(self):
        return self._parse()["title"]

    @property
    def category(self):
        return self._parse()["category"]

    @property
    def paragraph_count(self):
        return self._parse()["paragraph_count"]

    @property
    def size(self):
        return self.filepath.stat().st_size

    @property
    def modified_time(self):
        return datetime.fromtimestamp(self.filepath.stat().st_mtime)

    def to_dict(self):
        course_code = self.get_course_code()
        nas_mapping = load_nas_mapping()
        emergency_map = load_emergency_video_mapping()
        has_video = course_code in nas_mapping or course_code in emergency_map
        
        return {
            "id": self.id,
            "filename": self.filename,
            "title": self.title,
            "category": self.category,
            "paragraph_count": self.paragraph_count,
            "size": self.size,
            "size_display": self._format_size(self.size),
            "modified_time": self.modified_time.strftime("%Y-%m-%d %H:%M"),
            "knowledge_base": self.knowledge_base,
            "has_video": has_video,
        }

    def to_detail(self):
        parsed = self._parse()
        return {**self.to_dict(), "segments": parsed["segments"]}

    def full_text(self) -> str:
        try:
            return self.filepath.read_text(encoding="utf-8")
        except Exception:
            return ""

    @staticmethod
    def _format_size(size: int) -> str:
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / 1024 / 1024:.1f} MB"


def is_code_name(title: str) -> bool:
    """判断是否为编码名称（非自然中文标题）"""
    if not title:
        return True
    # 纯数字+字母+下划线等组合，不含连续中文（>=2个连续汉字）
    if re.search(r'[\u4e00-\u9fff]{2,}', title):
        return False
    # 以字母+数字开头，不含中文
    if re.match(r'^[A-Z]+\d+', title):
        return True
    # 类似 GC02A0416065, A01, GC04160005 等
    return False


def get_raw_course_code(filepath: Path) -> str:
    """从TXT文件快速获取课程编码（不触发完整解析）"""
    try:
        text = filepath.read_text(encoding="utf-8")
        for line in text.split("\n")[:6]:
            m = re.search(r"【课程名称】(.+)", line)
            if m:
                return m.group(1).strip()
    except Exception:
        pass
    return filepath.stem


def should_filter_emergency_doc(filepath: Path) -> bool:
    """判断是否应该过滤掉应急课程（无中文名映射且无视频链接）"""
    course_code = get_raw_course_code(filepath)
    
    # 如果课程名包含至少2个连续汉字，说明是中文名称，不过滤
    if re.search(r'[\u4e00-\u9fff]{2,}', course_code):
        return False
    
    # 检查是否有中文名映射
    name_mapping = load_course_name_mapping()
    if course_code in name_mapping:
        return False
    
    # 检查是否有视频链接
    emergency_map = load_emergency_video_mapping()
    if course_code in emergency_map:
        return False
    
    # 无中文名映射且无视频链接，应该过滤
    return True


def scan_all_docs(knowledge_base: str = None) -> list[CourseDoc]:
    docs = []
    bases_to_scan = KNOWLEDGE_BASES if knowledge_base is None else {knowledge_base: KNOWLEDGE_BASES.get(knowledge_base, {"dir": None})}

    for kb_key, kb_info in bases_to_scan.items():
        kb_dir = kb_info.get("dir")
        if kb_dir is None or not kb_dir.exists():
            continue
        files = sorted(kb_dir.glob("*.txt"))
        for f in files:
            # 安全应急知识库：过滤无中文名无视频的课程
            if kb_key == "emergency" and should_filter_emergency_doc(f):
                continue
            docs.append(CourseDoc(f, knowledge_base=kb_key))

    return docs


def get_doc_by_id(doc_id: str) -> Optional[CourseDoc]:
    for d in scan_all_docs():
        if d.id == doc_id:
            return d
    return None


def get_categories(docs: list[CourseDoc]):
    cats = {}
    for d in docs:
        c = d.category
        cats[c] = cats.get(c, 0) + 1
    return sorted(cats.keys()), cats


@app.get("/api/files")
async def list_files(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    sort: str = Query("title"),
    knowledge_base: Optional[str] = Query(None),
):
    docs = scan_all_docs(knowledge_base)

    if category:
        docs = [d for d in docs if d.category == category]

    if q:
        q_lower = q.lower()
        docs = [d for d in docs if q_lower in d.title.lower()]

    if sort == "date":
        docs.sort(key=lambda d: d.modified_time, reverse=True)
    elif sort == "size":
        docs.sort(key=lambda d: d.size, reverse=True)
    else:
        docs.sort(key=lambda d: d.title)

    # 分类统计始终基于当前知识库的全部文档
    all_docs = scan_all_docs(knowledge_base)
    categories, category_counts = get_categories(all_docs)

    return {
        "files": [d.to_dict() for d in docs],
        "total": len(docs),
        "categories": categories,
        "category_counts": category_counts,
    }


@app.get("/api/search")
async def search_content(q: str = Query(..., min_length=1), knowledge_base: Optional[str] = Query(None)):
    docs = scan_all_docs(knowledge_base)
    q_lower = q.lower()
    search_results = []

    for doc in docs:
        try:
            text = doc.full_text()
            if q_lower not in text.lower():
                continue
            lines = text.split("\n")
            snippets = []
            for i, line in enumerate(lines):
                if q_lower in line.lower():
                    start = max(0, i - 1)
                    end = min(len(lines), i + 2)
                    context_parts = []
                    for j in range(start, end):
                        l = lines[j].strip()
                        if l:
                            l = re.sub(r"【.+?】", "", l)
                            l = re.sub(r"\[时间\].*", "", l)
                            context_parts.append(l.strip())
                    context = " ".join(context_parts)[:300]
                    snippets.append({
                        "line": i + 1,
                        "text": line.strip()[:200],
                        "context": context,
                    })
            if snippets:
                search_results.append({
                    **doc.to_dict(),
                    "snippets": snippets[:5],
                    "match_count": len(snippets),
                })
        except Exception:
            continue

    search_results.sort(key=lambda r: r["match_count"], reverse=True)

    return {
        "query": q,
        "results": search_results[:50],
        "total": len(search_results),
    }


@app.get("/api/files/{doc_id}")
async def get_doc_detail(doc_id: str):
    doc = get_doc_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc.to_detail()


@app.get("/api/files/{doc_id}/video")
async def get_doc_video(doc_id: str):
    doc = get_doc_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    
    course_code = doc.get_course_code()
    course_title = doc.title
    
    # 1. 检查NAS映射
    nas_mapping = load_nas_mapping()
    if course_code in nas_mapping:
        item = nas_mapping[course_code]
        return {
            "has_video": True,
            "course_code": course_code,
            "chinese_name": item["chinese_name"],
            "video_filename": item["video_filename"],
            "video_url": f"/api/video/{course_code}",
            "nas_path": item["nas_path"],
        }
    
    # 2. 检查应急课程远程视频映射（按编码或中文名查找）
    emergency_map = load_emergency_video_mapping()
    emergency_item = emergency_map.get(course_code)
    if not emergency_item:
        # 尝试用中文名反向查找
        for code, item in emergency_map.items():
            if item.get("chinese_name") == course_title:
                emergency_item = item
                break
    
    if emergency_item:
        return {
            "has_video": True,
            "course_code": emergency_item.get("course_code", course_code),
            "chinese_name": emergency_item.get("chinese_name", course_title),
            "video_url": f"/api/video/emergency/{emergency_item.get('course_code', course_code)}",
            "from_remote": True,
        }
    
    return {"has_video": False, "course_code": course_code}


@app.get("/api/video/{course_code}")
async def stream_video(course_code: str):
    """代理NAS视频流（优先使用本地缓存）"""
    nas_mapping = load_nas_mapping()
    if course_code not in nas_mapping:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    item = nas_mapping[course_code]
    nas_path = str(item["nas_path"])
    
    # 优先使用本地缓存
    cached_path = video_cache.get_cache_path(course_code)
    if cached_path:
        video_file = Path(cached_path)
    else:
        video_file = Path(nas_path)
        if not video_file.exists():
            raise HTTPException(status_code=404, detail="视频文件不存在")
        # 后台异步缓存
        video_cache.cache_video(course_code, nas_path)
    
    return FileResponse(
        str(video_file),
        media_type="video/mp4",
        filename=item["video_filename"],
        headers={"Accept-Ranges": "bytes"},
    )


@app.get("/api/video/emergency/{course_code}")
async def stream_emergency_video(course_code: str, request: Request):
    """代理远程应急课程视频（添加Referer绕过403）"""
    emergency_map = load_emergency_video_mapping()
    item = emergency_map.get(course_code)
    if not item:
        raise HTTPException(status_code=404, detail="视频不存在")

    remote_url = item.get("video_url", "")
    if not remote_url:
        raise HTTPException(status_code=404, detail="视频URL不存在")

    range_header = request.headers.get("range", "")

    headers = {
        "Referer": "https://aqsc.jystudy.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    if range_header:
        headers["Range"] = range_header

    try:
        r = sync_requests.get(remote_url, headers=headers, stream=True, timeout=30)

        if r.status_code in (200, 206):
            resp_headers = {
                "Content-Type": r.headers.get("Content-Type", "video/mp4"),
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600",
            }
            if "Content-Length" in r.headers:
                resp_headers["Content-Length"] = r.headers["Content-Length"]
            if "Content-Range" in r.headers:
                resp_headers["Content-Range"] = r.headers["Content-Range"]

            def generate():
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        yield chunk
                r.close()

            return StreamingResponse(
                generate(),
                status_code=r.status_code,
                headers=resp_headers,
                media_type=r.headers.get("Content-Type", "video/mp4"),
            )
        else:
            raise HTTPException(status_code=502, detail=f"远程服务器返回 {r.status_code}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"视频代理失败: {str(e)}")


@app.get("/api/video/{course_code}/info")
async def get_video_info(course_code: str):
    """获取视频信息（优先本地缓存）"""
    nas_mapping = load_nas_mapping()
    if course_code not in nas_mapping:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    item = nas_mapping[course_code]
    
    # 优先使用本地缓存
    cached_path = video_cache.get_cache_path(course_code)
    if cached_path:
        video_path = Path(cached_path)
    else:
        video_path = Path(item["nas_path"])
        if not video_path.exists():
            raise HTTPException(status_code=404, detail="视频文件不存在")
    
    file_size = video_path.stat().st_size
    content_type, _ = mimetypes.guess_type(str(video_path))
    
    return {
        "course_code": course_code,
        "chinese_name": item["chinese_name"],
        "video_filename": item["video_filename"],
        "file_size": file_size,
        "file_size_display": f"{file_size / 1024 / 1024:.1f} MB",
        "content_type": content_type or "video/mp4",
        "from_cache": cached_path is not None,
    }


@app.get("/api/info")
async def server_info(knowledge_base: Optional[str] = Query(None)):
    docs = scan_all_docs(knowledge_base)
    categories, category_counts = get_categories(docs)
    total_size = sum(d.size for d in docs)
    total_paragraphs = sum(d.paragraph_count for d in docs)

    category_paragraph_counts = {}
    for d in docs:
        c = d.category
        category_paragraph_counts[c] = category_paragraph_counts.get(c, 0) + d.paragraph_count

    processed_count = len(list(PROCESSED_DIR.glob("*.json"))) if PROCESSED_DIR.exists() else 0

    cache_stats = video_cache.get_cache_stats()

    # 统计各知识库的文件数
    kb_stats = {}
    for kb_key in KNOWLEDGE_BASES:
        kb_docs = scan_all_docs(kb_key)
        kb_stats[kb_key] = {"name": KNOWLEDGE_BASES[kb_key]["name"], "count": len(kb_docs)}

    return {
        "name": SERVER_TITLE,
        "version": "1.0.0",
        "total_files": len(docs),
        "total_size": total_size,
        "total_size_display": f"{total_size / 1024 / 1024:.1f} MB",
        "categories": categories,
        "category_counts": category_counts,
        "category_paragraph_counts": category_paragraph_counts,
        "total_paragraphs": total_paragraphs,
        "data_source": str(KNOWLEDGE_BASE_DIR),
        "processed_count": processed_count,
        "video_cache": cache_stats,
        "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "knowledge_bases": kb_stats,
    }


@app.get("/api/cache/stats")
async def cache_stats():
    """视频缓存状态"""
    return video_cache.get_cache_stats()


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>智学知识库</title>
<style>
:root{--primary:#dc2626;--primary-hover:#b91c1c;--primary-light:#fef2f2;--sidebar-width:340px;--header-height:64px;--bg:#f8fafc;--card-bg:#fff;--text:#1e293b;--text-muted:#64748b;--border:#e2e8f0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Serif SC',sans-serif;background:var(--bg);color:var(--text);height:100vh;overflow:hidden}
.header{height:var(--header-height);background:linear-gradient(135deg,#dc2626 0%,#ea580c 100%);display:flex;align-items:center;padding:0 24px;justify-content:space-between;box-shadow:0 2px 8px rgba(220,38,38,0.15);z-index:100;position:relative}
.header-left{display:flex;align-items:center;gap:12px}
.header-logo{width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700}
.header-title{color:#fff;font-size:20px;font-weight:700}
.header-subtitle{color:rgba(255,255,255,0.8);font-size:13px;margin-left:12px;padding-left:12px;border-left:1px solid rgba(255,255,255,0.3)}
.header-right{display:flex;align-items:center;gap:16px}
.search-box{display:flex;align-items:center;background:rgba(255,255,255,0.15);border-radius:8px;padding:0 12px;transition:.2s}
.search-box:focus-within{background:rgba(255,255,255,0.25)}
.search-box input{background:none;border:none;outline:none;color:#fff;padding:8px 10px;font-size:14px;width:200px}
.search-box input::placeholder{color:rgba(255,255,255,0.6)}
.kb-tabs{display:flex;gap:6px;margin-right:12px}
.kb-tab{padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:none;color:rgba(255,255,255,0.8);font-size:13px;cursor:pointer;transition:.15s;white-space:nowrap}
.kb-tab:hover{background:rgba(255,255,255,0.15)}
.kb-tab.active{background:rgba(255,255,255,0.2) !important;color:#fff !important;font-weight:600}
.server-info{color:rgba(255,255,255,0.7);font-size:12px;display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(0,0,0,0.1);border-radius:6px;flex-shrink:0}
.server-info .dot{width:6px;height:6px;background:#22c55e;border-radius:50%;display:inline-block}
.main-container{display:flex;height:calc(100vh - var(--header-height))}
.sidebar{width:260px;background:var(--card-bg);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden}
.sidebar-header{padding:16px 20px;border-bottom:1px solid var(--border);flex-shrink:0}
.sidebar-header h3{font-size:13px;font-weight:600;color:var(--text-muted);letter-spacing:.5px}
.category-list{padding:12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;flex:1;min-height:0}
.category-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:.15s;font-size:14px;color:var(--text);border:none;background:none;width:100%;text-align:left}
.category-item:hover{background:var(--primary-light)}
.category-item.active{background:var(--primary-light);color:var(--primary);font-weight:600}
.category-item .count{margin-left:auto;font-size:12px;color:var(--text-muted);background:var(--bg);padding:2px 8px;border-radius:10px}
.category-item.active .count{background:var(--primary);color:#fff}
.content-area{flex:1;display:flex;flex-direction:column;background:var(--card-bg);overflow:hidden}
.course-grid-header{padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.course-grid-header h2{font-size:18px;font-weight:600;color:var(--text)}
.course-grid-controls{display:flex;gap:8px;align-items:center}
.course-grid{flex:1;overflow-y:auto;padding:20px 24px}
.course-grid-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.course-grid-card{border:1px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;transition:.15s;background:var(--card-bg)}
.course-grid-card:hover{border-color:var(--primary);background:var(--primary-light);transform:translateY(-2px);box-shadow:0 4px 12px rgba(220,38,38,0.1)}
.course-grid-card.active{border-color:var(--primary);background:var(--primary-light)}
.course-grid-card-icon{width:48px;height:48px;border-radius:10px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px}
.course-grid-card.active .course-grid-card-icon{background:var(--primary);color:#fff}
.course-grid-card-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.course-grid-card-meta{display:flex;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--text-muted)}
.course-grid-card-badge{padding:2px 8px;border-radius:4px;background:var(--bg);color:var(--text-muted)}
.course-grid-empty{grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)}
.sort-btn{padding:6px 14px;border-radius:6px;border:1px solid var(--border);background:none;font-size:13px;color:var(--text-muted);cursor:pointer;transition:.15s}
.sort-btn:hover{border-color:var(--primary);color:var(--primary)}
.sort-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.content-header{padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.content-header h2{font-size:18px;font-weight:600;color:var(--text)}
.content-meta{display:flex;gap:12px;font-size:12px;color:var(--text-muted);flex-wrap:wrap}
.content-body{flex:1;overflow-y:auto;padding:24px 32px;max-width:960px;line-height:1.8}
.segment-card{border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:12px;transition:.15s}
.segment-card:hover{border-color:var(--primary);background:var(--primary-light)}
.segment-title{font-size:15px;font-weight:600;color:var(--primary);margin-bottom:6px}
.segment-time{font-size:12px;color:var(--text-muted);margin-bottom:8px}
.segment-content{font-size:14px;line-height:1.8;color:var(--text)}
.welcome-screen{flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;color:var(--text-muted);height:100%}
.welcome-icon{font-size:64px;opacity:.3}
.welcome-text{font-size:18px;font-weight:500}
.welcome-hint{font-size:14px}
.loading{display:flex;align-items:center;justify-content:center;padding:40px;color:var(--text-muted)}
.loading::after{content:'';width:24px;height:24px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite;margin-left:8px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-files{text-align:center;padding:60px 20px;color:var(--text-muted)}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:8px;font-size:14px;z-index:1000;opacity:0;transition:opacity .3s;pointer-events:none}
.toast.show{opacity:1}
#_scroll{position:fixed;bottom:80px;right:24px;width:40px;height:40px;border-radius:50%;background:var(--primary);color:#fff;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(220,38,38,0.3);display:none;align-items:center;justify-content:center;font-size:20px;z-index:50}
#_scroll.show{display:flex}
.para-stat{font-size:13px;color:var(--text-muted);background:var(--bg);padding:4px 10px;border-radius:6px;display:inline-block}
.video-container{margin-bottom:20px;border-radius:8px;overflow:hidden;background:#000}
.video-container video{width:100%;max-height:400px;display:block}
.video-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--primary);border-radius:8px;margin-bottom:16px;cursor:pointer;transition:.15s}
.video-bar:hover{background:var(--primary-hover)}
.video-bar-icon{font-size:18px}
.video-bar-text{color:#fff;font-size:14px;font-weight:500}
.video-bar-size{margin-left:auto;color:rgba(255,255,255,0.8);font-size:12px}
.video-toggle{display:flex;gap:6px;margin-bottom:12px}
.video-toggle button{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:none;font-size:12px;cursor:pointer;transition:.15s;color:var(--text-muted)}
.video-toggle button.active{background:var(--primary);color:#fff;border-color:var(--primary)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
@media(max-width:768px){.sidebar{width:100%;max-height:200px;border-right:none;border-bottom:1px solid var(--border)}.main-container{flex-direction:column}.search-box input{width:120px}.header-subtitle,.server-info{display:none}}
</style>
</head>
<body>

<header class="header">
  <div class="header-left">
    <div class="header-logo">知</div>
    <span class="header-title">知识库</span>
    <span class="header-subtitle" id="headerSubtitle">加载中...</span>
  </div>
  <div class="header-right">
    <div class="kb-tabs" id="kbTabs">
      <button class="kb-tab active" onclick="switchKB('party',this)" style="background:rgba(255,255,255,0.2);color:#fff">🏛️ 党政</button>
      <button class="kb-tab" onclick="switchKB('emergency',this)">🚨 安全应急</button>
    </div>
    <div class="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input type="text" id="searchInput" placeholder="搜索文件名..." onkeyup="handleSearch(event)">
    </div>
    <div class="server-info">
      <span class="dot"></span>
      <span id="serverAddr">加载中...</span>
    </div>
  </div>
</header>

<div class="main-container">
  <aside class="sidebar">
    <div class="sidebar-header"><h3>课程分类</h3></div>
    <div class="category-list" id="categoryList"></div>
  </aside>

  <main class="content-area">
    <div id="courseGridArea" style="display:none;flex-direction:column;height:100%">
      <div class="course-grid-header">
        <h2 id="courseGridTitle">全部课程</h2>
        <div class="course-grid-controls">
          <div class="sort-bar" id="sortBar">
            <button class="sort-btn active" onclick="changeSort('title')">按名称</button>
            <button class="sort-btn" onclick="changeSort('date')">按时间</button>
            <button class="sort-btn" onclick="changeSort('size')">按大小</button>
          </div>
        </div>
      </div>
      <div class="course-grid">
        <div class="course-grid-list" id="courseGridList"></div>
      </div>
    </div>
    <div id="courseDetailArea" style="display:none;flex-direction:column;height:100%">
      <div class="content-header">
        <h2 id="contentTitle">欢迎使用知识库</h2>
        <div class="content-meta" id="contentMeta"></div>
      </div>
      <div class="content-body" id="contentBody"></div>
    </div>
    <div id="welcomeArea" class="welcome-screen">
      <div class="welcome-icon">&#x1F4DA;</div>
      <div class="welcome-text" id="welcomeText">知识库加载中...</div>
      <div class="welcome-hint">从左侧选择一个分类开始浏览</div>
    </div>
  </main>
</div>

<button id="_scroll" onclick="scrollToTopFn()">&#8593;</button>
<div class="toast" id="toast"></div>

<script>
let curCat='', curSort='title', curSearch='', curId=null, allFiles=[], totalAll=0, curVideoMode='video', curKB='party';

function init(){
  document.getElementById('serverAddr').textContent=window.location.host;
  loadFiles();
  loadInfo();
  const cb=document.getElementById('contentBody');
  cb.addEventListener('scroll',function(){
    document.getElementById('_scroll').classList.toggle('show',cb.scrollTop>300);
  });
}
document.addEventListener('DOMContentLoaded',init);

function scrollToTopFn(){
  document.getElementById('contentBody').scrollTo({top:0,behavior:'smooth'});
}

async function loadFiles(){
  try{
    const p=new URLSearchParams();
    if(curCat) p.set('category',curCat);
    if(curSearch) p.set('q',curSearch);
    p.set('sort',curSort);
    p.set('knowledge_base',curKB);
    const r=await fetch('/api/files?'+p.toString());
    const d=await r.json();
    allFiles=d.files;
    if(!curCat && !curSearch) totalAll=d.total;
    renderCats(d.categories,d.category_counts);
    renderCourseGrid(d.files);
    showCourseGrid();
  }catch(e){
    showToast('加载失败');
  }
}

async function loadInfo(){
  try{
    const r=await fetch('/api/info?knowledge_base='+curKB);
    const info=await r.json();
    updateDisplayCounts(info.total_files||0);
    return info;
  }catch(e){
    console.error('加载info失败');
    return null;
  }
}

async function switchKB(kb,btn){
  curKB=kb;
  totalAll=0;
  var btns=document.querySelectorAll('.kb-tab');
  btns.forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  curCat=''; curId=null;
  showWelcome();
  await Promise.all([loadFiles(), loadInfo()]);
  showWelcome();
}

function updateDisplayCounts(total){
  document.getElementById('headerSubtitle').textContent=total+'门课程 · 局域网服务';
  document.getElementById('welcomeText').textContent=total+'门课程知识库';
}

function renderCats(cats,counts){
  const list=document.getElementById('categoryList');
  let html='<button class="category-item'+(curCat===''?' active':'')+'" onclick="filterCat(\'\')"><span class="category-icon">&#x1F4C1;</span> 全部课程 <span class="count">'+totalAll+'</span></button>';
  cats.forEach(function(c){
    html+='<button class="category-item'+(curCat===c?' active':'')+'" onclick="filterCat(\''+c+'\')"><span class="category-icon">&#x1F4D6;</span> '+c+' <span class="count">'+(counts[c]||0)+'</span></button>';
  });
  list.innerHTML=html;
}

function renderCourseGrid(files){
  const ct=document.getElementById('courseGridList');
  const titleEl=document.getElementById('courseGridTitle');
  titleEl.textContent=curCat?curCat:'全部课程';
  
  if(files.length===0){
    ct.innerHTML='<div class="course-grid-empty"><div class="welcome-icon">&#x1F50D;</div><h3>未找到匹配的课程</h3><p>尝试修改搜索条件</p></div>';
    return;
  }
  let html='';
  files.forEach(function(f){
    const hasVideo = f.has_video || f.video_url || (curKB === 'party' && f.title.includes('.mp4'));
    const videoTag = hasVideo ? '<span class="course-grid-card-badge video-badge">&#x1F3AC; 有视频</span>' : '';
    html+='<div class="course-grid-card'+(f.id===curId?' active':'')+'" onclick="openFile(\''+f.id+'\')">'+
      '<div class="course-grid-card-icon">&#x1F4C4;</div>'+
      '<div class="course-grid-card-title">'+esc(f.title)+'</div>'+
      '<div class="course-grid-card-meta">'+
        '<span class="course-grid-card-badge">'+esc(f.category)+'</span>'+
        '<span class="course-grid-card-badge">'+f.size_display+'</span>'+
        '<span class="course-grid-card-badge">'+f.paragraph_count+'段</span>'+
        videoTag+
      '</div>'+
    '</div>';
  });
  ct.innerHTML=html;
}

function showCourseGrid(){
  document.getElementById('courseGridArea').style.display='flex';
  document.getElementById('courseDetailArea').style.display='none';
  document.getElementById('welcomeArea').style.display='none';
}

function showCourseDetail(){
  document.getElementById('courseGridArea').style.display='none';
  document.getElementById('courseDetailArea').style.display='flex';
  document.getElementById('welcomeArea').style.display='none';
}

function showWelcome(){
  document.getElementById('courseGridArea').style.display='none';
  document.getElementById('courseDetailArea').style.display='none';
  document.getElementById('welcomeArea').style.display='flex';
}

function filterCat(cat){
    curCat=cat; curSearch=''; document.getElementById('searchInput').value='';
    curId=null; loadFiles();
    showCourseGrid();
  }

function changeSort(s){
  curSort=s;
  var btns=document.querySelectorAll('.sort-btn');
  btns.forEach(function(b){
    var t=b.textContent;
    b.classList.toggle('active',(s==='title'&&t.indexOf('名称')>=0)||(s==='date'&&t.indexOf('时间')>=0)||(s==='size'&&t.indexOf('大小')>=0));
  });
  loadFiles();
}

var searchTimer;
function handleSearch(e){
  clearTimeout(searchTimer);
  searchTimer=setTimeout(function(){
    var q=document.getElementById('searchInput').value.trim();
    if(q){curSearch=q;curCat='';loadFiles();}
    else{curSearch='';loadFiles();}
  },300);
}

async function openFile(id){
  curId=id;
  showCourseDetail();
  document.getElementById('contentTitle').textContent='加载中...';
  document.getElementById('contentBody').innerHTML='<div class="loading">加载中</div>';
  try{
    var r=await fetch('/api/files/'+id);
    if(!r.ok)throw new Error('fail');
    var d=await r.json();
    document.getElementById('contentTitle').textContent=d.title;
    var cat=d.category||'未分类';
    document.getElementById('contentMeta').innerHTML='<span>'+cat+'</span><span>'+d.size_display+'</span><span>'+d.segments.length+' 个段落</span><span class="para-stat">段落数:'+d.paragraph_count+'</span>';
    var html='';
    
    // 检查是否有视频
     try{
       var vr=await fetch('/api/files/'+id+'/video');
       if(vr.ok){
         var vd=await vr.json();
         if(vd.has_video){
           html+='<div class="video-toggle">'+
             '<button class="active" id="btnVideo" onclick="switchVideoMode(\'video\',this)">视频播放</button>'+
             '<button id="btnText" onclick="switchVideoMode(\'text\',this)">文本内容</button>'+
           '</div>';
           html+='<div id="videoSection"><div class="video-container" id="videoContainer"></div></div>';
           html+='<div id="textSection" style="display:none">';
           d.segments.forEach(function(seg){
             html+='<div class="segment-card">'+
               '<div class="segment-title">'+esc(seg.title)+'</div>'+
               (seg.time?'<div class="segment-time">&#x23F1; '+seg.time+'</div>':'')+
               '<div class="segment-content">'+esc(seg.content)+'</div>'+
             '</div>';
           });
           html+='</div>';
           document.getElementById('contentBody').innerHTML=html;
           document.getElementById('contentBody').scrollTo({top:0,behavior:'smooth'});
           // 使用JavaScript动态创建video元素
           setTimeout(function(){
             var container=document.getElementById('videoContainer');
             if(container){
               var video=document.createElement('video');
               video.id='courseVideo';
               video.controls=true;
               video.preload='auto';
               video.playsInline=true;
               video.style.width='100%';
               video.style.maxHeight='500px';
               video.style.backgroundColor='#000';
               var source=document.createElement('source');
               source.src=vd.video_url;
               source.type='video/mp4';
               video.appendChild(source);
               var fallback=document.createTextNode('您的浏览器不支持视频播放');
               video.appendChild(fallback);
               container.appendChild(video);
               video.addEventListener('error',function(e){
                 console.error('视频加载错误:',e);
                 console.error('视频URL:',vd.video_url);
                 showToast('视频加载失败');
               });
               video.addEventListener('canplay',function(){
                 console.log('视频可以播放');
               });
               video.addEventListener('loadedmetadata',function(){
                 console.log('视频元数据加载完成, 时长:',video.duration);
               });
               video.load();
             }
           },50);
           return;
         }
       }
     }catch(ve){
       console.error('视频信息加载失败:',ve);
     }
    
    d.segments.forEach(function(seg){
      html+='<div class="segment-card">'+
        '<div class="segment-title">'+esc(seg.title)+'</div>'+
        (seg.time?'<div class="segment-time">&#x23F1; '+seg.time+'</div>':'')+
        '<div class="segment-content">'+esc(seg.content)+'</div>'+
      '</div>';
    });
    document.getElementById('contentBody').innerHTML=html;
    document.getElementById('contentBody').scrollTo({top:0,behavior:'smooth'});
  }catch(e){
    showToast('打开失败');
    document.getElementById('contentTitle').textContent='打开失败';
  }
}

function switchVideoMode(mode, btn){
  curVideoMode=mode;
  var btns=document.querySelectorAll('.video-toggle button');
  btns.forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  
  var vs=document.getElementById('videoSection');
  var ts=document.getElementById('textSection');
  if(vs&&ts){
    if(mode==='video'){
      vs.style.display='block';
      ts.style.display='none';
    }else{
      vs.style.display='none';
      ts.style.display='block';
    }
  }
}

function showToast(m){
  var t=document.getElementById('toast');
  t.textContent=m; t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2500);
}

function esc(t){
  var d=document.createElement('div');
  d.textContent=t;
  return d.innerHTML;
}
</script>
</body>
</html>"""


@app.get("/", response_class=HTMLResponse)
async def index():
    return HTML_TEMPLATE


if __name__ == "__main__":
    separator = "=" * 55
    print(f"""
{separator}
  {SERVER_TITLE} - 双知识库在线学习
{separator}

  党政: {KNOWLEDGE_BASE_DIR}
  安全应急: {EMERGENCY_KNOWLEDGE_BASE_DIR}
  LLM标题: {TITLES_DIR}
  分类数据: {CLASSIFICATION_FILE}
  服务地址: http://{SERVER_HOST}:{SERVER_PORT}
  局域网访问: http://你的IP地址:{SERVER_PORT}

  按 Ctrl+C 停止服务
{separator}
    """)
    
    # 预加载分类缓存
    load_new_categories()
    
    # 预加载NAS视频映射
    nas_map = load_nas_mapping()
    nas_count = len(nas_map)

    # 预加载应急课程远程视频映射
    emergency_video_map = load_emergency_video_mapping()
    emergency_video_count = len(emergency_video_map)

    # 初始化视频缓存
    video_cache.init_video_cache()
    cache_stats = video_cache.get_cache_stats()

    all_docs = scan_all_docs()
    cats, cnts = get_categories(all_docs)
    total_paras = sum(d.paragraph_count for d in all_docs)
    processed_count = len(list(PROCESSED_DIR.glob("*.json"))) if PROCESSED_DIR.exists() else 0

    print(f"  已发现 {len(all_docs)} 个课程文件:\n")
    for kb_key, kb_info in KNOWLEDGE_BASES.items():
        kb_docs = scan_all_docs(kb_key)
        kb_cats, kb_cnts = get_categories(kb_docs)
        print(f"    [{kb_info['name']}] {len(kb_docs)} 个课程, {len(kb_cats)} 个分类")
        for c in kb_cats[:5]:
            print(f"      - {c}: {kb_cnts[c]} 个")
        if len(kb_cats) > 5:
            print(f"      ... 共 {len(kb_cats)} 个分类")

    print(f"\n  总段落数: {total_paras}")
    print(f"  已处理课程: {processed_count}/{len(all_docs)}")
    print(f"  NAS视频: {nas_count} 个, 远程视频: {emergency_video_count} 个")
    print(f"  视频缓存: {cache_stats['count']} 个文件, {cache_stats['totalSize'] / (1024 * 1024):.0f}MB / {cache_stats['maxSize'] / (1024 * 1024):.0f}MB")
    print(f"\n{separator}\n")

    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT, log_level="info")