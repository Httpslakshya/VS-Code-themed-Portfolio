/**
 * cosmoAnimation.ts — COSMO 2.0’s pixel-sprite animation engine.
 *
 * The character is a set of extracted poses (src/assets/cosmo/*.png).
 * This module owns everything about HOW a pose is displayed:
 *
 *   - NORMALIZATION — every asset was extracted onto its own canvas, so
 *     the engine scales each pose (metadata in cosmoAssets.ts) to a
 *     consistent visual character height and pins its body anchor to one
 *     ground point. Poses can never make the character jump, grow or
 *     shrink, and effect art (trails, notes, pads) can never clip him.
 *   - A BASE CYCLE  (the 2-frame idle, the 4-frame fly cycle, dance…)
 *   - A FLASH pose  (blink, look-left, …) that overrides briefly
 *   - TRAVEL MOTION — directional pose resolution: the 4-frame fly cycle
 *     (mirrored for leftward flight), native left/right art for short
 *     hops, back/front art for vertical travel.
 *
 * Movement (x/y/rotation) stays in Cosmo.tsx — applied to the <img>, so
 * transforms and poses compose. The wrapper (figure) is engine-owned:
 * it carries the mirror flip and nothing else.
 * It also exposes a tiny runtime store the terminal can read.
 */

import { COSMO_ASSETS } from '../data/cosmoAssets';

export type PoseName = string;
export type Facing = 'left' | 'right' | 'up' | 'down';

const frames = import.meta.glob('../assets/cosmo/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const POSES: Record<PoseName, string> = {};
for (const [path, url] of Object.entries(frames)) {
  POSES[path.split('/').pop()!.replace('.png', '')] = url;
}

/* Cycles — frame sequences for continuous states. */
export const CYCLES: Record<string, { frames: PoseName[]; fps: number }> = {
  idle: { frames: ['idle-1', 'idle-2'], fps: 1.4 },
  fly: { frames: ['fly-1', 'fly-2', 'fly-3', 'fly-4'], fps: 5.5 },
  dance: { frames: ['dancing', 'idle-2', 'dancing', 'excited'], fps: 2.6 },
  charging: { frames: ['charging'], fps: 1 },
};

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

let img: HTMLImageElement | null = null;
let figure: HTMLElement | null = null;
let charH = 100; // target visual character height, CSS px (CSS: --cosmo-char-h)
let flipped = false; // mirror while flying left with right-facing art
let baseCycle: string[] = ['idle-1', 'idle-2'];
let baseFps = 1.4;
let cycleIdx = 0;
let cycleTimer = 0;
let flashTimer = 0;
let flashing = false;

/** The pose currently on screen (last applied). */
let current: PoseName = 'idle-1';

export function currentPose(): PoseName {
  return current;
}

/** Re-read sizing metrics (CSS var + figure box). Call on resize. */
export function refreshMetrics() {
  if (!figure) return;
  const v = parseFloat(getComputedStyle(figure).getPropertyValue('--cosmo-char-h'));
  if (!Number.isNaN(v) && v > 30) charH = v;
}

/** Place the current pose: normalized scale + anchored to the ground line. */
function apply(name: PoseName) {
  const meta = COSMO_ASSETS[name];
  current = name;
  if (!img || !meta || !POSES[name]) return;
  if (img.getAttribute('src') !== POSES[name]) img.src = POSES[name];
  const fig = figure;
  if (!fig) return;
  const s = (charH / meta.h) * (meta.corr ?? 1);
  const w = meta.w * s;
  const h = meta.h * s;
  const groundY = fig.clientHeight - fig.clientHeight * 0.06; // feet line
  img.style.width = `${w}px`;
  img.style.height = `${h}px`;
  img.style.left = `${fig.clientWidth / 2 - meta.ax * w}px`;
  img.style.top = `${groundY - meta.ay * h}px`;
}

function runCycle() {
  window.clearInterval(cycleTimer);
  if (baseCycle.length <= 1) {
    apply(baseCycle[0] ?? 'idle-1');
    return;
  }
  cycleIdx = 0;
  apply(baseCycle[0]);
  cycleTimer = window.setInterval(() => {
    if (flashing) return; // a flash pose has priority while visible
    cycleIdx = (cycleIdx + 1) % baseCycle.length;
    apply(baseCycle[cycleIdx]);
  }, Math.round(1000 / baseFps));
}

/** Attach the engine to the avatar <img> + its wrapper, preload every pose. */
export function initPoseEngine(el: HTMLImageElement, wrapper: HTMLElement) {
  img = el;
  figure = wrapper;
  refreshMetrics();
  for (const url of Object.values(POSES)) {
    const pre = new Image();
    pre.src = url;
  }
  setFlip(false);
  setBaseCycle('idle');
}

/** Mirror the figure — used when right-facing fly art travels left. */
export function setFlip(f: boolean) {
  flipped = f;
  if (figure) figure.style.transform = f ? 'scaleX(-1)' : '';
}

export function isFlipped() {
  return flipped;
}

/** Set the continuous base cycle. Accepts a named cycle (idle, fly,
    dance, charging) OR any single pose name (thinking, sleeping…),
    which becomes a held single-frame cycle. */
export function setBaseCycle(name: string) {
  const cycle = CYCLES[name] ?? (POSES[name] ? { frames: [name], fps: 1 } : CYCLES.idle);
  baseCycle = cycle.frames;
  baseFps = cycle.fps;
  flashing = false;
  window.clearTimeout(flashTimer);
  runCycle();
}

/** Briefly show a pose, then return to the base cycle. */
export function flashPose(name: PoseName, ms = 700) {
  if (!POSES[name] || COSMO_ASSETS[name]?.effect) return;
  flashing = true;
  window.clearTimeout(flashTimer);
  apply(name);
  flashTimer = window.setTimeout(() => {
    flashing = false;
    apply(baseCycle[cycleIdx] ?? baseCycle[0]);
  }, ms);
}

/* ------------------------------------------------------------------ */
/* Directional travel                                                  */
/* ------------------------------------------------------------------ */

/**
 * Put COSMO in the correct motion for travelling toward (dx, dy).
 * Long journeys get the 4-frame fly cycle (mirrored when heading left —
 * the artwork natively faces right); short hops use the dedicated native
 * left/right art; vertical travel uses the back (ascending) / front
 * (descending) hero poses. Returns the resolved facing.
 */
export function setTravelMotion(dx: number, dy: number, dist: number): Facing {
  const vertical = Math.abs(dy) > Math.abs(dx) * 1.35;
  if (vertical) {
    setFlip(false);
    setBaseCycle(dy < 0 ? 'back' : 'front');
    return dy < 0 ? 'up' : 'down';
  }
  if (dist > 300) {
    setBaseCycle('fly');
    setFlip(dx < 0);
    return dx < 0 ? 'left' : 'right';
  }
  setFlip(false);
  setBaseCycle(dx < 0 ? 'left' : 'right');
  return dx < 0 ? 'left' : 'right';
}

/* ------------------------------------------------------------------ */
/* Runtime store — read by the terminal (`cosmo status`)               */
/* ------------------------------------------------------------------ */

export const cosmoRuntime = {
  state: 'idle',
  mood: 'curious',
  location: 'home',
  activity: 'system online.',
};

export function updateRuntime(patch: Partial<typeof cosmoRuntime>) {
  Object.assign(cosmoRuntime, patch);
}
