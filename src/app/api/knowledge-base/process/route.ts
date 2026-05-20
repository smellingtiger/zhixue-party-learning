import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

export const dynamic = 'force-dynamic';
export const maxDuration = 600;

const UPLOAD_DIR = 'E:\\社院课程stt\\uploads';
const FUNASR_OUTPUT_DIR = 'E:\\社院课程stt\\output_funasr';

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

const LLM_TIMEOUT_MS = 180000;

async function callLLM(content: string, requestHeaders: Headers, onProgress?: (chunk: string) => void): Promise<string> {
  try {
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(requestHeaders);
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: OUTLINE_PROMPT },
      { role: 'user' as const, content: `请对以下党课转写文本进行智能分段和大纲提炼：\n\n${content}` },
    ];

    let fullResponse = '';
    const stream = client.stream(messages, {
      temperature: 0.3,
      model: 'doubao-seed-2-0-pro-260215',
    });

    const streamPromise = (async () => {
      for await (const chunk of stream) {
        if (chunk.content) {
          const contentText = typeof chunk.content === 'string' ? chunk.content : '';
          fullResponse += contentText;
          if (onProgress) {
            onProgress(contentText);
          }
        }
      }
      return fullResponse;
    })();

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('LLM调用超时（超过3分钟）')), LLM_TIMEOUT_MS);
    });

    return await Promise.race([streamPromise, timeoutPromise]);
  } catch (error) {
    console.error('LLM调用失败:', error);
    throw new Error(`LLM调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

function extractJsonFromResponse(response: string): any {
  try {
    return JSON.parse(response);
  } catch {
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
      }
    }

    const firstBracket = response.indexOf('[');
    const lastBracket = response.lastIndexOf(']');
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      try {
        return JSON.parse(response.slice(firstBracket, lastBracket + 1));
      } catch {
      }
    }
  }

  return null;
}

function checkFFmpegAvailable(): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function extractAudioFromVideo(videoPath: string, audioPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!checkFFmpegAvailable()) {
      console.error('FFmpeg未安装或不在系统PATH中');
      resolve(false);
      return;
    }
    
    try {
      console.log(`正在从视频提取音频: ${videoPath}`);
      execSync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -y "${audioPath}"`, {
        stdio: 'pipe',
        timeout: 300000
      });
      
      if (fs.existsSync(audioPath)) {
        console.log(`音频提取成功: ${audioPath}`);
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.error('音频提取失败:', error);
      resolve(false);
    }
  });
}

