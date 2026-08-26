import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isFinePointer, prefersReducedMotion } from '../lib/motion';

/**
 * Two-part cursor: a precise dot and a lagging ring that reads context —
 * it grows over interactive elements and can show a label via
 * `data-cursor="Open"` on any element.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]');
      const label = target?.dataset.cursor ?? '';
      ring.classList.toggle('is-active', Boolean(target));
      dot.classList.toggle('is-active', Boolean(target));
      if (labelRef.current) {
        labelRef.current.textContent = label;
        ring.classList.toggle('has-label', Boolean(label));
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} />
      </div>
    </>
  );
}
