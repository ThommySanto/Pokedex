import { typeLabel } from "../data/types.js";

export default function TopScreen({ pokemon, loading, error, shiny }) {
  if (error) return <p className="msg">Impossibile caricare il Pokémon. Controlla la connessione.</p>;
  if (!pokemon) return <p className="msg">Caricamento…</p>;

  const total = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
  const image = shiny && pokemon.shiny ? pokemon.shiny : pokemon.image;

  return (
    <div className={`dex type-${pokemon.types[0]} ${loading ? "is-loading" : ""}`}>
      <div className="dex__art">
        <img src={image} alt={pokemon.name} />
      </div>
      <div className="dex__info">
        <p className="dex__id">#{String(pokemon.id).padStart(3, "0")} {shiny && "★ shiny"}</p>
        <h1 className="dex__name">{pokemon.name}</h1>
        <div className="dex__types">
          {pokemon.types.map((t) => <span key={t} className={`chip chip--${t}`}>{typeLabel(t)}</span>)}
        </div>
        <p className="dex__body">Altezza {pokemon.height} m</p>
        <p className="dex__body">Peso {pokemon.weight} kg</p>
        <p className="dex__body">Statistiche totali {total}</p>
      </div>
    </div>
  );
}
