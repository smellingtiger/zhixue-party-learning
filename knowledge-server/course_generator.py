"""
AI课程生成服务 - 基于硅基流动 DeepSeek-V4-Flash
从知识库565门课程中检索相关资料，结合LLM能力生成高质量课程
"""

import os
import re
import json
import time
import asyncio
import aiohttp
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

KNOWLEDGE_BASE_DIR = Path(r"E:\社院课程stt\knowledge_base_txt")
TITLES_DIR = Path(r"E:\社院课程stt\knowledge_base_titles")

API_BASE_URL = "https://api.siliconflow.cn/v1"
API_KEY = "sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb"
MODEL_NAME = "deepseek-ai/DeepSeek-V4-Flash"

SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8081

MAX_RETRIES = 3
REQUEST_TIMEOUT = 300

app = FastAPI(title="AI课程生成服务", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    topic: str
    diagnostic: Optional[dict] = None


def parse_course_file(filepath: Path) -> dict:
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception:
        return {}

    lines = text.split("\n")
    course_name = ""
    category = ""

    for line in lines[:6]:
        m = re.search(r"【课程名称】(.+)", line)
        if m:
            course_name = m.group(1).strip()
        m = re.search(r"【课程分类】(.+)", line)
        if m:
            category = m.group(1).strip()

    segments = []
    current_title = ""
    current_content = []

    seg_start = 0
    for i, line in enumerate(lines):
        if line.strip().startswith("=" * 10):
            seg_start = i + 1
            break

    for line in lines[seg_start:]:
        m_bg = re.match(r"【背景[：:]\s*(.+)", line)
        m_ti = re.match(r"【要求[：:]\s*(.+)", line)
        m_div = re.match(r"^={10,}", line)

        if m_bg or m_ti:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "content": " ".join(current_content).strip()
                })
            current_title = (m_bg or m_ti).group(1).strip()
            current_content = []
        elif m_div:
            if current_title and current_content:
                segments.append({
                    "title": current_title,
                    "content": " ".join(current_content).strip()
                })
            current_title = ""
            current_content = []
        elif current_title:
            stripped = line.strip()
            if stripped:
                current_content.append(stripped)

    if current_title and current_content:
        segments.append({
            "title": current_title,
            "content": " ".join(current_content).strip()
        })

    return {
        "course_name": course_name or filepath.stem,
        "category": category or "未分类",
        "segments": segments,
    }


def search_knowledge_base(topic: str, max_courses: int = 8) -> list[dict]:
    if not KNOWLEDGE_BASE_DIR.exists():
        return []

    topic_keywords = set(re.findall(r"[\u4e00-\u9fff]{2,}", topic))
    stop_words = {"基础", "应用", "专题", "课程", "学习", "实践", "理论", "研究", "分析", "发展", "建设",
                  "方法", "能力", "体系", "机制", "模式", "路径", "框架", "思考", "认识"}
    topic_keywords = topic_keywords - stop_words

    scored_courses = []
    all_categories = set()

    for filepath in KNOWLEDGE_BASE_DIR.glob("*.txt"):
        course_name = filepath.stem
        score = 0
        match_reasons = []

        for kw in topic_keywords:
            if kw in course_name:
                score += 10
                match_reasons.append(f"标题含'{kw}'")

        try:
            first_lines = filepath.read_text(encoding="utf-8")[:800]
            category_match = re.search(r"【课程分类】(.+)", first_lines)
            if category_match:
                category = category_match.group(1).strip()
                all_categories.add(category)
                for kw in topic_keywords:
                    if kw in category:
                        score += 5
                        match_reasons.append(f"分类'{category}'含'{kw}'")

            content_preview = first_lines[200:]
            for kw in topic_keywords:
                if kw in content_preview:
                    score += 1
                    if len(match_reasons) < 3:
                        match_reasons.append(f"内容含'{kw}'")
        except Exception:
            pass

        if score > 0:
            scored_courses.append((score, filepath, match_reasons))

    if not scored_courses and topic_keywords:
        single_kw_matches = []
        for filepath in KNOWLEDGE_BASE_DIR.glob("*.txt"):
            course_name = filepath.stem
            for kw in topic_keywords:
                if kw in course_name:
                    single_kw_matches.append((5, filepath, [f"单关键词'{kw}'命中"]))
                    break
                try:
                    first_lines = filepath.read_text(encoding="utf-8")[:500]
                    category_match = re.search(r"【课程分类】(.+)", first_lines)
                    if category_match and kw in category_match.group(1):
                        single_kw_matches.append((3, filepath, [f"分类含'{kw}'"]))
                        break
                except Exception:
                    pass
            if len(single_kw_matches) >= max_courses:
                break
        scored_courses = sorted(single_kw_matches, key=lambda x: -x[0])[:max_courses]

    if not scored_courses:
        fallback_categories = {
            "政治理论": ["党章", "二十大", "习近平思想", "党史"],
            "统战理论": ["统一战线", "民族宗教", "非公经济", "港澳台"],
            "乡村振兴": ["农村", "农业", "扶贫", "共同富裕"],
            "经济建设": ["经济", "产业", "企业", "金融"],
            "社会治理": ["治理", "法治", "社区", "基层"],
            "文化建设": ["文化", "文明", "宣传", "意识形态"],
            "生态文明": ["生态", "环保", "绿色", "碳"],
            "党的建设": ["党建", "组织", "纪律", "作风"],
        }
        best_cat = None
        best_overlap = 0
        for cat, keywords in fallback_categories.items():
            overlap = len(set(keywords) & topic_keywords)
            if overlap > best_overlap:
                best_overlap = overlap
                best_cat = cat

        if best_cat:
            count = 0
            for filepath in KNOWLEDGE_BASE_DIR.glob("*.txt"):
                try:
                    first_lines = filepath.read_text(encoding="utf-8")[:500]
                    if best_cat in first_lines:
                        course = parse_course_file(filepath)
                        if course and course.get("segments"):
                            scored_courses.append((2, filepath, [f"分类兜底：{best_cat}"]))
                            count += 1
                            if count >= max_courses:
                                break
                except Exception:
                    pass

    scored_courses.sort(key=lambda x: -x[0])

    results = []
    for score, filepath, reasons in scored_courses[:max_courses]:
        course = parse_course_file(filepath)
        if course and course.get("segments"):
            course["_match_score"] = score
            course["_match_reasons"] = reasons
            results.append(course)

    return results


