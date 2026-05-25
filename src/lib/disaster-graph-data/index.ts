import { waterloggingGraphData } from './waterlogging';
import { typhoonGraphData } from './typhoon';
import { earthquakeGraphData } from './earthquake';
import { forestFireGraphData } from './forest-fire';
import { coldWaveGraphData } from './cold-wave';

export const DISASTER_GRAPH_DATA: Record<string, any> = {
  '内涝': waterloggingGraphData,
  '台风': typhoonGraphData,
  '地震': earthquakeGraphData,
  '森林火灾': forestFireGraphData,
  '寒潮': coldWaveGraphData,
};
