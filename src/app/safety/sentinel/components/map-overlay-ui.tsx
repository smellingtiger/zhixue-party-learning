'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, AlertTriangle, Play, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RealDisasterCase } from '@/lib/real-disaster-cases';
import { realDisasterCases } from '@/lib/real-disaster-cases';
import { wuhanWaterloggingCase } from '@/lib/wuhan-waterlogging-case';

interface MapOverlayUIProps {
  selectedCase: RealDisasterCase | null;
  onSelectCase: (caseData: RealDisasterCase) => void;
  onStartCampaign: () => void;
  showCaseList: boolean;
  showStartButton: boolean;
}

export default function MapOverlayUI({
  selectedCase,
  onSelectCase,
  onStartCampaign,
  showCaseList,
  showStartButton,
}: MapOverlayUIProps) {
  return (
    <>
      <AnimatePresence>
        {/* 案例选择列表 - 地图中央悬浮 */}
        {showCaseList && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 50 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 pointer-events-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">选择战役场景</h2>
                <p className="text-sm text-slate-400">点击地图上的标记或从下方列表选择</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...realDisasterCases, wuhanWaterloggingCase].map((caseData, idx) => (
                  <motion.button
                    key={caseData.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => onSelectCase(caseData)}
                    className={`text-left p-4 rounded-xl border transition-all group ${
                      selectedCase?.id === caseData.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedCase?.id === caseData.id
                          ? 'bg-amber-500/20'
                          : 'bg-slate-700/50'
                      }`}>
                        <MapPin className={`w-5 h-5 ${
                          selectedCase?.id === caseData.id ? 'text-amber-400' : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {caseData.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {caseData.date}
                          </Badge>
                          <span className="text-[10px] text-red-400">
                            {caseData.casualties.deaths}人遇难
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {caseData.description.slice(0, 60)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-slate-500 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {caseData.decisionPoints.length}个决策点
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {caseData.rescueForces.length}支救援力量
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${
                        selectedCase?.id === caseData.id ? 'text-amber-400' : 'text-slate-600'
                      }`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 开始战役按钮 - 地图中央 */}
        {showStartButton && selectedCase && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 60 }}
          >
            <div className="text-center pointer-events-auto">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="mb-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-amber-500/30 rounded-full">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-400">{selectedCase.name}</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Button
                  onClick={onStartCampaign}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-6 text-lg shadow-2xl shadow-red-500/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始战役推演
                  <Play className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <p className="text-sm text-slate-400 mt-4">
                {selectedCase.decisionPoints.length}个关键决策 · {selectedCase.rescueForces.length}支救援力量
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