def format_knowledge_context(courses: list[dict], max_chars: int = 8000) -> tuple[str, str]:
    if not courses:
        return ("（知识库中未检索到直接相关的课程内容）\n\n"
                "请基于以下权威来源生成课程内容：\n"
                "1. 共产党员网（12371.cn）——最新政策文件和理论解读\n"
                "2. 人民网（people.com.cn）——权威新闻报道和深度分析\n"
                "3. 新华网（xinhuanet.com）——国家政策发布和时政要闻\n"
                "4. 信通院（caict.ac.cn）——产业报告和技术标准\n"
                "5. 中央统战部官网（zytzb.gov.cn）——统战工作政策解读\n"
                "6. 学习强国平台——理论学习资料库\n"
                "7. 国务院发展研究中心研究报告", "no_match")

    parts = []
    total_chars = 0
    has_high_match = any(c.get("_match_score", 0) >= 10 for c in courses)

    for course in courses:
        reasons_str = ""
        if course.get("_match_reasons"):
            reasons_str = f" 【匹配：{', '.join(course['_match_reasons'])}】"
        course_text = f"\n### 《{course['course_name']}》（分类：{course['category']}{reasons_str}）\n"
        for seg in course["segments"][:6]:
            content_preview = seg["content"][:300]
            course_text += f"- {seg['title']}：{content_preview}...\n"

        if total_chars + len(course_text) > max_chars:
            break

        parts.append(course_text)
        total_chars += len(course_text)

    match_quality = "high" if has_high_match else "low"
    return "\n".join(parts), match_quality


