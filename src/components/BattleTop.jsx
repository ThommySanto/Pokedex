import { useEffect, useRef, useState } from "react";
import { displayName } from "../battle/engine.js";
import { TYPE_COLORS } from "../data/types.js";

const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Sprite animato (stile Black/White) con ripiego sullo sprite statico. La larghezza si adatta
// alla dimensione originale, così i Pokémon piccoli restano piccoli e quelli grandi grandi.
function Sprite({ id, back, className, scale }) {
  const animated = `${SPRITES}/other/showdown/${back ? "back/" : ""}${id}.gif`;
  const still = `${SPRITES}/${back ? "back/" : ""}${id}.png`;
  const [src, setSrc] = useState(animated);
  const [width, setWidth] = useState(null);
  useEffect(() => { setSrc(animated); setWidth(null); }, [animated]);
  return (
    <img
      className={className}
      src={src}
      alt=""
      style={width ? { width: `${width}cqw` } : { visibility: "hidden" }}
      onLoad={(e) => setWidth(Math.min(40, e.target.naturalWidth * scale))}
      onError={() => src !== still && setSrc(still)}
    />
  );
}

// Il testo appare lettera per lettera
function Typewriter({ text }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced()) { setN(text.length); return; }
    let i = 0;
    setN(0);
    const t = setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(t); }, 22);
    return () => clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

// Numero che scende (o sale) piano verso il valore finale, dopo un ritardo
function useTween(value, delay = 0, ms = 900) {
  const [shown, setShown] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    if (reduced()) { cur.current = value; setShown(value); return; }
    const from = cur.current;
    const t0 = performance.now() + delay;
    let raf;
    const tick = (now) => {
      const k = Math.min(Math.max((now - t0) / ms, 0), 1);
      cur.current = Math.round(from + (value - from) * (1 - (1 - k) ** 3));
      setShown(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return shown;
}

function HpBox({ name, hp, max, className, delay, hidden }) {
  const shown = useTween(hp, delay);
  const pct = Math.round((shown / max) * 100);
  const tone = pct > 50 ? "ok" : pct > 20 ? "mid" : "low";
  return (
    <div className={`hpbox ${className} ${hidden ? "is-away" : ""} ${tone === "low" && shown > 0 ? "is-danger" : ""}`}>
      <span>{name}</span>
      <span className="hpbox__bar"><i className={`is-${tone}`} style={{ width: `${pct}%` }} /></span>
      <span className="hpbox__num">PS {shown}/{max}</span>
    </div>
  );
}

// Schermo alto: la scena. Il tuo Pokémon è di spalle in basso, l'avversario di fronte in alto.
export default function BattleTop({ event, a, b, prompt }) {
  if (!event || !a || !b) return <div className="scene scene--empty"><p className="scene__text">Preparo la battaglia…</p></div>;

  const at = event.attack;
  const from = at ? (at.by === 0 ? "a" : "b") : null;
  const to = at ? (at.by === 0 ? "b" : "a") : null;
  const color = at ? TYPE_COLORS[at.type] : "#fff";
  const big = at && (at.eff > 1 || at.crit);
  const down = (i) => event.hp[i] === 0 && event.hit !== i;
  const mon = (i) => {
    const side = i === 0 ? "a" : "b";
    const shown = i === 0 ? event.showA : event.showB;
    return `slot slot--${side} ${shown ? "" : "is-away"} ${down(i) ? "is-faint" : ""} ${from === side ? "is-attacking" : ""} ${event.hit === i ? "is-hit" : ""} p${event.id % 2}`;
  };
  const text = prompt ? `Cosa farà ${displayName(a.name)}?` : event.text;
  const outcome = event.done ? (event.winner === 0 ? "win" : event.winner === 1 ? "lose" : "draw") : null;

  return (
    <div className={`scene p${event.id % 2} ${big && !at.miss ? "is-shake" : ""}`} style={{ "--fx": color }}>
      <HpBox className="hpbox--b" name={displayName(b.name)} hp={event.hp[1]} max={event.max[1]} delay={event.hit === 1 ? 500 : 0} hidden={!event.showB} />
      <HpBox className="hpbox--a" name={displayName(a.name)} hp={event.hp[0]} max={event.max[0]} delay={event.hit === 0 ? 500 : 0} hidden={!event.showA} />
      {event.turn > 0 && <span className="turntag">Turno {event.turn}</span>}

      <div className="plat plat--b" /><div className="plat plat--a" />
      <div className={mon(1)}><Sprite id={b.id} className="mon" scale={0.3} /></div>
      <div className={mon(0)}><Sprite id={a.id} back className="mon" scale={0.38} /></div>

      {event.enter !== undefined && <i key={`p${event.id}`} className={`poof poof--${event.enter === 0 ? "a" : "b"}`} />}

      {at && !at.miss && !at.none && (
        <>
          {at.cls === "special" && <i key={`o${event.id}`} className={`orb orb--${from}${to}`} />}
          <i key={`i${event.id}`} className={`impact impact--${to} ${big ? "impact--big" : ""}`} />
          {at.crit && <i key={`f${event.id}`} className="flash" />}
        </>
      )}
      {at?.miss && <span key={`m${event.id}`} className={`miss miss--${to}`}>Mancato!</span>}
      {event.dmg && <span key={`d${event.id}`} className={`dmg dmg--${event.hit === 1 ? "b" : "a"} ${at?.crit ? "dmg--crit" : at?.eff > 1 ? "dmg--super" : at?.eff < 1 ? "dmg--weak" : ""}`}>−{event.dmg}</span>}

      <p className="scene__text"><Typewriter text={text} /></p>

      {outcome && (
        <div className={`result result--${outcome}`}>
          <i className="result__rays" />
          {outcome === "win" && Array.from({ length: 24 }, (_, i) => <i key={i} className="confetti" style={{ "--x": `${(i * 37) % 100}%`, "--d": `${(i % 6) * 0.25}s`, "--c": ["#e8483d", "#f5c518", "#4a90e2", "#5cb85c", "#f2559b"][i % 5] }} />)}
          {outcome === "lose" && Array.from({ length: 14 }, (_, i) => <i key={i} className="drop" style={{ "--x": `${(i * 43) % 100}%`, "--d": `${(i % 7) * 0.2}s` }} />)}
          <div className="result__card">
            <span className="result__icon">{outcome === "win" ? "🏆" : outcome === "lose" ? "💔" : "🤝"}</span>
            <strong>{outcome === "win" ? "HAI VINTO!" : outcome === "lose" ? "HAI PERSO…" : "PAREGGIO"}</strong>
            <img className="result__mon" src={a.image} alt="" />
            <span className="result__sub">
              {outcome === "win" ? `${displayName(a.name)} ha battuto ${displayName(b.name)}!`
                : outcome === "lose" ? `${displayName(b.name)} ha battuto ${displayName(a.name)}`
                : "Nessuno dei due ha ceduto"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
