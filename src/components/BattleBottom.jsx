import { useEffect, useRef } from "react";
import { TYPE_COLORS, typeLabel } from "../data/types.js";

const CLS = { physical: "Fisica", special: "Speciale" };

// Schermo basso: menu delle mosse (griglia 2x2), poi la cronaca del turno
export default function BattleBottom({ phase, moves, pp, cursor, history, turn, outcome, final, names, onPick, onCursor, onSkip, onExit, onRematch }) {
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [history.length]);

  if (phase === "loading" || phase === "idle") {
    return <div className="battle"><p className="battle__wait">Preparo le mosse…</p></div>;
  }

  if (phase === "choose") {
    const noPP = pp.every((v) => v <= 0);
    const sel = moves[cursor];
    return (
      <div className="battle">
        <h2 className="battle__title">Scegli una mossa <span>Turno {turn + 1}</span></h2>
        <div className="moves" role="group" aria-label="Mosse">
          {moves.map((m, i) => (
            <button
              key={m.id + i}
              className={`move ${i === cursor ? "is-on" : ""}`}
              style={{ "--c": TYPE_COLORS[m.type] }}
              disabled={pp[i] <= 0 && !noPP}
              onMouseEnter={() => onCursor(i)}
              onClick={() => onPick(i)}
            >
              <b>{noPP ? "Scontro" : m.name}</b>
              <small>{typeLabel(m.type)} · PP {pp[i]}/{m.pp}</small>
            </button>
          ))}
        </div>
        <p className="moveinfo">
          {noPP ? "Niente PP: userai Scontro e ti farai male." : sel && `${typeLabel(sel.type)} · ${CLS[sel.cls] ?? ""} · Potenza ${sel.power} · Precisione ${sel.accuracy}%`}
        </p>
        <div className="battle__actions">
          <button className="btn btn--ghost" onClick={onExit}>B Esci</button>
          <button className="btn btn--primary" onClick={() => onPick(cursor)}>A Attacca</button>
        </div>
      </div>
    );
  }

  if (phase === "over") {
    const hp = final?.hp[0] ?? 0, max = final?.max[0] ?? 1;
    const title = outcome === "win" ? "HAI VINTO!" : outcome === "lose" ? "HAI PERSO…" : "PAREGGIO";
    const sub = outcome === "win" ? `${names[0]} è il campione: ${names[1]} è stato sconfitto.`
      : outcome === "lose" ? `${names[0]} è esausto: ${names[1]} ti ha battuto.`
      : "Il tempo è scaduto e nessuno ha vinto.";
    return (
      <div className={`battle battle--end is-${outcome ?? "draw"}`}>
        <span className="end__icon">{outcome === "win" ? "🏆" : outcome === "lose" ? "💔" : "🤝"}</span>
        <h2 className="end__title">{title}</h2>
        <p className="end__sub">{sub}</p>
        <ul className="end__stats">
          <li><small>Turni</small><b>{turn}</b></li>
          <li><small>I tuoi PS</small><b>{hp}/{max}</b></li>
        </ul>
        <div className="battle__actions">
          <button className="btn btn--ghost" onClick={onExit}>B Esci</button>
          <button className="btn btn--primary" onClick={onRematch}>A Rivincita</button>
        </div>
      </div>
    );
  }

  return (
    <div className="battle">
      <h2 className="battle__title">{`Turno ${turn}`}</h2>
      <ol className="battle__log" ref={logRef}>
        {history.map((text, i) => <li key={i}>{text}</li>)}
      </ol>
      <div className="battle__actions">
        <button className="btn btn--ghost" onClick={onExit}>B Esci</button>
        <button className="btn btn--primary" onClick={onSkip}>A Avanti</button>
      </div>
    </div>
  );
}