async function transcribeWithFunASR(audioPath: string, outputJsonPath: string, onProgress?: (percent: number, message: string) => void): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      console.log(`开始FUNASR转写: ${audioPath}`);
      
      const funasrServerUrl = process.env.FUNASR_SERVER_URL || 'http://localhost:10095';
      
      if (onProgress) onProgress(10, '正在连接FUNASR服务...');
      
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(audioPath);
      const fileName = path.basename(audioPath);
      
      const blob = new Blob([fileBuffer]);
      formData.append('audio', blob, fileName);
      formData.append('output_dir', FUNASR_OUTPUT_DIR);
      
      if (onProgress) onProgress(20, '正在上传音频文件...');
      
      const response = await fetch(`${funasrServerUrl}/api/v1/transcription`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`FUNASR服务返回错误: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (onProgress) onProgress(80, '正在保存转写结果...');
      
      fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2), 'utf-8');
      
      if (onProgress) onProgress(100, '转写完成');
      
      resolve(true);
    } catch (error) {
      console.error('FUNASR转写失败:', error);
      
      const pythonScriptPath = path.join(process.cwd(), 'knowledge-server', 'funasr_transcribe.py');
      
      if (fs.existsSync(pythonScriptPath)) {
        try {
          if (onProgress) onProgress(10, '正在启动本地FUNASR转写...');
          
          const process = spawn('python', [
            pythonScriptPath,
            audioPath,
            outputJsonPath
          ]);
          
          let stdout = '';
          let stderr = '';
          
          process.stdout.on('data', (data) => {
            stdout += data.toString();
            const progressMatch = data.toString().match(/进度[:：]\s*(\d+)%/);
            if (progressMatch && onProgress) {
              const percent = parseInt(progressMatch[1]);
              onProgress(percent, `转写中... ${percent}%`);
            }
          });
          
          process.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error('FUNASR stderr:', data.toString());
          });
          
          const exitCode = await new Promise<number>((resolve) => {
            process.on('close', (code) => resolve(code || 0));
          });
          
          if (exitCode === 0 && fs.existsSync(outputJsonPath)) {
            if (onProgress) onProgress(100, '转写完成');
            resolve(true);
          } else {
            console.error('Python脚本执行失败:', stderr);
            resolve(false);
          }
        } catch (pythonError) {
          console.error('Python脚本执行异常:', pythonError);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }
  });
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

        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        if (!fs.existsSync(FUNASR_OUTPUT_DIR)) {
          fs.mkdirSync(FUNASR_OUTPUT_DIR, { recursive: true });
        }

        const baseName = fileName.replace(/\.[^.]+$/, '');
        let finalPath = path.join(UPLOAD_DIR, fileName);
        let counter = 1;
        while (fs.existsSync(finalPath)) {
          finalPath = path.join(UPLOAD_DIR, `${baseName}_${counter}${ext}`);
          counter++;
        }

        send({ step: 'upload', status: 'processing', message: '正在上传文件...', progress: 5 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(finalPath, buffer);

        const fileSizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
          : `${(file.size / 1024).toFixed(1)}KB`;

        send({ step: 'upload', status: 'done', message: `上传成功（${fileSizeStr}）`, progress: 15 });

        let audioPath = finalPath;
        
        if (isVideo) {
          send({ step: 'transcribe', status: 'processing', message: '正在从视频中提取音频...', progress: 20 });
          
          const audioExtractPath = path.join(UPLOAD_DIR, `${baseName}.mp3`);
          const extractSuccess = await extractAudioFromVideo(finalPath, audioExtractPath);
          
          if (!extractSuccess) {
            const ffmpegHelp = process.platform === 'win32' 
              ? '音频提取失败。请安装FFmpeg：1) 访问 https://ffmpeg.org/download.html 2) 下载Windows版本 3) 解压并将bin目录添加到系统PATH环境变量'
              : '音频提取失败，请安装FFmpeg (sudo apt install ffmpeg 或 brew install ffmpeg)';
            
            send({
              step: 'transcribe',
              status: 'error',
              message: ffmpegHelp,
              progress: 0,
            });
            controller.close();
            return;
          }
          
          audioPath = audioExtractPath;
          send({ step: 'transcribe', status: 'done', message: '音频提取成功', progress: 30 });
        }

        send({ step: 'transcribe', status: 'processing', message: '正在进行语音转写...', progress: 35 });

        const outputJsonPath = path.join(FUNASR_OUTPUT_DIR, `${baseName}.json`);
        
        let transcriptText = '';
        let transcriptData: any[] = [];
        
        if (fs.existsSync(outputJsonPath)) {
          send({ step: 'transcribe', status: 'processing', message: '发现已有转写结果，正在加载...', progress: 35 });
          
          const rawData = JSON.parse(fs.readFileSync(outputJsonPath, 'utf-8'));
          transcriptData = Array.isArray(rawData) ? rawData : (rawData.data || []);
          transcriptText = transcriptData.map((e: any) => e.content || e.text || '').filter(Boolean).join('');
          
          if (transcriptText) {
            send({ step: 'transcribe', status: 'done', message: '已加载转写文本', progress: 50 });
          }
        }
        
        if (!transcriptText) {
          const transcribeSuccess = await transcribeWithFunASR(audioPath, outputJsonPath, (percent, message) => {
            send({
              step: 'transcribe',
              status: 'processing',
              message: message,
              progress: 35 + (percent * 0.15),
            });
          });
          
          if (!transcribeSuccess || !fs.existsSync(outputJsonPath)) {
            send({
              step: 'transcribe',
              status: 'error',
              message: '语音转写失败，请检查FUNASR服务是否正常运行',
              progress: 0,
            });
            controller.close();
            return;
          }
          
          const rawData = JSON.parse(fs.readFileSync(outputJsonPath, 'utf-8'));
          transcriptData = Array.isArray(rawData) ? rawData : (rawData.data || []);
          transcriptText = transcriptData.map((e: any) => e.content || e.text || '').filter(Boolean).join('');
          
          if (!transcriptText) {
            send({
              step: 'transcribe',
              status: 'error',
              message: '转写结果为空，请检查音频文件',
              progress: 0,
            });
            controller.close();
            return;
          }
          
          send({ step: 'transcribe', status: 'done', message: `转写完成，共${transcriptData.length}段`, progress: 50 });
        }

        send({ step: 'segment', status: 'processing', message: '正在分析内容结构...', progress: 55 });

        const chunks: string[] = [];
        const maxChunkSize = 6000;
        
        let currentChunk = '';
        for (const segment of transcriptData) {
          const content = segment.content || segment.text || '';
          if (!content) continue;
          
          if (currentChunk.length + content.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = '';
          }
          currentChunk += content + ' ';
        }
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }

        send({ step: 'segment', status: 'done', message: `内容分析完成，共${chunks.length}个段落`, progress: 60 });

        send({ step: 'outline', status: 'processing', message: '正在调用AI提炼大纲...', progress: 65 });

        const allOutlines: any[] = [];
        let currentProgress = 65;
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          send({
            step: 'outline',
            status: 'processing',
            message: `正在处理第${i + 1}/${chunks.length}段...`,
            progress: currentProgress + (i / chunks.length) * 25,
          });
          
          const llmResponse = await callLLM(chunk, request.headers);
          const outlineData = extractJsonFromResponse(llmResponse);
          
          if (outlineData && Array.isArray(outlineData)) {
            allOutlines.push(...outlineData);
          }
        }

        if (allOutlines.length === 0) {
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
          message: `AI大纲提炼完成，共${allOutlines.length}个要点`,
          progress: 95,
        });

        const result = {
          fileName: fileName,
          fileSize: fileSizeStr,
          segments: allOutlines.length,
          transcriptData: transcriptData,
          outline: allOutlines.map((item: any) => ({
            title: item.title || '未命名',
            description: item.description || '',
            startTime: item.startTime,
            endTime: item.endTime,
            keyPoints: item.keyPoints || [],
            content: item.content || '',
          })),
        };

        send({
          step: 'complete',
          status: 'done',
          message: '全部处理完成！',
          progress: 100,
          result: result,
        });

        controller.close();
      } catch (error) {
        console.error('处理出错:', error);
        send({ step: 'error', status: 'error', message: `处理出错：${error instanceof Error ? error.message : '未知错误'}`, progress: 0 });
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
