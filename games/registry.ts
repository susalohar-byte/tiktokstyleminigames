import { ComponentType } from 'react';
import { NativeGameProps } from '@/types';

import ColorTapFrenzy from './ColorTapFrenzy';
import MathBlast from './MathBlast';
import MemoryFlip from './MemoryFlip';
import StackMaster from './StackMaster';
import BalloonPopRush from './BalloonPopRush';
import ReactionSpeedTest from './ReactionSpeedTest';
import WordSwipe from './WordSwipe';
import PatternClone from './PatternClone';

export const NATIVE_GAME_IDS = {
  COLOR_TAP_FRENZY: 'color-tap-frenzy',
  MATH_BLAST: 'math-blast',
  MEMORY_FLIP: 'memory-flip',
  STACK_MASTER: 'stack-master',
  BALLOON_POP_RUSH: 'balloon-pop-rush',
  REACTION_SPEED_TEST: 'reaction-speed-test',
  WORD_SWIPE: 'word-swipe',
  PATTERN_CLONE: 'pattern-clone',
} as const;

const gameRegistry: Record<string, ComponentType<NativeGameProps>> = {
  [NATIVE_GAME_IDS.COLOR_TAP_FRENZY]: ColorTapFrenzy,
  [NATIVE_GAME_IDS.MATH_BLAST]: MathBlast,
  [NATIVE_GAME_IDS.MEMORY_FLIP]: MemoryFlip,
  [NATIVE_GAME_IDS.STACK_MASTER]: StackMaster,
  [NATIVE_GAME_IDS.BALLOON_POP_RUSH]: BalloonPopRush,
  [NATIVE_GAME_IDS.REACTION_SPEED_TEST]: ReactionSpeedTest,
  [NATIVE_GAME_IDS.WORD_SWIPE]: WordSwipe,
  [NATIVE_GAME_IDS.PATTERN_CLONE]: PatternClone,
};

export function getNativeGame(gameId: string): ComponentType<NativeGameProps> | null {
  return gameRegistry[gameId] || null;
}

export function isNativeGame(gameId: string): boolean {
  return gameId in gameRegistry;
}

export function getAllNativeGameIds(): string[] {
  return Object.values(NATIVE_GAME_IDS);
}
