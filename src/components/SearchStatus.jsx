import { typeLabel } from "../data/types.js";

const results = (n) => (n === 0 ? "nessun risultato" : n === 1 ? "1 risultato" : `${n} risultati`);

// Riga di stato in fondo agli schermi: com'è impostata la ricerca adesso
export default function SearchStatus({ search, count, position }) {
  const byType = search.by === "type";
  const q = search.query.trim();
  const filter = byType
    ? (search.type ? typeLabel(search.type) : "Tutti gli elementi")
    : (q ? `“${q}”` : "Tutti i Pokémon");
  const result = position > 0 ? `${position} di ${count}` : results(count);

  return (
    <footer className="status">
      <strong>{byType ? "Ricerca per elemento" : "Ricerca per nome"}</strong>
      <span>{filter}: {result}</span>
    </footer>
  );
}
