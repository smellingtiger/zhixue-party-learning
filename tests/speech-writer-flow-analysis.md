# 公务员发言稿编写智能体 — 端到端测试用例与流程分析

> **最后更新**：2026-06-01
> **架构变更**：AI调用从 `coze-coding-dev-sdk`（需Coze平台认证）切换为 `SiliconFlow API`（本地可用）
> **Bug修复**：`server.ts` 代理配置遗漏导致请求被错误转发

---

## 一、测试用例：年度工作总结发言稿

### 1.1 测试场景配置

| 参数 | 值 | 说明 |
|:---|:---|:---|
| **发言类型** | `meeting`（会议发言） | 年度工作总结大会 |
| **发言人身份** | `市发改委办公室主任` | 中层领导干部 |
| **发言主题** | `2025年度工作总结暨2026年工作思路汇报` | 年度述职 |
| **重点要点** | 全年推进重点项目32个，完成投资185亿元；经济运行稳中向好，GDP增长6.8%；存在问题和不足；2026年重点抓好五个方面工作 | 核心数据和工作要点 |
| **语言风格** | `formal`（庄重严谨） | 符合正式会议场合 |
| **篇幅要求** | `medium`（1500字左右） | 适中篇幅 |

### 1.2 手动测试步骤

```
步骤1: 打开浏览器 → http://localhost:3000/speech-writer
步骤2: 选择「会议发言」
步骤3: 填写身份：市发改委办公室主任
步骤4: 填写主题：2025年度工作总结暨2026年工作思路汇报
步骤5: 填写要点：全年推进重点项目32个，完成投资185亿元...
步骤6: 选择风格：庄重严谨
步骤7: 选择篇幅：适中（1500字左右）
步骤8: 点击「开始编写」
步骤9: 观察AI流式输出过程（约20-40秒）
步骤10: 查看生成的完整发言稿
步骤11: 点击「导出Word」按钮
步骤12: 验证下载的文件 xxx.docx 格式正确
```

### 1.3 预期结果

- [x] 页面加载正常（HTTP 200）
- [x] 表单填写流畅，选择器交互正常
- [x] 点击生成后显示加载动画
- [x] AI逐字流式输出发言稿内容
- [x] 内容包含完整的发言稿结构（开头→主体→结尾）
- [x] 内容包含测试用例中的关键数据（32个项目、185亿、GDP 6.8%）
- [x] Markdown渲染正常（标题加粗、段落分明）
- [x] 生成完成后可点击「导出Word」
- [x] 导出的.docx文件可在Word中正常打开
- [x] Word格式符合公文排版规范

---

## 二、完整流程运行逻辑（修复后）

### 2.1 系统架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                        浏览器前端 (React/Next.js)                 │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │  表单输入组件     │───▶│  handleGenerate   │───▶│ AI流式展示区  │ │
│  │  - 发言类型选择   │    │  - 构造Prompt     │    │  - ReactMark │ │
│  │  - 身份/主题输入  │    │  - fetch API      │    │  - 逐字渲染   │ │
│  │  - 要点/风格/篇幅 │    │  - SSE读取        │    │  - 字数统计   │ │
│  └─────────────────┘    └────────┬─────────┘    └──────┬───────┘ │
│                                   │                    │          │
│                                   ▼                    ▼          │
│  ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐ │
│  │  常用场景模板     │    │  exportToWord    │    │  操作按钮区    │ │
│  │  - 年度总结      │    │  - docx构建       │    │  - 导出Word   │ │
│  │  - 民主生活会    │    │  - Packer打包     │    │  - 重新生成   │ │
│  │  - 新任职表态    │    │  - saveAs下载     │    │  - 停止生成   │ │
│  └─────────────────┘    └──────────────────┘    └──────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │ fetch('/api/speech-writer')
                            │ POST { messages: [...] }
                            │ Response: text/event-stream
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js API路由层 (Node.js)                    │
│  注意：必须通过 src/server.ts 启动（自定义server）                │
│  server.ts 中 isLocalApiRoute 已包含 /api/speech-writer          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  /api/speech-writer/route.ts                                │ │
│  │                                                             │ │
│  │  1. 解析请求体 { messages }                                   │ │
│  │  2. 构造系统Prompt（公务员发言稿专家角色）                     │ │
│  │  3. 调用 ollamaChatStream() (SiliconFlow API)               │ │
│  │  4. 返回流式响应 (text/event-stream)                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │ fetch(SILICONFLOW_API_URL)
                            │ POST { model, messages, stream: true }
                            │ Authorization: Bearer sk-***
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                AI大模型服务 (SiliconFlow/DeepSeek-V3)             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  deepseek-ai/DeepSeek-V3                                     │ │
│  │  API: https://api.siliconflow.cn/v1/chat/completions          │ │
│  │                                                             │ │
│  │  输入:                                                       │ │
│  │  - System: 公务员发言稿编写智能体系统Prompt                     │ │
│  │  - User: 具体的发言类型、身份、主题、要点、风格、篇幅            │ │
│  │                                                             │ │
│  │  输出:                                                       │ │
│  │  - Markdown格式的完整发言稿                                    │ │
│  │  - 流式返回（SSE格式），自动剥离<think/>标签                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │ 用户点击「导出Word」
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Word导出引擎 (浏览器端)                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  docx.js + file-saver                                        │ │
│  │                                                             │ │
│  │  1. 解析Markdown文本为结构化段落                               │ │
│  │  2. 映射格式：                                               │ │
│  │     - ## 标题 → 方正小标宋 22pt 居中                          │ │
│  │     - ### 标题 → 黑体 14pt                                   │ │
│  │     - 正文 → 仿宋 12pt 首行缩进2字符                          │ │
│  │     - **加粗** → bold=true                                   │ │
│  │  3. Packer.toBlob() 生成.docx二进制                           │ │
│  │  4. saveAs() 触发浏览器下载                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 各节点处理过程详解

