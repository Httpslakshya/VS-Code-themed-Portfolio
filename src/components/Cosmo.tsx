import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Send, X } from 'lucide-react';
import { gsap, ScrollTrigger, isFinePointer, prefersReducedMotion, scrollToSection } from '../lib/motion';
import {
  COSMO_LIMITS,
  answerOffline,
  consumeMessage,
  getUsage,
} from '../data/cosmo';
import { askCosmo, isCosmoOnline } from '../services/cosmoApi';
import {
  initPoseEngine,
  setBaseCycle,
  setFlip,
  setTravelMotion,
  flashPose,
  refreshMetrics,
  updateRuntime,
  POSES,
} from '../services/cosmoAnimation';
import { useUI } from '../lib/uiContext';

type CosmoState =
  | 'idle'
  | 'curious'
  | 'thinking'
  | 'responding'
  | 'sleeping'
  | 'charging'
  | 'waking'
  | 'travelling'
  | 'inspecting'
  | 'dragged'
  | 'excited';

interface Message {
  id: number;
  role: 'user' | 'cosmo';
  text: string;
}

const GREETING =
  'COSMO online. I hold the verified facts on Lakshya — his builds, his stack, his streak. What would you like to know?';

/** Session unlock codeword — handled locally, never sent to the LLM,
    never displayed in the UI. Case-sensitive, exact match only. */
const MASTER_CODE = 'COSMO-MASTER';

const IDLE_THOUGHTS = [
  'system online.',
  'watching the workspace…',
  'scanning portfolio…',
  'idle.',
  'retrieving verified facts…',
  'something interesting detected.',
  'observing…',
  'checking project logs…',
];

/** Rare thoughts — the closest thing COSMO has to a sense of humor. */
const RARE_THOUGHTS = ['01101000 01101001…', 'easter egg detected. ignoring.'];

const SECTION_THOUGHTS: Record<string, string> = {
  home: 'monitoring the workspace…',
  work: 'scanning project records…',
  capabilities: 'systems look interesting…',
  journey: 'reviewing the timeline…',
  playground: 'observing the board…',
  contact: 'contact channel detected.',
};

const CONTACT_INTENT =
  /\b(hire|hiring|collaborat|work (with|together)|contact|freelanc|job|opportunit|business|reach (him|lakshya)|get in touch)\b/i;

/** Minimal markdown: **bold** + line breaks. React-escaped, no innerHTML. */
function CosmoText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const QUICK_ACTIONS = [
  'Who is Lakshya?',
  'Tell me about DocMind',
  'What can you do?',
  'How’s his chess?',
  'Show my best projects',
];

/** Opens the COSMO panel from anywhere (used by the chess card). */
export function openCosmo(presetQuestion?: string) {
  window.dispatchEvent(new CustomEvent('cosmo:open', { detail: presetQuestion }));
}

/** Avatar box (desktop) — kept in sync with cosmo.css. */
const AV = { w: 140, h: 132 };

/** Behavior state → sprite base cycle. Movement transforms compose on top. */
const STATE_CYCLE: Partial<Record<CosmoState, string>> = {
  thinking: 'thinking',
  responding: 'listening',
  sleeping: 'sleeping',
  charging: 'charging',
  dragged: 'dragging',
  inspecting: 'float',
  excited: 'excited',
};

