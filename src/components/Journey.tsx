import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { gsap, ScrollTrigger, maskRevealLines, revealChildren, scrambleIn } from '../lib/motion';
import { journey, telemetry } from '../data/portfolio';
import { useUI } from '../lib/uiContext';

export default function Journey() {
  const rootRef = useRef<HTMLElement>(null);
  const { openTerminal } = useUI();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      scrambleIn(root.querySelector<HTMLElement>('.kicker')!, 0.1);
      maskRevealLines(root.querySelector<HTMLElement>('.section-title')!, { scrollTrigger: true });
      revealChildren(root, { stagger: 0.08 });

      /* Telemetry counters — tick up when the column arrives. */
      root.querySelectorAll<HTMLElement>('.tele-value').forEach((el) => {
        const target = Number(el.dataset.value ?? 0);
        const state = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(state, {
              v: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = String(Math.round(state.v)).padStart(2, '0');
              },
            }),
        });
      });

      /* The trajectory line draws itself as you move through it — a long
         scrub catch-up (1.8s) makes the line visibly trail the scroll and
         glide into place after you stop: cinematic, never snappy. */
      const line = root.querySelector<HTMLElement>('.timeline-line');
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: 'top center',
            ease: 'none',
            scrollTrigger: {
              trigger: '.timeline',
              start: 'top 72%',
              end: 'bottom 48%',
              scrub: 1.8,
            },
          }
        );
      }

      /* Entries light up while in focus. */
      gsap.utils.toArray<HTMLElement>('.timeline-item', root).forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 40%',
          toggleClass: { targets: item, className: 'is-active' },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section id="journey" className="section journey" ref={rootRef} data-cosmo-zone="journey">
      <div className="shell journey-shell">
        <div className="journey-sticky">
          <p className="kicker">03 / TRAJECTORY</p>
          <h2 className="section-title">
            Always moving<br />
            toward <em>better systems.</em>
          </h2>
          <div className="telemetry" data-reveal>
            {telemetry.map((stat) => (
              <div className="tele-item" key={stat.label}>
                <span className="tele-value" data-value={stat.value}>
                  00
                  <i>{stat.suffix}</i>
                </span>
                <span className="tele-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <button className="text-link" data-reveal onClick={() => openTerminal('experience')}>
            Pull the full history via CLI <ChevronRight size={15} />
          </button>
        </div>

        <div className="timeline">
          <span className="timeline-line" aria-hidden="true" />
          {journey.map((entry) => (
            <div className="timeline-item" key={entry.period} data-reveal>
              <span className="timeline-node" aria-hidden="true" />
              <span className="timeline-period">
                {entry.period}
                {entry.current && <i className="live-dot" />}
              </span>
              <h3>
                {entry.title}
                {entry.title.includes('B.Tech') && <GraduationCap size={17} />}
              </h3>
              <p>{entry.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
