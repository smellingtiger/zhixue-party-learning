'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { KnowledgeNode, LearningProgress } from '@/lib/types';
import { getNodeById } from '@/lib/knowledge-graph';
import { motion } from 'framer-motion';
import { Play, BookOpen, Circle, Target, CheckCircle2 } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';

interface MindMapProps {
  data: KnowledgeNode;
  progress?: LearningProgress[];
  onNodeClick?: (node: KnowledgeNode) => void;
  highlightedNodes?: string[];
  interactive?: boolean;
  lockedByDifficultyNodes?: Set<string>;
}

interface TreeNode extends d3.HierarchyPointNode<KnowledgeNode> {
  x0?: number;
  y0?: number;
}

// 计算节点的状态（根据课程完成情况）
function calculateNodeStatus(
  node: KnowledgeNode,
  progress: LearningProgress[],
  highlightedNodes: string[]
): 'locked' | 'available' | 'in_progress' | 'completed' {
  // 如果是叶子节点（有课程或content）
  const hasCourses = node.courses && node.courses.length > 0;
  const hasContent = !!node.content;
  
  if (hasCourses || hasContent) {
    const nodeProgress = progress.find(p => p.nodeId === node.id);
    const allCourseIds = hasCourses ? node.courses!.map(c => c.id) : [node.id];
    const completedCourses = nodeProgress?.completedCourses || [];
    
    console.log(`[calculateNodeStatus] 节点: ${node.id}, progress:`, nodeProgress, `completedCourses:`, completedCourses, `allCourseIds:`, allCourseIds);
    
    // 如果所有课程都完成了
    if (allCourseIds.length > 0 && allCourseIds.every(id => completedCourses.includes(id))) {
      console.log(`[calculateNodeStatus] ${node.id} → completed (所有课程完成)`);
      return 'completed';
    }
    
    // 如果有部分课程完成了
    if (completedCourses.length > 0) {
      console.log(`[calculateNodeStatus] ${node.id} → in_progress (部分完成)`);
      return 'in_progress';
    }
    
    // 如果节点在进度中但状态是completed（向后兼容）
    if (nodeProgress?.status === 'completed') {
      console.log(`[calculateNodeStatus] ${node.id} → completed (向后兼容)`);
      return 'completed';
    }
    
    // 如果节点在进度中且状态是in_progress
    if (nodeProgress?.status === 'in_progress') {
      console.log(`[calculateNodeStatus] ${node.id} → in_progress (向后兼容)`);
      return 'in_progress';
    }
    
    // 检查是否可学习（高亮节点）
    if (highlightedNodes.includes(node.id)) {
      console.log(`[calculateNodeStatus] ${node.id} → available (高亮节点)`);
      return 'available';
    }
    
    console.log(`[calculateNodeStatus] ${node.id} → locked`);
    return 'locked';
  }
  
  // 如果是父节点，根据子节点状态计算
  if (node.children && node.children.length > 0) {
    const childrenStatuses = node.children.map(child => 
      calculateNodeStatus(child, progress, highlightedNodes)
    );
    
    const allCompleted = childrenStatuses.every(s => s === 'completed');
    const hasInProgress = childrenStatuses.some(s => s === 'in_progress');
    const hasAvailable = childrenStatuses.some(s => s === 'available');
    
    if (allCompleted && childrenStatuses.length > 0) {
      return 'completed';
    }
    if (hasInProgress) {
      return 'in_progress';
    }
    if (hasAvailable) {
      return 'available';
    }
    
    return 'locked';
  }
  
  // 默认状态
  if (highlightedNodes.includes(node.id)) {
    return 'available';
  }
  return 'locked';
}

function attachCoursesAsChildren(root: KnowledgeNode): KnowledgeNode {
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map(child => {
      if (child.children && child.children.length > 0) {
        return attachCoursesAsChildren(child);
      }
      if (child.courses && child.courses.length > 0) {
        const courseNodes: KnowledgeNode[] = child.courses.map(course => ({
          id: `course-${course.id}`,
          name: course.title,
          level: child.level + 1,
          isCourseNode: true,
          courseData: course,
        }));
        return {
          ...child,
          children: courseNodes,
        };
      }
      return child;
    }),
  };
}