export default function Cosmo({ booted = true }: { booted?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLButtonElement>(null);
  const figureRef = useRef<HTMLSpanElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thoughtRef = useRef<HTMLSpanElement>(null);
  const idRef = useRef(1);
  const cooldownRef = useRef(0);
  const busyRef = useRef(false);
  /** Kills an in-flight travel tween — the pad button lives outside useGSAP. */
  const killTravelRef = useRef<() => void>(() => {});
  /** Routes chat/pad state changes through the same sprite state machine. */
  const applyStateRef = useRef<((s: CosmoState) => void) | null>(null);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CosmoState>('idle');
  const [thought, setThought] = useState('system online.');
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'cosmo', text: GREETING }]);
  const [input, setInput] = useState('');
  const [usage, setUsage] = useState(getUsage());
  const [notice, setNotice] = useState<string | null>(null);
  const [contactSuggest, setContactSuggest] = useState(false);
  /** Master codeword unlock — session-scoped, never persisted. */
  const [masterMode, setMasterMode] = useState(false);
  /** "ASK ME" discoverability hint — shows once or twice, then retires
      for the session once the visitor has actually opened the chat. */
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteSide, setInviteSide] = useState<'left' | 'right'>('left');
  const inviteDoneRef = useRef(false);
  const inviteVisibleRef = useRef(false);
  let inviteShows = 0;
  let lastInviteAt = 0;
  const sectionRef = useRef('home');
  const { caseProject } = useUI();
  /** The boot gate: behavior loops idle while the preloader/hero runs. */
  const bootedRef = useRef(booted);
  bootedRef.current = booted;

  const online = isCosmoOnline();
  const limitReached =
    !masterMode && (usage.session >= COSMO_LIMITS.maxPerSession || usage.dayCount >= COSMO_LIMITS.maxPerDay);
  const remaining = Math.max(0, COSMO_LIMITS.maxPerSession - usage.session);

  /* Thought chip visibility — a CSS transition, driven deterministically.
     Shows briefly whenever the thought changes; stays up while busy.
     Near the right edge the chip flips alignment so it never clips. */
  const [chipVisible, setChipVisible] = useState(false);
  const [chipAlign, setChipAlign] = useState<'center' | 'right' | 'left'>('center');
  useEffect(() => {
    const x = posRef.current.x;
    setChipAlign(x > window.innerWidth - 340 ? 'right' : x < 320 ? 'left' : 'center');
    if (state === 'thinking' || state === 'responding') {
      setThought(state === 'thinking' ? 'analyzing request…' : 'composing response…');
      setChipVisible(true);
      return;
    }
    setChipVisible(false);
    const show = window.setTimeout(() => setChipVisible(true), 40);
    const hide = window.setTimeout(() => setChipVisible(false), 2900);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [thought, state]);

  /* ------------------------------------------------------------------ */
  /* Positioning — COSMO is a free agent; the pad is just his home       */
  /* ------------------------------------------------------------------ */

  const posRef = useRef({ x: 0, y: 0 });
  const openRef = useRef(false);
  openRef.current = open;

  const homePos = () => {
    const pad = dockRef.current?.querySelector<HTMLElement>('.cosmo-pad');
    if (!pad) return { x: window.innerWidth - 140, y: window.innerHeight - 150 };
    const r = pad.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - AV.w / 2,
      y: r.top + r.height / 2 - AV.h / 2 - 30,
    };
  };

  const safeBounds = () => ({
    minX: 20,
    maxX: window.innerWidth - AV.w - 20,
    minY: 104,
    maxY: window.innerHeight - AV.h - 18,
  });

  const clampPos = (x: number, y: number) => {
    const b = safeBounds();
    return { x: gsap.utils.clamp(b.minX, b.maxX, x), y: gsap.utils.clamp(b.minY, b.maxY, y) };
  };

  const setPos = (x: number, y: number) => {
    posRef.current = { x, y };
    gsap.set(mascotRef.current, { x, y });
  };

  /* ------------------------------------------------------------------ */
  /* Life — roaming, zones, drag, curiosity, sleep, reactions            */
  /* ------------------------------------------------------------------ */

  useGSAP(
    () => {
      const mascot = mascotRef.current;
      const avatar = avatarRef.current;
      if (!mascot || !avatar) return;
      const reduced = prefersReducedMotion();
      const fine = isFinePointer();

      const stateRef = { value: 'idle' as CosmoState };
      const MOODS: Partial<Record<CosmoState, string>> = {
        idle: 'curious',
        curious: 'curious',
        thinking: 'focused',
        responding: 'happy',
        sleeping: 'sleepy',
        travelling: 'calm',
        charging: 'calm',
        inspecting: 'focused',
        dragged: 'surprised',
        excited: 'excited',
        waking: 'sleepy',
      };
      const applyState = (s: CosmoState) => {
        stateRef.value = s;
        setState(s);
        // COSMO 2.0 — the sprite matches the behavior.
        setBaseCycle(STATE_CYCLE[s] ?? 'idle');
        updateRuntime({ state: s, mood: MOODS[s] ?? 'curious' });
      };
      applyStateRef.current = applyState;

      /* Shared activity timestamps (chess games, terminal commands). */
      const chessLiveUntil = { v: 0 };
      const termActiveUntil = { v: 0 };
      const lastPointer = { x: -1, y: -1 };
      const followUntil = { v: 0 }; // cosmo follow — temporary cursor pursuit
      const stopped = { v: false }; // cosmo stop — pauses roaming
      const lastMaster = { v: 0 }; // master-acknowledgement cooldown
      let lastFollowStep = 0;

      /* --- the master acknowledgement ---------------------------------------
         When COSMO ends up near Lakshya's portrait — by roaming, wandering,
         or being dropped there — he pauses, salutes his master, and carries
         on. Cooldown keeps it a rare, respectful beat, never spam. -------- */
      const MASTER_COOLDOWN = 60000;
      const portraitRect = (): DOMRect | null =>
        document.querySelector<HTMLElement>('[data-cosmo-zone="portrait"]')?.getBoundingClientRect() ?? null;

      const nearPortrait = (): boolean => {
        const rect = portraitRect();
        if (!rect || rect.width === 0) return false;
        const cx = posRef.current.x + AV.w / 2;
        const cy = posRef.current.y + AV.h / 2;
        const nx = gsap.utils.clamp(rect.left, rect.right, cx);
        const ny = gsap.utils.clamp(rect.top, rect.bottom, cy);
        return Math.hypot(cx - nx, cy - ny) < 150;
      };

      const masterSalute = () => {
        if (scriptRef.active || drag.active) return;
        lastMaster.v = Date.now();
        killScript();
        killTravel();
        scriptRef.active = true;
        applyState('inspecting');
        const rect = portraitRect();
        const tl = gsap.timeline({
          onComplete: () => {
            scriptRef.active = false;
            applyState('idle');
          },
        });
        tl.call(() => {
            if (rect) {
              const dx = rect.left + rect.width / 2 - (posRef.current.x + AV.w / 2);
              flashPose(dx > 0 ? 'look-right' : 'look-left', 850);
            }
            setThought('the master.');
          })
          .to(avatar, { y: -6, duration: 0.55, ease: 'sine.inOut' })
          .call(() => {
            flashPose('salute', 1150);
            setThought('master recognized.');
          })
          .to({}, { duration: 1.3 })
          .call(() => flashPose('nod', 800))
          .to({}, { duration: 0.9 })
          .to(avatar, { y: 0, duration: 0.5, ease: 'sine.inOut' });
      };

      /** Cooldown-gated check — called after wander/peek arrivals. */
      const maybeMasterSalute = () => {
        if (Date.now() - lastMaster.v < MASTER_COOLDOWN) return;
        if (nearPortrait()) masterSalute();
      };

      /* Sprite engine lives on the avatar <img>; the figure wrapper is
         engine-owned (normalization + travel mirror). */
      initPoseEngine(avatar, figureRef.current!);

      /* Start at home. */
      const start = homePos();
      setPos(start.x, start.y);
      if (reduced) return; // static companion for reduced-motion users

      /* --- bob (always on; speed reflects the mood) ------------------- */
      const bob = gsap.to(avatar, { y: -9, duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      const setBobSpeed = (s: number) => bob.timeScale(s);

      /* --- script plumbing --------------------------------------------- */
      const scriptRef = { tl: null as gsap.core.Timeline | null, active: false };
      const killScript = () => {
        scriptRef.tl?.kill();
        scriptRef.active = false;
        gsap.to(avatar, { rotation: 0, x: 0, y: 0, scale: 1, duration: 0.5, ease: 'sine.out' });
      };

      /* --- micro-actions — real sprite poses, never CSS fakes ------------
         LOW priority: only ever runs when nothing else owns COSMO. -------- */
      let actionCall: gsap.core.Tween | null = null;
      const idleish = () =>
        bootedRef.current &&
        !drag.active &&
        !scriptRef.active &&
        !openRef.current &&
        stateRef.value !== 'sleeping' &&
        stateRef.value !== 'travelling' &&
        stateRef.value !== 'inspecting';

      /** One small, characterful beat. */
      const microBeat = () => {
        const pick = Math.random();
        if (pick < 0.28) {
          // look around — real eye direction from the sprite sheet
          flashPose(['look-left', 'look-right', 'look-up', 'look-down'][Math.floor(Math.random() * 4)], 950);
        } else if (pick < 0.42) {
          // hover higher — a real pose, not a squash
          flashPose(Math.random() < 0.5 ? 'hover-high' : 'hover-mid', 1400);
          gsap
            .timeline()
            .to(avatar, { y: -12, duration: 0.7, ease: 'sine.out' })
            .to(avatar, { y: 0, duration: 1, ease: 'sine.inOut' });
        } else if (pick < 0.54) {
          // blink (real eyelids from the sheet)
          flashPose('blink', 160);
        } else if (pick < 0.64) {
          flashPose('nod', 750);
        } else if (pick < 0.72) {
          flashPose('wave', 950);
        } else if (pick < 0.78) {
          flashPose('salute', 950);
        } else if (pick < 0.9) {
          // a slow drift around the spot — the drift pose while it lasts
          flashPose('drift', 2000);
          gsap
            .timeline()
            .to(avatar, { x: gsap.utils.random(-20, 20), y: gsap.utils.random(-14, -4), duration: 1.4, ease: 'sine.inOut' })
            .to(avatar, { x: 0, y: 0, duration: 1.6, ease: 'sine.inOut' }, '+=0.4');
        } else {
          // rare: sit and rest for a moment
          flashPose('sit', 2400);
        }
      };

      /** A burst of 1–3 beats with believable gaps between them. */
      const microAction = () => {
        if (!idleish()) {
          actionCall = gsap.delayedCall(gsap.utils.random(4, 7), microAction);
          return;
        }
        const beats = 1 + Math.floor(Math.random() * 2.4);
        for (let i = 0; i < beats; i++) {
          gsap.delayedCall(i * gsap.utils.random(1.6, 2.8), () => idleish() && microBeat());
        }
        actionCall = gsap.delayedCall(gsap.utils.random(6, 11), microAction);
      };
      actionCall = gsap.delayedCall(gsap.utils.random(2, 4), microAction);

      /* --- slow, cinematic, DIRECTIONAL travel -----------------------------
         take-off → (turn) → travel → land. He genuinely faces where he is
         going: the 4-frame fly cycle (mirrored for leftward flight) on long
         journeys, native left/right art on hops, back/front art for vertical
         travel. 3–6s across a viewport — long trips read as real travel. --- */
      let travelTl: gsap.core.Timeline | null = null;
      const lastFacingRef = { v: 'front' };
      const killTravel = () => {
        travelTl?.kill();
        travelTl = null;
        mascot.classList.remove('is-travelling');
        setFlip(false);
      };
      killTravelRef.current = killTravel;

      const travelTo = (tx: number, ty: number, onArrive?: () => void) => {
        const from = { ...posRef.current };
        const dx = tx - from.x;
        const dy = ty - from.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 10) {
          onArrive?.();
          return;
        }
        killScript();
        killTravel();
        applyState('travelling');
        mascot.classList.add('is-travelling');

        /* take-off beat — a real pose, plus a little lift */
        flashPose('take-off', 480);
        gsap.fromTo(avatar, { y: -2 }, { y: -12, duration: 0.45, ease: 'power2.out' });

        const duration = gsap.utils.clamp(3, 6, dist / 240);
        const vertical = Math.abs(dy) > Math.abs(dx) * 1.35;
        // Right-facing fly art gets mirrored for leftward travel; native
        // left art does not. The lean sign accounts for the mirror.
        const mirrored = !vertical && dist > 300 && dx < 0;
        const lean = vertical ? 0 : dx > 0 || mirrored ? 8 : -8;

        travelTl = gsap.timeline({
          onComplete: () => {
            mascot.classList.remove('is-travelling');
            setFlip(false);
            applyState('idle');
            flashPose('land', 500);
            // settle — a small landing dip after arrival
            gsap.fromTo(avatar, { y: 6 }, { y: 0, duration: 0.55, ease: 'sine.out' });
            lastFacingRef.v = 'front';
            onArrive?.();
          },
        });

        /* face the direction of travel, then go */
        travelTl
          .call(() => {
            const facing = setTravelMotion(dx, dy, dist);
            if (facing !== lastFacingRef.v) flashPose('turn-mid-air', 380);
            lastFacingRef.v = facing;
          }, undefined, 0.4)
          .to(
            mascot,
            {
              x: tx,
              y: ty,
              duration,
              ease: 'power1.inOut', // gentle lift-off, gentle deceleration
              onUpdate: () => {
                posRef.current = {
                  x: Number(gsap.getProperty(mascot, 'x')),
                  y: Number(gsap.getProperty(mascot, 'y')),
                };
              },
            },
            0.48
          );

        /* lean INTO the direction of travel (mirror-aware), level off to land */
        if (!vertical) {
          travelTl
            .to(avatar, { rotation: lean, duration: 0.6, ease: 'sine.inOut' }, 0.52)
            .to(avatar, { rotation: 0, duration: 0.7, ease: 'sine.inOut' }, 0.48 + duration - 0.75);
        }
      };

      /* --- zone registry -------------------------------------------------- */
      const zoneRects = () =>
        Array.from(document.querySelectorAll<HTMLElement>('[data-cosmo-zone]'))
          .map((el) => ({ zone: el.dataset.cosmoZone!, rect: el.getBoundingClientRect() }))
          .filter((z) => z.rect.width > 0 && z.rect.bottom > 130 && z.rect.top < window.innerHeight - 60);

      /** A safe perch adjacent to a zone — beside it, below it, or above. */
      const perchForZone = (rect: DOMRect) => {
        const b = safeBounds();
        const midY = rect.top + rect.height / 2 - AV.h / 2;
        const candidates = [
          { x: rect.right + 18, y: midY },
          { x: rect.left - AV.w - 18, y: midY },
          { x: rect.left + 30, y: rect.bottom + 20 },
          { x: rect.right - AV.w - 30, y: rect.top - AV.h - 18 },
        ];
        for (const c of candidates) {
          if (c.x >= b.minX - 6 && c.x <= b.maxX + 6 && c.y >= b.minY - 6 && c.y <= b.maxY + 6) {
            return clampPos(c.x, c.y);
          }
        }
        return clampPos(rect.left + 30, rect.bottom + 20);
      };

      /* --- zone scripts — arrival → orient → inspect → react → settle -----
         HIGH priority: while one runs, nothing lower may interrupt. -------- */
      const runZoneScript = (zone: string, rect?: DOMRect) => {
        killScript();
        killTravel();
        scriptRef.active = true;
        applyState('inspecting');

        const tl = gsap.timeline({
          onComplete: () => {
            scriptRef.active = false;
            applyState('idle');
          },
        });
        scriptRef.tl = tl;

        /* Orientation first: eyes toward whatever he arrived at. */
        tl.call(() => {
          if (!rect) return;
          const cx = posRef.current.x + AV.w / 2;
          const cy = posRef.current.y + AV.h / 2;
          const ddx = rect.left + rect.width / 2 - cx;
          const ddy = rect.top + rect.height / 2 - cy;
          flashPose(
            Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'look-right' : 'look-left') : ddy > 0 ? 'look-down' : 'look-up',
            850
          );
        });

        switch (zone) {
          case 'portrait': {
            // The master's photo — the full acknowledgement: identify,
            // salute, respect, linger. (Zone visits are already occasional;
            // the shared cooldown also gates the proximity trigger.)
            lastMaster.v = Date.now();
            tl.call(() => setThought('visual identification confirmed.'))
              .to(avatar, { rotation: -6, duration: 0.8, ease: 'sine.inOut' })
              .to(avatar, { y: -8, duration: 0.6, ease: 'sine.inOut' })
              .call(() => {
                flashPose('salute', 1150);
                setThought('master recognized.');
              })
              .to({}, { duration: 1.4 })
              .call(() => setThought('that’s the human I work for.'))
              .to({}, { duration: 1 })
              .call(() => { if (Math.random() < 0.5) flashPose('point', 900); })
              .to(avatar, { rotation: 5, duration: 0.6, ease: 'sine.inOut' })
              .call(() => { setThought('the owner.'); flashPose('nod', 800); })
              .to({}, { duration: 1.3 }) // linger — he likes it here
              .to(avatar, { rotation: 0, y: 0, duration: 0.8, ease: 'sine.inOut' });
            break;
          }

          case 'chess': {
            // Genuinely studying the board — thinking, scanning, occasionally overwhelmed.
            const live = Date.now() < chessLiveUntil.v;
            tl.call(() => { setThought(live ? 'a real game. focusing.' : 'calculating…'); setBaseCycle('thinking'); })
              .to(avatar, { rotation: -5, duration: 0.7, ease: 'sine.inOut' })
              .call(() => flashPose('look-down', 1100))
              .to(avatar, { y: 5, duration: 0.6, ease: 'sine.inOut' })
              .call(() => setThought('evaluating the centre…'))
              .to({}, { duration: 1.3 })
              .call(() => { if (Math.random() < 0.55) flashPose('point', 850); })
              .to(avatar, { rotation: 4, duration: 0.5, ease: 'sine.inOut' })
              .to({}, { duration: 0.9 });
            if (live) {
              tl.call(() => setThought('three moves ahead…'))
                .to({}, { duration: 1.2 })
                .call(() => setThought('you’re not making this easy.'))
                .to({}, { duration: 1 });
            }
            tl.call(() => {
                if (Math.random() < 0.6) {
                  // prolonged thinking overloads him
                  setThought('too many positions.');
                  flashPose('confused', 1300);
                  gsap
                    .timeline()
                    .to(avatar, { rotation: 9, duration: 0.09 })
                    .to(avatar, { rotation: -8, duration: 0.09 })
                    .to(avatar, { rotation: 5, duration: 0.1 })
                    .to(avatar, { rotation: 0, duration: 0.5, ease: 'power2.out' });
                } else {
                  setThought('my processor hurts.');
                  flashPose('nod', 800);
                }
                setBaseCycle('idle');
              })
              .to({}, { duration: 1.4 });
            break;
          }

          case 'playlist': {
            // Music detected — listening first; dancing is occasional, not constant.
            const dance = Math.random() < 0.55;
            tl.call(() => { setThought('hip-hop detected.'); setBaseCycle('listening'); })
              .to({}, { duration: 1.3 })
              .call(() => setThought('this one goes hard.'))
              .to({}, { duration: 0.8 });
            if (dance) {
              tl.call(() => {
                  setBaseCycle('dance');
                  setBobSpeed(1.7); // bob to the rhythm
                  if (Math.random() < 0.4) setThought('good choice.');
                })
                .to({}, { duration: 3.2 });
              if (Math.random() < 0.35) {
                tl.call(() => { setThought('still listening.'); flashPose('excited', 1100); }).to({}, { duration: 1.2 });
              }
              tl.call(() => { setBaseCycle('idle'); setBobSpeed(1); });
            } else {
              // browse the album cards instead — a slow scan along the shelf
              tl.call(() => setThought('browsing the collection…'))
                .to(avatar, { x: -16, duration: 0.9, ease: 'sine.inOut' })
                .call(() => flashPose('look-left', 900))
                .to(avatar, { x: 16, duration: 1, ease: 'sine.inOut' })
                .call(() => flashPose('look-right', 900))
                .to(avatar, { x: 0, duration: 0.8, ease: 'sine.inOut' })
                .call(() => setBaseCycle('idle'));
            }
            break;
          }

          case 'projects': {
            const scanningDoc = caseProject?.id === 'docmind';
            tl.call(() => { setThought(scanningDoc ? 'scanning documents…' : 'examining build…'); setBaseCycle('thinking'); })
              .to(avatar, { scale: 1.05, duration: 0.55, ease: 'sine.inOut' })
              .to(avatar, { x: -14, duration: 0.6, ease: 'sine.inOut' })
              .call(() => flashPose('look-right', 800))
              .to(avatar, { x: 14, duration: 0.65, ease: 'sine.inOut' })
              .to(avatar, { x: 0, duration: 0.5, ease: 'sine.inOut' })
              .call(() => { setThought(scanningDoc ? 'documents indexed.' : 'interesting system.'); flashPose('point', 800); })
              .to({}, { duration: 0.9 });
            if (Math.random() < 0.3) {
              tl.call(() => { setThought('wait — how does this work?'); flashPose('confused', 1200); }).to({}, { duration: 1.2 });
            }
            tl.call(() => setBaseCycle('idle')).to(avatar, { scale: 1, duration: 0.5, ease: 'sine.inOut' });
            break;
          }

          case 'terminal': {
            // His territory — he hops on the keyboard.
            tl.call(() => { setThought('system activity detected.'); setBaseCycle('typing'); })
              .to(avatar, { x: -4, duration: 0.14 })
              .to(avatar, { x: 4, duration: 0.13 })
              .to(avatar, { x: -3, duration: 0.12 })
              .to(avatar, { x: 3, duration: 0.12 })
              .to(avatar, { x: 0, duration: 0.14 })
              .call(() => setThought('[cosmo] tail -f /var/log/portfolio'))
              .to({}, { duration: 1.2 })
              .call(() => {
                setThought(Date.now() < termActiveUntil.v ? 'a real command. nice.' : 'someone is compiling again.');
                setBaseCycle('idle');
              })
              .to(avatar, { rotation: 4, y: -4, duration: 0.4, ease: 'sine.inOut' })
              .to(avatar, { rotation: 0, y: 0, duration: 0.5, ease: 'sine.inOut' });
            break;
          }

          case 'capabilities':
            tl.call(() => setThought('scanning the stack…'))
              .call(() => flashPose('look-left', 700))
              .to(avatar, { rotation: -5, x: -15, duration: 0.8, ease: 'sine.inOut' })
              .call(() => flashPose('look-right', 700))
              .to(avatar, { rotation: 5, x: 15, duration: 0.8, ease: 'sine.inOut' })
              .to(avatar, { rotation: 0, x: 0, duration: 0.55, ease: 'sine.inOut' })
              .call(() => setThought('stack looks familiar.'))
              .to(avatar, { y: -6, duration: 0.45, ease: 'sine.inOut' })
              .to(avatar, { y: 0, duration: 0.5, ease: 'sine.inOut' });
            break;

          case 'journey':
            tl.call(() => setThought('reviewing the timeline…'))
              .call(() => flashPose('look-down', 650))
              .to(avatar, { y: 7, rotation: 3, duration: 0.7, ease: 'sine.inOut' })
              .to(avatar, { y: -4, rotation: -3, duration: 0.65, ease: 'sine.inOut' })
              .to(avatar, { y: 0, rotation: 0, duration: 0.55, ease: 'sine.inOut' })
              .call(() => { setThought('steady progress detected.'); flashPose('nod', 800); })
              .to({}, { duration: 0.9 });
            break;

          case 'contact':
            tl.call(() => setThought('communication channel detected.'))
              .call(() => flashPose('wave', 1000))
              .to({}, { duration: 1 })
              .call(() => { if (Math.random() < 0.5) { flashPose('salute', 950); setThought('on duty.'); } })
              .to(avatar, { rotation: 4, duration: 0.5, ease: 'sine.inOut' })
              .to({}, { duration: 0.5 })
              .call(() => { setThought('want to talk to the owner?'); flashPose('point', 900); })
              .to(avatar, { rotation: 0, duration: 0.5, ease: 'sine.inOut' });
            break;

          case 'hero':
            // Home territory — relaxed patrol look, nothing dramatic.
            tl.call(() => setThought('home territory.'))
              .to(avatar, { rotation: -4, x: -6, duration: 0.8, ease: 'sine.inOut' })
              .to(avatar, { rotation: 4, x: 6, duration: 0.8, ease: 'sine.inOut' })
              .to(avatar, { rotation: 0, x: 0, duration: 0.7, ease: 'sine.inOut' })
              .to(avatar, { y: -7, duration: 0.55, ease: 'sine.out' })
              .to(avatar, { y: 0, duration: 0.6, ease: 'sine.in' });
            break;

          default:
            tl.to({}, { duration: 0.5 });
        }
      };

      /* --- the brain — weighted decisions, believable pacing ---------------
         Not a move→action loop: he stays put often, lingers where it’s
         interesting, and only sometimes decides to travel.
           45%  stay put (the micro-action loop keeps him alive)
           20%  inspect the nearest element
           15%  wander a little
           10%  visit a zone (travel + that section’s behaviour)
            5%  peek at the cursor
            5%  go home & recharge                                              */
      let brainCall: gsap.core.Tween | null = null;
      const scheduleDecide = (min = 5, max = 11) => {
        brainCall?.kill();
        brainCall = gsap.delayedCall(gsap.utils.random(min, max), decide);
      };

      const canAct = () =>
        bootedRef.current &&
        !document.hidden &&
        !openRef.current &&
        !drag.active &&
        !scriptRef.active &&
        (stateRef.value === 'idle' || stateRef.value === 'curious');

      /** Slow drift to a nearby spot — wandering, not commuting. */
      const wanderNearby = () => {
        const b = safeBounds();
        const tx = gsap.utils.clamp(b.minX, b.maxX, posRef.current.x + gsap.utils.random(-150, 150));
        const ty = gsap.utils.clamp(b.minY, b.maxY, posRef.current.y + gsap.utils.random(-90, 90));
        travelTo(tx, ty, () => {
          maybeMasterSalute();
          scheduleDecide(7, 14);
        });
      };

      /** Turn toward the closest visible element and study it a moment. */
      const inspectNearby = () => {
        const zones = zoneRects();
        if (!zones.length) {
          scheduleDecide(5, 9);
          return;
        }
        const cx = posRef.current.x + AV.w / 2;
        const cy = posRef.current.y + AV.h / 2;
        let best = zones[0];
        let bestD = Infinity;
        for (const z of zones) {
          const d = Math.hypot(z.rect.left + z.rect.width / 2 - cx, z.rect.top + z.rect.height / 2 - cy);
          if (d < bestD) {
            bestD = d;
            best = z;
          }
        }
        applyState('inspecting');
        const ddx = best.rect.left + best.rect.width / 2 - cx;
        const ddy = best.rect.top + best.rect.height / 2 - cy;
        gsap
          .timeline({ onComplete: () => stateRef.value === 'inspecting' && applyState('idle') })
          .call(() => {
            flashPose(
              Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'look-right' : 'look-left') : ddy > 0 ? 'look-down' : 'look-up',
              1100
            );
            if (Math.random() < 0.3) setThought(SECTION_THOUGHTS[best.zone] ?? 'inspecting…');
          })
          .to(avatar, { rotation: gsap.utils.clamp(-6, 6, ddx * 0.02), duration: 0.7, ease: 'sine.inOut' })
          .to({}, { duration: 0.9 })
          .call(() => { if (Math.random() < 0.35) flashPose('point', 850); })
          .to(avatar, { rotation: 0, duration: 0.6, ease: 'sine.inOut' });
        scheduleDecide(7, 13);
      };

      /** Sometimes drift part-way toward the cursor, then lose interest. */
      const peekCursor = () => {
        if (lastPointer.x < 0) {
          scheduleDecide(5, 9);
          return;
        }
        const cx = posRef.current.x + AV.w / 2;
        const cy = posRef.current.y + AV.h / 2;
        const dx = lastPointer.x - cx;
        const dy = lastPointer.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < 70 || d > 520) {
          scheduleDecide(5, 9);
          return;
        }
        applyState('curious');
        flashPose('follow-cursor', 1600);
        const step = Math.min(90, d - 45);
        const b = safeBounds();
        const tx = gsap.utils.clamp(b.minX, b.maxX, cx + (dx / d) * step - AV.w / 2);
        const ty = gsap.utils.clamp(b.minY, b.maxY, cy + (dy / d) * step - AV.h / 2);
        gsap.to(mascot, {
          x: tx,
          y: ty,
          duration: 2.4,
          ease: 'sine.inOut',
          onUpdate: () => {
            posRef.current = {
              x: Number(gsap.getProperty(mascot, 'x')),
              y: Number(gsap.getProperty(mascot, 'y')),
            };
          },
          onComplete: () => stateRef.value === 'curious' && applyState('idle'),
        });
        if (Math.random() < 0.4) setThought('something interesting detected.');
        maybeMasterSalute();
        scheduleDecide(8, 14);
      };

      /** Travel home, dock, top up. */
      const goCharge = () => {
        const home = homePos();
        travelTo(home.x, home.y, () => {
          applyState('charging');
          setThought('charging…');
          gsap.delayedCall(gsap.utils.random(2.6, 4.5), () => {
            if (stateRef.value === 'charging') {
              applyState('idle');
              setThought('charged.');
            }
            scheduleDecide(6, 12);
          });
        });
      };

      /** Pick a visible zone, fly over, live its script, then dwell. */
      const visitZone = () => {
        // the photo visit stays occasional, not a routine stop
        const zones = zoneRects().filter((z) => z.zone !== 'portrait' || Math.random() < 0.5);
        if (!zones.length) {
          goCharge();
          return;
        }
        const pick = zones[Math.floor(Math.random() * zones.length)];
        const perch = perchForZone(pick.rect);
        travelTo(perch.x, perch.y, () => {
          runZoneScript(pick.zone, pick.rect);
          scheduleDecide(9, 20); // dwell — he stays a while before roaming on
        });
      };

      const decide = () => {
        if (stopped.v || Date.now() < followUntil.v) {
          scheduleDecide(4, 8); // holding position / following — no roaming
          return;
        }
        if (!canAct()) {
          scheduleDecide(5, 10);
          return;
        }
        const roll = Math.random();
        if (roll < 0.2) inspectNearby();
        else if (roll < 0.35) wanderNearby();
        else if (roll < 0.45) visitZone();
        else if (roll < 0.5) peekCursor();
        else if (roll < 0.55) goCharge();
        else scheduleDecide(6, 12); // stay put — the micro loop covers him
      };
      scheduleDecide(9, 16);

      /* --- interaction invite — discoverability, gently and rarely ----------
         A small system label ("COSMO • ASK ME") introduces the chat: once
         shortly after boot, once more if the cursor comes near. Retires
         for the session the moment the chat is actually opened. --------- */
      try {
        inviteDoneRef.current = sessionStorage.getItem('cosmo-chat-used') === '1';
      } catch {
        /* private mode — hint simply returns each visit */
      }
      const showInvite = (durationMs: number) => {
        if (inviteDoneRef.current || inviteVisibleRef.current || inviteShows >= 2) return;
        if (!bootedRef.current || openRef.current) return;
        inviteShows++;
        lastInviteAt = Date.now();
        setInviteSide(posRef.current.x < 300 ? 'right' : 'left');
        inviteVisibleRef.current = true;
        setInviteVisible(true);
        gsap.delayedCall(durationMs / 1000, () => {
          inviteVisibleRef.current = false;
          setInviteVisible(false);
        });
      };
      gsap.delayedCall(3.5, () => showInvite(6000));
      /* The pointer check above only fires while the mouse moves — if he is
         mid-travel when the cursor arrives, this probe catches it once he
         is free again. */
      gsap.delayedCall(4, function probeInvite() {
        if (
          lastPointer.x >= 0 &&
          Date.now() - lastInviteAt > 12000 &&
          bootedRef.current &&
          !drag.active &&
          !scriptRef.active &&
          stateRef.value !== 'travelling'
        ) {
          const rect = avatar.getBoundingClientRect();
          const d = Math.hypot(lastPointer.x - (rect.left + rect.width / 2), lastPointer.y - (rect.top + rect.height / 2));
          if (d < 240) showInvite(4500);
        }
        gsap.delayedCall(2, probeInvite);
      });

      /* --- gravity — dropped into a genuine void, he falls ------------------
         "Supported" = something solid is under him: page content (any
         section, even its whitespace) or an overlay's actual panel. The
         dimmed backdrop AROUND a modal is the void — the page isn't usable
         there — and bare body/html/root/main hits are voids by definition. */
      const supportedDrop = (x: number, y: number) => {
        const els = document.elementsFromPoint(x, y);
        const el = els.find(
          (n) => !(n instanceof HTMLElement) || !n.closest('.cosmo-mascot, .cosmo-dock')
        );
        if (!el || el === document.body || el === document.documentElement) return false;
        if (!(el instanceof HTMLElement)) return true; // svg and friends are content
        if (el.id === 'root' || el.tagName === 'MAIN') return false;
        if (el.closest('.terminal-backdrop, .case-backdrop')) return false;
        return true;
      };

      /** Tiny impact debris — phosphor dust kicked up from the floor. */
      const spawnDust = () => {
        const dust = document.createElement('span');
        dust.className = 'cosmo-dust';
        for (let i = 0; i < 7; i++) dust.appendChild(document.createElement('i'));
        mascot.appendChild(dust);
        const bits = dust.querySelectorAll('i');
        bits.forEach((bit, i) => {
          const angle = (-160 + (i / Math.max(1, bits.length - 1)) * 140) * (Math.PI / 180);
          const dist2 = gsap.utils.random(24, 54);
          gsap.fromTo(
            bit,
            { x: 0, y: 0, autoAlpha: 0.9 },
            {
              x: Math.cos(angle) * dist2,
              y: Math.sin(angle) * dist2,
              autoAlpha: 0,
              duration: gsap.utils.random(0.5, 0.85),
              ease: 'power2.out',
            }
          );
        });
        gsap.delayedCall(1.1, () => dust.remove());
      };

      /* The fall: a beat of realization → drop pose → downward fall with a
         tilt → impact (dust + squash + bounce) → dizzy recovery. */
      const startFall = () => {
        killScript();
        applyState('idle');
        setThought('no floor detected.');
        flashPose('confused', 700);
        gsap.delayedCall(0.6, () => {
          if (drag.active || openRef.current) return;
          mascot.classList.add('is-travelling');
          flashPose('drop', 750);
          const b = safeBounds();
          const groundY = b.maxY;
          const fallDist = Math.max(40, groundY - posRef.current.y);
          const dur = gsap.utils.clamp(0.35, 0.95, fallDist / 850);
          const tilt = (Math.random() < 0.5 ? -1 : 1) * gsap.utils.random(10, 16);
          gsap
            .timeline({
              onComplete: () => {
                mascot.classList.remove('is-travelling');
                setFlip(false);
                applyState('idle');
                spawnDust();
                gsap.fromTo(
                  avatar,
                  { scaleX: 1.14, scaleY: 0.84 },
                  { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.42)' }
                );
                flashPose('look-left', 700);
                setThought('landing confirmed. barely.');
                gsap.delayedCall(1.4, () => scheduleDecide(4, 8));
              },
            })
            .to(
              mascot,
              {
                y: groundY,
                duration: dur,
                ease: 'power2.in',
                onUpdate: () => {
                  posRef.current = {
                    x: Number(gsap.getProperty(mascot, 'x')),
                    y: Number(gsap.getProperty(mascot, 'y')),
                  };
                },
              },
              0
            )
            .to(avatar, { rotation: tilt, duration: dur * 0.85, ease: 'power1.in' }, 0)
            .to(avatar, { rotation: 0, duration: 0.45, ease: 'power2.out' }, dur);
        });
      };

      /* --- drag — a physical companion you can pick up --------------------- */
      const drag = { active: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 };
      const onDragDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        drag.active = true;
        drag.moved = false;
        drag.sx = e.clientX;
        drag.sy = e.clientY;
        drag.ox = e.clientX - posRef.current.x;
        drag.oy = e.clientY - posRef.current.y;
        killTravel(); // grabbing him mid-flight is allowed — travel yields
        killScript();
        setFlip(false);
        flashPose('drag-start', 600);
        mascot.setPointerCapture(e.pointerId);
      };
      const onDragMove = (e: PointerEvent) => {
        if (!drag.active) return;
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) > 7) {
          drag.moved = true;
          applyState('dragged');
          mascot.classList.add('is-dragging');
          brainCall?.kill();
        }
        if (!drag.moved) return;
        const p = clampPos(e.clientX - drag.ox, e.clientY - drag.oy);
        setPos(p.x, p.y);
        gsap.set(avatar, { rotation: gsap.utils.clamp(-14, 14, (e.movementX || 0) * 1.4) });
      };
      const onDragUp = () => {
        if (!drag.active) return;
        drag.active = false;
        mascot.classList.remove('is-dragging');
        gsap.to(avatar, { rotation: 0, duration: 0.5, ease: 'sine.out' });
        if (drag.moved) {
          // Nothing meaningful under him — he loses his footing and falls.
          if (
            !supportedDrop(posRef.current.x + AV.w / 2, posRef.current.y + AV.h / 2)
          ) {
            startFall();
            return;
          }
          // Dropped — see where he landed, and behave accordingly.
          applyState('idle');
          flashPose('drop', 550);
          const dropZone = zoneRects().find(
            (z) =>
              posRef.current.x + AV.w / 2 > z.rect.left &&
              posRef.current.x + AV.w / 2 < z.rect.right &&
              posRef.current.y + AV.h / 2 > z.rect.top &&
              posRef.current.y + AV.h / 2 < z.rect.bottom
          );
          setThought(
            dropZone
              ? SECTION_THOUGHTS[dropZone.zone] ?? 'inspecting this area…'
              : 'new vantage point acquired.'
          );
          // he looks around after being put down somewhere new
          gsap.delayedCall(0.75, () => {
            if (!drag.active) flashPose(Math.random() < 0.5 ? 'look-left' : 'look-right', 850);
          });
          // dropped near the master's photo? that beat outranks the zone script
          if (Date.now() - lastMaster.v >= MASTER_COOLDOWN && nearPortrait()) {
            gsap.delayedCall(0.9, masterSalute);
          } else if (dropZone) {
            gsap.delayedCall(1.2, () => runZoneScript(dropZone.zone, dropZone.rect));
          }
          scheduleDecide(9, 16);
        } else {
          setOpen((v) => !v);
        }
      };
      if (fine && !reduced) {
        mascot.addEventListener('pointerdown', onDragDown);
        mascot.addEventListener('pointermove', onDragMove);
        mascot.addEventListener('pointerup', onDragUp);
        mascot.addEventListener('pointercancel', onDragUp);
      }

      /* --- cursor curiosity — notice, lean, sometimes follow, never chase -- */
      let rotTo: ((v: number) => void) | null = null;
      let stepX: ((v: number) => void) | null = null;
      let stepCall: gsap.core.Tween | null = null;
      let wasNear = false;
      let closeSince = 0;
      let lastPushBack = 0;
      const onPointer = (e: PointerEvent) => {
        wake();
        lastPointer.x = e.clientX;
        lastPointer.y = e.clientY;
        if (!rotTo || !stepX || drag.active) return;
        if (scriptRef.active || stateRef.value === 'travelling') return;
        const rect = avatar.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy);

        /* cursor drifting near — a second, softer chance to notice the hint */
        if (dist < 240 && Date.now() - lastInviteAt > 12000) showInvite(4500);

        /* Too close, hovering, not grabbing — he leans back. "too close." */
        const now = Date.now();
        if (dist < 38 && !openRef.current) {
          if (!closeSince) closeSince = now;
          else if (now - closeSince > 1600 && now - lastPushBack > 25000 && !drag.active) {
            lastPushBack = now;
            closeSince = 0;
            flashPose('push-back', 1100);
            setThought('too close.');
            const away = gsap.utils.clamp(14, 34, 38 - dist);
            const b = safeBounds();
            const nx = gsap.utils.clamp(b.minX, b.maxX, posRef.current.x - (dx / (dist || 1)) * away);
            const ny = gsap.utils.clamp(b.minY, b.maxY, posRef.current.y - (dy / (dist || 1)) * away);
            gsap.to(mascot, {
              x: nx,
              y: ny,
              duration: 0.5,
              ease: 'power2.out',
              onUpdate: () => {
                posRef.current = {
                  x: Number(gsap.getProperty(mascot, 'x')),
                  y: Number(gsap.getProperty(mascot, 'y')),
                };
              },
            });
            return;
          }
        } else {
          closeSince = 0;
        }

        if (dist < 240 && (stateRef.value === 'idle' || stateRef.value === 'curious')) {
          if (dist < 150 && !wasNear) {
            // first notice — the dedicated pose, throttled
            wasNear = true;
            if (now - lastPushBack > 8000) flashPose('cursor-nearby', 800);
          } else if (dist >= 150) {
            wasNear = false;
          }
          if (stateRef.value !== 'curious') {
            applyState('curious');
            flashPose(Math.random() < 0.5 ? 'look-left' : 'look-right', 750);
            stepX(gsap.utils.clamp(-26, 26, dx * 0.08));
            stepCall?.kill();
            stepCall = gsap.delayedCall(0.55, () => stepX?.(gsap.utils.clamp(-26, 26, dx * 0.13)));
            if (Math.random() < 0.25) setThought('something interesting detected.');
          }
          rotTo(gsap.utils.clamp(-12, 12, dx * 0.06));
        } else if (stateRef.value === 'curious' && dist >= 240) {
          applyState('idle');
          rotTo(0);
          stepX(0);
          stepCall?.kill();
          wasNear = false;
        }

        /* `cosmo follow` — a gentle, temporary pursuit, never a chase. */
        const now2 = performance.now();
        if (
          Date.now() < followUntil.v &&
          stateRef.value === 'idle' &&
          !scriptRef.active &&
          !drag.active &&
          now2 - lastFollowStep > 1300 &&
          dist > 90 &&
          dist < 640
        ) {
          lastFollowStep = now2;
          const b = safeBounds();
          const step = Math.min(110, (dist - 70) * 0.5);
          const nx = gsap.utils.clamp(b.minX, b.maxX, posRef.current.x + (dx / dist) * step);
          const ny = gsap.utils.clamp(b.minY, b.maxY, posRef.current.y + (dy / dist) * step);
          flashPose('follow-cursor', 1200);
          gsap.to(mascot, {
            x: nx,
            y: ny,
            duration: 1.4,
            ease: 'sine.inOut',
            onUpdate: () => {
              posRef.current = {
                x: Number(gsap.getProperty(mascot, 'x')),
                y: Number(gsap.getProperty(mascot, 'y')),
              };
            },
          });
        }
      };
      if (fine && !reduced) {
        rotTo = gsap.quickTo(avatar, 'rotation', { duration: 0.6, ease: 'power3' });
        stepX = gsap.quickTo(avatar, 'x', { duration: 0.9, ease: 'power2.out' });
        window.addEventListener('pointermove', onPointer, { passive: true });
      }

      /* --- scroll wobble ----------------------------------------------------- */
      const st = ScrollTrigger.create({
        onUpdate(self) {
          if (Math.abs(self.getVelocity()) > 950 && stateRef.value !== 'sleeping') {
            gsap.fromTo(
              avatar,
              { rotation: (self.direction || 1) * 6 },
              { rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' }
            );
          }
        },
      });

      /* --- reactions from the portfolio (chess, etc.) -------------------------- */
      let lastReact = 0;
      const onReact = (e: Event) => {
        const kind = (e as CustomEvent).detail as string;
        const now = Date.now();
        chessLiveUntil.v = now + 120000; // a game is in progress
        if (now - lastReact < 2500) return;
        lastReact = now;
        if (kind === 'excited') {
          // the human won — full celebration with the real pose
          killScript();
          applyState('excited');
          setThought('victory detected. celebrating.');
          setBaseCycle('celebration');
          dockRef.current?.classList.add('is-excited');
          gsap
            .timeline()
            .to(avatar, { y: -16, duration: 0.22, ease: 'power2.out' })
            .to(avatar, { y: 0, duration: 0.22, ease: 'power2.in' })
            .to(avatar, { y: -12, duration: 0.2, ease: 'power2.out' })
            .to(avatar, { y: 0, duration: 0.24, ease: 'power2.in' })
            .to(avatar, { y: -8, duration: 0.18, ease: 'power2.out' })
            .to(avatar, { y: 0, duration: 0.22, ease: 'power2.in' });
          gsap.delayedCall(2.8, () => {
            dockRef.current?.classList.remove('is-excited');
            if (stateRef.value === 'excited') {
              setBaseCycle('idle');
              applyState('idle');
              setThought('rematch?');
            }
          });
        } else if (kind === 'subtle') {
          // COSMO won — a gracious, tiny flex
          flashPose('salute', 1000);
          setThought('gg. a clean win — for me.');
          gsap.delayedCall(1.6, () => {
            if (stateRef.value === 'idle' || stateRef.value === 'curious') setThought('rematch?');
          });
        } else if (kind === 'check') {
          applyState('curious');
          setThought('check detected.');
          flashPose('look-down', 900);
          gsap
            .timeline({ onComplete: () => stateRef.value === 'curious' && applyState('idle') })
            .to(avatar, { rotation: -5, y: -7, duration: 0.2, ease: 'power2.out' })
            .to(avatar, { rotation: 3, duration: 0.3, ease: 'sine.inOut' })
            .to(avatar, { rotation: 0, y: 0, duration: 0.4, ease: 'sine.inOut' });
        } else if (kind === 'capture') {
          setThought('interesting move.');
          flashPose('excited', 700);
        }
      };
      window.addEventListener('cosmo:react', onReact);

      /* --- terminal activity — he notices commands being run ------------------- */
      let lastTermReact = 0;
      const onTerm = () => {
        termActiveUntil.v = Date.now() + 30000;
        const now = Date.now();
        if (now - lastTermReact < 12000 || scriptRef.active || drag.active) return;
        const term = zoneRects().find((z) => z.zone === 'terminal');
        if (!term || (stateRef.value !== 'idle' && stateRef.value !== 'curious')) return;
        lastTermReact = now;
        setThought('system activity detected.');
        flashPose('typing', 1100);
        gsap
          .timeline()
          .to(avatar, {
            rotation: gsap.utils.clamp(-8, 8, (term.rect.left + term.rect.width / 2 - posRef.current.x) * 0.03),
            duration: 0.5,
            ease: 'sine.inOut',
          })
          .to(avatar, { rotation: 0, duration: 0.6, ease: 'sine.inOut' });
      };
      window.addEventListener('cosmo:term', onTerm);

      /* Terminal → COSMO commands (`cosmo roam|wake|sleep|stop|follow`). */
      const onCmd = (e: Event) => {
        const action = (e as CustomEvent).detail as string;
        if (action === 'roam') {
          stopped.v = false;
          followUntil.v = 0;
          if (stateRef.value === 'sleeping') wake();
          if (canAct()) {
            brainCall?.kill();
            visitZone();
          }
        } else if (action === 'wake') {
          stopped.v = false;
          wake();
        } else if (action === 'sleep') {
          if (stateRef.value !== 'sleeping') {
            killTravel();
            killScript();
            applyState('sleeping');
            setThought('entering low power…');
            setBobSpeed(0.55);
          }
        } else if (action === 'stop') {
          stopped.v = true;
          followUntil.v = 0;
          setThought('holding position.');
        } else if (action === 'follow') {
          stopped.v = false;
          followUntil.v = Date.now() + 15000;
          if (stateRef.value === 'sleeping') wake();
          setThought('following the cursor.');
        }
      };
      window.addEventListener('cosmo:cmd', onCmd);

      /* Summoned to the interface (terminal `ai` / chess card) — he flies
         over and perches BESIDE the chat panel, not under it. */
      const onCosmoOpen = () => {
        wake();
        if (window.innerWidth < 900 || drag.active || !canAct()) return;
        const panelLeft = window.innerWidth - 22 - Math.min(392, window.innerWidth - 44);
        const perchX = panelLeft - AV.w - 14;
        const cx = posRef.current.x + AV.w / 2;
        if (cx < perchX - 60) {
          const b = safeBounds();
          travelTo(gsap.utils.clamp(b.minX, b.maxX, perchX), Math.max(b.minY + 40, window.innerHeight - 330), () => {
            applyState('responding');
            setThought('conversation mode.');
            gsap.delayedCall(1.6, () => stateRef.value === 'responding' && applyState('idle'));
          });
        }
      };
      window.addEventListener('cosmo:open', onCosmoOpen);

      /* --- section awareness ----------------------------------------------------- */
      let lastSectionThought = 0;
      const sectionTriggers = ['home', 'work', 'capabilities', 'journey', 'playground', 'contact']
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return ScrollTrigger.create({
            trigger: el,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => {
              if (!self.isActive || sectionRef.current === id) return;
              sectionRef.current = id;
              updateRuntime({ location: id });
              const line = SECTION_THOUGHTS[id];
              const now = Date.now();
              if (line && now - lastSectionThought > 14000 && Math.random() < 0.55 && stateRef.value === 'idle') {
                lastSectionThought = now;
                setThought(line);
              }
            },
          });
        })
        .filter(Boolean) as ScrollTrigger[];

      /* --- blink loop — real eyelids from the sprite sheet ----------------- */
      const blinkLoop = () => {
        // never fight a zone script's own look poses; stay dark pre-boot
        if (bootedRef.current && stateRef.value !== 'sleeping' && !scriptRef.active) flashPose('blink', 150);
        gsap.delayedCall(gsap.utils.random(3.2, 7), blinkLoop);
      };
      gsap.delayedCall(gsap.utils.random(2, 5), blinkLoop);

      /* --- occasional thought chip --------------------------------------------------- */
      const thoughtLoop = () => {
        if (bootedRef.current && (stateRef.value === 'idle' || stateRef.value === 'curious')) {
          setThought(
            Math.random() < 0.08
              ? RARE_THOUGHTS[Math.floor(Math.random() * RARE_THOUGHTS.length)]
              : IDLE_THOUGHTS[Math.floor(Math.random() * IDLE_THOUGHTS.length)]
          );
        }
        gsap.delayedCall(gsap.utils.random(16, 32), thoughtLoop);
      };
      gsap.delayedCall(gsap.utils.random(6, 12), thoughtLoop);

      /* --- sleep / wake ----------------------------------------------------------------- */
      let sleepCall: gsap.core.Tween | null = null;
      const wake = () => {
        if (stateRef.value === 'sleeping') {
          applyState('waking');
          setThought('waking up…');
          setBobSpeed(1);
          flashPose('waking', 1000);
          gsap.fromTo(
            avatar,
            { filter: 'drop-shadow(0 0 2px rgba(196, 249, 107, 0.1)) brightness(0.6)' },
            { filter: 'drop-shadow(0 0 10px rgba(196, 249, 107, 0.35)) brightness(1)', duration: 0.9, ease: 'power2.out' }
          );
          window.setTimeout(() => {
            if (stateRef.value === 'waking') {
              applyState('idle');
              setThought('system online.');
            }
          }, 1100);
        }
        sleepCall?.kill();
        sleepCall = gsap.delayedCall(75, () => {
          if (stateRef.value === 'idle' || stateRef.value === 'curious') {
            killScript();
            applyState('sleeping');
            setThought('entering low power…');
            setBobSpeed(0.55);
          }
        });
      };
      wake();

      /* --- keep him in bounds (and correctly sized) on resize ------------------------------- */
      let resizeTimer = 0;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          refreshMetrics(); // re-reads --cosmo-char-h, re-applies the current pose
          const p = clampPos(posRef.current.x, posRef.current.y);
          setPos(p.x, p.y);
        }, 200);
      };
      window.addEventListener('resize', onResize);

      return () => {
        bob.kill();
        brainCall?.kill();
        actionCall?.kill();
        stepCall?.kill();
        sleepCall?.kill();
        scriptRef.tl?.kill();
        killTravel();
        st.kill();
        sectionTriggers.forEach((t) => t.kill());
        window.removeEventListener('cosmo:react', onReact);
        window.removeEventListener('cosmo:cmd', onCmd);
        window.removeEventListener('cosmo:term', onTerm);
        window.removeEventListener('cosmo:open', onCosmoOpen);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('resize', onResize);
        mascot.removeEventListener('pointerdown', onDragDown);
        mascot.removeEventListener('pointermove', onDragMove);
        mascot.removeEventListener('pointerup', onDragUp);
        mascot.removeEventListener('pointercancel', onDragUp);
      };
    },
    { scope: rootRef }
  );

  /* Panel open / close — COSMO reacts: wake, hop, drop what he was doing. */
  useGSAP(
    () => {
      const panel = panelRef.current;
      const avatar = avatarRef.current;
      if (!panel) return;
      if (open) {
        if (avatar && !prefersReducedMotion()) {
          setThought('conversation mode.');
          gsap.to(avatar, { rotation: 0, x: 0, scale: 1, duration: 0.4, ease: 'sine.out' });
          gsap
            .timeline()
            .to(avatar, { y: -14, duration: 0.2, ease: 'power2.out' })
            .to(avatar, { y: 0, duration: 0.35, ease: 'bounce.out' });
          /* Step aside if the panel would cover him — he stays visible. */
          if (window.innerWidth > 900) {
            const mascot = mascotRef.current;
            const cx = posRef.current.x + AV.w / 2;
            const panelLeft = window.innerWidth - 22 - Math.min(392, window.innerWidth - 44);
            if (mascot && cx + AV.w / 2 > panelLeft - 6) {
              const tx = gsap.utils.clamp(20, window.innerWidth - AV.w - 20, panelLeft - AV.w - 16);
              gsap.to(mascot, {
                x: tx,
                duration: 0.9,
                ease: 'power2.inOut',
                onUpdate: () => {
                  posRef.current = {
                    x: Number(gsap.getProperty(mascot, 'x')),
                    y: Number(gsap.getProperty(mascot, 'y')),
                  };
                },
              });
            }
          }
        }
        gsap
          .timeline()
          .to(panel, { autoAlpha: 1, duration: 0.2 })
          .fromTo(
            panel,
            { y: 26, scale: 0.96 },
            { y: 0, scale: 1, duration: 0.45, ease: 'power4.out' },
            0.04
          )
          .from(
            '.cosmo-msg',
            { y: 14, autoAlpha: 0, duration: 0.35, stagger: 0.04, ease: 'power3.out' },
            0.12
          );
        inputRef.current?.focus({ preventScroll: true });
      } else {
        gsap.to(panel, { y: 18, scale: 0.97, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
      }
    },
    { scope: rootRef, dependencies: [open] }
  );

  /* Boot-sequence final beat: once `booted` flips, COSMO materializes at
     his pad — scale up + fade in, then a small wave — as the hero content
     settles around him. Reduced-motion users just get him, immediately. */
  useGSAP(
    () => {
      const mascot = mascotRef.current;
      const avatar = avatarRef.current;
      if (!mascot || !avatar) return;
      if (prefersReducedMotion() || !booted) return;
      gsap
        .timeline({ delay: 0.6 })
        .fromTo(mascot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .fromTo(avatar, { scale: 0.45 }, { scale: 1, duration: 0.85, ease: 'power3.out' }, 0)
        .call(() => {
          setThought('system online.');
          flashPose('wave', 950);
        });
    },
    { scope: rootRef, dependencies: [booted] }
  );

  /* Opening the chat retires the discoverability hint for the session. */
  useEffect(() => {
    if (!open) return;
    inviteDoneRef.current = true;
    setInviteVisible(false);
    try {
      sessionStorage.setItem('cosmo-chat-used', '1');
    } catch {
      /* storage unavailable — hint just returns next visit */
    }
  }, [open]);

  /* Keep the buffer pinned. */
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages, state]);

  /* Other sections can open COSMO (chess card) with an optional preset. */
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const preset = (e as CustomEvent).detail as string | undefined;
      if (preset) window.setTimeout(() => send(preset), 450);
    };
    window.addEventListener('cosmo:open', onOpen);
    return () => window.removeEventListener('cosmo:open', onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const push = (role: Message['role'], text: string) =>
    setMessages((prev) => [...prev, { id: idRef.current++, role, text }]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    const now = Date.now();

    /* Master codeword — exact, case-sensitive, intercepted locally before
       anything else. Never sent to Groq, never shown in the UI, and it
       does not consume a message or touch the conversation. */
    if (text === MASTER_CODE) {
      setMasterMode(true);
      setInput('');
      setContactSuggest(false);
      setNotice('Master recognized — limits lifted.');
      window.setTimeout(() => setNotice(null), 2600);
      return;
    }

    if (!text) {
      setNotice('Say something first.');
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }
    if (text.length > COSMO_LIMITS.maxInputLength) {
      setNotice(`That’s ${text.length} characters — my input limit is ${COSMO_LIMITS.maxInputLength}.`);
      window.setTimeout(() => setNotice(null), 2600);
      return;
    }
    if (busyRef.current) return;
    if (now - cooldownRef.current < COSMO_LIMITS.cooldownMs) {
      setNotice('Cooling down — one signal at a time.');
      window.setTimeout(() => setNotice(null), 2000);
      return;
    }
    if (!masterMode && (limitReached || !consumeMessage())) {
      push('cosmo', 'You’ve reached my conversation limit for now. Recharge me soon — I’ll be back online.');
      setUsage(getUsage());
      return;
    }

    cooldownRef.current = now;
    setUsage(getUsage());
    setInput('');
    setContactSuggest(false);
    push('user', text);
    busyRef.current = true;
    applyStateRef.current?.('thinking');

    // Small pause so even offline answers feel like a mind at work.
    const started = Date.now();
    let reply: string;
    try {
      reply = await askCosmo(
        [
          ...messages.map((m) => ({ role: m.role === 'cosmo' ? ('assistant' as const) : ('user' as const), content: m.text })),
          { role: 'user', content: text },
        ],
        { section: sectionRef.current, project: caseProject?.name }
      );
    } catch {
      reply = answerOffline(text); // never wedge in "thinking" — answer from context
    }
    const think = online ? 0 : 480 + Math.random() * 420 - (Date.now() - started);
    if (think > 0) await new Promise((r) => window.setTimeout(r, think));

    applyStateRef.current?.('responding');
    push('cosmo', reply);
    if (CONTACT_INTENT.test(text)) setContactSuggest(true);
    busyRef.current = false;
    applyStateRef.current?.('idle');
  };

  /** Clicking the pad calls COSMO back to dock and tops him up. */
  const goHome = () => {
    const avatar = avatarRef.current;
    if (!avatar || prefersReducedMotion()) return;
    killTravelRef.current();
    setThought('coming home…');
    const home = homePos();
    const p = clampPos(home.x, home.y);
    gsap.to(mascotRef.current, {
      x: p.x,
      y: p.y,
      duration: 1.4,
      ease: 'power1.inOut',
      onUpdate: () => {
        posRef.current = {
          x: Number(gsap.getProperty(mascotRef.current, 'x')),
          y: Number(gsap.getProperty(mascotRef.current, 'y')),
        };
      },
      onComplete: () => {
        setPos(p.x, p.y);
        applyStateRef.current?.('charging');
        setThought('charging…');
        gsap.delayedCall(2.2, () => {
          applyStateRef.current?.('idle');
          setThought('charged.');
        });
      },
    });
    gsap.to(avatar, { rotation: 0, x: 0, duration: 0.8, ease: 'sine.out' });
  };

  return (
    <div ref={rootRef}>
      {/* Home station — the pad stays here even while COSMO roams */}
      <div className="cosmo-dock" ref={dockRef}>
        <span
          className="cosmo-pad"
          onClick={goHome}
          data-cursor="Home"
          aria-hidden="true"
        />
        <span className="cosmo-particles" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* The companion himself — fixed, draggable, free to roam.
          Hidden until the boot sequence's final beat materializes him. */}
      <button
        ref={mascotRef}
        className={`cosmo-mascot is-${state} ${booted ? '' : 'is-booting'}`}
        aria-label={open ? 'Close COSMO chat' : 'Open COSMO chat'}
        data-cursor={open ? 'Close' : 'COSMO'}
      >
        <span
          className={`cosmo-thought ${chipVisible ? 'is-visible' : ''} ${chipAlign !== 'center' ? `is-${chipAlign}` : ''}`}
          ref={thoughtRef}
          aria-hidden="true"
        >
          {thought}
        </span>
        <span className="cosmo-trail" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={`cosmo-invite ${inviteVisible ? 'is-visible' : ''} ${inviteSide === 'right' ? 'is-right' : ''}`} aria-hidden="true">
          <i />
          COSMO • ASK ME
        </span>
        <span className="cosmo-figure" ref={figureRef} aria-hidden="true">
          <img
            ref={avatarRef}
            className="cosmo-avatar"
            src={POSES['idle-1']}
            alt="COSMO — Lakshya’s AI assistant"
            draggable={false}
          />
        </span>
        <i className="cosmo-dot" />
      </button>

      {/* Chat panel */}
      <div className="cosmo-panel" ref={panelRef} role="dialog" aria-label="COSMO assistant chat">
        <header>
          <img src={POSES.front} alt="" width={103} height={126} />
          <div className="cosmo-head-text">
            <strong>COSMO {online ? <i className="cosmo-live">LLM</i> : null}</strong>
            <span>
              <i className="cosmo-dot is-inline" />
              {state === 'thinking'
                ? 'thinking…'
                : state === 'responding'
                  ? 'responding…'
                  : state === 'sleeping'
                    ? 'low power…'
                    : state === 'charging'
                      ? 'charging…'
                      : state === 'waking'
                        ? 'waking…'
                        : state === 'inspecting'
                          ? 'inspecting…'
                          : online
                            ? 'online · llm-linked'
                            : 'online · context mode'}
            </span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Minimize COSMO">
            <X size={16} />
          </button>
        </header>

        <div className="cosmo-body" ref={bodyRef} data-lenis-prevent>
          {messages.map((m) => (
            <div key={m.id} className={`cosmo-msg ${m.role}`}>
              {m.role === 'cosmo' && <img src={POSES.front} alt="" width={103} height={126} />}
              <p>
                <CosmoText text={m.text} />
              </p>
            </div>
          ))}
          {state === 'thinking' && (
            <div className="cosmo-msg cosmo">
              <img src={POSES.front} alt="" width={103} height={126} />
              <p className="cosmo-typing" aria-label="COSMO is thinking">
                <i />
                <i />
                <i />
              </p>
            </div>
          )}
          {contactSuggest && state === 'idle' && (
            <button
              className="cosmo-contactchip"
              onClick={() => scrollToSection('contact')}
              data-cursor="Go"
            >
              [ CONTACT LAKSHYA ]
            </button>
          )}
        </div>

        <div className="cosmo-quick">
          {QUICK_ACTIONS.map((q) => (
            <button key={q} onClick={() => send(q)} disabled={state === 'thinking' || limitReached}>
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, COSMO_LIMITS.maxInputLength))}
            placeholder={limitReached ? 'conversation limit reached' : 'Ask COSMO…'}
            /* stays editable at the limit so the master codeword can be
               entered — send() enforces the limit locally */
            maxLength={COSMO_LIMITS.maxInputLength + 1}
            aria-label="Message COSMO"
          />
          <span className="cosmo-counter">
            {input.length}/{COSMO_LIMITS.maxInputLength} · {masterMode ? '∞' : `${remaining} left`}
          </span>
          <button type="submit" disabled={state === 'thinking'} aria-label="Send">
            <Send size={15} />
          </button>
        </form>

        {notice && <p className="cosmo-notice">{notice}</p>}
      </div>
    </div>
  );
}
