import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion';

const ITEMS = ['PYTHON ENGINEER', 'AI BUILDER', 'PROBLEM SOLVER', 'PRODUCT THINKER', 'SYSTEMS THINKER'];

/**
 * Identity marquee — its speed and skew respond to scroll velocity,
 * and it reverses when you scroll back up. Idle, it drifts on its own.
 */
export default function Marquee() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const track = rootRef.current?.querySelector<HTMLElement>('.marquee-track');
      if (!track) return;

      const drift = gsap.to(track, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });
      const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power2' });

      ScrollTrigger.create({
        onUpdate(self) {
          const velocity = self.getVelocity();
          const boost = Math.min(Math.abs(velocity) / 900, 3);
          const direction = self.direction || 1;
          drift.timeScale(direction * (1 + boost));
          skewTo(gsap.utils.clamp(-6, 6, velocity / -350));
          // Ease both back to idle.
          gsap.to(drift, { timeScale: direction, duration: 1.2, ease: 'power2.out', overwrite: true, delay: 0.1 });
          gsap.delayedCall(0.12, () => skewTo(0));
        },
      });
    },
    { scope: rootRef }
  );

  const row = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <section className="marquee" ref={rootRef} aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={i}>
            {item} <b>✦</b>
          </span>
        ))}
      </div>
    </section>
  );
}
