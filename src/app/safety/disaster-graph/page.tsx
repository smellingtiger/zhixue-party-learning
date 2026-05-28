'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Sparkles,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  MapPin,
  Shield,
  XCircle,
  FileText,
  Scale,
  Users,
  Network,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { DISASTER_GRAPH_DATA } from '@/lib/disaster-graph-data';
import { knowledgeMap } from '../knowledge-hub/index';
import type { DisasterKnowledge } from '../knowledge-hub/types';

interface DisasterGraphNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'subcategory' | 'detail';
  description?: string;
  children?: DisasterGraphNode[];
  x?: number; y?: number; vx?: number; vy?: number; fx?: number; fy?: number;
}

const TYPE_COLORS: Record<string, string> = {
  root: '#1e40af', category: '#059669', subcategory: '#d97706', detail: '#dc2626'
};
const TYPE_SIZES: Record<string, number> = {
  root: 40, category: 32, subcategory: 24, detail: 18
};
const FONT_SIZES: Record<string, number> = {
  root: 26, category: 22, subcategory: 18, detail: 15
};

const hubTabs = [
  { id: 'graph', label: '知识图谱', icon: Network },
  { id: '成因', label: '灾害成因', icon: Zap },
  { id: '风险区域', label: '风险区域', icon: MapPin },
  { id: '避险方法', label: '避险方法', icon: Shield },
  { id: '典型错误', label: '典型错误', icon: XCircle },
  { id: '案例复盘', label: '案例复盘', icon: FileText },
];

function DisasterGraphContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDisaster, setSelectedDisaster] = useState<string>('');
  const [graphData, setGraphData] = useState<DisasterGraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<DisasterGraphNode | null>(null);
  const [activeHubTab, setActiveHubTab] = useState<'graph' | string>('graph');

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const disasterIdMap: Record<string, string> = {
    '内涝': 'flood', '台风': 'typhoon', '地震': 'earthquake',
    '森林火灾': 'forest-fire', '寒潮': 'cold-wave',
  };
  const currentKnowledge: DisasterKnowledge | undefined = disasterIdMap[selectedDisaster]
    ? knowledgeMap[disasterIdMap[selectedDisaster]]
    : undefined;

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

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current || activeHubTab !== 'graph') return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 700);
    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => { g.attr('transform', event.transform.toString()); });
    zoomRef.current = zoom;
    svg.call(zoom);

    interface LayoutNode extends DisasterGraphNode { depth: number; }
    function flattenData(node: DisasterGraphNode, depth: number = 0): LayoutNode[] {
      const result: LayoutNode[] = [{ ...node, depth }];
      if (node.children) node.children.forEach(child => result.push(...flattenData(child, depth + 1)));
      return result;
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

    function computeSparseFanLayout(rootNode: DisasterGraphNode): Map<string, { x: number; y: number }> {
      const positions = new Map<string, { x: number; y: number }>();
      const centerX = width / 2, centerY = height / 2;
      function getNodeRadius(type: string): number { return (TYPE_SIZES[type] || 12) + 10; }
      const minCanvas = Math.min(width, height);
      const baseUnit = Math.max(minCanvas / 5.5, 180);
      const RADIUS_CONFIG = { root: 0, category: baseUnit, subcategory: baseUnit * 2.3, detail: baseUnit * 4.0 };
      const DETAIL_CHILD_OFFSET = baseUnit * 1.0;
      const MIN_ARC_BUFFER = 8;

      interface PositionedNode { id: string; x: number; y: number; radius: number; type: string; angle?: number; actualRadius?: number; }
      const positionedNodes: PositionedNode[] = [];

      function checkCollision(x: number, y: number, radius: number): boolean {
        for (const pn of positionedNodes) {
          const dx = x - pn.x, dy = y - pn.y;
          if (Math.sqrt(dx * dx + dy * dy) < radius + pn.radius + MIN_ARC_BUFFER) return true;
        }
        return false;
      }
      function findPositionOnRing(targetAngle: number, fixedRadius: number, radius: number, maxAngleDeviation: number = 35): { x: number; y: number; angle: number } | null {
        for (let dev = 0; dev <= maxAngleDeviation; dev += 2) {
          for (const dir of [1, -1]) {
            const testAngle = targetAngle + dir * dev * Math.PI / 180;
            const testX = centerX + Math.cos(testAngle) * fixedRadius;
            const testY = centerY + Math.sin(testAngle) * fixedRadius;
            if (!checkCollision(testX, testY, radius)) return { x: testX, y: testY, angle: testAngle };
          }
        }
        return null;
      }
      function findPositionOutward(parentAngle: number, parentRadius: number, minChildRadius: number, radius: number, maxRadius: number): { x: number; y: number } | null {
        for (let rOffset = DETAIL_CHILD_OFFSET * 0.5; rOffset <= (maxRadius - parentRadius); rOffset += 8) {
          const childR = parentRadius + rOffset;
          if (childR > maxRadius) break;
          const testX = centerX + Math.cos(parentAngle) * childR;
          const testY = centerY + Math.sin(parentAngle) * childR;
          if (!checkCollision(testX, testY, radius)) return { x: testX, y: testY };
          for (let aDev = 3; aDev <= 40; aDev += 3) {
            for (const dir of [1, -1]) {
              const tX = centerX + Math.cos(parentAngle + dir * aDev * Math.PI / 180) * childR;
              const tY = centerY + Math.sin(parentAngle + dir * aDev * Math.PI / 180) * childR;
              if (!checkCollision(tX, tY, radius)) return { x: tX, y: tY };
            }
          }
        }
        return null;
      }
      function countAllDescendants(node: DisasterGraphNode): number {
        let count = 0;
        if (node.children) node.children.forEach(child => { count += 1 + countAllDescendants(child); });
        return count;
      }

      function assignSectorAngles(node: DisasterGraphNode, startAngle: number, endAngle: number, parentId?: string, parentAngle?: number): void {
        const nodeRadius = getNodeRadius(node.type);
        let posX: number, posY: number, finalAngle: number | undefined, actualR: number | undefined;

        if (node.type === 'root') {
          posX = centerX; posY = centerY; finalAngle = 0; actualR = 0;
        } else if (node.type === 'category' || node.type === 'subcategory') {
          const midAngle = (startAngle + endAngle) / 2;
          const fixedR = RADIUS_CONFIG[node.type];
          const result = findPositionOnRing(midAngle, fixedR, nodeRadius, 40);
          if (result) { posX = result.x; posY = result.y; finalAngle = result.angle; }
          else { posX = centerX + Math.cos(midAngle) * fixedR; posY = centerY + Math.sin(midAngle) * fixedR; finalAngle = midAngle; }
          actualR = fixedR;
        } else {
          const detailBaseR = RADIUS_CONFIG.detail;
          const maxDetailR = minCanvas * 0.47;
          let useAngle: number;
          if (parentAngle !== undefined && parentId) {
            const parentNode = positionedNodes.find(p => p.id === parentId);
            if (parentNode && parentNode.actualRadius) {
              useAngle = parentAngle;
              const outwardResult = findPositionOutward(useAngle, parentNode.actualRadius, detailBaseR, nodeRadius, maxDetailR);
              if (outwardResult) {
                posX = outwardResult.x; posY = outwardResult.y; finalAngle = useAngle;
                actualR = Math.sqrt(Math.pow(posX - centerX, 2) + Math.pow(posY - centerY, 2));
                positions.set(node.id, { x: posX, y: posY });
                positionedNodes.push({ id: node.id, x: posX, y: posY, radius: nodeRadius, type: node.type, angle: finalAngle, actualRadius: actualR });
                if (node.children && node.children.length > 0) assignChildrenForDetail(node, useAngle, actualR);
                return;
              }
            }
          }
          useAngle = (startAngle + endAngle) / 2;
          posX = centerX + Math.cos(useAngle) * detailBaseR;
          posY = centerY + Math.sin(useAngle) * detailBaseR;
          if (!checkCollision(posX, posY, nodeRadius)) { /* ok */ }
          else {
            const ringResult = findPositionOnRing(useAngle, detailBaseR, nodeRadius, 50);
            if (ringResult) { posX = ringResult.x; posY = ringResult.y; finalAngle = ringResult.angle; }
            else {
              for (let rOff = 15; rOff <= maxDetailR - detailBaseR; rOff += 10) {
                const tryR = detailBaseR + rOff;
                const tX = centerX + Math.cos(useAngle) * tryR, tY = centerY + Math.sin(useAngle) * tryR;
                if (!checkCollision(tX, tY, nodeRadius)) { posX = tX; posY = tY; break; }
              }
            }
          }
          finalAngle = useAngle;
          actualR = Math.sqrt(Math.pow(posX - centerX, 2) + Math.pow(posY - centerY, 2));
        }

        positions.set(node.id, { x: posX, y: posY });
        positionedNodes.push({ id: node.id, x: posX, y: posY, radius: nodeRadius, type: node.type, angle: finalAngle, actualRadius: actualR });

        if (node.children && node.children.length > 0 && node.type !== 'detail') {
          const totalChildren = node.children.length;
          const availableAngle = endAngle - startAngle;
          let weights: number[] = [], totalWeight = 0;
          if (node.type === 'root') {
            for (const child of node.children) { const w = Math.max(1, countAllDescendants(child)); weights.push(w); totalWeight += w; }
          } else { weights = node.children.map(() => 1); totalWeight = totalChildren; }
          let currentAngle = startAngle;
          for (let i = 0; i < totalChildren; i++) {
            const childAngleShare = (weights[i] / totalWeight) * availableAngle;
            const childEndAngle = currentAngle + childAngleShare;
            assignSectorAngles(node.children[i], currentAngle, childEndAngle, node.id, currentAngle + childAngleShare / 2);
            currentAngle = childEndAngle;
          }
        }
      }

      function assignChildrenForDetail(parentNode: DisasterGraphNode, parentAngle: number, parentRadius: number): void {
        if (!parentNode.children || parentNode.children.length === 0) return;
        const totalChildren = parentNode.children.length;
        const angleSpread = Math.min(60 / totalChildren, 20);
        for (let i = 0; i < totalChildren; i++) {
          const childNode = parentNode.children[i];
          const childRadius = getNodeRadius(childNode.type);
          const offsetAngle = (i - (totalChildren - 1) / 2) * angleSpread;
          const childAngle = parentAngle + offsetAngle * Math.PI / 180;
          const maxDetailR = minCanvas * 0.47;
          const outwardResult = findPositionOutward(childAngle, parentRadius, RADIUS_CONFIG.detail, childRadius, maxDetailR);
          let cX, cY, cActualR;
          if (outwardResult) { cX = outwardResult.x; cY = outwardResult.y; }
          else { const tryR = parentRadius + DETAIL_CHILD_OFFSET; cX = centerX + Math.cos(childAngle) * tryR; cY = centerY + Math.sin(childAngle) * tryR; }
          cActualR = Math.sqrt(Math.pow(cX - centerX, 2) + Math.pow(cY - centerY, 2));
          positions.set(childNode.id, { x: cX, y: cY });
          positionedNodes.push({ id: childNode.id, x: cX, y: cY, radius: childRadius, type: childNode.type, angle: childAngle, actualRadius: cActualR });
        }
      }

      assignSectorAngles(rootNode, -Math.PI * 0.97, Math.PI * 0.97);
      return positions;
    }

    const nodes = flattenData(graphData);
    const links = getLinks(graphData);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const positions = computeSparseFanLayout(graphData);

    nodes.forEach(n => {
      const pos = positions.get(n.id);
      if (pos) { n.x = pos.x; n.y = pos.y; }
    });

    const linkGroup = g.append('g').attr('class', 'links');
    linkGroup.selectAll('line').data(links).join('line')
      .attr('class', 'fan-link')
      .attr('stroke', (d: any) => TYPE_COLORS[(typeof d.source === 'string' ? nodeMap.get(d.source) : d.source)?.type || 'detail'] || '#94a3b8')
      .attr('stroke-opacity', 0.65)
      .attr('stroke-width', (d: any) => {
        const src = typeof d.source === 'string' ? nodeMap.get(d.source) : d.source;
        return src?.type === 'root' ? 3 : src?.type === 'category' ? 2.2 : 1.5;
      })
      .attr('x1', (d: any) => (typeof d.source === 'string' ? positions.get(d.source)?.x : d.source.x) || 0)
      .attr('y1', (d: any) => (typeof d.source === 'string' ? positions.get(d.source)?.y : d.source.y) || 0)
      .attr('x2', (d: any) => (typeof d.target === 'string' ? positions.get(d.target)?.x : d.target.x) || 0)
      .attr('y2', (d: any) => (typeof d.target === 'string' ? positions.get(d.target)?.y : d.target.y) || 0);

    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .call((selection: any) => {
        selection.call((d3.drag<SVGGElement, DisasterGraphNode>() as any)
          .on('start', (event: any, d: any) => { d.fx = d.x; d.fy = d.y; })
          .on('drag', (event: any, d: any) => {
            d.fx = event.x; d.fy = event.y;
            d3.select(event.source).attr('transform', `translate(${event.x},${event.y})`);
            linkGroup.selectAll('line')
              .filter((l: any) => l.source.id === d.id || l.target.id === d.id)
              .each(function(this: any, l: any) {
                const line = d3.select(this);
                if (l.source.id === d.id) line.attr('x1', event.x).attr('y1', event.y);
                if (l.target.id === d.id) line.attr('x2', event.x).attr('y2', event.y);
              });
          })
          .on('end', (event: any, d: any) => { d.fx = null; d.fy = null; }));
      });

    node.attr('transform', (d: any) => `translate(${d.x || 0},${d.y || 0})`);

    node.append('circle')
      .attr('r', (d: any) => TYPE_SIZES[d.type])
      .attr('fill', (d: any) => TYPE_COLORS[d.type])
      .attr('stroke', '#fff').attr('stroke-width', 3).attr('opacity', 0.92)
      .style('filter', 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))');

    const CHAR_WIDTH_RATIO = 0.6;
    function shouldWrap(label: string, nodeType: string): { wrap: boolean; maxWidth: number } {
      if (!label || label.length <= 5) return { wrap: false, maxWidth: 0 };
      const fontSize = FONT_SIZES[nodeType] || 12;
      const circleDiameter = (TYPE_SIZES[nodeType] || 18) * 2;
      const textPixelWidth = label.length * fontSize * CHAR_WIDTH_RATIO;
      return { wrap: textPixelWidth > Math.max(circleDiameter * 0.9, 60), maxWidth: Math.max(circleDiameter * 0.9, 60) };
    }
    function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
      if (!text) return [''];
      const charsPerLine = Math.max(4, Math.floor(maxWidth / (fontSize * CHAR_WIDTH_RATIO)));
      if (text.length <= charsPerLine) return [text];
      const lines: string[] = []; let remaining = text;
      while (remaining.length > 0) {
        if (remaining.length <= charsPerLine) { lines.push(remaining); break; }
        let breakPoint = charsPerLine;
        for (let i = charsPerLine; i >= Math.max(1, charsPerLine - 4); i--) {
          const char = remaining[i];
          if (char === '、' || char === '-' || char === '(' || char === '（' || char === '/' || char === '·' || char === '—' || char === '，') { breakPoint = i + 1; break; }
        }
        lines.push(remaining.substring(0, breakPoint));
        remaining = remaining.substring(breakPoint);
        if (lines.length >= 3) { lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + '…'; break; }
      }
      return lines.length > 0 ? lines : [text];
    }

    node.each(function(d: any) {
      const nodeEl = d3.select(this);
      const label = d.label || '';
      const { wrap, maxWidth } = shouldWrap(label, d.type);
      if (!wrap) {
        nodeEl.append('text').text(label).attr('dy', TYPE_SIZES[d.type] + 14).attr('text-anchor', 'middle')
          .attr('font-size', `${FONT_SIZES[d.type]}px`).attr('fill', '#1f2937')
          .attr('font-weight', d.type === 'root' || d.type === 'category' ? 'bold' : '600').style('pointer-events', 'none');
      } else {
        const labelLines = wrapText(label, maxWidth, FONT_SIZES[d.type]);
        const textGroup = nodeEl.append('g').attr('class', 'multiline-label').style('pointer-events', 'none');
        const lineHeight = FONT_SIZES[d.type] * 1.25;
        const startY = TYPE_SIZES[d.type] + 8;
        labelLines.forEach((line: string, i: number) => {
          textGroup.append('text').text(line).attr('dy', startY + i * lineHeight).attr('text-anchor', 'middle')
            .attr('font-size', `${FONT_SIZES[d.type]}px`).attr('fill', '#1f2937')
            .attr('font-weight', d.type === 'root' || d.type === 'category' ? 'bold' : '600');
        });
      }
    });

    node.on('click', (event, d) => {
      event.stopPropagation();
      const originalNode = nodeMap.get(d.id);
      if (originalNode) setSelectedNode(originalNode);
    });

    node.on('mouseenter', function(event, d) {
      d3.select(this).select('circle').transition().duration(200).attr('r', TYPE_SIZES[d.type] + 6).attr('stroke-width', 4);
      d3.select(this).selectAll('text').transition().duration(200).attr('font-size', `${FONT_SIZES[d.type] + 2}px`);
    });
    node.on('mouseleave', function(event, d) {
      d3.select(this).select('circle').transition().duration(200).attr('r', TYPE_SIZES[d.type]).attr('stroke-width', 3);
      d3.select(this).selectAll('text').transition().duration(200).attr('font-size', `${FONT_SIZES[d.type]}px`);
    });

    setTimeout(() => {
      svg.call(zoom.transform, d3.zoomIdentity.scale(0.75));
    }, 100);

    return () => {};
  }, [graphData, activeHubTab]);

  const handleZoomIn = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3); };
  const handleZoomOut = () => { if (svgRef.current && zoomRef.current) d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7); };
  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current && containerRef.current) {
      const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight;
      d3.select(svgRef.current).transition().duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity.scale(0.75));
    }
  };

  if (!graphData) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => router.push('/safety')} className="gap-2 border-red-400 bg-white hover:bg-red-50 text-red-700 font-medium shadow-sm mb-6">
            <ArrowLeft className="w-4 h-4" />返回安全培训
          </Button>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">未找到知识图谱数据</h3>
            <p className="text-gray-600 mb-6">请先在安全培训页面选择灾害类型</p>
            <Button onClick={() => router.push('/safety')} className="bg-blue-600 hover:bg-blue-700 text-white">返回选择</Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderKnowledgeContent = () => {
    if (!currentKnowledge) return (
      <div className="text-center py-20 text-gray-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>暂无该灾害的详细知识数据</p>
      </div>
    );
    const k = currentKnowledge;

    switch (activeHubTab) {
      case '成因':
        return (
          <div className="border-2 border-black bg-white p-5 space-y-3" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <h3 className="font-black text-lg text-red-700 flex items-center gap-2"><Zap className="w-5 h-5" /> 灾害成因</h3>
            {k.成因.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 bg-red-600 text-white font-black flex items-center justify-center text-sm border border-black flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-800 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        );
      case '风险区域':
        return (
          <div className="space-y-3">
            {k.风险区域.map((cat, ci) => (
              <div key={ci} className="border-2 border-black bg-white" style={{ boxShadow: '3px 3px 0 0 #000' }}>
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 border-b-2 border-black px-4 py-2">
                  <h4 className="text-white font-bold text-sm"><MapPin className="w-4 h-4 inline mr-1" />{cat.category}</h4>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="flex items-start gap-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" /><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case '避险方法':
        return (
          <div className="space-y-4">
            {k.避险方法.map((phase, pi) => (
              <div key={pi} className="border-2 border-black bg-white" style={{ boxShadow: '3px 3px 0 0 #000' }}>
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 border-b-2 border-black px-5 py-3">
                  <h4 className="text-white font-black"><Shield className="w-5 h-5 inline mr-1" />{phase.phase}</h4>
                </div>
                <div className="p-4 space-y-2">
                  {phase.items.map((item, ii) => (
                    <div key={ii} className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" /><span className="text-gray-800 leading-relaxed">{item}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case '典型错误':
        return (
          <div className="border-2 border-black bg-white overflow-hidden" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <table className="w-full border-collapse">
              <thead><tr className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
                <th className="border-2 border-black px-4 py-3 text-left font-black text-sm w-1/3">❌ 错误做法</th>
                <th className="border-2 border-black px-4 py-3 text-left font-black text-sm w-1/3">⚠️ 可能后果</th>
                <th className="border-2 border-black px-4 py-3 text-left font-black text-sm w-1/3">✅ 正确做法</th>
              </tr></thead>
              <tbody>
                {k.典型错误.map((row, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-purple-50'} hover:bg-purple-100 transition-colors`}>
                    <td className="border-2 border-black px-3 py-3 text-sm text-red-700 font-medium">{row.error}</td>
                    <td className="border-2 border-black px-3 py-3 text-sm text-orange-700">{row.consequence}</td>
                    <td className="border-2 border-black px-3 py-3 text-sm text-green-700 font-medium">{row.correct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case '案例复盘':
        return (
          <div className="space-y-5">
            {k.案例复盘.map((case_, ci) => (
              <div key={ci} className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b-2 border-black px-5 py-3">
                  <h4 className="text-white font-black"><FileText className="w-5 h-5 inline mr-1" />案例{ci + 1}：{case_.title}</h4>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs font-black mb-2">背景</Badge>
                    <p className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-blue-300">{case_.background}</p>
                  </div>
                  <div>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs font-black mb-2">过程</Badge>
                    <p className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-orange-300">{case_.process}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-yellow-600" /><span className="text-yellow-800 text-xs font-black">教训与启示</span></div>
                    <ul className="space-y-2 pl-3">
                      {case_.lessons.map((lesson, li) => (
                        <li key={li} className="flex items-start gap-2 text-sm text-gray-800"><Target className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" /><span>{lesson}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.push('/safety')} className="gap-2 border-red-400 bg-white hover:bg-red-50 text-red-700 font-medium shadow-sm">
            <ArrowLeft className="w-4 h-4" />返回安全培训
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-red-800" style={{ textShadow: '0 1px 3px rgba(185,28,28,0.15)' }}>
              {selectedDisaster} · 知识中枢
            </h1>
            <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-white/60">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700 font-bold">{selectedDisaster}</span>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => router.push('/safety/command-course?disaster=' + (disasterIdMap[selectedDisaster] || 'flood'))} className="gap-1.5 border-2 border-purple-400 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs" style={{ borderRadius: 0, boxShadow: '2px 2px 0 0 #000' }}>
              <Users className="w-3.5 h-3.5" />岗位手册
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push('/safety/command-course?disaster=' + (disasterIdMap[selectedDisaster] || 'flood'))} className="gap-1.5 border-2 border-green-400 text-green-700 font-bold text-xs hover:bg-green-50" style={{ borderRadius: 0, boxShadow: '1px 1px 0 0 #000' }}>
              <Scale className="w-3.5 h-3.5" />法规标准
            </Button>
          </div>
        </motion.div>

        <div className="flex gap-2 flex-wrap mb-4 border-b-2 border-black/10 pb-2">
          {hubTabs.map((tab) => {
            const isActive = activeHubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveHubTab(tab.id); setSelectedNode(null); }}
                className={`px-4 py-2 text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white border-black scale-105'
                    : 'bg-white/80 text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-white'
                }`}
                style={{
                  borderRadius: 0,
                  boxShadow: isActive ? '3px 3px 0 0 #000' : '1px 1px 0 0 #ccc',
                }}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeHubTab === 'graph' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-700 border-green-300">✓ 图谱已加载</Badge>
                <span className="text-gray-600 text-sm">点击节点查看详情 | 拖拽移动 | 滚轮缩放</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => loadGraph(selectedDisaster)} className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs">重新加载</Button>
                <Button variant="outline" size="sm" onClick={handleZoomIn} className="border-gray-300"><ZoomIn className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut} className="border-gray-300"><ZoomOut className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={handleResetZoom} className="border-gray-300"><Maximize2 className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Card className="flex-1 bg-white/90 backdrop-blur-sm border-gray-200 overflow-hidden">
                <CardContent className="p-0">
                  <div ref={containerRef} className="relative w-full" style={{ minHeight: '600px' }}>
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
                          <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-gray-900 h-8 w-8 p-0">×</Button>
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
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-h-[550px]">
            {renderKnowledgeContent()}
          </motion.div>
        )}
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

export default function DisasterGraphPage() {
  return (
    <Suspense fallback={
      <div className="h-full overflow-auto bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <DisasterGraphContent />
    </Suspense>
  );
}

function findNodeById(root: DisasterGraphNode, id: string): DisasterGraphNode | null {
  if (root.id === id) return root;
  if (root.children) { for (const child of root.children) { const found = findNodeById(child, id); if (found) return found; } }
  return null;
}

function countNodes(node: DisasterGraphNode): number {
  let count = 1;
  if (node.children) node.children.forEach(child => { count += countNodes(child); });
  return count;
}
