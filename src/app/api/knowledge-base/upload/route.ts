import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const UPLOAD_DIR = 'E:\\社院课程stt\\uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }

    const fileName = file.name;
    const ext = path.extname(fileName).toLowerCase();
    const isVideo = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'].includes(ext);
    const isAudio = ['.mp3', '.wav', '.aac', '.ogg', '.wma', '.m4a'].includes(ext);

    if (!isVideo && !isAudio) {
      return NextResponse.json(
        { error: '仅支持视频文件（mp4/avi/mov/mkv）和音频文件（mp3/wav/aac）' },
        { status: 400 }
      );
    }

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

    const fileSize = file.size;
    const fileSizeStr = fileSize > 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(1)}MB`
      : `${(fileSize / 1024).toFixed(1)}KB`;

    return NextResponse.json({
      success: true,
      fileName: path.basename(finalPath),
      filePath: finalPath,
      fileSize: fileSizeStr,
      fileType: isVideo ? 'video' : 'audio',
      message: `文件上传成功：${path.basename(finalPath)}（${fileSizeStr}）`,
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
  }
}