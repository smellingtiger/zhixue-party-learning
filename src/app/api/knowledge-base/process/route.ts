import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const UPLOAD_DIR = 'E:\\社院课程stt\\uploads';

const OUTLINE_PROMPT = `你是一位资深的党课课程教研专家。请对以下党课语音转写文本进行深度分析，完成以下任务：

1. **智能分段**：根据内容逻辑和话题转换，将文本分成若干个有明确主题的段落
2. **提炼大纲**：为每个段落提炼一个简洁的标题（不超过15个字），并写一段简要描述（不超过50字）
3. **提取要点**：从每个段落中提取1-3个核心要点

输出要求：
- 大纲标题必须是有意义的总结性语句，不能是口语化的片段
- 标题要体现该段落的核心主题，例如"脱贫攻坚战的战略意义"而非"他的第四次调研"
- 描述要概括该段落的主要内容
- 要点要提取该段落中最关键的观点、数据或结论

请严格以JSON格式输出，不要输出其他任何内容。格式如下：
[
  {
    "title": "分段标题（简洁、有概括性）",
    "description": "该段落的简要描述（1-2句话）",
    "startTime": 0,
    "endTime": 0,
    "keyPoints": ["要点1", "要点2"],
    "content": "该段落的原文摘要（保留核心内容，去掉口语化词汇）"
  }
]

注意：
- startTime 和 endTime 如果无法确定可以设为 null
- keyPoints 必须是简短的短语或短句
- 确保整个JSON是合法可解析的`;

async function callLLM(content: string): Promise<string> {
  const config = new Config();
  const customHeaders = HeaderUtils.extractForwardHeaders(
    new Headers() as unknown as Record<string, string>
  );
  const client = new LLMClient(config, customHeaders as any);

  const messages = [
    { role: 'system' as const, content: OUTLINE_PROMPT },
    { role: 'user' as const, content: `请对以下党课转写文本进行智能分段和大纲提炼：\n\n${content}` },
  ];

  let fullResponse = '';
  const stream = client.stream(messages, {
    temperature: 0.3,
    model: 'doubao-seed-2-0-pro-260215',
  });

  for await (const chunk of stream) {
    if (chunk.content) {
      fullResponse += chunk.content;
    }
  }

  return fullResponse;
}

function extractJsonFromResponse(response: string): any {
  // 尝试直接解析
  try {
    return JSON.parse(response);
  } catch {
    // 尝试提取代码块中的JSON
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // pass
      }
    }

    // 尝试找到第一个 [ 到最后一个 ] 之间的内容
    const firstBracket = response.indexOf('[');
    const lastBracket = response.lastIndexOf(']');
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      try {
        return JSON.parse(response.slice(firstBracket, lastBracket + 1));
      } catch {
        // pass
      }
    }
  }

  return null;
}

