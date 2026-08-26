/**
 * motion.ts — the animation system for the whole site.
 *
 * One place registers plugins, defines the shared easing language, and owns
 * the smooth-scroller. Components use `useGSAP` with a scope and call the
 * helpers here, so motion stays consistent and cleanup stays automatic.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, ScrambleTextPlugin, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.8 });

/** Characters used for the “system text materialising” effect. */
export const SCRAMBLE_CHARS = '▚▞▛#/<>*+:01';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

/* ------------------------------------------------------------------ */
/* Smooth scrolling (Lenis), driven by GSAP’s ticker                    */
/* ------------------------------------------------------------------ */

let lenis: Lenis | null = null;

export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {};

  lenis = new Lenis({
    duration: 1.05,
    // Let Lenis pick sane defaults per device; touch stays native.
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function getLenis() {
  return lenis;
}

export function lockScroll(locked: boolean) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/** Smoothly scroll to a section id — works with and without Lenis. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: id === 'home' ? 0 : -70, duration: 1.15 });
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

/* ------------------------------------------------------------------ */
/* Shared reveal helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Standard section reveal: everything tagged [data-reveal] inside the scope
 * fades/slides up once, in DOM order, with an optional group stagger.
 */
export function revealChildren(scope: HTMLElement | string | null, extra: gsap.TweenVars = {}) {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope as Element);
  if (!items.length) return;
  if (prefersReducedMotion()) {
    gsap.set(items, { autoAlpha: 1 });
    return;
  }
  gsap.set(items, { autoAlpha: 0, y: 34 });
  ScrollTrigger.create({
    trigger: items[0],
    start: 'top 82%',
    once: true,
    onEnter: () =>
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        // hand control back to CSS classes once revealed
        onComplete: () => gsap.set(items, { clearProps: 'opacity,visibility,transform' }),
        ...extra,
      }),
  });
}

/**
 * Masked line reveal for display headings — SplitText with line masks,
 * resilient to font swaps via autoSplit.
 */
export function maskRevealLines(
  el: HTMLElement | null,
  vars: { scrollTrigger?: boolean; delay?: number; stagger?: number } = {}
) {
  if (prefersReducedMotion()) return null;
  const split = SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    linesClass: 'split-line',
    onSplit(self) {
      const tween = gsap.from(self.lines, {
        yPercent: 115,
        rotate: 2,
        duration: 1.1,
        ease: 'power4.out',
        stagger: vars.stagger ?? 0.09,
        delay: vars.delay ?? 0,
        paused: !vars.scrollTrigger,
      });
      if (vars.scrollTrigger) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => tween.play(),
        });
      }
      return tween;
    },
  });
  return split;
}

/** Scramble a label into its final text — the “system materialising” cue. */
export function scrambleIn(el: HTMLElement | null, delay = 0, scrollTrigger = true) {
  if (!el || prefersReducedMotion()) return;
  const finalText = el.textContent ?? '';
  gsap.set(el, { autoAlpha: 0 });
  const run = () =>
    gsap.to(el, {
      autoAlpha: 1,
      duration: 0.9,
      delay,
      scrambleText: { text: finalText, chars: SCRAMBLE_CHARS, speed: 1.1 },
    });
  if (!scrollTrigger) {
    run();
    return;
  }
  ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: run });
}

/** Magnetic hover for CTAs — desktop pointers only. */
export function makeMagnetic(el: HTMLElement, strength = 0.35) {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
  const onMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
    yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const onLeave = () => {
    xTo(0);
    yTo(0);
  };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
  };
}

export { gsap, ScrollTrigger, SplitText };