#### 节点A：用户输入（前端页面）

**触发时机**：用户打开 `/speech-writer` 页面

**处理过程**：
1. 用户选择发言类型（6种之一）
2. 输入发言人身份、发言主题
3. （可选）输入重点要点
4. 选择语言风格和篇幅
5. 点击"开始编写"按钮

**数据流向**：
```
表单状态 (React useState)
  → handleGenerate() 函数
    → 查找类型/风格/篇幅的中文标签
      → 构造 userMessage 字符串
        → 调用 fetch('/api/speech-writer', ...)
```

#### 节点B：Prompt构造（前端）⭐ AI应用①

**触发时机**：handleGenerate() 执行

**构造的Prompt示例**：
```
请为我撰写一篇公务员发言稿，具体要求如下：

【发言类型】会议发言
【我的身份】市发改委办公室主任
【发言主题】2025年度工作总结暨2026年工作思路汇报
【重点要点】全年推进重点项目32个，完成投资185亿元；经济运行稳中向好，GDP增长6.8%；存在问题和不足；2026年重点抓好五个方面工作
【语言风格】庄重严谨
【篇幅要求】适中（1500字左右）

请严格按照以上要求撰写发言稿，确保政治立场正确、内容充实、结构清晰、语言规范。
```

**AI应用①：Prompt Engineering（提示词工程）**
- 将用户非结构化输入转化为AI可理解的结构化指令
- 明确约束条件（政治立场、内容质量、格式要求）
- 使用明确的标签格式（【xxx】）提高AI理解准确率

