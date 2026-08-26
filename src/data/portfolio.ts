/**
 * portfolio.ts — the single source of truth for everything on this site.
 *
 * The UI, the terminal, and (later) the AI assistant all read from here.
 * If you change a fact about Lakshya, change it here and every surface
 * picks it up. See `assistant.ts` for how this feeds the future chatbot.
 */

export interface Project {
  id: string;
  name: string;
  label: string;
  status: 'AI SYSTEM' | 'SHIPPED' | 'EXPERIMENT';
  accent: 'phosphor' | 'signal' | 'violet';
  description: string;
  problem: string;
  approach: string;
  highlights: string[];
  stack: string[];
  role: string;
  year: string;
  github: string;
  image: string;
  /** Alternate screen — revealed at the cursor when hovering the row. */
  hoverImage: string;
}

export interface SkillArea {
  name: string;
  icon: 'code' | 'sparkles' | 'server' | 'zap' | 'database' | 'layout';
  description: string;
  tools: string[];
}

export interface JourneyEntry {
  period: string;
  title: string;
  detail: string;
  current?: boolean;
}

export const profile = {
  name: 'Lakshya Dharkar',
  initials: 'LD',
  role: 'Python Developer · AI Engineer',
  tagline: 'Building useful intelligence for the web.',
  intro:
    'I’m Lakshya — a Python Developer and AI Engineer focused on turning complex ideas into precise, human-centered software.',
  availability: 'Available for selected opportunities',
  location: 'India · open to remote',
  email: 'lakshyadharkar@gmail.com',
  github: 'https://github.com/Httpslakshya',
  linkedin: 'https://www.linkedin.com/in/lakshya-dharkar-571004294/',
  chess: 'https://www.chess.com/member/theycallmelakshya',
  spotify: 'https://open.spotify.com/user/31ncwlzw3g43nivume7zievwupim?si=fb0024ae543e46be',
  resume: '/resume.pdf',
  portrait: '/lakshya-portrait.webp',
  heroSignals: ['PYTHON', 'AI / ML', 'BACKEND', 'AUTOMATION'],
  /** Flavor lines for the hero “system log” card — cycled with a scramble effect. */
  systemLog: [
    'indexing 1,284 document chunks',
    'rag-service → deploy stable',
    'training recommender · epoch 14/20',
    'prompt-drift eval: passed',
    'cosmo · online — streak: 15',
    'agent tool-call latency: 212ms',
  ],
} as const;

