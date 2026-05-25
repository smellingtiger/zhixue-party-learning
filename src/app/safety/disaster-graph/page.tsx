'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { DISASTER_GRAPH_DATA } from '@/lib/disaster-graph-data';

interface DisasterGraphNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'subcategory' | 'detail';
  description?: string;
  children?: DisasterGraphNode[];
}

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

export default function DisasterGraphPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDisaster, setSelectedDisaster] = useState<string>('');
  const [graphData, setGraphData] = useState<DisasterGraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<DisasterGraphNode | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const loadGraph = useCallback((disasterType: string) => {
    if (!disasterType) return;
    setSelectedNode(null);

    const staticData = DISASTER_GRAPH_DATA[disasterType];
    if (staticData) {
      console.log(`[${disasterType}] 图谱节点: ${countNodes(staticData)}个`);
      setGraphData(staticData);
    } else {
      console.error('未找到灾害类型数据:', disasterType);
      setGraphData(null);
    }
  }, []);

  useEffect(() => {
    const disasterFromUrl = searchParams.get('disaster');
    const disasterFromStorage = localStorage.getItem('selectedDisaster');
    const disasterType = disasterFromUrl || disasterFromStorage || '内涝';

    setSelectedDisaster(disasterType);
    loadGraph(disasterType);
  }, [searchParams, loadGraph]);

  const handleRegenerate = () => {
    if (selectedDisaster) {
      loadGraph(selectedDisaster);
    }
  };

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 600);

    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    function flattenData(node: DisasterGraphNode): DisasterGraphNode[] {
      const nodes: DisasterGraphNode[] = [{ ...node }];
      if (node.children) {
        node.children.forEach(child => nodes.push(...flattenData(child)));
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
        .id((d: any) => d.id)
        .distance((d: any) => {
          const src = d.source as DisasterGraphNode | undefined;
          if (src?.type === 'root') return 200;
          if (src?.type === 'category') return 150;
          if (src?.type === 'subcategory') return 100;
          return 80;
        })
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => TYPE_SIZES[d.type] + 15))
      .alpha(1)
      .restart();

    const link = g.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', '#94a3b8').attr('stroke-opacity', 0.6).attr('stroke-width', 2);

    const node = g.append('g').selectAll('g')
      .data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, DisasterGraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle')
      .attr('r', (d: any) => TYPE_SIZES[d.type])
      .attr('fill', (d: any) => TYPE_COLORS[d.type])
      .attr('stroke', '#fff').attr('stroke-width', 2)
      .attr('opacity', 0.9)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

    node.append('text')
      .text((d: any) => (d.label || '').length > 12 ? (d.label || '').slice(0, 12) + '...' : d.label)
      .attr('dy', (d: any) => TYPE_SIZES[d.type] + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => d.type === 'root' ? '14px' : d.type === 'category' ? '11px' : '9px')
      .attr('fill', '#374151')
      .attr('font-weight', (d: any) => d.type === 'root' ? 'bold' : 'normal')
      .style('pointer-events', 'none');

    node.on('click', (event, d) => {
      event.stopPropagation();
      const originalNode = nodeMap.get(d.id);
      if (originalNode) setSelectedNode(originalNode);
    });

    node.on('mouseenter', function(event, d) {
      d3.select(this).select('circle').transition().duration(200)
        .attr('r', TYPE_SIZES[d.type] + 5).attr('stroke-width', 3);
    });
    node.on('mouseleave', function(event, d) {
      d3.select(this).select('circle').transition().duration(200)
        .attr('r', TYPE_SIZES[d.type]).attr('stroke-width', 2);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x || 0).attr('y1', (d: any) => d.source.y || 0)
        .attr('x2', (d: any) => d.target.x || 0).attr('y2', (d: any) => d.target.y || 0);
      node.attr('transform', (d: any) => `translate(${d.x || 0},${d.y || 0})`);
    });

    setTimeout(() => {
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));
    }, 100);

    return () => { simulation.stop(); };
  }, [graphData]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  };
  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  };
  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current && containerRef.current) {
      const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight;
      d3.select(svgRef.current).transition().duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(w / 2, h / 2).scale(0.8));
    }
  };

  if (!graphData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => router.push('/safety')} className="gap-2 border-red-400 bg-white hover:bg-red-50 text-red-700 font-medium shadow-sm mb-6">
            <ArrowLeft className="w-4 h-4" />返回安全培训
          </Button>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">未找到知识图谱数据</h3>
            <p className="text-gray-600 mb-6">请先在安全培训页面选择灾害类型</p>
            <Button onClick={() => router.push('/safety')} className="bg-blue-600 hover:bg-blue-700 text-white">
              返回选择
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.push('/safety')} className="gap-2 border-red-400 bg-white hover:bg-red-50 text-red-700 font-medium shadow-sm">
            <ArrowLeft className="w-4 h-4" />返回安全培训
          </Button>
          <motion.div key={selectedDisaster} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/50">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700 font-medium">当前灾害：<span className="text-blue-600 font-bold">{selectedDisaster}</span></span>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-2" style={{ textShadow: '0 1px 3px rgba(185,28,28,0.15)' }}>
            {selectedDisaster}知识图谱
          </h1>
          <p className="text-gray-600 text-sm">静态数据 · 秒级加载 · 点击节点查看详情</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">✓ 图谱已加载</Badge>
              <span className="text-gray-600 text-sm">点击节点查看详情 | 拖拽移动节点 | 滚轮缩放</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRegenerate} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                重新加载
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn} className="border-gray-300 text-gray-700 hover:bg-gray-100"><ZoomIn className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut} className="border-gray-300 text-gray-700 hover:bg-gray-100"><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom} className="border-gray-300 text-gray-700 hover:bg-gray-100"><Maximize2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Card className="flex-1 bg-white/90 backdrop-blur-sm border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <div ref={containerRef} className="relative w-full" style={{ minHeight: '650px' }}>
                  <svg ref={svgRef} className="w-full h-full" style={{ display: 'block' }} />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">图例</h4>
                    <div className="space-y-1.5">
                      {[
                        { type: 'root', label: '根节点', color: TYPE_COLORS.root },
                        { type: 'category', label: '主分类', color: TYPE_COLORS.category },
                        { type: 'subcategory', label: '子分类', color: TYPE_COLORS.subcategory },
                        { type: 'detail', label: '知识点', color: TYPE_COLORS.detail },
                      ].map(item => (
                        <div key={item.type} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {selectedNode && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="w-80 shrink-0">
                  <Card className="bg-white/90 backdrop-blur-sm border-gray-200 h-fit sticky top-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }} />
                          <CardTitle className="text-lg text-gray-900">{selectedNode.label}</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-8 w-8 p-0">×</Button>
                      </div>
                      <Badge variant="outline" className="text-xs mt-2" style={{ borderColor: TYPE_COLORS[selectedNode.type], color: TYPE_COLORS[selectedNode.type] }}>
                        {selectedNode.type === 'root' ? '根节点' : selectedNode.type === 'category' ? '主分类' : selectedNode.type === 'subcategory' ? '子分类' : '知识点'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedNode.description && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Info className="w-4 h-4" />详细说明</div>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedNode.description}</p>
                        </div>
                      )}
                      {selectedNode.children && selectedNode.children.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">子节点 ({selectedNode.children.length})</div>
                          <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {selectedNode.children.map((child) => (
                              <div key={child.id} className="flex items-center gap-2 p-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors group" onClick={() => { const fullNode = findNodeById(graphData!, child.id); if (fullNode) setSelectedNode(fullNode); }}>
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[child.type] }} />
                                <span className="text-xs text-gray-700 group-hover:text-gray-900 truncate">{child.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200"><div className="text-xs text-gray-500">节点 ID: {selectedNode.id}</div></div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
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

function countNodes(node: DisasterGraphNode): number {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => { count += countNodes(child); });
  }
  return count;
}
