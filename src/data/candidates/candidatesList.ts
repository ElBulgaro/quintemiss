import type { Candidate } from './types';
import { northCandidates } from './regions/north';
import { southCandidates } from './regions/south';
import { eastCandidates } from './regions/east';
import { westCandidates } from './regions/west';
import { centerCandidates } from './regions/center';
import { overseasCandidates } from './regions/overseas';
import { otherCandidates } from './regions/other';

export const candidates: Candidate[] = [
  ...northCandidates,
  ...southCandidates,
  ...eastCandidates,
  ...westCandidates,
  ...centerCandidates,
  ...overseasCandidates,
  ...otherCandidates,
];