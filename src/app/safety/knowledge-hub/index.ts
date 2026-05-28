import type { DisasterKnowledge } from './types';
import { floodKnowledge } from './flood-knowledge';
import { typhoonKnowledge } from './typhoon-knowledge';
import { earthquakeKnowledge } from './earthquake-knowledge';
import { forestFireKnowledge } from './forest-fire-knowledge';
import { coldWaveKnowledge } from './cold-wave-knowledge';

export const knowledgeMap: Record<string, DisasterKnowledge> = {
  flood: floodKnowledge,
  typhoon: typhoonKnowledge,
  earthquake: earthquakeKnowledge,
  'forest-fire': forestFireKnowledge,
  'cold-wave': coldWaveKnowledge,
};

export const disasterNames: Record<string, string> = {
  flood: '内涝',
  typhoon: '台风',
  earthquake: '地震',
  'forest-fire': '森林火灾',
  'cold-wave': '寒潮',
};
