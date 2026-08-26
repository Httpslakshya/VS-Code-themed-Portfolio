import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Command, Menu, X } from 'lucide-react';
import { gsap, ScrollTrigger, isFinePointer, scrollToSection } from '../lib/motion';
import { sections } from '../data/portfolio';
import { useUI } from '../lib/uiContext';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone/.test(navigator.platform);

export default function Nav({ booted }: { booted: boolean }) {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { openTerminal } = useUI();

  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;

      // Entrance once the boot completes.
      if (booted) gsap.fromTo(nav, { yPercent: -120 }, { yPercent: 0, duration: 0.9, ease: 'power4.out' });

      // Hide on scroll down, return on scroll up; tint after leaving the top.
      let lastDirection = 0;
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate(self) {
          nav.classList.toggle('is-scrolled', self.scroll() > 40);
          if (!isFinePointer()) return;
          if (self.direction !== lastDirection) {
            lastDirection = self.direction;
            gsap.to(nav, {
              yPercent: self.direction === 1 && self.scroll() > 160 ? -120 : 0,
              duration: 0.45,
              ease: 'power3.out',
              overwrite: true,
            });
          }
        },
      });

      // Active-section tracking. (Elements are passed directly — the hook’s
      // scope would otherwise resolve `#id` selectors inside the nav.)
      const homeTrigger = ScrollTrigger.create({
        trigger: document.getElementById('home'),
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => self.isActive && setActiveSection(''),
      });
      const triggers = sections
        .map((section) => ({ section, el: document.getElementById(section.id) }))
        .filter((s): s is { section: (typeof sections)[number]; el: HTMLElement } => Boolean(s.el))
        .map(({ section, el }) =>
          ScrollTrigger.create({
            trigger: el,
            start: 'top 45%',
            end: 'bottom 45%',
            onToggle: (self) => self.isActive && setActiveSection(section.id),
          })
        );

      return () => {
        st.kill();
        homeTrigger.kill();
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: navRef, dependencies: [booted] }
  );

  useGSAP(
    () => {
      if (!menuRef.current) return;
      if (menuOpen) {
        gsap.fromTo(menuRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
        gsap.fromTo(
          menuRef.current.querySelectorAll('button'),
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out' }
        );
      }
    },
    { scope: menuRef, dependencies: [menuOpen] }
  );

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <nav className={`nav ${booted ? 'is-ready' : ''}`} ref={navRef} aria-label="Primary">
        <button className="brand" onClick={() => go('home')} aria-label="Back to top">
          <span>LD</span>
          <i />
        </button>
        <div className="nav-links">
          {sections.map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? 'is-active' : ''}
              onClick={() => go(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="terminal-trigger" onClick={() => openTerminal()} data-cursor="⌘" data-cosmo-zone="terminal">
            <Command size={14} />
            <span>Open interface</span>
            <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu" ref={menuRef}>
          {sections.map((section) => (
            <button key={section.id} onClick={() => go(section.id)}>
              <span>0{sections.indexOf(section) + 1}</span>
              {section.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              openTerminal();
            }}
          >
            <span>⌘</span>Open interface
          </button>
        </div>
      )}
    </>
  );
}
