"""
知识库文件服务器 - 局域网知识库文件浏览服务
扫描 E:\社院课程stt院stt\knowledge_base_txt 目录下的565门课程文本，提供友好的 Web 访问界面
"""

import os
import re
import json
import uuid
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

KNOWLEDGE_BASE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
TITLES_DIR = Path(r"E:\社院课程stt\knowledge_base_titles")
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8080
SERVER_TITLE = "智学知识库"

app = FastAPI(title=SERVER_TITLE, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CourseDoc:
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.filename = filepath.name
        self.id = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(filepath)))
        self._parsed = None
        self._llm_titles = None

    def _load_llm_titles(self) -> Optional[list[str]]:
        if self._llm_titles is not None:
            return self._llm_titles
        
        if not TITLES_DIR.exists():
            self._llm_titles = None
            return None
        
        # 尝试匹配JSON文件
        base_name = self.filepath.stem
        json_file = TITLES_DIR / f"{base_name}.json"
        
        if json_file.exists():
            try:
                data = json.loads(json_file.read_text(encoding="utf-8"))
                titles = [seg.get("title", seg.get("original_title", "")) for seg in data.get("segments", [])]
                self._llm_titles = titles
                return titles
            except Exception:
                self._llm_titles = None
                return None
        
        self._llm_titles = None
        return None

    def _parse(self):
        if self._parsed:
            return self._parsed
        try:
            text = self.filepath.read_text(encoding="utf-8")
        except Exception:
            self._parsed = {"title": self.filename, "category": "未知", "paragraph_count": 0, "segments": []}
            return self._parsed

        lines = text.split("\n")
        title = ""
        category = ""
        para_count = 0

        for line in lines[:6]:
            m = re.search(r"【课程名称】(.+)", line)
            if m:
                title = m.group(1).strip()
            m = re.search(r"【课程分类】(.+)", line)
            if m:
                category = m.group(1).strip()
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

        # 尝试加载 LLM 生成的标题
        llm_titles = self._load_llm_titles()
        if llm_titles:
            for i, seg in enumerate(segments):
                if i < len(llm_titles) and llm_titles[i]:
                    seg["title"] = llm_titles[i]

        self._parsed = {
            "title": title or self.filename.replace(".txt", ""),
            "category": category or "未分类",
            "paragraph_count": para_count or len(segments),
            "segments": segments,
        }
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
        return {
            "id": self.id,
            "filename": self.filename,
            "title": self.title,
            "category": self.category,
            "paragraph_count": self.paragraph_count,
            "size": self.size,
            "size_display": self._format_size(self.size),
            "modified_time": self.modified_time.strftime("%Y-%m-%d %H:%M"),
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


def scan_all_docs() -> list[CourseDoc]:
    if not KNOWLEDGE_BASE_DIR.exists():
        return []
    files = sorted(KNOWLEDGE_BASE_DIR.glob("*.txt"))
    return [CourseDoc(f) for f in files]


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
):
    docs = scan_all_docs()

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

    categories, category_counts = get_categories(scan_all_docs())

    return {
        "files": [d.to_dict() for d in docs],
        "total": len(docs),
        "categories": categories,
        "category_counts": category_counts,
    }


@app.get("/api/search")
async def search_content(q: str = Query(..., min_length=1)):
    docs = scan_all_docs()
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