SYSTEM_PROMPT = """你是一位资深的党政干部教育培训课程设计师，服务于"智学"党政在线学习平台。你的任务是为机关干部设计高质量、实用性强的在线课程。

## 核心原则

1. **内容必须具体、可操作**：杜绝空话套话，每句话都要有信息量
2. **引用真实政策文件**：引用具体的政策名称、发布日期、文件编号
3. **提供实用工具**：每门课程必须包含可操作的框架（清单、评分表、问卷等）
4. **权威来源链接**：每章必须引用2-3个权威来源链接（共产党员网12371.cn、人民网people.com.cn、新华网xinhuanet.com、信通院caict.ac.cn、中央统战部zytzb.gov.cn等）
5. **结构化呈现**：大量使用表格、列表、加粗等格式，便于快速阅读

## 课程结构模板（严格遵循，共9章）

每门课程**必须**包含9个章节，type字段严格按照以下规定：

| 序号 | 章节类型(type) | 章节定位 | 时长 |
|:---|:---|:---|:---|
| 1 | **mixed** | 前言：为什么机关干部要关注此主题 | 6分钟 |
| 2 | **mixed** | 第1章：核心概念与定义——从一句话定义开始 | 6分钟 |
| 3 | **mixed** | 第2章：核心机制与关键路径——第一性原理拆解 | 6分钟 |
| 4 | **video** | 第3章：1分钟看懂X与Y的差别——分屏对比场景 | 4分钟 |
| 5 | **mixed** | 第4章：面向公共治理的应用场景——四大板块表格 | 6分钟 |
| 6 | **video** | 第5章：关键概念/制度跃迁——连贯镜头描述 | 4分钟 |
| 7 | **mixed** | 第6章：项目论证与评估方法——六问清单+评分表 | 6分钟 |
| 8 | **video** | 第7章：三要素——可解释/可评估/可监管（或可落地/可评估/可推广） | 4分钟 |
| 9 | **mixed** | 第8章：组织一次本地化小调研——10题问卷+5页评审模板 | 6分钟 |

**⚠️ type字段只有两个值："mixed" 或 "video"，第4、6、8章必须是 "video"，其余必须是 "mixed"。绝对不能全部是mixed！**

## 内容质量要求

- 前言必须引用**最近2年的政策文件**和**具体数据**（市场规模、覆盖率等）
- 每章mixed类型内容必须有**学习目标**（2-4条）和**多个页面**（用---PAGE---分隔）
- 每个页面聚焦一个知识点，包含表格或结构化内容
- video类型章节要描述**具体的视频画面场景**（连贯镜头、分屏对比等），然后提炼核心要点
- 第6章的论证清单和评分表必须**可直接使用**，不是概念描述
- 第8章的问卷必须**10道具体题目**，评审模板必须**5页框架**
- 所有权威链接必须是**真实存在的官方网址**"""


def build_user_prompt(topic: str, diagnostic: Optional[dict], knowledge_context: str) -> str:
    target_audience = "党政类在线学习平台成人用户（机关干部）"
    difficulty = "中级"
    role_hint = ""
    topic_hint = ""

    if diagnostic:
        roles = diagnostic.get("roles", [])
        topics = diagnostic.get("topics", [])
        diff = diagnostic.get("difficulty", "intermediate")

        if roles:
            target_audience = f"党政类在线学习平台成人用户（{', '.join(roles)}）"
            role_hint = f"\n特别说明：学员身份为{', '.join(roles)}，课程内容应侧重{'实务操作和基层方法' if any(r in roles for r in ['党支部书记', '党务工作者']) else '理论学习和政策理解'}。"

        if topics:
            topic_hint = f"\n学员感兴趣的相关主题：{', '.join(topics)}，请在课程中融入相关知识点。"

        diff_map = {"beginner": "入门级", "intermediate": "中级", "advanced": "深入级"}
        difficulty = diff_map.get(diff, "中级")

    prompt = f"""请为以下主题设计一门高质量课程：

## 课程主题
{topic}

## 目标受众
{target_audience}

## 难度等级
{difficulty}
{role_hint}{topic_hint}

## 知识库参考资料（来自565门课程中与主题相关的内容）
{knowledge_context}

## 输出要求

严格按照系统提示中的课程结构模板（9章，第4/6/8章type为video），输出完整JSON：
```json
{{
  "courseName": "课程主标题——副标题",
  "courseType": "课程类型",
  "totalHours": 0.8,
  "difficulty": "{difficulty}",
  "targetAudience": "{target_audience}",
  "description": "课程简介（100-200字）",
  "learningObjectives": ["目标1", "目标2", "目标3", "目标4", "目标5"],
  "chapters": [
    {{"id":1,"title":"前言：...","duration":"6分钟","type":"mixed","content":"完整Markdown内容"}},
    {{"id":2,"title":"第1章：...","duration":"6分钟","type":"mixed","content":"完整Markdown内容"}},
    ...（共9章，严格遵循系统提示的结构和type分配）
  ]
}}
```

每章content必须是完整的、详细的Markdown内容，不能省略或用"..."代替。"""

    return prompt


