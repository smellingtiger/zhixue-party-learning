import type { CommandManualData } from './command-course/types';
import { floodCommandManualData } from './command-course/flood-command-manual-data';
import { earthquakeCommandManualData } from './command-course/earthquake-command-manual-data';
import { typhoonCommandManualData } from './command-course/typhoon-command-manual-data';
import { forestFireCommandManualData } from './command-course/forest-fire-command-manual-data';
import { coldWaveCommandManualData } from './command-course/cold-wave-command-manual-data';

export const manualDataMap: Record<string, CommandManualData> = {
  flood: floodCommandManualData,
  earthquake: earthquakeCommandManualData,
  typhoon: typhoonCommandManualData,
  'forest-fire': forestFireCommandManualData,
  'cold-wave': coldWaveCommandManualData,
};

export type DisasterType = keyof typeof manualDataMap;

export const disasterNames: Record<string, string> = {
  flood: '防汛',
  typhoon: '防台风',
  earthquake: '防震',
  'forest-fire': '森林防火',
  'cold-wave': '防寒潮',
};
