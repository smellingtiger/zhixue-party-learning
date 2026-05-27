'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { floodCourseData } from '@/app/ai-course/flood-course-data';
import { typhoonCommandCourseData } from '@/app/ai-course/typhoon-command-course-data';
import { earthquakeCommandCourseData } from '@/app/ai-course/earthquake-command-course-data';
import { forestFireCommandCourseData } from '@/app/ai-course/forest-fire-command-course-data';
import { coldWaveCommandCourseData } from '@/app/ai-course/cold-wave-command-course-data';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

export default function CommandCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disaster = searchParams.get('disaster') || 'flood';
  const course = disaster === 'typhoon' ? typhoonCommandCourseData 
    : disaster === 'earthquake' ? earthquakeCommandCourseData 
    : disaster === 'forest-fire' ? forestFireCommandCourseData
    : disaster === 'cold-wave' ? coldWaveCommandCourseData
    : floodCourseData;
  const courseId = disaster === 'typhoon' ? 11 
    : disaster === 'earthquake' ? 12 
    : disaster === 'forest-fire' ? 14
    : disaster === 'cold-wave' ? 16
    : 8;
  const [isFavorited, setIsFavorited] = useState(false);

  const handleStartLearn = (chapterIdx: number) => {
    localStorage.setItem('current_ai_course', JSON.stringify(course));
    router.push(`/library/course-learn/${courseId}?chapter=${chapterIdx}`);
  };

  const handleStartFullCourse = () => {
    localStorage.setItem('current_ai_course', JSON.stringify(course));
    router.push(`/library/course-learn/${courseId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
      {/* 返回按钮 */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.push('/safety')}
          className="gap-2 border-2 border-black font-bold"
          style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回安全应急培训
        </Button>
      </div>

      {/* 课程简介卡片 */}
      <div className="border-2 border-black bg-white p-6 relative mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
          课程简介
        </div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="font-black text-2xl md:text-3xl text-black">{course.courseName}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" className={`border-2 font-bold ${isFavorited ? 'border-amber-400 bg-amber-400 text-black' : 'border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-black'}`} style={{ borderRadius: '0' }} onClick={() => setIsFavorited(!isFavorited)}>
              <Star className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
          </div>
        </div>

        {/* 4个属性标签 */}
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: '课程类型', value: course.courseType, color: 'bg-purple-500', icon: '📋' },
            { label: '总学时', value: `${course.totalHours}学时`, color: 'bg-amber-400', icon: '⏱' },
            { label: '难度等级', value: course.difficulty, color: 'bg-pink-500', icon: '📊' },
            { label: '章节数', value: `${course.chapters.length}章`, color: 'bg-emerald-500', icon: '📑' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} border-2 border-black flex items-center gap-2 px-4 py-2 text-white`}
              style={{ boxShadow: '3px 3px 0 0 #000' }}
            >
              <span className="text-base">{stat.icon}</span>
              <span className="text-sm font-black">{stat.value}</span>
              <span className="text-[10px] font-bold opacity-75 ml-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">{course.description}</p>

        <div className="mt-4 pt-4 border-t-2 border-black">
          <div className="text-sm font-bold text-black mb-2">学习目标</div>
          <ul className="space-y-1.5">
            {course.learningObjectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span className="font-bold">目标受众：</span>
            <span>{course.targetAudience}</span>
          </div>
        </div>
      </div>

      {/* 课程章节列表 */}
      <div className="border-2 border-black bg-white p-6 relative mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
          课程章节
        </div>
        <div className="flex items-center justify-between mb-5 mt-2">
          <h3 className="font-black text-xl text-black">
            共{course.chapters.length}章
          </h3>
        </div>
        <div className="space-y-3">
          {course.chapters.map((chapter, idx) => (
            <div key={chapter.id} className="p-4 border-2 border-black bg-white relative" style={{ boxShadow: '3px 3px 0 0 #000' }}>
              <div className="flex items-center gap-4">
                {/* 彩色封面块 */}
                <div className="relative flex-shrink-0">
                  <div className={`w-14 h-14 flex items-center justify-center border-2 border-black font-black text-2xl text-white ${
                    idx % 5 === 0 ? 'bg-red-500' : idx % 5 === 1 ? 'bg-purple-600' : idx % 5 === 2 ? 'bg-amber-400 text-black' : idx % 5 === 3 ? 'bg-emerald-500' : 'bg-pink-500'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black text-base">{chapter.title}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs bg-gray-100 border border-black px-2 py-0.5 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {chapter.duration}
                    </span>
                    <span className={`text-xs px-2 py-0.5 font-bold border border-black ${
                      chapter.type === 'video' ? 'bg-red-100' :
                      chapter.type === 'mixed' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {chapter.type === 'video' ? '🎬 视频课' : chapter.type === 'mixed' ? '📑 图文课' : '📑 图文课'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-amber-400 text-black font-bold border-2 border-black hover:bg-amber-500" style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }} onClick={() => handleStartLearn(idx)}>
                    <Play className="h-4 w-4 mr-1" />
                    学习
                  </Button>
                </div>
              </div>
              {/* 章节内容预览 */}
              {chapter.content && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">章节内容预览</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{
                    chapter.content
                      .replace(/##\s*第\s*\d+\s*章[·｜][^\n]+/g, '')
                      .replace(/---PAGE---/g, '')
                      .replace(/###\s+/g, '')
                      .replace(/\*\*/g, '')
                      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
                      .replace(/\n+/g, ' ')
                      .trim()
                      .substring(0, 200)
                  }</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="border-2 border-black bg-gray-900 p-5 flex items-center justify-between text-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="text-sm">
          课程：<span className="font-bold text-amber-400">{course.courseName}</span> ·
          共<span className="font-bold text-amber-400">{course.chapters.length}</span>章节 ·
          <span className="font-bold text-amber-400">{course.totalHours}</span>学时
        </div>
        <div className="flex gap-3">
          <Button size="lg" className="bg-green-500 text-white font-bold border-2 border-black hover:bg-green-600" style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }} onClick={handleStartFullCourse}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            开始学习
          </Button>
        </div>
      </div>
    </div>
  );
}
