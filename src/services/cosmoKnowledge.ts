/**
 * cosmoKnowledge.ts — COSMO's lightweight local retrieval layer.
 *
 * The two knowledge sources (Lakshya's personal context file + his resume,
 * pre-extracted to resumeText.ts) are parsed ONCE at module init into small
 * labeled chunks. For each visitor question we score chunks by keyword
 * overlap and return only the top ~1.4KB of relevant text, so the Groq
 * request stays small and fast:
 *
 *   question → local keyword retrieval → small context → short system prompt
 *
 * No vector DB, no runtime PDF parsing, no heavy dependencies — just string
 * scoring over ~30 chunks, which costs well under a millisecond.
 */

import { RESUME_TEXT } from '../data/resumeText';
import rawPersonal from '../../lakshya_personal_ai_context.txt?raw';
import { buildCosmoContext } from '../data/cosmo';

export interface KnowledgeChunk {
  /** Short label, used as a keyword boost (e.g. "CORE PROFILE"). */
  title: string;
  text: string;
}

/* ------------------------------------------------------------------ */
/* Chunking — once, at module load                                     */
/* ------------------------------------------------------------------ */

function chunkPersonal(raw: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  // The file is organized as: ==== N. TITLE ====  … body …
  const re = /={4,}\s*\d*\.\s*([^\n=]+?)\s*={4,}/g;
  const marks: Array<{ title: string; start: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) marks.push({ title: m[1].trim(), start: m.index, end: re.lastIndex });
  for (let i = 0; i < marks.length; i++) {
    const bodyEnd = i + 1 < marks.length ? marks[i + 1].start : raw.length;
    const body = raw.slice(marks[i].end, bodyEnd).trim();
    if (body) chunks.push({ title: marks[i].title, text: body });
  }
  return chunks;
}

function chunkResume(text: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  // The PDF extracts with ALL-CAPS section headers (SUMMARY, SKILLS, …).
  const lines = text.split('\n');
  let current: KnowledgeChunk | null = null;
  for (const line of lines) {
    const t = line.trim();
    const isHeader = /^[A-Z][A-Z &-]{3,}$/.test(t.replace(/\s+/g, ' '));
    if (isHeader) {
      if (current && current.text) chunks.push(current);
      current = { title: `RESUME — ${t.replace(/\s+/g, ' ')}`, text: '' };
    } else if (current) {
      current.text += (current.text ? '\n' : '') + t;
    } else {
      current = { title: 'RESUME — HEADER', text: t };
    }
  }
  if (current && current.text) chunks.push(current);
  return chunks;
}

function chunkPortfolio(): KnowledgeChunk[] {
  // The verified site context, one chunk per line-item.
  return buildCosmoContext()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const title = line.slice(0, line.indexOf(':')) || 'PORTFOLIO';
      return { title: `PORTFOLIO — ${title}`, text: line };
    });
}

/* Built lazily on first retrieval — cosmo.ts imports this module (for its
   offline brain) and this module reads cosmo.ts's verified context, so
   chunking at module-init would race the circular import. */
let CHUNKS: KnowledgeChunk[] | null = null;

function getChunks(): KnowledgeChunk[] {
  if (!CHUNKS) {
    CHUNKS = [...chunkPersonal(rawPersonal), ...chunkResume(RESUME_TEXT), ...chunkPortfolio()];
  }
  return CHUNKS;
}

/* ------------------------------------------------------------------ */
/* Retrieval                                                           */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  'a an the is are was were do does did of in on at to for with about his her he she they them you your it its and or what who whom which when where why how tell say me my i we us can could would should give show know think there that this these those from as by be been being have has had not no yes please thanks thank hi hello hey'.split(
    ' '
  )
);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/* Visitors say "hobbies", the file says "interests span" — a tiny synonym
   bridge closes the vocabulary gap without any embedding machinery. */
const SYNONYMS: Record<string, string> = {
  hobby: 'interests',
  hobbies: 'interests',
  enjoy: 'interests likes',
  enjoys: 'interests likes',
  fun: 'interests gaming music',
  pastime: 'interests',
  spare: 'interests',
  outside: 'interests',
  creative: 'design drawing video',
  music: 'rap guitar playlist listening',
  freelance: 'client work experience',
  streak: 'chess wins',
  stack: 'skills tools',
  study: 'education college',
  studies: 'education college',
  age: 'born year old',
  birthday: 'born year old',
  girlfriend: 'relationship personal',
  family: 'personal relationship',
};

function expand(tokens: string[]): string[] {
  const out = [...tokens];
  for (const t of tokens) {
    const extra = SYNONYMS[t];
    if (extra) out.push(...extra.split(' '));
  }
  return out;
}

/** Score one chunk against the question tokens. */
function score(chunk: KnowledgeChunk, tokens: string[]): number {
  const hay = `${chunk.title} ${chunk.text}`.toLowerCase();
  const title = chunk.title.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (title.includes(t)) s += 3; // a section-title hit is a strong signal
    else if (hay.includes(t)) s += 1;
  }
  return s;
}

/**
 * The most relevant knowledge for one question, within a character budget.
 * Returns '' when nothing matches — the caller then relies on the core
 * identity context and the anti-hallucination rule.
 */
export function getRelevantContext(question: string, budget = 1400): string {
  const tokens = expand(tokenize(question));
  if (!tokens.length) return '';
  const ranked = getChunks()
    .map((c) => ({ c, s: score(c, tokens) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4);

  let out = '';
  for (const { c } of ranked) {
    if (out.length >= budget) break;
    // truncate to the remaining budget — never drop a chunk entirely just
    // because it alone overflows (small budgets still deserve context)
    const block = `[${c.title}]\n${c.text}`;
    out += (out ? '\n\n' : '') + block.slice(0, budget - out.length);
  }
  return out;
}

/** Knowledge size — for the terminal's `cosmo status`. Lazy-safe. */
export function knowledgeStats() {
  const chunks = getChunks();
  return { chunks: chunks.length, chars: chunks.reduce((n, c) => n + c.text.length, 0) };
}
