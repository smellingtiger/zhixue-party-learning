'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, ChevronRight, Clock, BookOpen, Sparkles, Upload, Film, Music, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessStep {
  step: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  message: string;
  progress?: number;
  outline?: any[];
  outlineItem?: any;
}

interface KnowledgeProcessProps {
  onComplete?: () => void;
}

const stepLabels: Record<string, string> = {
  upload: '上传文件',
  transcribe: '语音转写',
  segment: '智能分段',
  outline: 'AI提炼大纲',
  complete: '处理完成',
  error: '处理出错',
};

const stepIcons: Record<string, React.ReactNode> = {
  upload: <Upload className="h-4 w-4" />,
  transcribe: <Music className="h-4 w-4" />,
  segment: <BookOpen className="h-4 w-4" />,
  outline: <Sparkles className="h-4 w-4" />,
  complete: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
};

export function KnowledgeProcess({ onComplete }: KnowledgeProcessProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [steps]);

  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv'].includes(ext);
    const isAudio = ['mp3', 'wav', 'aac', 'ogg', 'wma', 'm4a'].includes(ext);

    if (!isVideo && !isAudio) {
      alert('仅支持视频文件（mp4/avi/mov/mkv）和音频文件（mp3/wav/aac）');
      return;
    }

    setUploadFile(file);
    setResult(null);
    setShowResult(false);
    setSteps([]);
    setProgress(0);
    setCurrentStepIndex(0);
  };

  const handleProcess = async () => {
    if (!uploadFile) return;

    setProcessing(true);
    setSteps([]);
    setProgress(0);
    setResult(null);
    setShowResult(false);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const initialStep: ProcessStep = { step: 'upload', status: 'processing', message: '正在上传文件...', progress: 5 };
      setSteps([initialStep]);
      setCurrentStepIndex(0);

      const res = await fetch('/api/knowledge-base/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        setSteps([{ step: 'upload', status: 'error', message: error.error || '上传失败', progress: 0 }]);
        setProcessing(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setSteps([{ step: 'error', status: 'error', message: '无法读取响应流', progress: 0 }]);
        setProcessing(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let stepOrder: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              setSteps(prev => {
                const existing = prev.findIndex(s => s.step === data.step && s.status !== 'done');
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = data;
                  return updated;
                }
                
                if (data.status === 'done') {
                  const doneIndex = prev.findIndex(s => s.step === data.step && s.status === 'processing');
                  if (doneIndex >= 0) {
                    const updated = [...prev];
                    updated[doneIndex] = data;
                    return updated;
                  }
                }
                
                return [...prev, data];
              });

              if (data.progress !== undefined) {
                setProgress(data.progress);
              }

              if (data.status === 'processing' && !stepOrder.includes(data.step)) {
                stepOrder.push(data.step);
                setCurrentStepIndex(stepOrder.length - 1);
              }

              if (data.step === 'complete' && data.result) {
                setResult(data.result);
                setShowResult(true);
              }

              if (data.step === 'error') {
                setProcessing(false);
              }
            } catch (err) {
              console.error('解析数据失败:', err);
            }
          }
        }
      }

      setProcessing(false);
      onComplete?.();
    } catch (err) {
      console.error('处理失败:', err);
      setSteps(prev => [...prev.filter(s => s.step !== 'error'), {
        step: 'error', status: 'error', message: '处理过程出错', progress: 0
      }]);
      setProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return Film;
    return Music;
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
          }}
          onClick={() => !processing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.avi,.mov,.mkv,.wmv,.flv,.mp3,.wav,.aac,.ogg,.wma,.m4a"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
          {uploadFile ? (
            <div className="flex items-center justify-center gap-3">
              {React.createElement(getFileIcon(uploadFile.name), { className: 'h-8 w-8 text-red-500 flex-shrink-0' })}
              <div className="text-left min-w-0">
                <p className="font-medium text-sm truncate">{uploadFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadFile.size / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>
              {!processing && (
                <button
                  className="text-xs text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null); setResult(null); setShowResult(false); setSteps([]); }}
                >
                  移除
                </button>
              )}
            </div>
          ) : (
            <div>
              <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">拖拽课程视频/音频到此处，或点击选择文件</p>
              <p className="text-xs text-gray-400 mt-1">支持 mp4/avi/mov/mkv/mp3/wav 等格式</p>
            </div>
          )}
        </div>

        {uploadFile && !processing && (
          <div className="flex justify-end mt-3">
            <Button onClick={handleProcess} className="bg-red-600 hover:bg-red-700">
              <Sparkles className="h-4 w-4 mr-2" />
              上传并开始AI处理
            </Button>
          </div>
        )}
      </div>

      {(processing || steps.length > 0) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">处理进度</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {steps.length > 0 && (
        <div className="space-y-3 mb-4">
          <ScrollArea className="h-48" ref={stepsContainerRef}>
            <div className="space-y-3 pr-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  {step.status === 'processing' && (
                    <div className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5 animate-spin">
                      <Loader2 className="h-4 w-4" />
                    </div>
                  )}
                  {step.status === 'done' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {step.status === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={step.status === 'processing' ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {stepLabels[step.step] || step.step}
                      </span>
                      {stepIcons[step.step] && (
                        <span className="text-gray-400">
                          {stepIcons[step.step]}
                        </span>
                      )}
                    </div>
                    {step.message && (
                      <span className="text-gray-500 block text-xs mt-0.5">{step.message}</span>
                    )}
                    {step.outlineItem && step.step === 'outline' && (
                      <div className="mt-1 text-xs text-gray-400">
                        正在提炼：{step.outlineItem.title?.slice(0, 50) || '...'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {showResult && result && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                处理结果
              </h3>
              <Badge variant="secondary">{result.fileName}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-lg font-bold text-red-600">{result.segments || 0}</p>
                <p className="text-xs text-muted-foreground">分段数</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-lg font-bold text-blue-600">{result.outline?.length || 0}</p>
                <p className="text-xs text-muted-foreground">大纲要点</p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="text-lg font-bold text-green-600">{result.fileSize || '-'}</p>
                <p className="text-xs text-muted-foreground">文件大小</p>
              </div>
            </div>

            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-4">
                {result.outline?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-gray-100 hover:border-red-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        {item.title}
                      </span>
                      {item.startTime != null && item.endTime != null && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">{item.description}</p>
                    )}
                    {item.keyPoints && item.keyPoints.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.keyPoints.map((kp: string, ki: number) => (
                          <span key={ki} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            {kp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
