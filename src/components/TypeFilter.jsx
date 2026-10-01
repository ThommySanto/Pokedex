import { TYPES } from "../data/types.js";

// Chip scorrevoli: tocca per filtrare, tocca di nuovo per togliere il filtro
export default function TypeFilter({ value, onChange }) {
  return (
    <div className="types" role="group" aria-label="Filtra per elemento">
      {TYPES.map((t) => (
        <button
          key={t.id}
          className={`type-chip chip--${t.id} ${value === t.id ? "is-on" : ""}`}
          aria-pressed={value === t.id}
          onClick={() => onChange(value === t.id ? null : t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
