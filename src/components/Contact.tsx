import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUp, ArrowUpRight, Check, Copy, Download, Github, Linkedin, Send } from 'lucide-react';
import {
  gsap,
  SCRAMBLE_CHARS,
  maskRevealLines,
  prefersReducedMotion,
  revealChildren,
  scrambleIn,
  scrollToSection,
} from '../lib/motion';
import { profile } from '../data/portfolio';
import { makeMagnetic } from '../lib/motion';

export default function Contact() {
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState('--:--');

  /* Live IST clock. */
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    });
    const update = () => setTime(formatter.format(new Date()));
    update();
    const timer = window.setInterval(update, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(
    () => {
      scrambleIn(rootRef.current?.querySelector<HTMLElement>('.kicker')!, 0.1);
      maskRevealLines(rootRef.current?.querySelector<HTMLElement>('.section-title')!, { scrollTrigger: true });
      revealChildren(rootRef.current, { stagger: 0.07 });
    },
    { scope: rootRef }
  );

  useEffect(() => makeMagnetic(copyRef.current!, 0.25), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
    setCopied(true);
    const label = copyRef.current?.querySelector('span');
    if (label && !prefersReducedMotion()) {
      gsap.to(label, {
        duration: 0.5,
        scrambleText: { text: 'COPIED TO CLIPBOARD', chars: SCRAMBLE_CHARS, speed: 1.2 },
      });
    }
    window.setTimeout(() => {
      setCopied(false);
      if (label) label.textContent = 'COPY EMAIL';
    }, 1800);
  };

  return (
    <>
      <section id="contact" className="section contact" ref={rootRef} data-cosmo-zone="contact">
        <div className="contact-glow" aria-hidden="true" />
        <div className="shell">
          <p className="kicker">05 / START A CONVERSATION</p>
          <h2 className="section-title">
            Have a problem<br />
            worth <em>solving?</em>
          </h2>

          <div className="contact-grid" data-reveal>
            <div className="contact-main">
              <a className="contact-email" href={`mailto:${profile.email}`} data-cursor="Mail">
                {profile.email}
                <i className="email-underline" />
              </a>
              <div className="contact-actions">
                <button className="button primary magnetic" ref={copyRef} onClick={copyEmail}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY EMAIL'}</span>
                </button>
                <a className="button ghost magnetic" href={`mailto:${profile.email}`}>
                  Write now <Send size={15} />
                </a>
              </div>
            </div>

            <div className="contact-meta">
              <div className="meta-row">
                <span>LOCAL TIME</span>
                <strong>
                  {time} IST <i className="live-dot" />
                </strong>
              </div>
              <div className="meta-row">
                <span>STATUS</span>
                <strong>{profile.availability}</strong>
              </div>
              <div className="meta-row">
                <span>BASE</span>
                <strong>{profile.location}</strong>
              </div>
              <div className="contact-links">
                <a href={profile.github} target="_blank" rel="noreferrer">
                  <Github size={15} /> GitHub <ArrowUpRight size={13} />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin size={15} /> LinkedIn <ArrowUpRight size={13} />
                </a>
                <a href={profile.resume} download>
                  <Download size={15} /> Resume <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-shell">
          <span>© {new Date().getFullYear()} LAKSHYA DHARKAR</span>
          <span>DESIGNED AS A LIVING SYSTEM</span>
          <button onClick={() => scrollToSection('home')} aria-label="Back to top" data-cursor="Top">
            <ArrowUp size={15} />
          </button>
        </div>
      </footer>
    </>
  );
}
