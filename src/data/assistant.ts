/**
 * assistant.ts — architecture for the future portfolio AI assistant.
 *
 * The assistant is INTENTIONALLY NOT IMPLEMENTED yet. When it is, it should
 * answer questions specifically about this portfolio, e.g.:
 *   - "What Python projects has Lakshya built?"
 *   - "What is his experience with AI?"
 *   - "Show me his best project."
 *
 * The plan, so nothing has to be rebuilt later:
 *
 *   1. `buildAssistantContext()` below already produces a compact, structured
 *      summary of the whole portfolio from `portfolio.ts`. Send it as the LLM
 *      system/context payload — it stays in sync with the site automatically.
 *   2. Wire `askAssistant()` to a backend endpoint that forwards the question
 *      + context to an LLM API (Claude, etc.). Nothing else in the frontend
 *      needs to change — UI components should call `askAssistant()`, never a
 *      provider SDK directly.
 *   3. Optional later upgrades: GitHub API fetch for live repo stats, and
 *      analytics events on assistant usage. Both can slot in behind this
 *      module without touching UI code.
 */

import { education, journey, profile, projects, skillAreas } from './portfolio';

export interface AssistantContext {
  profile: {
    name: string;
    role: string;
    location: string;
    availability: string;
    intro: string;
    email: string;
    github: string;
    linkedin: string;
  };
  skills: Array<{ name: string; description: string; tools: string[] }>;
  projects: Array<{
    name: string;
    label: string;
    status: string;
    year: string;
    stack: string[];
    description: string;
    problem: string;
    approach: string;
    highlights: string[];
    github: string;
  }>;
  experience: Array<{ period: string; title: string; detail: string }>;
  education: { period: string; degree: string; school: string };
}

/** Compact, structured summary of the entire portfolio — LLM-ready. */
export function buildAssistantContext(): AssistantContext {
  return {
    profile: {
      name: profile.name,
      role: profile.role,
      location: profile.location,
      availability: profile.availability,
      intro: profile.intro,
      email: profile.email,
      github: profile.github,
      linkedin: profile.linkedin,
    },
    skills: skillAreas.map(({ name, description, tools }) => ({ name, description, tools })),
    projects: projects.map((p) => ({
      name: p.name,
      label: p.label,
      status: p.status,
      year: p.year,
      stack: p.stack,
      description: p.description,
      problem: p.problem,
      approach: p.approach,
      highlights: p.highlights,
      github: p.github,
    })),
    experience: journey.map(({ period, title, detail }) => ({ period, title, detail })),
    education: education,
  };
}

/** The system prompt the future assistant should run with. */
export const ASSISTANT_SYSTEM_PROMPT = [
  'You are the portfolio assistant for Lakshya Dharkar, a Python Developer and AI Engineer.',
  'Answer only from the PORTFOLIO CONTEXT provided. Be concise, specific and warm.',
  'When asked for projects, rank by relevance to the question and mention stack + status.',
  'If asked something the context does not cover, say so and point to the contact email.',
  'Never invent experience, dates or projects.',
].join(' ');

/**
 * Stub for the future assistant. UI code can already call this today;
 * wiring it later is a one-function change.
 */
export async function askAssistant(_question: string): Promise<string> {
  throw new Error(
    'Assistant module is scheduled for a future release. ' +
      'The context layer (buildAssistantContext) is already in place — wire an LLM backend to enable it.'
  );
}
