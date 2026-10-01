export const TYPES = [
  { id: "normal", label: "Normale" }, { id: "fire", label: "Fuoco" }, { id: "water", label: "Acqua" },
  { id: "electric", label: "Elettro" }, { id: "grass", label: "Erba" }, { id: "ice", label: "Ghiaccio" },
  { id: "fighting", label: "Lotta" }, { id: "poison", label: "Veleno" }, { id: "ground", label: "Terra" },
  { id: "flying", label: "Volante" }, { id: "psychic", label: "Psico" }, { id: "bug", label: "Coleottero" },
  { id: "rock", label: "Roccia" }, { id: "ghost", label: "Spettro" }, { id: "dragon", label: "Drago" },
  { id: "dark", label: "Buio" }, { id: "steel", label: "Acciaio" }, { id: "fairy", label: "Folletto" },
];

export const typeLabel = (id) => TYPES.find((t) => t.id === id)?.label ?? id;

// Colori dei tipi: usati dai pulsanti delle mosse e dagli effetti della battaglia
export const TYPE_COLORS = {
  normal: "#9a9a8a", fire: "#f0802f", water: "#4a90e2", electric: "#f5c518", grass: "#5cb85c", ice: "#6ccfe0",
  fighting: "#c0392b", poison: "#a040a0", ground: "#c9a54a", flying: "#8f9fe8", psychic: "#f2559b", bug: "#9bb520",
  rock: "#a89038", ghost: "#6a5a9a", dragon: "#6a3be8", dark: "#6a5648", steel: "#9aa6b8", fairy: "#f08ab8",
};
