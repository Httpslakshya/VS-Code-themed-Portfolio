import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../lib/motion';

const BOOT_LINES = [
  'mounting /portfolio …',
  'loading modules: vision · language · memory',
  'uplink established — welcome, guest',
];

/**
 * Boot sequence — the site introduces itself the way a system does.
 * Short (~1.6s), skippable with a click, skipped entirely for
 * reduced-motion users.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      if (prefersReducedMotion()) {
        doneRef.current();
        return;
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => doneRef.current(),
      });

      tl.from('.pre-brand', { autoAlpha: 0, y: 14, duration: 0.5 })
        .from(
          '.pre-line',
          { autoAlpha: 0, y: 8, duration: 0.4, stagger: 0.16 },
          0.15
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.15,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (countRef.current)
                countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
            },
          },
          0.1
        )
        .to('.pre-inner', { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' }, '+=0.12')
        .to(root, {
          yPercent: -100,
          duration: 0.75,
          ease: 'power4.inOut',
        });

      const skip = () => tl.timeScale(4.5);
      root.addEventListener('pointerdown', skip);
      return () => root.removeEventListener('pointerdown', skip);
    },
    { scope: rootRef }
  );

  return (
    <div className="preloader" ref={rootRef} role="status" aria-label="Loading portfolio">
      <div className="pre-inner">
        <p className="pre-brand">
          LAKSHYA<span>.OS</span>
        </p>
        <div className="pre-boot">
          {BOOT_LINES.map((line) => (
            <p className="pre-line" key={line}>
              <span className="pre-tick">›</span> {line}
            </p>
          ))}
        </div>
        <p className="pre-count">
          <span ref={countRef}>000</span>
          <i>%</i>
        </p>
        <p className="pre-skip">click to skip</p>
      </div>
    </div>
  );
}
