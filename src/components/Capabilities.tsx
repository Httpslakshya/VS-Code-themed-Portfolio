import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Code2, Database, LayoutDashboard, Server, Sparkles, Zap } from 'lucide-react';
import { gsap, maskRevealLines, prefersReducedMotion, revealChildren, scrambleIn } from '../lib/motion';
import { exploring, skillAreas } from '../data/portfolio';

const ICONS = {
  code: Code2,
  sparkles: Sparkles,
  server: Server,
  zap: Zap,
  database: Database,
  layout: LayoutDashboard,
} as const;

export default function Capabilities() {
  const rootRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      scrambleIn(rootRef.current?.querySelector<HTMLElement>('.kicker')!, 0.1);
      maskRevealLines(rootRef.current?.querySelector<HTMLElement>('.section-title')!, { scrollTrigger: true });
      revealChildren(rootRef.current, { stagger: 0.06 });

      if (!prefersReducedMotion()) {
        // “Now exploring” strip — a slow drift, paused on hover.
        const track = stripRef.current?.querySelector<HTMLElement>('.strip-track');
        if (track) {
          const drift = gsap.to(track, { xPercent: -50, ease: 'none', duration: 24, repeat: -1 });
          stripRef.current?.addEventListener('pointerenter', () => drift.timeScale(0.15));
          stripRef.current?.addEventListener('pointerleave', () => drift.timeScale(1));
        }
      }
    },
    { scope: rootRef }
  );

  /* Card spotlight — cursor-tracked radial glow, one delegated handler. */
  const onCardMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.cap-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="capabilities" className="section capabilities" ref={rootRef} data-cosmo-zone="capabilities">
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="kicker">02 / CAPABILITY MAP</p>
            <h2 className="section-title">
              Technical range,<br />
              <em>intentional focus.</em>
            </h2>
          </div>
          <p className="section-note">
            The centre of gravity is AI and backend engineering — everything else exists to ship
            those systems properly.
          </p>
        </div>

        <div className="strip" ref={stripRef} aria-label="Currently exploring">
          <span className="strip-label">NOW EXPLORING</span>
          <div className="strip-window">
            <div className="strip-track">
              {[...exploring, ...exploring].map((topic, i) => (
                <span className="strip-chip" key={`${topic}-${i}`}>
                  {topic} <i>·</i>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="cap-grid" onPointerMove={onCardMove}>
          {skillAreas.map((area, i) => {
            const Icon = ICONS[area.icon];
            return (
              <article className="cap-card" key={area.name} data-reveal>
                <div className="cap-top">
                  <span className="cap-index">0{i + 1}</span>
                  <span className="cap-icon">
                    <Icon size={20} />
                  </span>
                </div>
                <h3>{area.name}</h3>
                <p>{area.description}</p>
                <span className="cap-tools">{area.tools.join(' · ')}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