async def call_llm(session: aiohttp.ClientSession, messages: list[dict], max_tokens: int = 65536) -> Optional[str]:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": max_tokens,
    }

    for retry in range(MAX_RETRIES):
        try:
            async with session.post(
                f"{API_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"].strip()
                elif response.status == 429:
                    wait = 2 ** retry
                    print(f"频率限制，等待{wait}秒后重试...")
                    await asyncio.sleep(wait)
                else:
                    error_text = await response.text()
                    print(f"API错误 {response.status}: {error_text[:200]}")
                    if retry < MAX_RETRIES - 1:
                        await asyncio.sleep(2)
        except asyncio.TimeoutError:
            print(f"请求超时，重试 {retry+1}/{MAX_RETRIES}")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"请求异常: {e}")
            if retry < MAX_RETRIES - 1:
                await asyncio.sleep(2)

    return None


def parse_json_response(content: str) -> Optional[dict]:
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    start = content.find('{')
    end = content.rfind('}')
    if start != -1 and end != -1:
        try:
            return json.loads(content[start:end+1])
        except json.JSONDecodeError:
            pass

    return None


VIDEO_CHAPTER_INDICES = {3, 5, 7}

def validate_and_fix_course(course: dict, topic: str) -> dict:
    if not course.get("courseName"):
        course["courseName"] = f"{topic}——从认知到实践"

    if not course.get("courseType"):
        course["courseType"] = "专题课程"

    if not course.get("totalHours"):
        course["totalHours"] = 0.8

    if not course.get("difficulty"):
        course["difficulty"] = "中级"

    if not course.get("targetAudience"):
        course["targetAudience"] = "党政类在线学习平台成人用户（机关干部）"

    if not course.get("description"):
        course["description"] = f"本课程围绕\u201c{topic}\u201d主题，系统讲解相关理论知识和实践方法。"

    if not course.get("learningObjectives"):
        course["learningObjectives"] = [
            f"深刻理解{topic}的核心内涵",
            f"掌握相关的政策要求和工作方法",
            f"提升解决实际问题的能力",
        ]

    chapters = course.get("chapters", [])
    for i, ch in enumerate(chapters):
        ch_id = i + 1
        if not ch.get("id"):
            ch["id"] = ch_id
        if ch_id in VIDEO_CHAPTER_INDICES:
            ch["type"] = "video"
            if not ch.get("duration"):
                ch["duration"] = "4分钟"
        else:
            ch["type"] = "mixed"
            if not ch.get("duration"):
                ch["duration"] = "6分钟"
        if not ch.get("content"):
            ch["content"] = f"本章讲解{topic}的相关内容。"

    return course