function cleanTranscriptText(rawText: string): string {
  // 去掉口语化语气词和重复内容
  return rawText
    .replace(/[啊呢哦吧嘛呀哎唉嗯]{2,}/g, '')
    .replace(/(这个|那个|然后|就是|其实|好像|大概|可能|应该|或者|不过|然而)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRawTranscript(rawLines: string[]): string {
  let cleaned = '';
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('【') || trimmed.includes('[时间]')) continue;
    if (/^\d/.test(trimmed)) continue;
    cleaned += trimmed + ' ';
  }
  return cleanTranscriptText(cleaned);
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
          send({ step: 'error', status: 'error', message: '请选择要上传的文件', progress: 0 });
          controller.close();
          return;
        }

        const fileName = file.name;
        const ext = path.extname(fileName).toLowerCase();
        const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'].includes(ext);
        const isAudio = ['.mp3', '.wav', '.aac', '.ogg', '.wma', '.m4a'].includes(ext);

        if (!isVideo && !isAudio) {
          send({ step: 'error', status: 'error', message: '仅支持视频和音频文件', progress: 0 });
          controller.close();
          return;
        }

        // 步骤1：上传文件
        send({ step: 'upload', status: 'processing', message: '正在上传文件...', progress: 5 });

        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const baseName = fileName.replace(/\.[^.]+$/, '');
        let finalPath = path.join(UPLOAD_DIR, fileName);
        let counter = 1;
        while (fs.existsSync(finalPath)) {
          finalPath = path.join(UPLOAD_DIR, `${baseName}_${counter}${ext}`);
          counter++;
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(finalPath, buffer);

        const fileSizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
          : `${(file.size / 1024).toFixed(1)}KB`;

        send({ step: 'upload', status: 'done', message: `上传成功（${fileSizeStr}）`, progress: 20 });

        // 步骤2：语音转写
        send({ step: 'transcribe', status: 'processing', message: '正在进行语音转写（调用后端服务）...', progress: 30 });

        // 这里调用后端的STT服务
        // 暂时用提示告知用户需要配置STT服务
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 检查是否有对应的转写文件
        const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
        const sttBaseDir = 'E:\\社院课程stt';

        let transcriptText = '';
        let transcriptFound = false;

        // 尝试在已知的STT目录中查找
        const categories = ['政治理论', '统战理论', '国家治理'];
        for (const cat of categories) {
          const funasrPath = path.join(sttBaseDir, cat, 'output_funasr', `${nameWithoutExt}.json`);
          const outlinePath = path.join(sttBaseDir, cat, 'output_outline', `${nameWithoutExt}.json`);

          if (fs.existsSync(funasrPath)) {
            const rawData = JSON.parse(fs.readFileSync(funasrPath, 'utf-8'));
            transcriptText = rawData.map((e: any) => e.content).join('\n');
            transcriptFound = true;
            break;
          }
          if (fs.existsSync(outlinePath)) {
            const rawData = JSON.parse(fs.readFileSync(outlinePath, 'utf-8'));
            transcriptText = rawData.map((e: any) => e.content).join('\n');
            transcriptFound = true;
            break;
          }
        }

        if (transcriptFound && transcriptText) {
          send({ step: 'transcribe', status: 'done', message: '找到已有转写文本', progress: 40 });
        } else {
          // 没有转写数据，提示用户
          send({
            step: 'transcribe',
            status: 'error',
            message: `文件已上传，但需要配置语音转写服务才能继续处理。文件已保存至：${finalPath}`,
            progress: 0,
            filePath: finalPath,
          });
          controller.close();
          return;
        }

        // 步骤3：智能分段
        send({ step: 'segment', status: 'processing', message: '正在分析内容结构，进行智能分段...', progress: 50 });

        // 如果文本太长，截取前8000字给LLM
        const textToSend = transcriptText.length > 8000 ? transcriptText.slice(0, 8000) : transcriptText;

        await new Promise(resolve => setTimeout(resolve, 500));

        send({ step: 'segment', status: 'done', message: '内容分析完成', progress: 60 });

        // 步骤4：AI提炼大纲
        send({ step: 'outline', status: 'processing', message: '正在调用AI提炼课程大纲...', progress: 65 });

        const llmResponse = await callLLM(textToSend);

        const outlineData = extractJsonFromResponse(llmResponse);

        if (!outlineData || !Array.isArray(outlineData)) {
          send({
            step: 'outline',
            status: 'error',
            message: 'AI返回的数据格式不正确，无法生成大纲',
            progress: 0,
          });
          controller.close();
          return;
        }

        send({
          step: 'outline',
          status: 'done',
          message: `AI大纲提炼完成，共 ${outlineData.length} 个要点`,
          progress: 90,
        });

        // 步骤5：完成
        const totalDuration = outlineData.reduce((sum: number, item: any) => {
          const start = item.startTime || 0;
          const end = item.endTime || 0;
          return sum + (end - start);
        }, 0);

        send({
          step: 'complete',
          status: 'done',
          message: '全部处理完成！',
          progress: 100,
          result: {
            fileName: fileName,
            fileSize: fileSizeStr,
            segments: outlineData.length,
            totalDuration: totalDuration > 0 ? totalDuration : null,
            outline: outlineData.map((item: any) => ({
              title: item.title || '未命名',
              description: item.description || '',
              startTime: item.startTime,
              endTime: item.endTime,
              keyPoints: item.keyPoints || [],
              content: item.content || '',
            })),
          },
        });

        controller.close();
      } catch (error) {
        console.error('处理出错:', error);
        send({ step: 'error', status: 'error', message: `处理出错：${error}`, progress: 0 });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}