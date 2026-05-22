'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Waves, 
  Wind, 
  Mountain, 
  TriangleAlert,
  Ship, 
  Tornado, 
  Flame, 
  CloudFog, 
  Snowflake, 
  Sun,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DisasterGraphNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'subcategory' | 'detail';
  description?: string;
  children?: DisasterGraphNode[];
}

interface DisasterType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const DISASTER_TYPES: DisasterType[] = [
  {
    id: '地震',
    name: '地震',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: '#ef4444',
    description: '地壳快速释放能量造成的振动'
  },
  {
    id: '洪水',
    name: '洪水/洪涝',
    icon: <Waves className="w-5 h-5" />,
    color: '#3b82f6',
    description: '暴雨或融雪导致的水体泛滥'
  },
  {
    id: '台风',
    name: '台风',
    icon: <Wind className="w-5 h-5" />,
    color: '#8b5cf6',
    description: '热带洋面上的强烈气旋'
  },
  {
    id: '火山爆发',
    name: '火山爆发',
    icon: <Mountain className="w-5 h-5" />,
    color: '#f97316',
    description: '火山喷发释放的岩浆和气体'
  },
  {
    id: '泥石流',
    name: '泥石流',
    icon: <TriangleAlert className="w-5 h-5" />,
    color: '#a16207',
    description: '山区沟谷的土石洪流'
  },
  {
    id: '海啸',
    name: '海啸',
    icon: <Ship className="w-5 h-5" />,
    color: '#06b6d4',
    description: '海底地震引发的巨大海浪'
  },
  {
    id: '龙卷风',
    name: '龙卷风',
    icon: <Tornado className="w-5 h-5" />,
    color: '#6366f1',
    description: '强烈旋转的空气柱'
  },
  {
    id: '森林火灾',
    name: '森林火灾',
    icon: <Flame className="w-5 h-5" />,
    color: '#dc2626',
    description: '森林植被的燃烧灾害'
  },
  {
    id: '沙尘暴',
    name: '沙尘暴',
    icon: <CloudFog className="w-5 h-5" />,
    color: '#d97706',
    description: '强风卷起大量沙尘的天气'
  },
  {
    id: '雪崩',
    name: '雪崩',
    icon: <Snowflake className="w-5 h-5" />,
    color: '#e0f2fe',
    description: '山坡积雪突然崩塌'
  },
  {
    id: '干旱',
    name: '干旱',
    icon: <Sun className="w-5 h-5" />,
    color: '#eab308',
    description: '长期降水不足导致的缺水'
  }
];

const TYPE_COLORS: Record<string, string> = {
  root: '#1e40af',
  category: '#059669',
  subcategory: '#d97706',
  detail: '#dc2626'
};

const TYPE_SIZES: Record<string, number> = {
  root: 28,
  category: 22,
  subcategory: 16,
  detail: 12
};

