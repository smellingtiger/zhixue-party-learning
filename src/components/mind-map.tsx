'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { KnowledgeNode, LearningProgress } from '@/lib/types';
import { motion } from 'framer-motion';
import { ChevronRight, Play, BookOpen, FileText, Circle } from 'lucide-react';

interface MindMapProps {
  data: KnowledgeNode;
  progress?: LearningProgress[];
  onNodeClick?: (node: KnowledgeNode) => void;
  highlightedNodes?: string[];
}

interface TreeNode extends d3.HierarchyPointNode<KnowledgeNode> {
  x0?: number;
  y0?: number;
}

export function MindMap({ data, progress = [], onNodeClick, highlightedNodes = [] }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  // 响应式尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 获取节点状态
  const getNodeStatus = useCallback((nodeId: string) => {
    const prog = progress.find(p => p.nodeId === nodeId);
    if (prog) return prog.status;
    if (highlightedNodes.includes(nodeId)) return 'available';
    return 'locked';
  }, [progress, highlightedNodes]);

  // 渲染思维导图
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 80, right: 250, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 创建主容器
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 创建缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 创建树布局 - 水平方向
    const treeLayout = d3.tree<KnowledgeNode>()
      .size([innerHeight, innerWidth])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

    // 创建层级数据
    const root = d3.hierarchy(data, d => d.children);
    const treeData = treeLayout(root);

    // 计算节点尺寸
    const getNodeWidth = (level: number) => {
      if (level === 0) return 140;
      if (level === 1) return 130;
      return 120;
    };
    
    const getNodeHeight = (level: number) => {
      if (level === 0) return 60;
      if (level === 1) return 50;
      return 44;
    };

    // 绘制连接线（贝塞尔曲线）
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        const sourceX = (d.source as TreeNode).y;
        const sourceY = (d.source as TreeNode).x;
        const targetX = (d.target as TreeNode).y;
        const targetY = (d.target as TreeNode).x;
        const sourceNodeWidth = getNodeWidth((d.source.data as KnowledgeNode).level);
        
        return `M${sourceX + sourceNodeWidth},${sourceY}
                C${(sourceX + sourceNodeWidth + targetX) / 2},${sourceY}
                 ${(sourceX + sourceNodeWidth + targetX) / 2},${targetY}
                 ${targetX},${targetY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', d => {
        const sourceId = (d.source.data as KnowledgeNode).id;
        const targetId = (d.target.data as KnowledgeNode).id;
        const sourceStatus = getNodeStatus(sourceId);
        const targetStatus = getNodeStatus(targetId);
        if (sourceStatus === 'completed' && targetStatus !== 'locked') return '#22c55e';
        if (sourceStatus === 'completed' || targetStatus === 'available') return '#3b82f6';
        return '#e2e8f0';
      })
      .attr('stroke-width', 2.5)
      .attr('opacity', 0.7);

    // 绘制节点组
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => {
        const nodeHeight = getNodeHeight((d.data as KnowledgeNode).level);
        return `translate(${d.y},${d.x - nodeHeight / 2})`;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const nodeData = d.data as KnowledgeNode;
        setSelectedNode(nodeData);
        onNodeClick?.(nodeData);
      });

    // 节点矩形背景
    nodes.append('rect')
      .attr('width', d => getNodeWidth((d.data as KnowledgeNode).level))
      .attr('height', d => getNodeHeight((d.data as KnowledgeNode).level))
      .attr('rx', d => (d.data as KnowledgeNode).level === 0 ? 12 : 8)
      .attr('fill', d => {
        const status = getNodeStatus((d.data as KnowledgeNode).id);
        const level = (d.data as KnowledgeNode).level;
        if (level === 0) return 'url(#gradient0)';
        if (level === 1) return 'url(#gradient1)';
        if (status === 'completed') return '#22c55e';
        if (status === 'available') return '#3b82f6';
        if (status === 'in_progress') return '#f59e0b';
        return '#475569'; // locked 状态使用深灰色
      })
      .attr('stroke', d => {
        const status = getNodeStatus((d.data as KnowledgeNode).id);
        const level = (d.data as KnowledgeNode).level;
        // 所有节点都有边框
        if (level === 0) return 'rgba(255,255,255,0.3)';
        if (level === 1) return 'rgba(255,255,255,0.4)';
        if (status === 'available') return '#60a5fa';
        if (status === 'in_progress') return '#fbbf24';
        if (status === 'completed') return '#4ade80';
        return 'rgba(255,255,255,0.5)'; // locked 节点边框
      })
      .attr('stroke-width', 2)
      .attr('opacity', d => {
        const status = getNodeStatus((d.data as KnowledgeNode).id);
        return status === 'locked' ? 0.9 : 1;
      })
      .attr('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))');

    // 节点文字（带阴影确保可读性）
    nodes.append('text')
      .attr('x', d => getNodeWidth((d.data as KnowledgeNode).level) / 2)
      .attr('y', d => getNodeHeight((d.data as KnowledgeNode).level) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', d => {
        const level = (d.data as KnowledgeNode).level;
        return level === 0 ? '15px' : level === 1 ? '13px' : '12px';
      })
      .attr('font-weight', d => (d.data as KnowledgeNode).level <= 1 ? 'bold' : '500')
      .attr('fill', '#ffffff')
      .attr('style', 'text-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)')
      .each(function(d) {
        const nodeWidth = getNodeWidth((d.data as KnowledgeNode).level);
        const text = (d.data as KnowledgeNode).name;
        const fontSize = (d.data as KnowledgeNode).level === 0 ? 15 : (d.data as KnowledgeNode).level === 1 ? 13 : 12;
        const maxChars = Math.floor(nodeWidth / (fontSize * 0.6));
        
        // 文字换行处理
        if (text.length > maxChars) {
          const words = text.split('');
          let line = '';
          let lineNumber = 0;
          const lines = [];
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            if (testLine.length > maxChars) {
              lines.push(line);
              line = words[i];
              lineNumber++;
            } else {
              line = testLine;
            }
          }
          lines.push(line);
          
          d3.select(this).selectAll('tspan').remove();
          lines.slice(0, 2).forEach((l, i) => {
            d3.select(this).append('tspan')
              .attr('x', getNodeWidth((d.data as KnowledgeNode).level) / 2)
              .attr('dy', i === 0 ? '0.3em' : '1.2em')
              .text(l);
          });
        } else {
          d3.select(this).text(text);
        }
      });

    // 添加进度指示器
    nodes.filter(d => !!(d.data as KnowledgeNode).content)
      .append('circle')
      .attr('cx', d => getNodeWidth((d.data as KnowledgeNode).level) - 8)
      .attr('cy', 8)
      .attr('r', 6)
      .attr('fill', d => {
        const status = getNodeStatus((d.data as KnowledgeNode).id);
        if (status === 'completed') return '#ffffff';
        if (status === 'in_progress') return '#f59e0b';
        return 'rgba(255,255,255,0.3)';
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

  }, [data, dimensions, getNodeStatus, highlightedNodes, onNodeClick, progress]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden">
      {/* SVG容器 */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      >
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="gradient0" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* 选中节点详情面板 */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 border border-slate-200"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900">{selectedNode.name}</h3>
          </div>
          
          <div className="space-y-3">
            {/* 知识点 */}
            {selectedNode.keyPoints && selectedNode.keyPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  核心知识点
                </h4>
                <ul className="space-y-1">
                  {selectedNode.keyPoints.slice(0, 4).map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Circle className="w-1.5 h-1.5 fill-slate-400 text-slate-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* 内容详情 */}
            {selectedNode.content && (
              <div className="bg-slate-50 rounded-xl p-3">
                <h4 className="text-sm font-semibold text-slate-900">
                  {selectedNode.content.title}
                </h4>
                <p className="text-xs text-slate-500 mb-2">
                  {selectedNode.content.type === 'video' && `时长: ${selectedNode.content.duration}分钟`}
                </p>
                {selectedNode.content.summary && (
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedNode.content.summary}</p>
                )}
                <button className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" />
                  开始学习
                </button>
              </div>
            )}
            
            {/* 关联文档 */}
            {selectedNode.relatedDocuments && selectedNode.relatedDocuments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  关联阅读
                </h4>
                <ul className="space-y-1">
                  {selectedNode.relatedDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{doc.title}</span>
                      <span className="text-xs text-slate-400 ml-auto">({doc.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-sm transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-slate-400" />
            <span>未解锁</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-blue-500" />
            <span>可学习</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-amber-500" />
            <span>进行中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-green-500" />
            <span>已完成</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">点击节点查看详情 · 拖拽或滚轮缩放</p>
      </div>
    </div>
  );
}