export const projects: Project[] = [
  {
    id: 'docmind',
    name: 'DocMind',
    label: 'AI DOCUMENT INTELLIGENCE',
    status: 'AI SYSTEM',
    accent: 'signal',
    description:
      'Turns any PDF into an intelligent knowledge base for chat, search, summaries, and insight extraction.',
    problem: 'Useful information is buried in lengthy technical documents.',
    approach:
      'A RAG-oriented document workflow makes complex PDFs conversational and searchable — retrieval first, generation second.',
    highlights: [
      'Document ingestion → chunking → embedding → retrieval pipeline',
      'Grounded chat answers with source context',
      'Summary and insight extraction on demand',
    ],
    stack: ['Python', 'RAG', 'LLM APIs', 'PDF processing'],
    role: 'Design, engineering, end-to-end build',
    year: '2025',
    github: 'https://github.com/Httpslakshya/DocMind',
    image: '/projects/docmind-home.webp',
    hoverImage: '/projects/docmind-login.webp',
  },
  {
    id: 'cosmo',
    name: 'COSMO AI',
    label: 'PERSONAL AUTOMATION',
    status: 'AI SYSTEM',
    accent: 'violet',
    description: 'A desktop assistant built around secure voice control and system automation.',
    problem: 'Everyday computer actions still involve too much repetitive, manual work.',
    approach:
      'Voice-first commands and automation make personal computing feel more direct — the OS becomes callable.',
    highlights: [
      'Wake-word and voice command capture',
      'Intent routing into system actions',
      'Secure local execution — no cloud dependency for control',
    ],
    stack: ['Python', 'Voice AI', 'Automation', 'OS scripting'],
    role: 'Design, engineering, end-to-end build',
    year: '2024',
    github: 'https://github.com/Httpslakshya/COSMO-AI',
    image: '/projects/cosmo-home.webp',
    hoverImage: '/projects/cosmo-alt.webp',
  },
  {
    id: 'medistock',
    name: 'MediStock',
    label: 'HEALTHCARE OPERATIONS',
    status: 'SHIPPED',
    accent: 'phosphor',
    description:
      'A practical medicine inventory system for tracking stock, expiries, and vital information.',
    problem: 'Manual medicine tracking makes stock visibility and expiry management difficult.',
    approach:
      'A focused dashboard combines inventory operations with symptom-based discovery — utility over decoration.',
    highlights: [
      'Stock, expiry and threshold tracking in one view',
      'Symptom-based medicine discovery flow',
      'Designed for real clinic workflows, not demos',
    ],
    stack: ['React', 'JavaScript', 'UI/UX', 'Local persistence'],
    role: 'Product design, frontend engineering',
    year: '2024',
    github: 'https://github.com/Httpslakshya/MediStock',
    image: '/projects/medistock-home.webp',
    hoverImage: '/projects/medistock-login.webp',
  },
  {
    id: 'reflekt',
    name: 'reflekt-ai',
    label: 'PROMPT INTELLIGENCE',
    status: 'AI SYSTEM',
    accent: 'signal',
    description:
      'Transforms messy, multilingual thoughts into structured AI prompts with customizable depth and style.',
    problem: 'Good AI outcomes often get lost between intent and an unstructured prompt.',
    approach:
      'A guided prompt-transformation flow preserves context while producing clearer instructions for any model.',
    highlights: [
      'Multilingual input → structured prompt output',
      'Adjustable depth and style controls',
      'Built around real prompt-engineering habits',
    ],
    stack: ['TypeScript', 'LLM APIs', 'Prompt engineering', 'UX'],
    role: 'Design, engineering, end-to-end build',
    year: '2025',
    github: 'https://github.com/Httpslakshya/reflekt-ai',
    image: '/projects/reflekt-home.webp',
    hoverImage: '/projects/reflekt-alt.webp',
  },
  {
    id: 'malwa',
    name: 'Malwa Express',
    label: 'INTERACTIVE WEB EXPERIENCE',
    status: 'EXPERIMENT',
    accent: 'violet',
    description:
      'An atmospheric 90s Bollywood night-bus journey across Central India, built around sound, memory, and motion.',
    problem: 'Most web experiences lose their identity by treating the interface as only a container.',
    approach:
      'A cinematic, story-led journey uses interaction and atmosphere to make the web feel transportive.',
    highlights: [
      'Scene-based scroll journey with ambient audio',
      'Motion and typography carry the narrative',
      'A proof that engineering can also be atmosphere',
    ],
    stack: ['HTML', 'Web Audio', 'Motion', 'Storytelling'],
    role: 'Concept, design, engineering',
    year: '2025',
    github: 'https://github.com/Httpslakshya/MalwaExpress',
    image: '/projects/malwa-home.webp',
    hoverImage: '/projects/malwa-inside.webp',
  },
];

