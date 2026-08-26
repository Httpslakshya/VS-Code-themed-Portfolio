import { useEffect, useMemo, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, initSmoothScroll, lockScroll } from './lib/motion';
import { UIContext } from './lib/uiContext';
import type { Project } from './data/portfolio';

import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Projects, { CaseOverlay } from './components/Projects';
import Capabilities from './components/Capabilities';
import Journey from './components/Journey';
import Playground from './components/Playground';
import Contact from './components/Contact';
import Terminal from './components/Terminal';
import Cosmo from './components/Cosmo';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [terminal, setTerminal] = useState<{ open: boolean; command?: string }>({ open: false });
  const [caseProject, setCaseProject] = useState<Project | null>(null);

  /* Smooth scrolling, driven by GSAP’s ticker. */
  useEffect(() => initSmoothScroll(), []);

  /* Global command-interface shortcut. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setTerminal((t) => ({ open: !t.open, command: undefined }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Freeze the page while any layer owns attention. */
  useEffect(() => {
    lockScroll(!booted || terminal.open || caseProject !== null);
  }, [booted, terminal.open, caseProject]);

  /* Reading progress — a quickSetter, not React state. */
  useGSAP(() => {
    const set = gsap.quickSetter('.progress-bar', 'scaleX') as (v: number) => void;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => set(self.progress),
    });
  }, []);

  const ui = useMemo(
    () => ({
      openTerminal: (command?: string) => setTerminal({ open: true, command }),
      openCase: (project: Project) => setCaseProject(project),
      closeCase: () => setCaseProject(null),
      caseProject,
    }),
    [caseProject]
  );

  return (
    <UIContext.Provider value={ui}>
      <Cursor />
      {!booted && <Preloader onDone={() => setBooted(true)} />}
      <div className="noise" aria-hidden="true" />
      <div className="progress" aria-hidden="true">
        <i className="progress-bar" />
      </div>

      <Nav booted={booted} />

      <main>
        <Hero />
        <Marquee />
        <Projects />
        <Capabilities />
        <Journey />
        <Playground />
        <Contact />
      </main>

      <Terminal
        open={terminal.open}
        pendingCommand={terminal.command}
        onClose={() => setTerminal({ open: false })}
        onCommandConsumed={() => setTerminal((t) => ({ ...t, command: undefined }))}
      />
      <Cosmo booted={booted} />
      {caseProject && <CaseOverlay project={caseProject} onClose={() => setCaseProject(null)} />}
    </UIContext.Provider>
  );
}
