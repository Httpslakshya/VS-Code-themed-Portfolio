# LAKSHYA.OS — Interactive Portfolio

The portfolio of **Lakshya Dharkar** — Python Developer · AI Engineer — built as a
living system: it boots, streams telemetry, presents projects as case files, and is
operated by a real command line.

## Stack

- React 18 + TypeScript + Vite
- GSAP (ScrollTrigger, SplitText, ScrambleText) + Lenis smooth scroll
- Hand-written CSS design system (`src/styles/`) — no UI framework
- lucide-react icons

## Architecture

```
src/
  data/
    portfolio.ts   ← single source of truth (profile, projects, skills, journey)
    assistant.ts   ← future AI assistant: buildAssistantContext() + askAssistant() stub
  lib/
    motion.ts      ← GSAP registration, smooth scroll, shared reveal helpers
    uiContext.ts   ← shared openTerminal() / openCase() actions
  components/      ← one file per section, all motion scoped via useGSAP
  styles/          ← base.css (tokens/chrome) · sections.css · terminal.css
```

### Terminal

Open with **⌘K / Ctrl+K**, the nav button, or the hero CTA.
Commands: `help · about · projects · project <name> · skills · stack · experience ·
education · open <section> · contact · github · linkedin · resume · neofetch · top ·
matrix · chai · joke · hire · socials · whoami · pwd · history · clear · exit`
— plus a few undocumented ones. Tab completes, ↑/↓ walks history.

### AI assistant (future)

The assistant is intentionally not implemented yet. Everything it will need is ready:
`buildAssistantContext()` in `src/data/assistant.ts` serializes the whole portfolio for
an LLM system prompt, and `askAssistant()` is the single integration point — wire a
backend to it and no UI code needs to change.

## Commands

```bash
npm run dev       # local dev
npm run build     # production build → dist/
npm run preview   # serve the production build
```
