import { CONTROLS } from "../data/keymap.js";

// Legenda dei tasti, a sinistra della console
export default function Legend({ music, onToggleMusic }) {
  const musicLabel = music.on ? "Musica: accesa" : "Musica: spenta";

  return (
    <aside className="legend" aria-label="Legenda dei tasti">
      <h2>Comandi</h2>
      <ul>
        {CONTROLS.map((c) => (
          <li key={c.button}>
            <span className="legend__button">{c.button}</span>
            <span className="legend__keys">{c.label.map((k) => <kbd key={k}>{k}</kbd>)}</span>
            <span className="legend__text">{c.text}</span>
          </li>
        ))}
      </ul>
      <p className="legend__note">
        Nella barra di ricerca le lettere scrivono. Premi Esc per uscire e usare di nuovo i tasti.
      </p>
      <button className="legend__music" onClick={onToggleMusic} aria-pressed={music.on}>
        {musicLabel}
      </button>
      {music.missing.length > 0 && (
        <p className="legend__warn">Audio non trovato in public/: {music.missing.join(", ")}</p>
      )}
    </aside>
  );
}