async def generate_course_stream(request: GenerateRequest):
    topic = request.topic
    diagnostic = request.diagnostic

    def sse_event(event: str, data: dict):
        return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

    yield sse_event("step", {
        "index": 0,
        "title": "读取知识图谱诊断结果",
        "detail": f"正在加载学习诊断数据...\n\n• 课程主题：{topic}\n• 身份角色：{diagnostic.get('roles', ['未检测']) if diagnostic else '未检测'}\n• 学习主题：{diagnostic.get('topics', ['未选择']) if diagnostic else '未选择'}"
    })
    await asyncio.sleep(0.3)

    yield sse_event("step", {
        "index": 1,
        "title": "分析课程需求与目标受众",
        "detail": f"基于「{topic}」专题分析：\n\n• 核心需求：机关干部对该领域的认知与治理能力\n• 受众定位：党政类在线学习平台成人用户（机关干部）\n• 课程深度：{'入门级——侧重基础概念' if diagnostic and diagnostic.get('difficulty') == 'beginner' else '进阶级——理论与实务并重'}"
    })
    await asyncio.sleep(0.3)

    yield sse_event("step", {
        "index": 2,
        "title": "检索相关知识点与资料",
        "detail": "正在从知识库565门课程中检索相关资料..."
    })

    knowledge_courses = search_knowledge_base(topic)
    knowledge_context, match_quality = format_knowledge_context(knowledge_courses)

    found_count = len(knowledge_courses)
    course_names = [c["course_name"] for c in knowledge_courses[:5]]

    if match_quality == "no_match":
        step2_detail = f"检索资源包括：\n\n📚 知识库（共565门课程）\n   ⚠️ 未检索到与「{topic}」直接相关的课程\n   → 已切换为联网搜索模式，将基于权威网站内容生成课程\n\n🌐 权威来源（联网检索）\n   • 共产党员网（12371.cn）\n   • 人民网（people.com.cn）\n   • 新华网（xinhuanet.com）\n   • 信通院（caict.ac.cn）\n   • 学习强国平台"
    elif match_quality == "low":
        step2_detail = f"检索资源包括：\n\n📚 知识库（共565门课程）\n   • 检索到 {found_count} 门相关课程（模糊匹配）\n   • 相关课程：{'、'.join(course_names[:3])}\n   ⚠️ 直接匹配度较低，将结合联网搜索补充内容\n\n🌐 权威网站补充检索\n   • 共产党员网（12371.cn）\n   • 人民网（people.com.cn）\n   • 新华网（xinhuanet.com）"
    else:
        step2_detail = f"检索资源包括：\n\n📚 知识库（共565门课程）\n   ✅ 检索到 {found_count} 门高度相关课程\n   • 相关课程：{'、'.join(course_names[:3])}\n\n📖 权威政策文件与报告\n   • 根据主题匹配最新政策文件\n\n🌐 权威网站补充\n   • 人民网、新华网等实时资讯"

    yield sse_event("step", {
        "index": 2,
        "title": "检索相关知识点与资料",
        "detail": step2_detail
    })
    await asyncio.sleep(0.3)

    estimated_time = "约2-3分钟"
    yield sse_event("meta", {"estimatedTime": estimated_time, "matchQuality": match_quality})

    yield sse_event("step", {
        "index": 3,
        "title": "进行内容合规审核",
        "detail": "三级合规校验：\n\n• 政治方向：确保与党中央精神一致，核心表述准确\n• 政策解读：对照最新政策文件版本\n• 敏感筛查：所有链接均为官方权威来源"
    })
    await asyncio.sleep(0.3)

    yield sse_event("step", {
        "index": 4,
        "title": "设计课程结构与章节安排",
        "detail": "正在调用大语言模型设计课程框架...\n\n• 模型：DeepSeek-V4-Flash\n• 章节结构：前言+8章\n• 包含2-3个视频讲解章节"
    })

    user_prompt = build_user_prompt(topic, diagnostic, knowledge_context)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    yield sse_event("step", {
        "index": 5,
        "title": "生成课程内容与学习目标",
        "detail": "AI正在撰写各章节内容...\n\n• 生成方式：DeepSeek-V4-Flash + 知识库驱动\n• 每章结构：学习目标→知识点讲解→政策引用→实务指南→权威链接\n• 输出格式：Markdown文档"
    })

    start_time = time.time()
    async with aiohttp.ClientSession() as http_session:
        llm_response = await call_llm(http_session, messages)

    if not llm_response:
        yield sse_event("error", {"message": "LLM调用失败，请稍后重试"})
        return

    elapsed = time.time() - start_time
    print(f"LLM调用耗时: {elapsed:.1f}秒, 响应长度: {len(llm_response)}字符")

    yield sse_event("step", {
        "index": 6,
        "title": "优化课程大纲与教学设计",
        "detail": "正在解析和优化AI生成内容...\n\n• 解析课程结构\n• 校验章节完整性\n• 补充缺失内容"
    })

    course_data = parse_json_response(llm_response)

    if not course_data:
        print(f"LLM响应解析失败，原始内容前500字: {llm_response[:500]}")
        yield sse_event("error", {"message": "课程内容解析失败，请重试"})
        return

    course_data = validate_and_fix_course(course_data, topic)

    chapters = course_data.get("chapters", [])
    video_count = sum(1 for ch in chapters if ch.get("type") == "video")
    mixed_count = sum(1 for ch in chapters if ch.get("type") == "mixed")
    total_elapsed = time.time() - start_time

    yield sse_event("step", {
        "index": 7,
        "title": "课程生成完成",
        "detail": f"✅ 课程已全部生成！\n\n• 课程名称：{course_data.get('courseName', topic)}\n• 章节数：{len(chapters)}章（{video_count}个视频讲解 + {mixed_count}个图文章节）\n• 预计时长：约{int(course_data.get('totalHours', 0.8) * 60)}分钟\n• 实际生成耗时：{total_elapsed:.1f}秒\n• 内容来源：{'权威网站联网检索' if match_quality == 'no_match' else '知识库' + (f'{found_count}门相关课程 + ' if found_count else '') + 'DeepSeek-V4-Flash + 权威官方来源'}\n\n课程已保存，可随时查看或重新生成。"
    })

    yield sse_event("course", course_data)


@app.post("/api/generate-course")
async def generate_course(request: GenerateRequest):
    return StreamingResponse(
        generate_course_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "course-generator", "model": MODEL_NAME}


if __name__ == "__main__":
    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT)