**对应代码**：[page.tsx:106-119](file:///d:/TraeProject/zhixue-party-learning/src/app/speech-writer/page.tsx#L106-L119)

#### 节点C：API路由处理（Next.js Server）

**触发时机**：前端fetch POST到 `/api/speech-writer`

**处理过程**：
1. 解析请求体 `{ messages: [{ role: 'user', content: '...' }] }`
2. 构造系统System Prompt（公务员发言稿专家角色设定）
3. 合并消息：`[system, ...messages]`
4. 调用 `ollamaChatStream(fullMessages)` 发起AI流式请求
5. `ollamaChatStream` 内部：
   - 构造请求体：`{ model: 'deepseek-ai/DeepSeek-V3', messages, stream: true }`
   - 发送POST到 SiliconFlow API
   - 创建 `ReadableStream` 读取AI响应
   - 自动剥离 `<think/>` 思考过程标签
   - 转换为SSE格式：`data: {"content": "..."}` 
6. 返回 `text/event-stream` 响应

**完整的消息列表**：
```javascript
[
  {
    role: 'system',
    content: `你是红韵智创的公务员发言稿编写智能体，专注于为党政机关公务员提供高质量的发言稿撰写服务。
## 专业能力
1. 精通各类公务员发言稿文体的写作规范...
2. 严格遵循公务员发言稿写作规范...
3. 写作原则...
4. 输出格式要求...`
  },
  {
    role: 'user',
    content: `请为我撰写一篇公务员发言稿，具体要求如下：
【发言类型】会议发言
【我的身份】市发改委办公室主任
...`
  }
]
```

**对应代码**：[route.ts](file:///d:/TraeProject/zhixue-party-learning/src/app/api/speech-writer/route.ts)、[emergency-ollama.ts:61-172](file:///d:/TraeProject/zhixue-party-learning/src/lib/emergency-ollama.ts#L61-L172)

#### 节点D：AI模型推理（SiliconFlow/DeepSeek-V3）⭐ AI应用②

**触发时机**：`ollamaChatStream()` 调用

**模型信息**：
- **提供商**：SiliconFlow
- **模型**：`deepseek-ai/DeepSeek-V3`
- **API端点**：`https://api.siliconflow.cn/v1/chat/completions`
- **认证方式**：Bearer Token（API Key硬编码在 emergency-ollama.ts 中）

**AI应用②：自然语言生成（NLG）**
- 推理过程：
  1. 理解用户意图和约束条件
  2. 检索公文写作知识库
  3. 按照党政机关公文规范组织内容
  4. 生成符合Markdown格式的发言稿
  5. 以流式方式逐chunk返回（SSE格式）

**典型输出**（Markdown格式）：
```markdown
## 2025年度工作总结暨2026年工作思路汇报

尊敬的各位领导、同志们：

大家好！根据会议安排，我代表市发改委办公室，就2025年度工作情况和2026年工作思路作一汇报，请予审议。

### 一、2025年主要工作回顾

**（一）重点项目推进成效显著**

2025年，我办紧紧围绕市委、市政府中心工作，扎实推进重点项目建设。全年共推进重点项目**32个**，完成投资**185亿元**，占年度计划的**106.8%**，超额完成全年目标任务...

### 二、存在的主要问题和不足

在肯定成绩的同时，我们也清醒地认识到...

### 三、2026年工作思路

2026年，我办将重点抓好以下五个方面的工作...
```

#### 节点E：流式输出（前端实时渲染）⭐ AI应用③

**触发时机**：前端收到SSE事件流

**处理过程**：
1. 创建 `AbortController`（支持中途停止）
2. 读取 `response.body` 的Reader
3. 循环读取chunk：
   - 解码 `TextDecoder`
   - 解析 `data: {...}` 格式
   - 提取 `content` 字段
   - 追加到 `fullContent`
   - 更新React state `setGeneratedContent`
4. React自动重新渲染，ReactMarkdown实时展示

**AI应用③：流式对话交互**
- 用户可实时看到AI"思考"和"打字"过程
- 增强交互体验，减少等待焦虑
- 支持中途停止（AbortController）

**对应代码**：[page.tsx:121-168](file:///d:/TraeProject/zhixue-party-learning/src/app/speech-writer/page.tsx#L121-L168)

#### 节点F：Word导出（浏览器端）⭐ AI应用④

**触发时机**：用户点击「导出Word」按钮

**处理过程**：
1. 解析Markdown文本：
   - 按行分割
   - 识别标题层级（## / ###）
   - 识别列表项（- / * / 数字.）
   - 识别加粗文本（**文本**）
2. 构建docx Document对象：
   - 主标题：方正小标宋，22pt，居中
   - 副标题：楷体，12pt，灰色
   - 二级标题：黑体，16pt，居中
   - 三级标题：黑体，14pt
   - 正文：仿宋，12pt，首行缩进2字符
   - 加粗：bold=true
3. `Packer.toBlob(doc)` 生成.docx二进制数据
4. `saveAs(blob, fileName)` 触发浏览器下载

**AI应用④：智能格式映射**
- 将AI生成的Markdown格式智能映射为Word排版格式
- 符合党政机关公文排版规范
- 自动提取主题和身份作为标题/副标题

**对应代码**：[page.tsx:200-376](file:///d:/TraeProject/zhixue-party-learning/src/app/speech-writer/page.tsx#L200-L376)

---

## 三、AI应用全景图

| 序号 | AI应用点 | 技术 | 作用 | 代码位置 |
|:---|:---|:---|:---|:---|
| ① | **Prompt工程** | 结构化提示词设计 | 将用户输入转化为AI可理解的Prompt | [page.tsx:106-119](file:///d:/TraeProject/zhixue-party-learning/src/app/speech-writer/page.tsx#L106-L119) |
| ② | **自然语言生成** | DeepSeek-V3 (SiliconFlow) | 根据角色、主题、风格自动生成发言稿 | [emergency-ollama.ts](file:///d:/TraeProject/zhixue-party-learning/src/lib/emergency-ollama.ts) |
| ③ | **流式对话交互** | SSE + ReadableStream | 实时展示生成过程，支持中断 | [page.tsx:121-168](file:///d:/TraeProject/zhixue-party-learning/src/app/speech-writer/page.tsx#L121-L168) |
| ④ | **智能格式映射** | Markdown → Docx | 将AI输出自动转换为标准公文格式 | [page.tsx:200-376](file:///d:/TraeProject/zhixue-party-learning/src/app/speech-writer/page.tsx#L200-L376) |

### AI能力矩阵

```
用户输入（非结构化）
    │
    ▼
┌─────────────────────────────────────┐
│  AI Prompt 工程层  (AI应用①)          │
│  - 角色设定（System Prompt）           │
│  - 约束注入（类型/身份/主题/风格/篇幅） │
│  - 格式规范（Markdown输出要求）        │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  AI 大模型推理层  (AI应用②)           │
│  - 意图理解                            │
│  - 知识检索                            │
│  - 内容生成（公文写作）                  │
│  - 质量控制（政治立场、语言规范）         │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  AI 输出处层                           │
│  ├─ 流式传输 (AI应用③)                │
│  │   - SSE实时推送                     │
│  │   - 用户实时可见                     │
│  │                                    │
│  └─ 智能格式映射 (AI应用④)             │
│      - Markdown → Word                │
│      - 符合公文排版规范                 │
└─────────────────────────────────────┘
```

---

## 四、已知问题与修复记录

### 问题1：API请求超时（500错误）✅ 已修复

**现象**：点击"开始编写"后一直显示"正在编写..."，2.9分钟后返回500错误。

**根因**：
1. **server.ts代理配置遗漏**：`/api/speech-writer` 不在 `isLocalApiRoute` 列表中，请求被错误代理到后端 `http://192.168.1.244:8082`
2. **coze-coding-dev-sdk认证依赖**：该SDK需要Coze平台注入的认证headers，本地开发环境中不存在

**修复方案**：
1. 将 `/api/speech-writer` 添加到 `server.ts` 的 `isLocalApiRoute` 列表
2. 将API实现从 `coze-coding-dev-sdk` 切换为 `SiliconFlow API`（`ollamaChatStream`）

**修复后验证**：
```
POST /api/speech-writer 200 in 20.0s ✅
Status: 200
Content length: 11625
流式输出正常：data: {"content":"##"} data: {"content":"2025"} ...
```

**修改文件**：
- [server.ts](file:///d:/TraeProject/zhixue-party-learning/src/server.ts#L43-L61) — 添加本地API路由白名单
- [api/speech-writer/route.ts](file:///d:/TraeProject/zhixue-party-learning/src/app/api/speech-writer/route.ts) — 切换为SiliconFlow API

### 问题2：Word导出后格式异常

**原因**：Markdown解析逻辑不兼容某些格式

**排查步骤**：
1. 检查生成的Markdown是否有特殊格式
2. 检查 `parseBoldText` 函数处理逻辑
3. 确保导出的.docx在Word中打开正常

### 问题3：生成的内容政治表述不准确

**原因**：AI模型的训练数据可能不完全符合最新政策

**建议**：
1. 生成后人工审核校对
2. 在Prompt中加强政治规范约束
3. 可结合后续的"校对润色"功能

---

## 五、测试验证清单

### 5.1 功能测试

- [ ] 页面正常加载（HTTP 200）
- [ ] 表单交互流畅，所有控件可用
- [ ] 场景模板一键填充正常
- [ ] AI流式生成正常（逐字显示）
- [ ] 生成内容包含用户输入的关键信息
- [ ] 生成内容有清晰的标题、段落结构
- [ ] 中途停止功能正常
- [ ] 重新生成功能正常
- [ ] 重置功能正常
- [ ] Word导出成功
- [ ] 导出的Word文件格式正确

### 5.2 性能测试

- [ ] 首字响应时间 < 5秒
- [ ] 完整生成时间 < 60秒
- [ ] 流式输出流畅，无卡顿
- [ ] Word导出时间 < 1秒

### 5.3 兼容性测试

- [ ] Chrome浏览器
- [ ] Edge浏览器
- [ ] Firefox浏览器
- [ ] 移动端浏览器（响应式布局）

---

## 六、启动方式说明

⚠️ **重要**：必须通过自定义 `server.ts` 启动开发服务器，否则API路由会被错误代理。

```bash
# ✅ 正确方式（使用server.ts）
npx tsx watch src/server.ts

# ❌ 错误方式（直接使用next dev，不会应用server.ts的代理配置）
npx next dev --port 3000
```
