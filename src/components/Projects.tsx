import { useEffect, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, X } from 'lucide-react';
import {
  gsap,
  ScrollTrigger,
  maskRevealLines,
  prefersReducedMotion,
  revealChildren,
  scrambleIn,
  lockScroll,
} from '../lib/motion';
import { projects, type Project } from '../data/portfolio';
import { useUI } from '../lib/uiContext';

/* ------------------------------------------------------------------ */
/* Explorer — full-width rows; a floating screenshot trails the cursor  */
/* ------------------------------------------------------------------ */

export default function Projects() {
  const rootRef = useRef<HTMLElement>(null);
  const { openCase } = useUI();
  const [tech, setTech] = useState<string | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      scrambleIn(root?.querySelector<HTMLElement>('.kicker')!, 0.1);
      maskRevealLines(root?.querySelector<HTMLElement>('.section-title')!, {
        scrollTrigger: true,
      });
      /* Head elements reveal as one; the project rows are scroll-synced
         below — each discovers itself as you scroll. */
      revealChildren(root, { stagger: 0.08 });

      /* Scroll-synced sequential reveal — every row owns a slice of scroll
         progress (data order, no hardcoding): faint → full as that row
         travels up the viewport. Reverse scrolling eases it back; the small
         scrub lag keeps each step buttery instead of snapping. */
      const rows = gsap.utils.toArray<HTMLElement>('.project-row', root);
      const stackIndex = root?.querySelector<HTMLElement>('.stack-index');
      if (rows.length && !prefersReducedMotion()) {
        rows.forEach((row) => {
          gsap.fromTo(
            row,
            { autoAlpha: 0.15, y: 64, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                start: 'top 93%',
                end: 'top 70%',
                scrub: 0.7,
              },
            }
          );
        });
        if (stackIndex) {
          gsap.set(stackIndex, { autoAlpha: 0, y: 24 });
          ScrollTrigger.create({
            trigger: stackIndex,
            start: 'top 90%',
            once: true,
            onEnter: () =>
              gsap.to(stackIndex, {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
                ease: 'power3.out',
                onComplete: () => gsap.set(stackIndex, { clearProps: 'opacity,visibility,transform' }),
              }),
          });
        }
      }
    },
    { scope: rootRef }
  );

  /* Derived telemetry + technology index — always in sync with the data. */
  const stats = useMemo(() => {
    const years = projects.map((p) => Number(p.year));
    return {
      total: projects.length,
      ai: projects.filter((p) => p.status === 'AI SYSTEM').length,
      shipped: projects.filter((p) => p.status === 'SHIPPED').length,
      span: `${Math.min(...years)}—${Math.max(...years)}`,
    };
  }, []);

  const techIndex = useMemo(() => {
    const map = new Map<string, { display: string; count: number }>();
    projects.forEach((p) =>
      p.stack.forEach((t) => {
        const key = t.toLowerCase();
        const hit = map.get(key);
        if (hit) hit.count += 1;
        else map.set(key, { display: t, count: 1 });
      })
    );
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, []);

  return (
    <section id="work" className="work" ref={rootRef} data-cosmo-zone="projects">
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="kicker">01 / SELECTED WORK</p>
            <h2 className="section-title">
              Systems built<br />
              to be <em>used.</em>
            </h2>
          </div>
          <p className="section-note">
            Five builds — three of them AI-powered. Open one for the full case study, or trace a
            technology through the index below.
          </p>
        </div>

        <div className="work-index" data-reveal aria-label="Work statistics">
          <span>
            <b>{String(stats.total).padStart(2, '0')}</b> SYSTEMS
          </span>
          <i />
          <span>
            <b>{String(stats.ai).padStart(2, '0')}</b> AI-POWERED
          </span>
          <i />
          <span>
            <b>{String(stats.shipped).padStart(2, '0')}</b> SHIPPED
          </span>
          <i />
          <span>
            <b>{stats.span}</b> ACTIVE
          </span>
        </div>

        <div className="project-list">
          {projects.map((item, index) => {
            const dimmed = tech !== null && !item.stack.some((s) => s.toLowerCase().includes(tech));
            return (
              <button
                key={item.id}
                className={`project-row ${dimmed ? 'is-dim' : ''}`}
                onClick={() => openCase(item)}
                data-cursor="View"
              >
                <span className="row-index">_{String(index + 1).padStart(2, '0')}.</span>
                <span className="row-main">
                  <strong>{item.name}</strong>
                  <span className="row-tags">{item.stack.slice(0, 3).join(' · ')}</span>
                </span>
                <span className="row-status">{item.status}</span>
                <ArrowUpRight className="row-arrow" size={26} />
              </button>
            );
          })}
        </div>

        <div className="stack-index">
          <span className="stack-label">
            STACK INDEX <i>— hover a technology to trace where it ships</i>
          </span>
          <div className="stack-chips">
            {techIndex.map(([key, info]) => (
              <button
                key={key}
                className={`stack-chip ${tech === key ? 'is-on' : ''}`}
                onMouseEnter={() => setTech(key)}
                onFocus={() => setTech(key)}
                onClick={() => setTech(tech === key ? null : key)}
                onMouseLeave={() => setTech((current) => (current === key ? null : current))}
              >
                {info.display} <i>×{info.count}</i>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Case study overlay — the project as a file, not a card               */
/* ------------------------------------------------------------------ */

export function CaseOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const lensInnerRef = useRef<HTMLDivElement>(null);
  const { openCase } = useUI();
  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects[(index + 1) % projects.length];

  const requestClose = () => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return onClose();
    gsap
      .timeline({ onComplete: onClose })
      .to(root.querySelector('.case-panel'), { y: 34, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .to(root.querySelector('.case-backdrop'), { autoAlpha: 0, duration: 0.25 }, 0);
  };

  useGSAP(
    () => {
      lockScroll(true);
      const root = rootRef.current!;
      if (prefersReducedMotion()) return () => lockScroll(false);
      gsap
        .timeline()
        .from(root.querySelector('.case-backdrop'), { autoAlpha: 0, duration: 0.35 })
        .from(
          root.querySelector('.case-panel'),
          { yPercent: 6, autoAlpha: 0, scale: 0.985, duration: 0.55, ease: 'power4.out' },
          0.08
        )
        .from(
          '.case-reveal',
          { y: 26, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' },
          0.2
        );
      return () => lockScroll(false);
    },
    { scope: rootRef }
  );

  /* The inspection lens — a cursor-following glass that reveals the
     project’s alternate screen. The ring glides after the cursor while the
     image inside moves a touch faster: a small parallax that makes it feel
     like a physical magnifier rather than a mask. */
  useGSAP(
    () => {
      const figure = figureRef.current;
      const lens = lensRef.current;
      const inner = lensInnerRef.current;
      if (!figure || !lens || !inner || prefersReducedMotion()) return;

      const R = 115; // lens radius
      const glass = { x: 0, y: 0 }; // the ring — slower, heavier
      const view = { x: 0, y: 0 }; // the image — leads slightly
      const apply = () => {
        gsap.set(lens, { x: glass.x - R, y: glass.y - R });
        gsap.set(inner, { x: -(view.x - R), y: -(view.y - R) });
      };
      const gxTo = gsap.quickTo(glass, 'x', { duration: 0.5, ease: 'power3', onUpdate: apply });
      const gyTo = gsap.quickTo(glass, 'y', { duration: 0.5, ease: 'power3', onUpdate: apply });
      const vxTo = gsap.quickTo(view, 'x', { duration: 0.3, ease: 'power3', onUpdate: apply });
      const vyTo = gsap.quickTo(view, 'y', { duration: 0.3, ease: 'power3', onUpdate: apply });

      /* Keep the revealed image exactly aligned with the base screenshot. */
      const sizeInner = () => {
        const rect = figure.getBoundingClientRect();
        gsap.set(inner, { width: rect.width, height: rect.height });
        return rect;
      };

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const rect = figure.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gxTo(x);
        gyTo(y);
        vxTo(x);
        vyTo(y);
      };
      const onEnter = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const rect = sizeInner();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gsap.set(glass, { x, y });
        gsap.set(view, { x, y });
        apply();
        gsap.killTweensOf(lens);
        // the glass expands in with a slight overshoot and settles flat
        gsap.fromTo(
          lens,
          { scale: 0.35, autoAlpha: 0, rotation: -7 },
          { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.6)' }
        );
      };
      const onLeave = () => {
        gsap.killTweensOf(lens);
        gsap.to(lens, { scale: 0.3, autoAlpha: 0, rotation: 5, duration: 0.35, ease: 'power2.in' });
      };

      figure.addEventListener('pointermove', onMove, { passive: true });
      figure.addEventListener('pointerenter', onEnter);
      figure.addEventListener('pointerleave', onLeave);
      window.addEventListener('resize', sizeInner);
      return () => {
        figure.removeEventListener('pointermove', onMove);
        figure.removeEventListener('pointerenter', onEnter);
        figure.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('resize', sizeInner);
      };
    },
    { scope: rootRef }
  );

  /* Swapping to the next case animates in place. */
  const firstCase = useRef(true);
  useEffect(() => {
    if (firstCase.current) {
      firstCase.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    gsap.set('.case-panel', { autoAlpha: 1, y: 0 });
    gsap.fromTo(
      '.case-reveal',
      { y: 22, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
    );

    /* The lens follows the new project: re-align its revealed image with
       the new base screenshot, then transition the image in with motion —
       never an abrupt swap. */
    const figure = figureRef.current;
    const lens = lensRef.current;
    const inner = lensInnerRef.current;
    const lensImg = inner?.querySelector('img');
    if (figure && lens && inner && lensImg) {
      const rect = figure.getBoundingClientRect();
      gsap.set(inner, { width: rect.width, height: rect.height });
      gsap.killTweensOf([lensImg, lens]);
      gsap.fromTo(
        lensImg,
        { autoAlpha: 0, scale: 1.14, rotation: 2 },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.55, ease: 'power3.out' }
      );
      if (gsap.getProperty(lens, 'autoAlpha') > 0.5) {
        // pointer was still on the figure — the glass re-focuses with a pulse
        gsap.fromTo(lens, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' });
      }
    }
  }, [project.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && requestClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="case-root" ref={rootRef} role="dialog" aria-modal="true" aria-label={`${project.name} case study`}>
      <div className="case-backdrop" onClick={requestClose} />
      <article className="case-panel">
        <header className="case-head">
          <div>
            <p className="kicker">
              {String(index + 1).padStart(2, '0')} / {project.label}
            </p>
            <h2 className="case-reveal">{project.name}</h2>
            <p className="case-lead case-reveal">{project.description}</p>
          </div>
          <button className="case-close" onClick={requestClose} aria-label="Close case study">
            <X size={20} />
          </button>
        </header>

        <div className="case-scroll" data-lenis-prevent>
          <div className="case-figure case-reveal" ref={figureRef} data-cursor="Inspect">
            <img className="lens-base" src={project.image} alt={`${project.name} interface`} width={1280} height={800} />
            <div className="lens" ref={lensRef} aria-hidden="true">
              <div className="lens-inner" ref={lensInnerRef}>
                <img src={project.hoverImage} alt="" width={1280} height={800} />
              </div>
            </div>
            <span className="lens-hint" aria-hidden="true">
              <i /> INSPECT — HOVER THE SCREEN
            </span>
          </div>

          <div className="case-meta case-reveal">
            <div>
              <span>ROLE</span>
              <strong>{project.role}</strong>
            </div>
            <div>
              <span>YEAR</span>
              <strong>{project.year}</strong>
            </div>
            <div>
              <span>STATUS</span>
              <strong>{project.status}</strong>
            </div>
          </div>

          <div className="case-grid case-reveal">
            <div>
              <span>THE PROBLEM</span>
              <p>{project.problem}</p>
            </div>
            <div>
              <span>THE APPROACH</span>
              <p>{project.approach}</p>
            </div>
          </div>

          <div className="case-highlights case-reveal">
            <span>WHAT IT DOES</span>
            <ul>
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div className="case-stack case-reveal">
            <span>BUILT WITH</span>
            <div className="tags">
              {project.stack.map((tech) => (
                <b key={tech}>{tech}</b>
              ))}
            </div>
          </div>

          <footer className="case-footer case-reveal">
            <a className="button ghost" href={project.github} target="_blank" rel="noreferrer">
              View source <ArrowUpRight size={15} />
            </a>
            <button
              className="text-link"
              onClick={() => {
                if (prefersReducedMotion()) return openCase(next);
                gsap
                  .timeline()
                  .to('.case-panel', { autoAlpha: 0, y: 20, duration: 0.25, ease: 'power2.in' })
                  .add(() => openCase(next));
              }}
            >
              Next case — {next.name} <ArrowUpRight size={15} />
            </button>
          </footer>
        </div>
      </article>
    </div>
  );
}
