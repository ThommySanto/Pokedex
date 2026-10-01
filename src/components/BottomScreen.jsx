import { useEffect, useRef } from "react";
import SearchStatus from "./SearchStatus.jsx";
import TypeFilter from "./TypeFilter.jsx";
import ConfirmTypeSearch from "./ConfirmTypeSearch.jsx";
import { displayName } from "../battle/engine.js";

const MAX_STAT = 160;

function Detail({ pokemon, onBack, onFight, fightLabel, status }) {
  if (!pokemon) return <p className="msg">Caricamento…</p>;
  return (
    <div className="detail">
      <header className="detail__bar">
        <button className="detail__back" onClick={onBack}>B Indietro</button>
        <button className="detail__fight" onClick={onFight} aria-label="Scegli per la battaglia">{fightLabel}</button>
      </header>
      <p className="detail__abilities">Abilità: {pokemon.abilities.join(", ")}</p>
      <ul className="stats">
        {pokemon.stats.map((s) => (
          <li key={s.name}>
            <span className="stats__label">{s.name.replace("special-", "sp. ")}</span>
            <span className="stats__bar"><i style={{ width: `${Math.min(s.value / MAX_STAT, 1) * 100}%` }} /></span>
            <span className="stats__val">{s.value}</span>
          </li>
        ))}
      </ul>
      {status}
    </div>
  );
}

// Barra in cima alla lista: cambia in base al tipo di ricerca attiva
function SearchBar({ search, on }) {
  if (search.by === "type") {
    return (
      <>
        <div className="touch__bar">
          <p className="touch__field">Cerca per elemento</p>
          <button className="touch__switch" onClick={on.toName} aria-label="Torna alla ricerca per nome">Nome</button>
        </div>
        <TypeFilter value={search.type} onChange={on.type} />
      </>
    );
  }
  return (
    <div className="touch__bar">
      <input
        className="touch__search"
        type="search"
        placeholder="Nome o numero"
        value={search.query}
        onChange={(e) => on.query(e.target.value)}
        aria-label="Cerca Pokémon per nome"
      />
      <button className="touch__switch" onClick={on.askType} aria-label="Cerca per elemento">Elementi</button>
    </div>
  );
}

export default function BottomScreen({ mode, pokemon, list, selectedId, search, on, error, first }) {
  const activeRef = useRef(null);

  // Tiene visibile l'elemento selezionato (D-pad) e al ritorno dal dettaglio
  useEffect(() => {
    if (mode === "list") activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId, mode]);

  if (mode === "confirm") return <ConfirmTypeSearch onConfirm={on.confirm} onCancel={on.cancel} />;

  if (mode === "detail") {
    const position = list.findIndex((p) => p.id === selectedId) + 1;
    return (
      <Detail
        pokemon={pokemon}
        onBack={on.back}
        onFight={on.fight}
        fightLabel={first ? "A Avversario" : "A Battaglia"}
        status={<SearchStatus search={search} count={list.length} position={position} />}
      />
    );
  }

  return (
    <div className="touch">
      <SearchBar search={search} on={on} />
      {first && (
        <div className="pick">
          <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${first.id}.png`} alt="" />
          <span>{displayName(first.name)} è pronto: scegli l'avversario</span>
          <button onClick={on.cancelFighter}>Annulla</button>
        </div>
      )}
      {error && <p className="msg">Lista non disponibile.</p>}
      <ul className="touch__list">
        {list.map((p) => (
          <li key={p.id}>
            <button
              ref={p.id === selectedId ? activeRef : null}
              className={`touch__item ${p.id === selectedId ? "is-active" : ""}`}
              onClick={() => (p.id === selectedId ? on.open() : on.select(p.id))}
            >
              <img
                loading="lazy"
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                alt=""
              />
              <span className="touch__id">#{String(p.id).padStart(3, "0")}</span>
              <span>{p.name}</span>
            </button>
          </li>
        ))}
        {!error && list.length === 0 && (
          <li className="msg">{search.loading ? "Caricamento…" : "Nessun risultato."}</li>
        )}
      </ul>
      <SearchStatus search={search} count={list.length} />
    </div>
  );
}