export default function DisasterKnowledgeGraphPage() {
  const [selectedDisaster, setSelectedDisaster] = useState<string>('');
  const [graphData, setGraphData] = useState<DisasterGraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<DisasterGraphNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<DisasterGraphNode, undefined> | null>(null);

  const generateGraph = useCallback(async (disasterType: string) => {
    setIsLoading(true);
    setIsGenerating(true);
    setSelectedNode(null);
    
    try {
      const response = await fetch('/api/disaster-knowledge-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disasterType }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '生成失败');
      }

      setGraphData(result.data);
      toast.success(`成功生成${disasterType}知识图谱`);
    } catch (error) {
      console.error('生成知识图谱失败:', error);
      toast.error(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }, []);

  const handleDisasterSelect = (disasterId: string) => {
    setSelectedDisaster(disasterId);
    generateGraph(disasterId);
  };

  const handleRegenerate = () => {
    if (selectedDisaster) {
      generateGraph(selectedDisaster);
    }
  };

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 600);

    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    let transform = d3.zoomIdentity;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        transform = event.transform;
        g.attr('transform', transform.toString());
      });

    svg.call(zoom);

    function flattenData(node: DisasterGraphNode, depth: number = 0): DisasterGraphNode[] {
      const nodes: DisasterGraphNode[] = [{ ...node }];
      if (node.children) {
        node.children.forEach(child => {
          nodes.push(...flattenData(child, depth + 1));
        });
      }
      return nodes;
    }

    function getLinks(node: DisasterGraphNode): { source: string; target: string }[] {
      const links: { source: string; target: string }[] = [];
      if (node.children) {
        node.children.forEach(child => {
          links.push({ source: node.id, target: child.id });
          links.push(...getLinks(child));
        });
      }
      return links;
    }

    const nodes = flattenData(graphData);
    const links = getLinks(graphData);

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => (d as DisasterGraphNode).id)
        .distance(d => {
          const node = d as DisasterGraphNode;
          if (node.type === 'root') return 200;
          if (node.type === 'category') return 150;
          if (node.type === 'subcategory') return 100;
          return 80;
        })
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        const node = d as DisasterGraphNode;
        return TYPE_SIZES[node.type] + 10;
      }));

    simulationRef.current = simulation;

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, DisasterGraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('circle')
      .attr('r', d => TYPE_SIZES[d.type])
      .attr('fill', d => TYPE_COLORS[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    node.append('text')
      .text(d => d.label.length > 12 ? d.label.slice(0, 12) + '...' : d.label)
      .attr('dy', d => TYPE_SIZES[d.type] + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.type === 'root' ? 14 : d.type === 'category' ? 11 : 9)
      .attr('fill', '#374151')
      .attr('font-weight', d => d.type === 'root' ? 'bold' : 'normal');

    node.on('click', (event, d) => {
      event.stopPropagation();
      const originalNode = nodeMap.get(d.id);
      if (originalNode) {
        setSelectedNode(originalNode);
      }
    });

    node.on('mouseenter', function(event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', TYPE_SIZES[d.type] + 5)
        .attr('stroke-width', 3);
    });

    node.on('mouseleave', function(event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', TYPE_SIZES[d.type])
        .attr('stroke-width', 2);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as DisasterGraphNode).x || 0)
        .attr('y1', d => (d.source as DisasterGraphNode).y || 0)
        .attr('x2', d => (d.target as DisasterGraphNode).x || 0)
        .attr('y2', d => (d.target as DisasterGraphNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8);
    
    svg.call(zoom.transform, initialTransform);

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        (zoom as any).scaleBy,
        1.3
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        (zoom as any).scaleBy,
        0.7
      );
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && containerRef.current) {
      const svg = d3.select(svgRef.current);
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      svg.transition().call(
        (zoom as any).transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-yellow-400" />
            灾害主题知识图谱
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            选择一种自然灾害类型，AI 将为您生成完整的知识图谱，包含成因、分类、预警、避险等全方位内容
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {DISASTER_TYPES.map((disaster) => (
            <motion.div
              key={disaster.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-${disaster.color}/20 ${
                  selectedDisaster === disaster.id 
                    ? 'ring-2 ring-offset-2 ring-offset-slate-900 shadow-lg' 
                    : 'hover:ring-1 hover:ring-slate-600'
                }`}
                style={{
                  borderColor: selectedDisaster === disaster.id ? disaster.color : undefined,
                  backgroundColor: selectedDisaster === disaster.id ? `${disaster.color}15` : undefined
                }}
                onClick={() => handleDisasterSelect(disaster.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${disaster.color}20`, color: disaster.color }}
                    >
                      {disaster.icon}
                    </div>
                    <h3 className="font-semibold text-white">{disaster.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{disaster.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
                      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-400/30 animate-ping" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-white">正在生成知识图谱</h3>
                      <p className="text-slate-400">AI 正在分析 {selectedDisaster} 灾害的完整知识体系...</p>
                      <p className="text-sm text-slate-500">这可能需要 10-30 秒，请耐心等待</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-blue-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!isGenerating && graphData && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                    ✓ 图谱已生成
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    点击节点查看详情 | 拖拽移动节点 | 滚轮缩放
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    重新生成
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetZoom}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Card className="flex-1 bg-slate-800/50 border-slate-700 overflow-hidden">
                  <CardContent className="p-0">
                    <div ref={containerRef} className="relative w-full" style={{ minHeight: '650px' }}>
                      <svg ref={svgRef} className="w-full h-full" />
                      
                      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
                        <h4 className="text-xs font-semibold text-slate-300 mb-2">图例</h4>
                        <div className="space-y-1.5">
                          {[
                            { type: 'root', label: '根节点', color: TYPE_COLORS.root },
                            { type: 'category', label: '主分类', color: TYPE_COLORS.category },
                            { type: 'subcategory', label: '子分类', color: TYPE_COLORS.subcategory },
                            { type: 'detail', label: '知识点', color: TYPE_COLORS.detail },
                          ].map(item => (
                            <div key={item.type} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs text-slate-400">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <AnimatePresence>
                  {selectedNode && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="w-80 shrink-0"
                    >
                      <Card className="bg-slate-800/50 border-slate-700 h-fit sticky top-4">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }}
                              />
                              <CardTitle className="text-lg text-white">
                                {selectedNode.label}
                              </CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedNode(null)}
                              className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs mt-2"
                            style={{ 
                              borderColor: TYPE_COLORS[selectedNode.type],
                              color: TYPE_COLORS[selectedNode.type] 
                            }}
                          >
                            {selectedNode.type === 'root' ? '根节点' :
                             selectedNode.type === 'category' ? '主分类' :
                             selectedNode.type === 'subcategory' ? '子分类' : '知识点'}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedNode.description && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Info className="w-4 h-4" />
                                详细说明
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed">
                                {selectedNode.description}
                              </p>
                            </div>
                          )}
                          
                          {selectedNode.children && selectedNode.children.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-slate-300">
                                子节点 ({selectedNode.children.length})
                              </div>
                              <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                {selectedNode.children.map((child, index) => (
                                  <div
                                    key={child.id}
                                    className="flex items-center gap-2 p-2 rounded-md bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors group"
                                    onClick={() => {
                                      const fullNode = findNodeById(graphData!, child.id);
                                      if (fullNode) setSelectedNode(fullNode);
                                    }}
                                  >
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: TYPE_COLORS[child.type] }}
                                    />
                                    <span className="text-xs text-slate-300 group-hover:text-white truncate">
                                      {child.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-3 border-t border-slate-700">
                            <div className="text-xs text-slate-500">
                              节点 ID: {selectedNode.id}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {!isGenerating && !graphData && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto space-y-6">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-block"
                >
                  <AlertTriangle className="w-24 h-24 text-yellow-500/50 mx-auto" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">选择灾害类型开始探索</h3>
                  <p className="text-slate-400">
                    点击上方的灾害类型卡片，AI 将为您生成该灾害的完整知识图谱
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sparkles className="w-4 h-4" />
                    AI 驱动
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Info className="w-4 h-4" />
                    内容随机生成
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

function findNodeById(root: DisasterGraphNode, id: string): DisasterGraphNode | null {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}
