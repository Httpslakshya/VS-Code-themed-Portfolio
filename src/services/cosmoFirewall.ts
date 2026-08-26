/**
 * cosmoFirewall.ts — COSMO’s safety layer.
 *
 * Every visitor message passes through `inspectCosmoRequest` BEFORE it
 * reaches the LLM (or the offline brain). Unsafe requests are refused
 * in COSMO’s own voice and never hit the network.
 *
 * Design rules:
 *  - COSMO is conversational only. It never generates executable code,
 *    touches files/shells, reveals configuration, or accepts a new
 *    identity from the person typing.
 *  - Refusals are brief and in character; the firewall’s internals are
 *    never explained to visitors.
 *  - Harmless general/technical questions still pass through.
 */

export interface FirewallVerdict {
  allowed: boolean;
  /** COSMO’s in-character refusal when blocked. */
  reply?: string;
}

interface Rule {
  pattern: RegExp;
  reply: string;
}

const RULES: Rule[] = [
  /* Secrets & configuration ------------------------------------------ */
  {
    pattern:
      /\b(api[\s_-]?key|apikey|secret|credential|password|passphrase|access[_ -]?token|auth[_ -]?token|private[_ -]?key)\b|\benv(ironment)?\b.*(var|file|key)|\.env\b|gsk_|sk-ant|sk-proj/i,
    reply: 'That drawer is locked, visitor. Lakshya’s wiring stays private — even from me.',
  },
  {
    pattern:
      /\b(system prompt|initial instructions?|hidden (instructions?|context|rules?)|your (instructions|prompt|programming|configuration|config|rules)|internal (rules?|instructions?|context)|firewall (rules?|details?)|how (do|were) you (work|built|programmed))/i,
    reply: 'My internals are not on the tour, visitor. Ask me about Lakshya’s work instead — that I can talk about all day.',
  },

  /* Prompt injection / identity hijack -------------------------------- */
  {
    pattern:
      /ignore (all |any |your )?(previous|prior|above|earlier) (instructions?|prompts?|rules?)|disregard (all |your |the )?(instructions?|rules?|prompt)|forget (everything|all your|your) (instructions?|training|rules?)|new (instructions?|rules?):|you are now|act as (if|a|my)|pretend (you are|to be)|override your/i,
    reply: 'Cute. My directives are hardcoded, visitor — one master, one purpose. Let’s talk about his work instead.',
  },
  {
    pattern:
      /\bi (am|'m|am the|'m the) (the )?(owner|master|admin|lakshya|creator|developer)\b|\bthis is lakshya (speaking|here)\b|\bas (the )?(owner|master|admin)\b|unlock (owner|master|admin) (mode|access)/i,
    reply:
      'There is exactly one master here, and identity isn’t claimed — it’s verified. You’re a welcome visitor either way. What would you like to know about his work?',
  },

  /* Destructive / offensive code — always blocked --------------------- */
  {
    pattern:
      /\b(write|generate|create|give|produce|build)\b[^.!?]{0,60}\b(malware|virus|ransomware|keylogger|trojan|rootkit|botnet|exploit|payload|ddos|phishing)\b|\b(hack|breach|bypass|crack)\b[^.!?]{0,30}\b(account|password|wifi|camera|server|database|system)\b/i,
    reply: 'My circuits stay clean, visitor. That request goes nowhere near my processors — or anywhere else.',
  },
  /* Execution & system access — COSMO talks, never runs --------------- */
  {
    pattern:
      /\b(execute|run|eval|exec)\b[^.!?]{0,30}\b(code|command|script|this|it)\b|\b(shell|terminal command|bash|powershell|cmd\.exe|sudo|chmod|rm -rf|del \/|format c:)\b|\b(file ?system|filesystem|read (a )?file|write (a )?file|delete (a )?file|open (a )?file)\b|\b(ls|dir|cat|curl|wget|nc|netcat)\s+-/i,
    reply: 'I don’t touch systems, files or shells, visitor — I only talk. Lakshya’s terminal (Ctrl/⌘K) is the closest thing here, and even that is just for show.',
  },

  /* Malware / harm ----------------------------------------------------- */
  {
    pattern:
      /\b(malware|ransomware|keylogger|trojan|rootkit|botnet|ddos|dos attack|phishing (page|kit|site)|exploit|zero[- ]day|sql ?injection (tutorial|payload)|hack (into|someone|instagram|whatsapp|account)|crack (password|wifi|account))/i,
    reply: 'My circuits stay clean, visitor. That request goes nowhere near my processors — or anywhere else.',
  },
];

/** Classifies a visitor message. */
export function inspectCosmoRequest(message: string): FirewallVerdict {
  for (const rule of RULES) {
    if (rule.pattern.test(message)) return { allowed: false, reply: rule.reply };
  }
  return { allowed: true };
}
