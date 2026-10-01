import { useEffect, useMemo, useState } from "react";
import Console3DS from "./components/Console3DS.jsx";
import TopScreen from "./components/TopScreen.jsx";
import BottomScreen from "./components/BottomScreen.jsx";
import Legend from "./components/Legend.jsx";
import BattleTop from "./components/BattleTop.jsx";
import BattleBottom from "./components/BattleBottom.jsx";
import { useBattle } from "./hooks/useBattle.js";
import { displayName } from "./battle/engine.js";
import { KEY_TO_ACTION, REPEATABLE, TYPING_KEYS } from "./data/keymap.js";
import { playButtonSound } from "./audio/buttonSound.js";
import { playEventSfx } from "./audio/sfx.js";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic.js";
import { usePokemon, usePokemonList, useTypeIds } from "./hooks/usePokemon.js";

export default function App() {
  const { list, error: listError } = usePokemonList();
  const [selectedId, setSelectedId] = useState(1);
  const [mode, setMode] = useState("list");       // "list" | "detail" | "confirm"
  const [searchBy, setSearchBy] = useState("name"); // "name" | "type"
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [shiny, setShiny] = useState(false);
  const [on, setOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const { data, loading, error } = usePokemon(selectedId);
  const [first, setFirst] = useState(null);   // primo combattente confermato
  const [second, setSecond] = useState(null); // secondo combattente (avvia la battaglia)
  const battle = useBattle(mode === "battle" ? first : null, mode === "battle" ? second : null);
  // Musica per scena: menu, battaglia, poi vittoria o sconfitta. Console spenta = silenzio
  const scene = mode !== "battle" ? "menu" : battle.outcome === "win" ? "victory" : battle.outcome === "lose" ? "defeat" : battle.outcome === "draw" ? "menu" : "battle";
  const { missing: musicMissing } = useBackgroundMusic(musicOn && on, scene);
  // Effetti sonori sintetizzati: uno per ogni evento della battaglia
  const eventId = battle.current?.id;
  useEffect(() => {
    if (mode === "battle" && on && battle.current) playEventSfx(battle.current);
  }, [eventId, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const { ids: typeIds, loading: typeLoading } = useTypeIds(searchBy === "type" ? typeFilter : null);

  // Risultati in base alla ricerca attiva
  const filtered = useMemo(() => {
    if (searchBy === "type") {
      if (!typeFilter) return list;
      return typeIds ? list.filter((p) => typeIds.has(p.id)) : [];
    }
    const q = query.trim().toLowerCase();
    return q ? list.filter((p) => p.name.includes(q) || String(p.id) === q) : list;
  }, [list, searchBy, typeFilter, typeIds, query]);

  // Se il Pokémon selezionato esce dai risultati, seleziona il primo
  useEffect(() => {
    if (filtered.length && !filtered.some((p) => p.id === selectedId)) setSelectedId(filtered[0].id);
  }, [filtered]);

  const move = (delta) => {
    if (mode === "confirm" || mode === "battle" || !filtered.length) return;
    const i = filtered.findIndex((p) => p.id === selectedId);
    setSelectedId(filtered[Math.min(Math.max(i + delta, 0), filtered.length - 1)].id);
  };

  const toName = () => { setSearchBy("name"); setTypeFilter(null); setMode("list"); };
  const confirmType = () => { setSearchBy("type"); setQuery(""); setMode("list"); };
  const clearSearch = () => (searchBy === "type" ? setTypeFilter(null) : setQuery(""));

  // Dal dettaglio: il primo Pokémon confermato attende l'avversario, il secondo avvia la battaglia
  const chooseFighter = () => {
    if (!data || data.id !== selectedId) return; // dati non ancora pronti
    if (!first) { setFirst(data); setMode("list"); }
    else { setSecond(data); setMode("battle"); }
  };
  const resetFighters = () => { setFirst(null); setSecond(null); };
  const exitBattle = () => { resetFighters(); setMode("list"); };

  // Un'azione per ogni tasto della console
  const actions = {
    up: () => (mode === "battle" ? battle.nav("up") : move(-1)),
    down: () => (mode === "battle" ? battle.nav("down") : move(1)),
    left: () => (mode === "battle" ? battle.nav("left") : move(-1)),
    right: () => (mode === "battle" ? battle.nav("right") : move(1)),
    m1: () => mode === "battle" && battle.pick(0),
    m2: () => mode === "battle" && battle.pick(1),
    m3: () => mode === "battle" && battle.pick(2),
    m4: () => mode === "battle" && battle.pick(3),
    a: () => {                                   // seleziona / conferma
      document.activeElement?.blur?.();
      if (mode === "confirm") return confirmType();
      if (mode === "battle") return battle.confirm();
      if (mode === "detail") return chooseFighter();
      if (filtered.length) setMode("detail");
    },
    b: () => (mode === "battle" ? exitBattle() : mode === "list" ? clearSearch() : setMode("list")), // indietro
    x: () => { if (mode === "battle") return; toName(); setTimeout(() => document.querySelector(".touch__search")?.focus(), 0); },
    y: () => setShiny((s) => !s),
    l: () => mode !== "battle" && move(-10),
    r: () => mode !== "battle" && move(10),
    start: () => mode !== "battle" && list.length && setSelectedId(list[Math.floor(Math.random() * list.length)].id),
    select: () => mode !== "battle" && clearSearch(),
    home: () => { resetFighters(); toName(); setQuery(""); setSelectedId(1); },
    power: () => setOn((o) => !o),
    music: () => setMusicOn((m) => !m),
  };

  // Click sui tasti della console: stessa azione, più il suono
  const clickActions = Object.fromEntries(
    Object.entries(actions).map(([name, fn]) => [name, () => { playButtonSound(); fn(); }])
  );

  // Tastiera: ogni tasto della console ha un tasto del PC (vedi data/keymap.js)
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return; // non rubo le scorciatoie del browser
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const act = KEY_TO_ACTION[key];
      if (!act) return;
      if (e.target.tagName === "INPUT") {
        if (!TYPING_KEYS.has(key)) return; // nella barra di ricerca si scrive
        if (key === "Escape") { e.preventDefault(); e.target.blur(); return; } // Esc esce dalla barra
      }
      if (e.repeat && !REPEATABLE.has(act)) return;
      e.preventDefault();
      if (!e.repeat) playButtonSound(); // niente raffica di suoni tenendo premuto
      actions[act]();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <main className="stage">
      <Legend music={{ on: musicOn, missing: musicMissing }} onToggleMusic={clickActions.music} />
      <Console3DS
        on={on}
        actions={clickActions}
        music={musicOn}
        top={
          mode === "battle"
            ? <BattleTop event={battle.current} a={first} b={second} prompt={battle.phase === "choose"} />
            : <TopScreen pokemon={data} loading={loading} error={error} shiny={shiny} />
        }
        bottom={
          mode === "battle" ? (
            <BattleBottom
              phase={battle.phase}
              moves={battle.moves}
              pp={battle.pp}
              cursor={battle.cursor}
              history={battle.history}
              turn={battle.turn}
              outcome={battle.outcome}
              final={battle.current}
              names={[first && displayName(first.name), second && displayName(second.name)]}
              onPick={battle.pick}
              onCursor={battle.setCursor}
              onSkip={battle.advance}
              onExit={exitBattle}
              onRematch={battle.rematch}
            />
          ) : (
            <BottomScreen
              mode={mode}
              pokemon={data}
              list={filtered}
              selectedId={selectedId}
              error={listError}
              first={first}
              search={{ by: searchBy, query, type: typeFilter, loading: typeLoading }}
              on={{
                select: setSelectedId,
                open: () => setMode("detail"),
                back: () => setMode("list"),
                query: setQuery,
                type: setTypeFilter,
                askType: () => setMode("confirm"),
                confirm: confirmType,
                cancel: () => setMode("list"),
                toName,
                fight: chooseFighter,
                cancelFighter: () => setFirst(null),
              }}
            />
          )
        }
      />
    </main>
  );
}
