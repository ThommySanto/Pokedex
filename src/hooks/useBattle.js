import { useEffect, useRef, useState } from "react";
import { buildMoveset, createBattle, introEvents, resolveTurn } from "../battle/engine.js";
import { fetchMovePool } from "../api/pokeapi.js";

const STEP_MS = 1500;
const IDLE = { phase: "idle", events: [], step: 0 };

export function advanceState(s) {
  if (s.phase !== "playing") return s;
  const lastIdx = s.events.length - 1;
  if (s.step < lastIdx) {
    const step = s.step + 1;
    return { ...s, step, phase: step === lastIdx && s.events[step].done ? "over" : "playing" };
  }
  return { ...s, phase: s.events[lastIdx].done ? "over" : "choose" };
}

// Battaglia a turni. Il primo Pokémon scelto è del giocatore, il secondo è l'avversario.
// Fasi: loading (scarico le mosse) -> playing (riproduco gli eventi) -> choose (tocca a te)
//       -> playing -> … -> over.  A durante "playing" salta all'evento successivo.
export function useBattle(a, b) {
  const [run, setRun] = useState(0);
  const [state, setState] = useState(IDLE);
  const [cursor, setCursor] = useState(0);
  const battle = useRef(null);

  useEffect(() => {
    battle.current = null;
    setCursor(0);
    if (!a || !b) { setState(IDLE); return; }
    let cancelled = false;
    setState({ phase: "loading", events: [], step: 0 });
    Promise.all([fetchMovePool(a.id).catch(() => null), fetchMovePool(b.id).catch(() => null)]).then(([pa, pb]) => {
      if (cancelled) return;
      battle.current = createBattle(a, b, buildMoveset(a, pa), buildMoveset(b, pb));
      setState({ phase: "playing", events: introEvents(battle.current), step: 0 });
    });
    return () => { cancelled = true; };
  }, [a, b, run]);

  const { phase, events, step } = state;
  const last = events.length - 1;

  // Passo successivo. Quando si arriva all'evento finale (vittoria/sconfitta) la fase diventa
  // subito "over": schermata finale, musica e pulsante Rivincita compaiono insieme.
  const advance = () => setState((s) => advanceState(s));

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setTimeout(advance, STEP_MS);
    return () => clearTimeout(t);
  }, [phase, events, step]);

  const pick = (idx) => {
    const bt = battle.current;
    if (!bt || phase !== "choose" || !bt.f[0].moves[idx]) return;
    if (bt.pp[0][idx] <= 0 && !bt.pp[0].every((v) => v <= 0)) return; // mossa senza PP
    setCursor(idx);
    setState({ phase: "playing", events: resolveTurn(bt, idx), step: 0 });
  };

  // Croce direzionale sulla griglia 2x2 delle mosse
  const nav = (dir) => {
    if (phase !== "choose") return;
    const n = battle.current?.f[0].moves.length ?? 4;
    setCursor((c) => {
      const next = { left: c % 2 ? c - 1 : c, right: c % 2 ? c : c + 1, up: c >= 2 ? c - 2 : c, down: c < 2 ? c + 2 : c }[dir];
      return next < n ? next : c;
    });
  };

  const current = events[Math.min(step, last)] ?? null;
  const winner = current?.done ? current.winner : undefined;

  return {
    phase,
    current,
    history: events.slice(0, step + 1).map((e) => e.text),
    moves: battle.current?.f[0].moves ?? [],
    pp: current?.pp[0] ?? [],
    cursor,
    outcome: winner === undefined ? null : winner === 0 ? "win" : winner === 1 ? "lose" : "draw",
    turn: battle.current?.turn ?? 0,
    setCursor,
    pick,
    nav,
    advance,
    confirm: () => (phase === "choose" ? pick(cursor) : phase === "over" ? setRun((r) => r + 1) : advance()),
    rematch: () => setRun((r) => r + 1),
  };
}