export const skillAreas: SkillArea[] = [
  {
    name: 'AI / ML',
    icon: 'sparkles',
    description: 'Applied intelligence — retrieval systems, LLM products, and model-driven features that ship.',
    tools: ['RAG', 'LLM APIs', 'embeddings', 'scikit-learn'],
  },
  {
    name: 'Python',
    icon: 'code',
    description: 'The core language — for AI workflows, APIs, automation, and everything in between.',
    tools: ['FastAPI', 'asyncio', 'PyTorch', 'tooling'],
  },
  {
    name: 'Backend',
    icon: 'server',
    description: 'Service architecture and APIs that stay fast, testable, and boring in production.',
    tools: ['FastAPI', 'Flask', 'REST', 'PostgreSQL'],
  },
  {
    name: 'Automation',
    icon: 'zap',
    description: 'Turning repetitive operations into reliable flows that run without supervision.',
    tools: ['scripting', 'schedulers', 'OS tooling', 'workflows'],
  },
  {
    name: 'Data',
    icon: 'database',
    description: 'Retrieval, structured information, and the decision systems built on top of them.',
    tools: ['SQL', 'pandas', 'vector stores', 'pipelines'],
  },
  {
    name: 'Interfaces',
    icon: 'layout',
    description: 'Product-minded frontends for technical systems — clear, quick, and honest.',
    tools: ['React', 'TypeScript', 'GSAP', 'Tailwind'],
  },
];

/** What Lakshya is actively exploring — shown in the “now exploring” strip. */
export const exploring = [
  'LLM agents',
  'RAG pipelines',
  'LangGraph',
  'fine-tuning',
  'vector search',
  'eval harnesses',
  'MCP servers',
  'voice interfaces',
];

export const journey: JourneyEntry[] = [
  {
    period: 'NOW',
    title: 'Python Developer · AI Engineer',
    detail:
      'Building intelligent applications, APIs, automation workflows, and product experiences where AI adds practical value.',
    current: true,
  },
  {
    period: '2023 — NOW',
    title: 'Independent builder',
    detail:
      'Shipped web products, hackathon concepts, and user-focused interfaces — learning to turn an idea into an end-to-end experience.',
  },
  {
    period: '2022 — NOW',
    title: 'B.Tech, Computer Science',
    detail: 'Swami Vivekanand College of Engineering — the formal base under the self-taught systems work.',
  },
];

export const education = {
  period: '2022 — NOW',
  degree: 'B.Tech, Computer Science',
  school: 'Swami Vivekanand College of Engineering',
};

export const telemetry = [
  { value: 3, suffix: '+', label: 'YEARS BUILDING' },
  { value: 5, suffix: '', label: 'SYSTEMS SHIPPED' },
  { value: 3, suffix: '', label: 'AI-POWERED' },
];

export const sections = [
  { id: 'work', label: 'Work' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
] as const;

export const playlist = [
  { src: '/playlist/bayaan.jpeg', name: 'Bayaan', artist: 'Seedhe Maut' },
  { src: '/playlist/yours-truly.jpeg', name: 'Yours Truly', artist: 'KR$NA' },
  { src: '/playlist/gnx.jpeg', name: 'GNX', artist: 'Kendrick Lamar' },
  { src: '/playlist/lunch-break.jpeg', name: 'Lunch Break', artist: 'Seedhe Maut' },
  { src: '/playlist/karan-aujla.jpeg', name: 'Making Memories', artist: 'Karan Aujla' },
  { src: '/playlist/naam-sujal.jpeg', name: 'Naam Sujal', artist: 'Naam Sujal' },
  { src: '/playlist/mamafication.jpeg', name: 'Mamafication', artist: 'Naam Sujal' },
  { src: '/playlist/monopoly-moves.jpeg', name: 'Monopoly Moves', artist: 'Seedhe Maut' },
  { src: '/playlist/chaar-diwaari.jpeg', name: 'Chaar Diwaari', artist: 'Chaar Diwaari' },
  { src: '/playlist/kshama.jpeg', name: 'Kshama', artist: 'Seedhe Maut' },
];

/**
 * London System — the tabiya after 1.d4 d5 2.Bf4 Nf6 3.e3.
 * (The f4 bishop is the c1 bishop — c1 is empty, not f1.)
 * Stored as a FEN so the playable board and chess.js always agree.
 */
export const londonFen = 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 1';
