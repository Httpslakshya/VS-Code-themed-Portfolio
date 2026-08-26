import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';
import { Chess } from 'chess.js';
import { gsap, maskRevealLines, prefersReducedMotion, revealChildren, scrambleIn } from '../lib/motion';
import { londonFen, playlist, profile } from '../data/portfolio';
import { openCosmo } from './Cosmo';
import { POSES } from '../services/cosmoAnimation';

export default function Playground() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      scrambleIn(root.querySelector<HTMLElement>('.kicker')!, 0.1);
      maskRevealLines(root.querySelector<HTMLElement>('.section-title')!, { scrollTrigger: true });
      revealChildren(root, { stagger: 0.08 });

      /* The chess board assembles itself — squares drop into place. */
      const pieces = root.querySelectorAll('.board .sq');
      if (pieces.length && !prefersReducedMotion()) {
        gsap.from(pieces, {
          scale: 0.3,
          autoAlpha: 0,
          duration: 0.5,
          ease: 'back.out(2.2)',
          stagger: { each: 0.012, from: 'start' },
          scrollTrigger: { trigger: root.querySelector('.chess-feature'), start: 'top 75%', once: true },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section id="playground" className="section playground" ref={rootRef}>
      <div className="shell">
        <div className="section-head">
          <div>
            <p className="kicker">04 / OFF THE CLOCK</p>
            <h2 className="section-title">
              Patterns, rhythm,<br />
              <em>and a good endgame.</em>
            </h2>
          </div>
          <p className="section-note">
            The inputs outside a terminal that shape how I think inside one — DHH on rotation,
            positions on a board.
          </p>
        </div>

        <PlaylistDeck />
        <ChessStudy />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Playlist deck — what’s on rotation, draggable, auto-cycling          */
/* ------------------------------------------------------------------ */

function PlaylistDeck() {
  const [active, setActive] = useState(2);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragging = useRef(false);
  const hoverRef = useRef(false);

  const offsetFor = (index: number) => {
    let offset = index - active;
    const half = Math.floor(playlist.length / 2);
    if (offset > half) offset -= playlist.length;
    if (offset < -half) offset += playlist.length;
    return offset;
  };

  const move = (direction: number) =>
    setActive((current) => (current + direction + playlist.length) % playlist.length);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!dragging.current && !hoverRef.current && !document.hidden) move(1);
    }, 2100); // short hold between steps — the deck feels like it flows
    return () => window.clearInterval(timer);
  }, []);

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    dragStart.current = null;
    dragging.current = false;
    if (Math.abs(distance) > 35) move(distance < 0 ? 1 : -1);
  };

  return (
    <div className="playlist-carousel" ref={rootRef} data-reveal data-cosmo-zone="playlist">
      <div className="playlist-head">
        <span>CURRENT PLAYLIST — DHH + HIP-HOP</span>
        <a href={profile.spotify} target="_blank" rel="noreferrer" aria-label="Open Spotify profile" data-cursor="Listen">
          <ArrowUpRight size={17} />
        </a>
      </div>
      <div
        className="deck"
        aria-label="Playlist carousel"
        onPointerEnter={() => (hoverRef.current = true)}
        onPointerLeave={() => (hoverRef.current = false)}
        onPointerDown={(event) => {
          dragging.current = true;
          dragStart.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={() => {
          dragStart.current = null;
          dragging.current = false;
        }}
      >
        {playlist.map((album, index) => {
          const offset = offsetFor(index);
          const distance = Math.abs(offset);
          return (
            <button
              aria-label={`Show ${album.name}`}
              key={album.src}
              onClick={() => setActive(index)}
              className={`playlist-card ${distance > 2 ? 'is-hidden' : ''}`}
              style={{ '--offset': offset, '--distance': distance, '--order': 10 - distance } as CSSProperties}
            >
              <img draggable={false} src={album.src} alt={`${album.name} cover`} loading="lazy" width={285} height={184} />
              <div>
                <span>ON REPEAT</span>
                <strong>{album.name}</strong>
                <p>{album.artist}</p>
              </div>
            </button>
          );
        })}
        <button className="deck-control previous" onClick={() => move(-1)} aria-label="Previous album">
          ‹
        </button>
        <button className="deck-control next" onClick={() => move(1)} aria-label="Next album">
          ›
        </button>
      </div>
      <p className="deck-hint">Auto-playing — drag the deck, click a cover, or use the arrows.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chess — the London System, playable against COSMO                    */
/* ------------------------------------------------------------------ */

const FEN_TO_GLYPH: Record<string, string> = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
};

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

/** Material + centre control, in centipawns from white’s perspective. */
function evaluate(game: Chess): number {
  let score = 0;
  for (const row of game.board()) {
    for (const square of row) {
      if (!square) continue;
      const file = square.square.charCodeAt(0) - 97;
      const rank = Number(square.square[1]) - 1;
      const centre = 3.5 - Math.abs(file - 3.5) + (3.5 - Math.abs(rank - 3.5));
      const bonus = centre * (square.type === 'n' ? 4 : square.type === 'p' ? 2 : 1);
      score += (square.color === 'w' ? 1 : -1) * (PIECE_VALUES[square.type] + bonus);
    }
  }
  return score;
}

/** Negamax with alpha-beta pruning. Returns score from the side to move. */
function search(game: Chess, depth: number, alpha: number, beta: number): number {
  if (game.isGameOver()) {
    if (game.isCheckmate()) return -100000 - depth; // being mated sooner is worse
    return 0;
  }
  if (depth === 0) return (game.turn() === 'w' ? 1 : -1) * evaluate(game);
  let best = -Infinity;
  for (const move of game.moves()) {
    game.move(move);
    const score = -search(game, depth - 1, -beta, -alpha);
    game.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/** COSMO’s reply — depth-3 search, yielded between root moves so the
    page never freezes, with a pinch of randomness for variety. */
async function bestMoveAsync(game: Chess): Promise<string | null> {
  const moves = game.moves();
  if (!moves.length) return null;
  let best = -Infinity;
  let pick = moves[0];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    game.move(move);
    const score = -search(game, 2, -Infinity, Infinity) + Math.random() * 10;
    game.undo();
    if (score > best) {
      best = score;
      pick = move;
    }
    if (i % 3 === 2) await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
  return pick;
}

type Status = { text: string; tone: 'you' | 'cosmo' | 'end' };

function ChessStudy() {
  const gameRef = useRef(new Chess(londonFen));
  const timerRef = useRef<number | undefined>(undefined);
  const genRef = useRef(0); // invalidates in-flight COSMO thinking on reset/unmount
  const [fen, setFen] = useState(londonFen);
  const [mode, setMode] = useState<'london' | 'standard'>('london');
  const [selected, setSelected] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [captured, setCaptured] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] });
  const [status, setStatus] = useState<Status>({ text: 'YOUR MOVE — WHITE TO PLAY', tone: 'you' });

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const board = useMemo(() => gameRef.current.board(), [fen]);
  const legalTargets = useMemo(
    () =>
      selected
        ? gameRef.current.moves({ square: selected as never, verbose: true }).map((m) => m.to)
        : [],
    [selected, fen]
  );

  /** New game — standard starting position, all 32 pieces home. */
  const reset = () => {
    window.clearTimeout(timerRef.current);
    genRef.current += 1;
    gameRef.current = new Chess(); // standard start
    setFen(gameRef.current.fen());
    setMode('standard');
    setSelected(null);
    setLastMove(null);
    setCaptured({ w: [], b: [] });
    setStatus({ text: 'NEW GAME — STANDARD START · WHITE TO PLAY', tone: 'you' });
  };

  const settle = (): boolean => {
    const game = gameRef.current;
    if (!game.isGameOver()) return false;
    if (game.isCheckmate()) {
      setStatus({
        text: game.turn() === 'w' ? 'CHECKMATE — COSMO WINS' : 'CHECKMATE — YOU WIN',
        tone: 'end',
      });
      // COSMO reacts to the result — a real character, not a widget.
      window.dispatchEvent(
        new CustomEvent('cosmo:react', { detail: game.turn() === 'w' ? 'subtle' : 'excited' })
      );
    } else {
      setStatus({ text: 'DRAW — RESET TO RUN IT BACK', tone: 'end' });
    }
    return true;
  };

  const cosmoReplies = () => {
    const game = gameRef.current;
    const generation = genRef.current;
    setStatus({ text: 'COSMO IS THINKING…', tone: 'cosmo' });
    timerRef.current = window.setTimeout(async () => {
      const reply = await bestMoveAsync(game);
      if (generation !== genRef.current) return; // reset or unmount happened mid-think
      if (reply) {
        const move = game.move(reply);
        setLastMove({ from: move.from, to: move.to });
        if (move.captured) {
          setCaptured((c) => ({ ...c, b: [...c.b, FEN_TO_GLYPH[move.captured!.toUpperCase()]] }));
        }
        setFen(game.fen());
        if (game.inCheck()) window.dispatchEvent(new CustomEvent('cosmo:react', { detail: 'check' }));
        else if (move.captured) window.dispatchEvent(new CustomEvent('cosmo:react', { detail: 'capture' }));
      }
      if (settle()) return;
      setStatus({
        text: game.inCheck() ? 'YOUR MOVE — YOU ARE IN CHECK' : 'YOUR MOVE — WHITE TO PLAY',
        tone: 'you',
      });
    }, 300);
  };

  const playUserMove = (from: string, to: string) => {
    const game = gameRef.current;
    try {
      const move = game.move({ from, to, promotion: 'q' });
      setLastMove({ from: move.from, to: move.to });
      if (move.captured) {
        setCaptured((c) => ({ ...c, w: [...c.w, FEN_TO_GLYPH[move.captured!]] }));
      }
      setFen(game.fen());
      setSelected(null);
      if (move.captured) window.dispatchEvent(new CustomEvent('cosmo:react', { detail: 'capture' }));
      if (settle()) return;
      cosmoReplies();
    } catch {
      setSelected(null);
    }
  };

  const onSquare = (square: string) => {
    const game = gameRef.current;
    if (game.isGameOver() || game.turn() !== 'w') return;
    if (selected && legalTargets.includes(square as never)) {
      playUserMove(selected, square);
      return;
    }
    const piece = game.get(square as never);
    if (piece && piece.color === 'w') setSelected(square);
    else setSelected(null);
  };

  const inCheck = gameRef.current.inCheck();

  return (
    <div className="chess-feature" data-reveal data-cosmo-zone="chess">
      <div className="chess-copy">
        <span>{mode === 'london' ? 'LONDON SYSTEM · MAIN LINE' : 'STANDARD GAME · YOU VS COSMO'}</span>
        <strong>
          {mode === 'london' ? (
            <>
              Build the <em>centre.</em>
            </>
          ) : (
            <>
              Your <em>move.</em>
            </>
          )}
        </strong>
        <p>
          {mode === 'london' ? (
            <>
              Quiet development, sharp ideas — a position about purposeful structure before the
              tactics arrive. Same way I like to build. Take white; COSMO takes black.
            </>
          ) : (
            <>
              Fresh board, all 32 pieces home. You take white, COSMO takes black — good luck.
            </>
          )}
        </p>
        <p className={`chess-status tone-${status.tone}`} role="status">
          <i className="status-cursor" />
          {status.text}
        </p>
        <div className="chess-trays">
          <span>YOU TOOK — {captured.w.join(' ') || '·'}</span>
          <span>COSMO TOOK — {captured.b.join(' ') || '·'}</span>
        </div>
        <div className="chess-actions">
          <button className="chess-reset" onClick={reset}>
            New game
          </button>
          <a className="text-link" href={profile.chess} target="_blank" rel="noreferrer">
            Chess.com <ArrowUpRight size={15} />
          </a>
        </div>
        <button
          className="cosmo-chesscard"
          onClick={() => openCosmo('How’s my chess?')}
          data-cursor="Ask"
          aria-label="Ask COSMO about your chess"
        >
          <img src={POSES.front} alt="" width={103} height={126} />
          <span className="cosmo-chesscard-text">
            <strong>
              COSMO <i>• ONLINE</i>
            </strong>
            <span>
              {status.tone === 'end' ? 'Good game.' : status.tone === 'cosmo' ? 'Thinking…' : 'Your move.'}
            </span>
          </span>
        </button>
      </div>
      <div className="board chess-live" aria-label="Playable London System position">
        {board.flatMap((row, r) =>
          row.map((square, c) => {
            const name = 'abcdefgh'[c] + (8 - r);
            const isTarget = legalTargets.includes(name as never);
            const isSelected = selected === name;
            const isLast = lastMove?.from === name || lastMove?.to === name;
            const isCheckSquare =
              square && square.type === 'k' && inCheck && square.color === gameRef.current.turn();
            const glyph = square
              ? FEN_TO_GLYPH[square.color === 'w' ? square.type.toUpperCase() : square.type]
              : '';
            return (
              <button
                key={name}
                className={`sq ${(r + c) % 2 === 0 ? 'sq-light' : 'sq-dark'}${isSelected ? ' is-sel' : ''}${
                  isTarget ? ' is-hint' : ''
                }${isLast ? ' is-last' : ''}${isCheckSquare ? ' is-check' : ''}`}
                onClick={() => onSquare(name)}
                aria-label={`${name}${square ? ` ${square.color === 'w' ? 'white' : 'black'} ${square.type}` : ', empty'}`}
              >
                {glyph && <span className={square!.color === 'w' ? 'white-piece' : 'black-piece'}>{glyph}</span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
