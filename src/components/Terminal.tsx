import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { X } from 'lucide-react';
import { gsap, prefersReducedMotion, scrollToSection } from '../lib/motion';
import {
  education,
  journey,
  profile,
  projects,
  skillAreas,
} from '../data/portfolio';
import { openCosmo } from './Cosmo';
import { cosmoRuntime, currentPose } from '../services/cosmoAnimation';

type LineKind = 'in' | 'out' | 'sys' | 'err' | 'ok' | 'dim' | 'accent' | 'link';
interface Line {
  id: number;
  kind: LineKind;
  text: string;
  href?: string;
}

const PROMPT = 'guest@lakshya:~$';
const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

const JOKES = [
  'why did the neural network break up with the decision tree? it needed someone less shallow.',
  'there are 10 types of people: those who understand binary and those who ask the terminal for help.',
  'a rag pipeline walks into a bar. bartender: "what\'ll it be?" pipeline: "give me a second — let me retrieve the context."',
  'lakshya\'s code has two states: works on my machine, and works in production. no third state observed.',
  'i would tell you a udp joke, but you might not get it.',
];

export default function Terminal({
  open,
  pendingCommand,
  onClose,
  onCommandConsumed,
}: {
  open: boolean;
  pendingCommand?: string;
  onClose: () => void;
  onCommandConsumed: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const bootedRef = useRef(false);
  const mountedRef = useRef(true);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const line = (kind: LineKind, text: string, href?: string): Line => ({
    id: idRef.current++,
    kind,
    text,
    href,
  });

  const push = (...newLines: Line[]) => setLines((prev) => [...prev, ...newLines]);

  /** Print with a typewriter cadence (instant for reduced motion). */
  const print = async (newLines: Line[]) => {
    if (prefersReducedMotion()) {
      push(...newLines);
      return;
    }
    for (const l of newLines) {
      if (!mountedRef.current) return;
      await sleep(26);
      push(l);
    }
  };

  /* ------------------------- command registry ------------------------- */

  const COMMAND_HINTS: Record<string, string> = {
    help: 'list commands',
    about: 'who lakshya is',
    projects: 'list systems',
    project: 'inspect one system',
    skills: 'capability map',
    stack: 'the short version',
    experience: 'trajectory',
    education: 'formal base',
    open: 'jump to a section',
    contact: 'channels',
    github: 'open github',
    linkedin: 'open linkedin',
    resume: 'open resume',
    neofetch: 'system summary',
    whoami: 'identity check',
    clear: 'wipe buffer',
    exit: 'close interface',
    top: 'process monitor',
    matrix: 'follow the white rabbit',
    chai: 'brew one',
    joke: 'dev humour',
    hire: 'smart move',
    socials: 'everywhere lakshya is',
    theme: 'the aesthetic',
    pwd: 'where are you',
  };

  const runCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    push(line('in', trimmed));
    setHistory((prev) => [...prev.filter((h) => h !== trimmed), trimmed]);
    setHistoryIndex(-1);
    window.dispatchEvent(new CustomEvent('cosmo:term')); // COSMO notices activity

    const [cmd, ...args] = trimmed.toLowerCase().split(/\s+/);
    const rest = args.join(' ');
    const out = (text: string) => line('out', text);
    const dim = (text: string) => line('dim', text);
    const accent = (text: string) => line('accent', text);
    const link = (text: string, href: string) => line('link', text, href);

    switch (cmd) {
      case 'help':
        await print([
          line('sys', 'AVAILABLE COMMANDS'),
          out('  about            who lakshya is'),
          out('  projects         list the shipped systems'),
          out('  project <name>   inspect one system in depth'),
          out('  skills           capability map'),
          out('  experience       the trajectory so far'),
          out('  education        the formal base'),
          out('  stack            the short version'),
          dim('  ── navigation ──'),
          out('  open <section>   work · capabilities · journey · playground · contact'),
          dim('  ── links ──'),
          out('  github · linkedin · resume · contact'),
          dim('  ── fun & system ──'),
          out('  neofetch · top · matrix · chai · joke · hire · socials'),
          out('  whoami · pwd · history · clear · exit'),
          dim('  ── the companion ──'),
          out('  cosmo help       everything COSMO can do'),
          dim('  (a few are still undocumented. curious guests find them.)'),
        ]);
        break;

      case 'about':
        await print([
          out(`${profile.name} — ${profile.role}.`),
          out('Builds AI systems, intelligent applications and automation with Python,'),
          out('then wraps them in interfaces people actually want to use.'),
          accent(`Currently: ${profile.availability.toLowerCase()}.`),
        ]);
        break;

      case 'projects':
        await print([
          line('sys', `${projects.length} SYSTEMS ON RECORD`),
          ...projects.map((p, i) =>
            line(
              'out',
              `  ${String(i + 1).padStart(2, '0')}  ${p.name.padEnd(14)} ${p.status.padEnd(11)} ${p.stack
                .slice(0, 2)
                .join(' · ')
                .toLowerCase()}`
            )
          ),
          dim("  inspect one with: project <name or number>"),
        ]);
        break;

      case 'project': {
        const query = rest.replace(/^0*(\d+).*$/, '$1');
        const found =
          projects.find((p) => p.id === rest.replace(/\s+/g, '')) ??
          projects.find((p) => p.name.toLowerCase().includes(rest) && rest.length > 1) ??
          (/^\d+$/.test(query) ? projects[Number(query) - 1] : undefined);
        if (!found) {
          await print([line('err', `no system matching "${rest}". try 'projects' for the index.`)]);
          break;
        }
        await print([
          line('sys', `${found.name.toUpperCase()} — ${found.label}`),
          out(found.description),
          dim('  problem ▸ ' + found.problem),
          dim('  approach ▸ ' + found.approach),
          ...found.highlights.map((h) => out('  ▸ ' + h)),
          out('  stack: ' + found.stack.join(' · ')),
          out(`  role: ${found.role.toLowerCase()} · year: ${found.year}`),
          link('  → view source on github', found.github),
          dim("  or type 'open work' to see it in the explorer"),
        ]);
        break;
      }

      case 'skills':
        await print([
          line('sys', 'CAPABILITY MAP'),
          ...skillAreas.map((area) => out(`  ${(area.name + ' ').padEnd(11, '·')} ${area.tools.join(' · ')}`)),
        ]);
        break;

      case 'stack':
        await print([out('python · fastapi · rag/llm pipelines · react · automation · sql')]);
        break;

      case 'experience':
        await print(
          journey.flatMap((entry) => [
            line('accent', `  ${entry.period}`),
            out(`  ${entry.title}`),
            dim(`    ${entry.detail}`),
            line('dim', ''),
          ])
        );
        break;

      case 'education':
        await print([
          out(`${education.degree} — ${education.school}`),
          dim(`  ${education.period}`),
        ]);
        break;

      case 'open': {
        const map: Record<string, string> = {
          work: 'work',
          projects: 'work',
          capabilities: 'capabilities',
          skills: 'capabilities',
          journey: 'journey',
          experience: 'journey',
          playground: 'playground',
          contact: 'contact',
          home: 'home',
          top: 'home',
        };
        const target = map[rest];
        if (!target) {
          await print([line('err', `unknown section "${rest}". try: work, capabilities, journey, playground, contact`)]);
          break;
        }
        await print([line('ok', `navigating → ${target} …`)]);
        await sleep(320);
        if (mountedRef.current) {
          onClose();
          // Let the parent release the scroll lock before gliding there.
          window.setTimeout(() => scrollToSection(target), 90);
        }
        break;
      }

      case 'contact':
        await print([
          line('sys', 'CHANNELS'),
          link('  email    ' + profile.email, `mailto:${profile.email}`),
          link('  github   github.com/Httpslakshya', profile.github),
          link('  linkedin /in/lakshya-dharkar', profile.linkedin),
          dim('  response time: usually within a day'),
        ]);
        break;

      case 'github':
        window.open(profile.github, '_blank');
        await print([line('ok', 'opening github →')]);
        break;

      case 'linkedin':
        window.open(profile.linkedin, '_blank');
        await print([line('ok', 'opening linkedin →')]);
        break;

      case 'resume':
      case 'cv':
        window.open(profile.resume, '_blank');
        await print([line('ok', 'opening resume pdf →')]);
        break;

      case 'email':
        window.location.href = `mailto:${profile.email}`;
        await print([line('ok', 'drafting mail to ' + profile.email + ' →')]);
        break;

      case 'whoami':
        await print([out('guest — but the interesting process on this machine is lakshya. try \'about\'.')]);
        break;

      case 'pwd':
        await print([out('/home/lakshya/portfolio')]);
        break;

      case 'top':
      case 'htop':
        await print([
          line('sys', 'PROCESSES — lakshya.os'),
          out('  PID  PROCESS              CPU   STATUS'),
          out('  001  rag-service          12%   healthy'),
          out('  002  cosmo-voice-loop      8%   listening'),
          out('  003  reflekt-prompts       5%   shipping'),
          out('  004  malwa-express        23%   rendering frames'),
          out('  005  medistock-watch       3%   stable'),
          out('  006  chai-scheduler        1%   brewing'),
          dim('  load average: curious, focused, shipping'),
        ]);
        break;

      case 'chai':
      case 'coffee':
        await print([
          out('      ( ('),
          out('       ) )'),
          out('    ..........'),
          out('    |        |]'),
          out('    \\        /'),
          out("     `------'"),
          accent('  chai.exe — brewing. ideas loading.'),
        ]);
        break;

      case 'joke':
        await print([out(JOKES[Math.floor(Math.random() * JOKES.length)])]);
        break;

      case 'hire':
        await print([
          line('sys', 'SMART MOVE.'),
          out('lakshya is currently open to selected opportunities.'),
          link('  → lakshyadharkar@gmail.com', `mailto:${profile.email}`),
          dim("  type 'contact' for all channels · response usually < 24h"),
        ]);
        break;

      case 'matrix': {
        const glyph = () => {
          const chars = 'アイウエオカキクケコサシスセソ01<>/#$%&';
          let row = '';
          for (let i = 0; i < 46; i++) row += chars[Math.floor(Math.random() * chars.length)];
          return row;
        };
        await print([
          ...Array.from({ length: 8 }, () => line('ok', glyph())),
          dim('wake up, guest. the portfolio is built on python.'),
        ]);
        break;
      }

      case 'socials':
        await print([
          link('  github    github.com/Httpslakshya', profile.github),
          link('  linkedin  /in/lakshya-dharkar', profile.linkedin),
          link('  chess     chess.com/member/theycallmelakshya', profile.chess),
          link('  spotify   current rotation', profile.spotify),
        ]);
        break;

      case 'theme':
        await print([
          out('theme: phosphor-on-obsidian.'),
          dim('changing it would violate the aesthetic. try \'matrix\' instead.'),
        ]);
        break;

      case 'neofetch':
        await print([
          line('accent', '  ██╗     ██╗    ' + 'guest@lakshya'),
          line('accent', '  ██║     ██║    ' + '──────────────────────'),
          line('accent', '  ██║     ██║    ' + 'role    python dev · ai engineer'),
          line('accent', '  ██║     ██║    ' + 'focus   applied AI systems'),
          line('accent', '  ███████╗██║    ' + 'stack   python · fastapi · react'),
          line('accent', '  ╚══════╝╚═╝    ' + 'uptime  building since 2022'),
          dim('  shell: portfolio-cli · theme: phosphor'),
        ]);
        break;

      case 'sudo':
        await print([line('err', 'guest is not in the sudoers file. this incident will be reported to no one.')]);
        break;

      case 'ai':
      case 'cosmo': {
        // `cosmo <sub>` — live telemetry + direct control of the companion.
        if (args[0]) {
          const rt = cosmoRuntime;
          const sub = args[0];
          if (sub === 'help') {
            await print([
              line('sys', 'COSMO COMMANDS'),
              out('  cosmo status      state · mood · location'),
              out('  cosmo locate      where he is right now'),
              out('  cosmo mood        his current mood'),
              out('  cosmo animation   the pose currently playing'),
              dim('  ── control ──'),
              out('  cosmo roam        send him exploring'),
              out('  cosmo follow      follow the cursor for a while'),
              out('  cosmo stop        pause the roaming'),
              out('  cosmo sleep       enter low power'),
              out('  cosmo wake        wake him up'),
            ]);
          } else if (sub === 'status') {
            await print([
              line('sys', `COSMO — ${rt.state === 'sleeping' ? 'LOW POWER' : 'LIVE'}`),
              out(`  ${rt.state === 'sleeping' ? 'sleeping' : 'online'} // ${rt.state} // ${rt.location}`),
              out(`  activity ${rt.activity}`),
            ]);
          } else if (sub === 'locate') {
            await print([out(`location: ${rt.location} — he’s around there somewhere.`)]);
          } else if (sub === 'mood') {
            await print([out(`mood: ${rt.mood}`)]);
          } else if (sub === 'animation') {
            await print([out(`animation: ${currentPose()}`)]);
          } else if (sub === 'roam' || sub === 'wake' || sub === 'sleep' || sub === 'stop' || sub === 'follow') {
            window.dispatchEvent(new CustomEvent('cosmo:cmd', { detail: sub }));
            const ack: Record<string, string> = {
              roam: 'cosmo: roaming enabled →',
              wake: 'cosmo: waking →',
              sleep: 'cosmo: entering low power →',
              stop: 'cosmo: holding position →',
              follow: 'cosmo: cursor-follow engaged →',
            };
            await print([line('ok', ack[sub])]);
          } else {
            await print([
              line('err', `unknown cosmo command: ${sub}. try help, status, locate, mood, animation, roam, follow, stop, sleep, wake.`),
            ]);
          }
          break;
        }
        await print([
          line('sys', 'ASSISTANT MODULE — ONLINE'),
          out('COSMO is hovering in the corner, watching this terminal.'),
          out('try: cosmo status · cosmo roam · cosmo help'),
          accent('Summoning him…'),
        ]);
        await sleep(500);
        if (mountedRef.current) {
          openCosmo();
        }
        break;
      }

      case 'rm':
        await print([line('err', `rm: cannot remove '${rest || '/'}': this portfolio is load-bearing.`)]);
        break;

      case 'ls':
        await print([out('about.txt   projects/   skills.txt   resume.pdf   secrets/')]);
        break;

      case 'cat':
        if (rest.startsWith('about')) await print([out(profile.intro)]);
        else if (rest.startsWith('skills') || rest.startsWith('stack'))
          await print([out('python · fastapi · rag/llm · react · automation · sql')]);
        else if (rest.startsWith('secrets')) await print([line('err', 'cat: secrets/: permission denied (nice try)')]);
        else if (rest.startsWith('resume')) await print([line('ok', "opening resume → (or run 'resume')")]);
        else await print([line('err', `cat: ${rest || ''}: no such file`)]);
        break;

      case 'history':
        await print([...history.map((h, i) => dim(`  ${String(i + 1).padStart(3)}  ${h}`))]);
        break;

      case 'echo':
        await print([out(args.join(' '))]);
        break;

      case 'date':
        await print([out(new Date().toString())]);
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        break;

      case 'exit':
      case 'quit':
      case 'close':
        await print([line('ok', 'closing interface …')]);
        await sleep(260);
        if (mountedRef.current) onClose();
        break;

      default: {
        const suggestion = Object.keys(COMMAND_HINTS).find((c) => c.startsWith(cmd[0] ?? '') && c !== cmd);
        await print([
          line('err', `command not found: ${cmd}${suggestion ? ` — did you mean '${suggestion}'?` : ". try 'help'."}`),
        ]);
      }
    }
  };

  /* --------------------------- lifecycle --------------------------- */

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* Boot on first open; run any queued command; refocus. */
  useEffect(() => {
    if (!open) return;
    // The entrance makes the overlay visible over ~0.25s — focusing earlier
    // silently fails on a `visibility: hidden` subtree.
    const focus = () => inputRef.current?.focus({ preventScroll: true });
    const focusWhenVisible = window.setTimeout(focus, 340);

    if (!bootedRef.current) {
      bootedRef.current = true;
      const boot = async () => {
        await print([
          line('sys', 'LAKSHYA.OS [version 4.0.0]'),
          line('dim', '(c) lakshya dharkar — all signals reserved.'),
          line('out', "Type 'help' to list commands."),
          line('dim', ''),
        ]);
        if (pendingCommand && mountedRef.current) {
          await runCommand(pendingCommand);
          onCommandConsumed();
        }
        focus();
      };
      boot();
    } else if (pendingCommand) {
      runCommand(pendingCommand);
      onCommandConsumed();
    }

    /* Focus trap: while open, keystrokes always belong to the terminal. */
    const trap = (e: FocusEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) focus();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('focusin', trap);
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusWhenVisible);
      window.removeEventListener('focusin', trap);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingCommand]);

  /* Keep the buffer pinned to the latest line. */
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  /* Entrance / exit. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (open) {
        gsap
          .timeline()
          .to(root, { autoAlpha: 1, duration: 0.25 })
          .fromTo(
            root.querySelector('.terminal-window'),
            { yPercent: 4, scale: 0.97, autoAlpha: 0 },
            { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power4.out' },
            0.05
          );
      } else if (bootedRef.current) {
        gsap.to(root, { autoAlpha: 0, duration: 0.25, delay: 0.1 });
        gsap.to(root.querySelector('.terminal-window'), { y: 18, scale: 0.98, duration: 0.3, ease: 'power2.in' });
      }
    },
    { scope: rootRef, dependencies: [open] }
  );

  /* --------------------------- input --------------------------- */

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = input;
    setInput('');
    runCommand(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < 0) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = Object.keys(COMMAND_HINTS).filter((c) => c.startsWith(input.trim()));
      if (matches.length === 1) setInput(matches[0] + ' ');
      else if (matches.length > 1) push(line('dim', '  ' + matches.join('   ')));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'c' && e.ctrlKey) {
      push(line('dim', PROMPT + ' ^C'));
      setInput('');
    }
  };

  const quick = ['help', 'projects', 'skills', 'neofetch', 'ai'];

  return (
    <div
      className="terminal-root"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio command interface"
    >
      <div className="terminal-backdrop" onClick={onClose} />
      <div className="terminal-window" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <header>
          <span className="chrome-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="terminal-title">{PROMPT} ~/portfolio</span>
          <button onClick={onClose} aria-label="Close terminal" className="terminal-close">
            <X size={17} />
          </button>
        </header>

        <div className="terminal-body" ref={bodyRef} data-lenis-prevent>
          {lines.map((l) =>
            l.href ? (
              <p key={l.id} className={`t-line t-${l.kind}`}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.text}
                </a>
              </p>
            ) : (
              <p key={l.id} className={`t-line t-${l.kind}`}>
                {l.text || ' '}
              </p>
            )
          )}
          <form onSubmit={submit}>
            <span className="t-prompt">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal input"
              placeholder={lines.length > 4 ? '' : 'try: help'}
            />
          </form>
        </div>

        <div className="terminal-quick">
          {quick.map((cmd) => (
            <button key={cmd} onClick={() => runCommand(cmd)}>
              {cmd}
            </button>
          ))}
          <span className="terminal-hint">tab completes · ↑ history · esc closes</span>
        </div>
      </div>
    </div>
  );
}
