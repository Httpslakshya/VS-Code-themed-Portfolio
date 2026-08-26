import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowDownRight, FileText } from 'lucide-react';
import { BrainCircuit, Circle } from 'lucide-react';
import {
  gsap,
  SCRAMBLE_CHARS,
  isFinePointer,
  prefersReducedMotion,
  scrollToSection,
} from '../lib/motion';
import { profile } from '../data/portfolio';

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLSpanElement>(null);

  /* Cycling system log — the hero’s “live telemetry” card. */
  useEffect(() => {
    if (prefersReducedMotion() || !logRef.current) return;
    let index = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      index = (index + 1) % profile.systemLog.length;
      gsap.to(logRef.current, {
        duration: 0.7,
        scrambleText: { text: profile.systemLog[index], chars: SCRAMBLE_CHARS, speed: 0.7 },
      });
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      /* No entrance choreography here — the loading counter + shutter are
         the entire reveal. Every hero element sits in its final state from
         first paint; only ambient motion lives below. */

      /* ---------- ambient motion (desktop pointers only) ---------- */
      if (isFinePointer()) {
        // Mouse parallax — each layer carries a data-depth factor.
        const layers = gsap.utils.toArray<HTMLElement>('[data-parallax]', root);
        const setters = layers.map((layer) => ({
          depth: parseFloat(layer.dataset.depth ?? '10'),
          x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3' }),
          y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3' }),
        }));
        const onPointer = (e: PointerEvent) => {
          const cx = e.clientX - window.innerWidth / 2;
          const cy = e.clientY - window.innerHeight / 2;
          setters.forEach(({ depth, x, y }) => {
            x((cx / window.innerWidth) * depth * 2);
            y((cy / window.innerHeight) * depth * 2);
          });
        };
        root.addEventListener('pointermove', onPointer, { passive: true });

        // The portrait tilts toward the cursor — a card held up to the light.
        const frame = root.querySelector<HTMLElement>('.portrait-frame');
        if (frame) {
          gsap.set(frame, { transformPerspective: 1000 });
          const rx = gsap.quickTo(frame, 'rotationX', { duration: 0.8, ease: 'power3' });
          const ry = gsap.quickTo(frame, 'rotationY', { duration: 0.8, ease: 'power3' });
          const onTilt = (e: PointerEvent) => {
            const rect = frame.getBoundingClientRect();
            const px = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
            const py = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
            rx(gsap.utils.clamp(-5, 5, -py * 7));
            ry(gsap.utils.clamp(-6, 6, px * 8));
          };
          root.addEventListener('pointermove', onTilt, { passive: true });
        }

        // Floating telemetry cards.
        gsap.utils.toArray<HTMLElement>('.system-card', root).forEach((card, i) => {
          gsap.to(card, {
            y: i % 2 ? 9 : -9,
            duration: 2.6 + i * 0.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' },
          });
        });

        return () => root.removeEventListener('pointermove', onPointer);
      }
    },
    { scope: rootRef }
  );

  /* Depth on the way out — the hero recedes as the work arrives. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to('.hero-copy', {
        yPercent: -9,
        autoAlpha: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom 30%', scrub: true },
      });
      gsap.to('.hero-visual', {
        yPercent: 11,
        ease: 'none',
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: rootRef }
  );

  return (
    <section id="home" className="hero" ref={rootRef} data-cosmo-zone="hero">
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="shell hero-shell">
        <div className="hero-copy">
          <p className="hero-eyebrow eyebrow">
            <span className="status-dot" />
            <span className="eyebrow-text">{profile.availability.toUpperCase()}</span>
          </p>
          <h1 className="hero-title">
            Building useful <em>intelligence</em> for the web.
          </h1>
          <p className="hero-intro">{profile.intro}</p>
          <div className="hero-ctas">
            <button className="button primary magnetic" onClick={() => scrollToSection('work')}>
              Explore selected work <ArrowDownRight size={17} />
            </button>
            <a className="button ghost magnetic" href={profile.resume} target="_blank" rel="noreferrer">
              <FileText size={16} /> View Resume
            </a>
          </div>
          <div className="signal-row">
            {profile.heroSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="false">
          <div className="orbit-ring" data-parallax="6" aria-hidden="true" />
          <div className="orb orb-glow" data-parallax="14" aria-hidden="true" />
          <div className="portrait-frame" data-parallax="10" data-cosmo-zone="portrait">
            <img src={profile.portrait} alt={profile.name} width={1000} height={1250} />
            <div className="portrait-wash" />
            <span className="frame-corner tl" aria-hidden="true" />
            <span className="frame-corner tr" aria-hidden="true" />
            <span className="frame-corner bl" aria-hidden="true" />
            <span className="frame-corner br" aria-hidden="true" />
            <span className="scanline" aria-hidden="true" />
            <div className="detect-box" aria-hidden="true">
              <span className="detect-label">SUBJECT — LAKSHYA.D · 99.7%</span>
            </div>
          </div>
          <div className="system-card top-card" data-parallax="18">
            <div>
              <span className="mini-label">CURRENT FOCUS</span>
              <strong>Applied AI systems</strong>
            </div>
            <BrainCircuit size={20} />
          </div>
          <div className="system-card bottom-card log-card" data-parallax="14">
            <span className="pulse-dot">
              <Circle size={9} fill="currentColor" />
            </span>
            <div>
              <span className="mini-label">
                SYSTEM LOG — <span ref={logRef}>boot complete</span>
              </span>
              <strong>Building in public</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-scrollcue" aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}