/** 递归剪枝：移除难度锁定节点及其所有子节点，若父节点无剩余子节点则也一并移除 */
function pruneLockedNodes(node: KnowledgeNode, lockedSet: Set<string>): KnowledgeNode | null {
  // 当前节点被锁定 → 剪掉整个子树
  if (lockedSet.has(node.id)) return null;

  // 叶子节点：未被锁定则保留
  if (!node.children || node.children.length === 0) return node;

  // 父节点：递归剪枝所有子节点
  const prunedChildren = node.children
    .map(child => pruneLockedNodes(child, lockedSet))
    .filter((child): child is KnowledgeNode => child !== null);

  // 所有子节点都被剪掉 → 父节点也隐藏
  if (prunedChildren.length === 0) return null;

  return {
    ...node,
    children: prunedChildren,
  };
}

export function MindMap({ data, progress = [], onNodeClick, highlightedNodes = [], interactive = true, lockedByDifficultyNodes = new Set() }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const router = useNextRouter();

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

  // 获取节点状态（使用新的计算逻辑）
  const getNodeStatus = useCallback((nodeId: string) => {
    const node = getNodeById(nodeId, data);
    if (!node) return 'locked';
    return calculateNodeStatus(node, progress, highlightedNodes);
  }, [data, progress, highlightedNodes]);

  // 判断某个课程是否已完成
  const isCourseCompleted = useCallback((nodeId: string, courseId: string) => {
    const nodeProgress = progress.find(p => p.nodeId === nodeId);
    return nodeProgress?.completedCourses?.includes(courseId) || false;
  }, [progress]);

  // 渲染思维导图
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const displayData = attachCoursesAsChildren(data);
    const prunedData = lockedByDifficultyNodes.size > 0
      ? pruneLockedNodes(displayData, lockedByDifficultyNodes)
      : displayData;
    
    // 整棵树都被剪掉了，无需渲染
    if (!prunedData) return;

    const { width, height } = dimensions;
    const margin = { top: 80, right: 250, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 添加全尺寸透明背景rect，确保图谱空白区域也能响应拖拽/缩放
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'grab');

    // 创建主容器 - zoom 层在外，margin 层在内
    const zoomGroup = svg.append('g');
    const g = zoomGroup.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 添加缩放和平移交互（绑定在SVG上，节点和背景的事件都会冒泡到SVG触发zoom）
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('start', () => {
        svg.style('cursor', 'grabbing');
      })
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
      })
      .on('end', () => {
        svg.style('cursor', 'grab');
      });

    svg.call(zoom)
      .on('dblclick.zoom', null);

    const root = d3.hierarchy(prunedData, d => d.children);

    const LEVEL_GAP = 70;
    const SIBLING_GAP = 12;
    const COURSE_SIBLING_GAP = 6;

    // 文字宽度测量
    const textMeasureCanvas = document.createElement('canvas');
    const textMeasureCtx = textMeasureCanvas.getContext('2d')!;
    
    const measureTextWidth = (text: string, fontSize: number, fontWeight: string = '400') => {
      textMeasureCtx.font = `${fontWeight} ${fontSize}px sans-serif`;
      return textMeasureCtx.measureText(text).width;
    };

    // 计算节点尺寸
    const getNodeWidth = (node: KnowledgeNode) => {
      if (node.isCourseNode) {
        const fontSize = 12;
        const textWidth = measureTextWidth(node.name, fontSize, '400');
        const iconSpace = 20;
        const padding = 16;
        return Math.max(100, Math.min(textWidth + iconSpace + padding, 320));
      }
      if (node.level === 0) return 140;
      if (node.level === 1) return 130;
      return 120;
    };
    
    const getNodeHeight = (node: KnowledgeNode) => {
      if (node.isCourseNode) {
        const nodeWidth = getNodeWidth(node);
        const fontSize = 12;
        const textWidth = measureTextWidth(node.name, fontSize, '400');
        const iconSpace = 20;
        const availableTextWidth = Math.max(1, nodeWidth - iconSpace - 16);
        const linesNeeded = Math.ceil(textWidth / availableTextWidth);
        const lineHeight = 16;
        return 10 + linesNeeded * lineHeight + 10;
      }
      if (node.level === 0) return 60;
      if (node.level === 1) return 50;
      return 44;
    };

    // 步骤1: 自底向上计算每个节点的子树高度区间
    interface SubtreeBounds { top: number; bottom: number; height: number; }
    const subtreeMap = new Map<string, SubtreeBounds>();

    function calcSubtreeBounds(node: d3.HierarchyNode<KnowledgeNode>): SubtreeBounds {
      const nodeData = node.data as KnowledgeNode;
      const nh = getNodeHeight(nodeData);

      if (!node.children || node.children.length === 0) {
        const half = nh / 2;
        const b = { top: -half, bottom: half, height: nh };
        subtreeMap.set(nodeData.id, b);
        return b;
      }

      const isCourseParent = !!(node.children[0].data as KnowledgeNode).isCourseNode;
      const gap = isCourseParent ? COURSE_SIBLING_GAP : SIBLING_GAP;

      let accumY = 0;

      node.children.forEach((child) => {
        const cb = calcSubtreeBounds(child);
        accumY += cb.bottom - cb.top + gap;
      });

      accumY -= gap;

      const selfHalf = nh / 2;
      const childrenHalf = accumY / 2;
      const result: SubtreeBounds = {
        top: Math.min(-selfHalf, -childrenHalf),
        bottom: Math.max(selfHalf, childrenHalf),
        height: accumY,
      };
      subtreeMap.set(nodeData.id, result);
      return result;
    }

    calcSubtreeBounds(root);

    // 步骤2: 自顶向下分配坐标 (y = 垂直居中, x = 水平左边缘)
    function assignLayout(
      node: d3.HierarchyNode<KnowledgeNode>,
      x: number,
      yCenter: number
    ) {
      node.y = x;
      node.x = yCenter;

      if (!node.children || node.children.length === 0) return;

      const nodeData = node.data as KnowledgeNode;
      const nodeW = getNodeWidth(nodeData);
      const isCourseParent = !!(node.children[0].data as KnowledgeNode).isCourseNode;
      const gap = isCourseParent ? COURSE_SIBLING_GAP : SIBLING_GAP;

      const sb = subtreeMap.get(nodeData.id)!;
      const totalH = sb.height;
      const startY = yCenter - totalH / 2;

      let cursorY = startY;
      node.children.forEach((child) => {
        const chData = child.data as KnowledgeNode;
        const cb = subtreeMap.get(chData.id)!;
        const childMid = cursorY + (cb.bottom - cb.top) / 2;
        assignLayout(child, x + nodeW + LEVEL_GAP, childMid);
        cursorY += cb.bottom - cb.top + gap;
      });
    }

    assignLayout(root, margin.left, innerHeight / 2 + margin.top);

    

    // 绘制连接线（优雅弧线）
    const CURVE_OFFSET = 30;

    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        const sourceX = (d.source as TreeNode).y;
        const sourceY = (d.source as TreeNode).x;
        const targetX = (d.target as TreeNode).y;
        const targetY = (d.target as TreeNode).x;
        const sourceNodeWidth = getNodeWidth(d.source.data as KnowledgeNode);
        const sx = sourceX + sourceNodeWidth;
        const sy = sourceY;
        const tx = targetX;
        const ty = targetY;
        const hOffset = Math.min(CURVE_OFFSET, (tx - sx) * 0.35);

        return `M${sx},${sy}
                C${sx + hOffset},${sy}
                 ${tx - hOffset},${ty}
                 ${tx},${ty}`;
      })
      .attr('fill', 'none')
      .attr('stroke', d => {
        const targetNode = d.target.data as KnowledgeNode;
        if (lockedByDifficultyNodes.has(targetNode.id)) return '#cbd5e1';
        if (targetNode.isCourseNode) {
          const courseId = targetNode.courseData?.id || '';
          const parentProgress = progress.find(p => p.nodeId === (d.target.parent?.data as KnowledgeNode)?.id);
          if (parentProgress?.completedCourses?.includes(courseId)) return '#22c55e';
          return '#93c5fd';
        }
        const sourceId = (d.source.data as KnowledgeNode).id;
        const targetId = targetNode.id;
        const sourceStatus = getNodeStatus(sourceId);
        const targetStatus = getNodeStatus(targetId);
        if (sourceStatus === 'completed' && targetStatus !== 'locked') return '#22c55e';
        if (sourceStatus === 'completed' || targetStatus === 'available') return '#3b82f6';
        return '#e2e8f0';
      })
      .attr('stroke-width', d => {
        const targetNode = d.target.data as KnowledgeNode;
        if (lockedByDifficultyNodes.has(targetNode.id)) return 1.5;
        if (targetNode.isCourseNode) return 1.5;
        return 2.5;
      })
      .attr('stroke-dasharray', d => {
        const targetNode = d.target.data as KnowledgeNode;
        if (lockedByDifficultyNodes.has(targetNode.id)) return '4,3';
        return 'none';
      })
      .attr('opacity', d => {
        const targetNode = d.target.data as KnowledgeNode;
        if (lockedByDifficultyNodes.has(targetNode.id)) return 0.35;
        return 0.7;
      });

    // 绘制节点组
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('pointer-events', 'all')
      .attr('transform', d => {
        const nodeHeight = getNodeHeight(d.data as KnowledgeNode);
        return `translate(${d.y!},${d.x! - nodeHeight / 2})`;
      })
      .style('cursor', 'pointer');

    nodes.on('click', (event, d) => {
      event.stopPropagation();
      const nodeData = d.data as KnowledgeNode;
      if (nodeData.isCourseNode && nodeData.courseData) {
        router.push(`/course/${nodeData.courseData.id}`);
        return;
      }
      setSelectedNode(nodeData);
      onNodeClick?.(nodeData);
    });

    // 节点矩形背景
    nodes.append('rect')
      .attr('width', d => getNodeWidth(d.data as KnowledgeNode))
      .attr('height', d => getNodeHeight(d.data as KnowledgeNode))
      .attr('rx', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return 6;
        return node.level === 0 ? 12 : 8;
      })
      .attr('fill', d => {
        const node = d.data as KnowledgeNode;
        // 难度锁定节点：灰色
        if (lockedByDifficultyNodes.has(node.id)) return '#e2e8f0';
        if (node.isCourseNode) {
          const courseId = node.courseData?.id || '';
          const parentProgress = progress.find(p => p.nodeId === (d.parent?.data as KnowledgeNode)?.id);
          if (parentProgress?.completedCourses?.includes(courseId)) return '#dcfce7';
          return '#f0f9ff';
        }
        const status = getNodeStatus(node.id);
        const level = node.level;
        if (level === 0) return '#991b1b';
        if (level === 1) return '#b91c1c';
        if (status === 'completed') return '#16a34a';
        if (status === 'available') return '#2563eb';
        if (status === 'in_progress') return '#d97706';
        return '#1e293b';
      })
      .attr('stroke', d => {
        const node = d.data as KnowledgeNode;
        // 难度锁定节点：灰色虚线边框
        if (lockedByDifficultyNodes.has(node.id)) return '#cbd5e1';
        if (node.isCourseNode) {
          const courseId = node.courseData?.id || '';
          const parentProgress = progress.find(p => p.nodeId === (d.parent?.data as KnowledgeNode)?.id);
          if (parentProgress?.completedCourses?.includes(courseId)) return '#86efac';
          return '#93c5fd';
        }
        const status = getNodeStatus(node.id);
        const level = node.level;
        if (level === 0) return 'rgba(255,255,255,0.4)';
        if (level === 1) return 'rgba(255,255,255,0.5)';
        if (status === 'available') return '#60a5fa';
        if (status === 'in_progress') return '#fbbf24';
        if (status === 'completed') return '#4ade80';
        return 'rgba(255,255,255,0.6)';
      })
      .attr('stroke-width', d => {
        const node = d.data as KnowledgeNode;
        // 难度锁定节点：细边框
        if (lockedByDifficultyNodes.has(node.id)) return 1;
        if (node.isCourseNode) return 1.5;
        return node.level < 2 ? 3 : 2;
      })
      .attr('stroke-dasharray', d => {
        const node = d.data as KnowledgeNode;
        // 难度锁定节点：虚线
        if (lockedByDifficultyNodes.has(node.id)) return '3,3';
        return 'none';
      })
      .attr('opacity', d => {
        const node = d.data as KnowledgeNode;
        if (lockedByDifficultyNodes.has(node.id)) return 0.5;
        return 1;
      })
      .attr('filter', d => {
        const node = d.data as KnowledgeNode;
        if (lockedByDifficultyNodes.has(node.id)) return 'none';
        if (node.isCourseNode) return 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.12))';
        return 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25))';
      });

    // 节点文字
    nodes.append('text')
      .attr('x', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return 26;
        return getNodeWidth(node) / 2;
      })
      .attr('y', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return getNodeHeight(node) / 2;
        return getNodeHeight(node) / 2;
      })
      .attr('dy', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) {
          const nodeWidth = getNodeWidth(node);
          const fontSize = 12;
          const textWidth = measureTextWidth(node.name, fontSize);
          const availableTextWidth = Math.max(1, nodeWidth - 60);
          const linesNeeded = Math.ceil(textWidth / availableTextWidth);
          const totalTextHeight = linesNeeded * 16;
          const nodeHeight = getNodeHeight(node);
          return `${(nodeHeight - totalTextHeight) / 2 + 12}px`;
        }
        return '0.35em';
      })
      .attr('text-anchor', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return 'start';
        return 'middle';
      })
      .attr('font-size', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return '12px';
        const level = node.level;
        return level === 0 ? '15px' : level === 1 ? '13px' : '12px';
      })
      .attr('font-weight', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return '400';
        return node.level <= 1 ? 'bold' : '500';
      })
      .attr('fill', d => {
        const node = d.data as KnowledgeNode;
        // 难度锁定节点：浅灰色文字
        if (lockedByDifficultyNodes.has(node.id)) return '#94a3b8';
        if (node.isCourseNode) return '#1e40af';
        return '#ffffff';
      })
      .attr('style', d => {
        const node = d.data as KnowledgeNode;
        if (node.isCourseNode) return '';
        return 'text-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)';
      })
      .each(function(d) {
        const node = d.data as KnowledgeNode;
        const nodeWidth = getNodeWidth(node);
        const text = node.name;
        const fontSize = node.isCourseNode ? 12 : node.level === 0 ? 15 : node.level === 1 ? 13 : 12;
        
        if (node.isCourseNode) {
          const availableTextWidth = Math.max(1, nodeWidth - 60);
          const words: string[] = [];
          let currentLine = '';
          for (let i = 0; i < text.length; i++) {
            const testLine = currentLine + text[i];
            if (measureTextWidth(testLine, 12) > availableTextWidth && currentLine.length > 0) {
              words.push(currentLine);
              currentLine = text[i];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) words.push(currentLine);
          
          d3.select(this).selectAll('tspan').remove();
          words.forEach((l, i) => {
            d3.select(this).append('tspan')
              .attr('x', 26)
              .attr('dy', i === 0 ? '0' : '16')
              .text(l);
          });
        } else {
          const maxChars = Math.floor(nodeWidth / (fontSize * 0.6));
          
          if (text.length > maxChars) {
            const words = text.split('');
            let line = '';
            let lines: string[] = [];
            
            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i];
              if (testLine.length > maxChars) {
                lines.push(line);
                line = words[i];
              } else {
                line = testLine;
              }
            }
            lines.push(line);
            
            d3.select(this).selectAll('tspan').remove();
            lines.slice(0, 2).forEach((l, i) => {
              d3.select(this).append('tspan')
                .attr('x', nodeWidth / 2)
                .attr('dy', i === 0 ? '0.3em' : '1.2em')
                .text(l);
            });
          } else {
            d3.select(this).text(text);
          }
        }
      });

    // 添加进度指示器
    nodes.filter(d => {
        const node = d.data as KnowledgeNode;
        return !node.isCourseNode && !!node.content;
      })
      .append('circle')
      .attr('cx', d => getNodeWidth(d.data as KnowledgeNode) - 8)
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

    // 课程节点添加小图标指示
    nodes.filter(d => {
      const node = d.data as KnowledgeNode;
      return !!node.isCourseNode;
    })
      .append('circle')
      .attr('cx', 10)
      .attr('cy', d => getNodeHeight(d.data as KnowledgeNode) / 2)
      .attr('r', 5)
      .attr('fill', d => {
        const node = d.data as KnowledgeNode;
        const courseId = node.courseData?.id || '';
        const parentProgress = progress.find(p => p.nodeId === (d.parent?.data as KnowledgeNode)?.id);
        if (parentProgress?.completedCourses?.includes(courseId)) return '#22c55e';
        return '#3b82f6';
      });

    // 难度锁定节点：添加锁图标
    nodes.filter(d => {
      const node = d.data as KnowledgeNode;
      return lockedByDifficultyNodes.has(node.id) && !node.isCourseNode;
    })
      .append('text')
      .attr('x', d => getNodeWidth(d.data as KnowledgeNode) - 14)
      .attr('y', d => getNodeHeight(d.data as KnowledgeNode) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#94a3b8')
      .text('🔒');

    // 难度锁定节点：添加悬停提示
    nodes.filter(d => {
      const node = d.data as KnowledgeNode;
      return lockedByDifficultyNodes.has(node.id);
    })
      .append('title')
      .text('此节点需要循序渐进完成上一个等级全部学习内容才可以解锁');

  }, [data, dimensions, getNodeStatus, highlightedNodes, onNodeClick, progress, interactive, lockedByDifficultyNodes, isCourseCompleted, router]);

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden">
      {/* SVG容器 */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
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
            {selectedNode.difficulty && (
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                <Target className="w-3 h-3 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  {selectedNode.difficulty === 1 ? '基础' : 
                   selectedNode.difficulty === 2 ? '中等' : '复杂'}
                </span>
              </div>
            )}
          </div>
          
          {/* 难度锁定提示 */}
          {lockedByDifficultyNodes.has(selectedNode.id) && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 flex items-center gap-1.5">
                <span className="text-base">🔒</span>
                此节点需要循序渐进完成上一个等级全部学习内容才可以解锁
              </p>
            </div>
          )}
          
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
            
            {/* 推荐课程 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Play className="w-4 h-4" />
                推荐课程
              </h4>
              <div className="space-y-1.5">
                {selectedNode.courses && selectedNode.courses.length > 0 ? (
                  selectedNode.courses.map((course) => {
                    const completed = isCourseCompleted(selectedNode.id, course.id);
                    return (
                      <a
                        key={course.id}
                        href={`/course/${course.id}`}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                          completed 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'bg-slate-50 hover:bg-orange-50'
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
                          completed
                            ? 'bg-green-500'
                            : 'bg-gradient-to-br from-orange-400 to-amber-400'
                        }`}>
                          {completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Play className="h-2.5 w-2.5 text-white ml-0.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate group-hover:text-orange-700 ${
                            completed ? 'text-green-700' : 'text-slate-700'
                          }`}>
                            {course.title}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{course.duration}分钟</span>
                        {completed && (
                          <span className="text-xs text-green-600 shrink-0 font-medium">已完成</span>
                        )}
                      </a>
                    );
                  })
                ) : selectedNode.content ? (
                  <a
                    href={`/course/${selectedNode.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-orange-50 cursor-pointer transition-colors group"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Play className="h-2.5 w-2.5 text-white ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate group-hover:text-orange-700">{selectedNode.content.title}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{selectedNode.content.duration}分钟</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
            aria-label="关闭"
          >
            ×
          </button>
        </motion.div>
      )}
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded bg-slate-400" />
            <span>未解锁</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded border border-dashed border-slate-300 bg-slate-200" />
            <span>等级锁定</span>
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
        <p className="text-[10px] text-slate-400 mt-2">
          {interactive ? '点击节点查看详情 · 拖拽或滚轮缩放' : '点击节点查看详情'}
        </p>
      </div>
      
      {/* 难度级别说明 */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">难度级别说明</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-20">入门级：</span>
            <span>基础内容，适合初学者</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-20">进阶级：</span>
            <span>中等难度，适合有一定基础</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-20">深入级：</span>
            <span>全面内容，包括复杂主题</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MindMap;