@app.get("/api/info")
async def server_info():
    docs = scan_all_docs()
    categories, category_counts = get_categories(docs)
    total_size = sum(d.size for d in docs)
    total_paragraphs = sum(d.paragraph_count for d in docs)

    # 统计已有LLM标题的课程数量
    llm_count = 0
    if TITLES_DIR.exists():
        llm_count = len(list(TITLES_DIR.glob("*.json")))

    return {
        "name": SERVER_TITLE,
        "version": "1.0.0",
        "total_files": len(docs),
        "total_size": total_size,
        "total_size_display": f"{total_size / 1024 / 1024:.1f} MB",
        "categories": categories,
        "category_counts": category_counts,
        "total_paragraphs": total_paragraphs,
        "data_source": str(KNOWLEDGE_BASE_DIR),
        "llm_titles_ready": llm_count,
        "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


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
.server-info{color:rgba(255,255,255,0.7);font-size:12px;display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(0,0,0,0.1);border-radius:6px;flex-shrink:0}
.server-info .dot{width:6px;height:6px;background:#22c55e;border-radius:50%;display:inline-block}
.main-container{display:flex;height:calc(100vh - var(--header-height))}
.sidebar{width:var(--sidebar-width);background:var(--card-bg);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}
.sidebar-header{padding:16px 20px;border-bottom:1px solid var(--border)}
.sidebar-header h3{font-size:13px;font-weight:600;color:var(--text-muted);letter-spacing:.5px}
.category-list{padding:12px;display:flex;flex-direction:column;gap:4px}
.category-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:.15s;font-size:14px;color:var(--text);border:none;background:none;width:100%;text-align:left}
.category-item:hover{background:var(--primary-light)}
.category-item.active{background:var(--primary-light);color:var(--primary);font-weight:600}
.category-item .count{margin-left:auto;font-size:12px;color:var(--text-muted);background:var(--bg);padding:2px 8px;border-radius:10px}
.category-item.active .count{background:var(--primary);color:#fff}
.file-list-container{flex:1;overflow-y:auto;padding:16px}
.file-stats{font-size:13px;color:var(--text-muted);margin-bottom:12px;padding:0 4px}
.sort-bar{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.sort-btn{padding:4px 12px;border-radius:6px;border:1px solid var(--border);background:none;font-size:12px;color:var(--text-muted);cursor:pointer;transition:.15s}
.sort-btn:hover{border-color:var(--primary);color:var(--primary)}
.sort-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.file-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;cursor:pointer;transition:.15s;border:1px solid transparent;margin-bottom:4px}
.file-item:hover{background:var(--primary-light);border-color:var(--border)}
.file-item.active{background:var(--primary-light);border-color:var(--primary)}
.file-icon{width:40px;height:40px;border-radius:8px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.file-info{flex:1;min-width:0}
.file-name{font-size:14px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.file-meta{font-size:12px;color:var(--text-muted);display:flex;gap:8px;margin-top:2px}
.file-badge{font-size:11px;padding:2px 8px;border-radius:4px;background:var(--bg);color:var(--text-muted)}
.content-area{flex:1;display:flex;flex-direction:column;background:var(--card-bg);overflow:hidden}
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
    <span class="header-subtitle">565门课程 · 局域网服务</span>
  </div>
  <div class="header-right">
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
    <div class="file-list-container">
      <div class="file-stats" id="fileStats"></div>
      <div class="sort-bar" id="sortBar">
        <button class="sort-btn active" onclick="changeSort('title')">按名称</button>
        <button class="sort-btn" onclick="changeSort('date')">按时间</button>
        <button class="sort-btn" onclick="changeSort('size')">按大小</button>
      </div>
      <div id="fileList"></div>
    </div>
  </aside>

  <main class="content-area">
    <div class="content-header">
      <h2 id="contentTitle">欢迎使用知识库</h2>
      <div class="content-meta" id="contentMeta"></div>
    </div>
    <div class="content-body" id="contentBody">
      <div class="welcome-screen">
        <div class="welcome-icon">&#x1F4DA;</div>
        <div class="welcome-text">565门课程知识库</div>
        <div class="welcome-hint">从左侧选择一个课程开始阅读</div>
      </div>
    </div>
  </main>
</div>

<button id="_scroll" onclick="scrollToTopFn()">&#8593;</button>
<div class="toast" id="toast"></div>

<script>
let curCat='', curSort='title', curSearch='', curId=null, allFiles=[];

function init(){
  document.getElementById('serverAddr').textContent=window.location.host;
  loadFiles();
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
    const r=await fetch('/api/files?'+p.toString());
    const d=await r.json();
    allFiles=d.files;
    renderCats(d.categories,d.category_counts);
    renderFiles(d.files);
    document.getElementById('fileStats').textContent='共 '+d.total+' 个课程';
  }catch(e){
    showToast('加载失败');
  }
}

function renderCats(cats,counts){
  const list=document.getElementById('categoryList');
  let html='<button class="category-item'+(curCat===''?' active':'')+'" onclick="filterCat(\'\')"><span class="category-icon">&#x1F4C1;</span> 全部课程 <span class="count">'+allFiles.length+'</span></button>';
  cats.forEach(function(c){
    html+='<button class="category-item'+(curCat===c?' active':'')+'" onclick="filterCat(\''+c+'\')"><span class="category-icon">&#x1F4D6;</span> '+c+' <span class="count">'+(counts[c]||0)+'</span></button>';
  });
  list.innerHTML=html;
}

function renderFiles(files){
  const ct=document.getElementById('fileList');
  if(files.length===0){
    ct.innerHTML='<div class="empty-files"><div class="welcome-icon">&#x1F50D;</div><h3>未找到匹配的课程</h3><p>尝试修改搜索条件</p></div>';
    return;
  }
  let html='';
  files.forEach(function(f){
    html+='<div class="file-item'+(f.id===curId?' active':'')+'" onclick="openFile(\''+f.id+'\')">'+
      '<div class="file-icon">&#x1F4C4;</div>'+
      '<div class="file-info">'+
        '<div class="file-name">'+esc(f.title)+'</div>'+
        '<div class="file-meta"><span>'+f.category+'</span><span>'+f.size_display+'</span><span>'+f.modified_time+'</span></div>'+
      '</div>'+
      '<span class="file-badge">'+f.paragraph_count+'段</span>'+
    '</div>';
  });
  ct.innerHTML=html;
}

function filterCat(cat){
  curCat=cat; curSearch=''; document.getElementById('searchInput').value='';
  curId=null; loadFiles();
  document.getElementById('contentTitle').textContent='欢迎使用知识库';
  document.getElementById('contentMeta').innerHTML='';
  document.getElementById('contentBody').innerHTML='<div class="welcome-screen"><div class="welcome-icon">&#x1F4DA;</div><div class="welcome-text">565门课程知识库</div><div class="welcome-hint">从左侧选择一个课程开始阅读</div></div>';
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
  {SERVER_TITLE} - 局域网知识库文件服务
{separator}

  数据源: {KNOWLEDGE_BASE_DIR}
  LLM标题: {TITLES_DIR}
  服务地址: http://{SERVER_HOST}:{SERVER_PORT}
  局域网访问: http://你的IP地址:{SERVER_PORT}

  按 Ctrl+C 停止服务
{separator}
    """)

    docs = scan_all_docs()
    cats, cnts = get_categories(docs)
    total_paras = sum(d.paragraph_count for d in docs)
    llm_count = len(list(TITLES_DIR.glob("*.json"))) if TITLES_DIR.exists() else 0

    print(f"  已发现 {len(docs)} 个课程文件:\n")
    for c in cats:
        print(f"    [{c}] {cnts[c]} 个课程")
    print(f"\n  总段落数: {total_paras}")
    print(f"  LLM标题已生成: {llm_count}/{len(docs)}")
    print(f"\n{separator}\n")

    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT, log_level="info")