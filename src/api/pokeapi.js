const BASE = "https://pokeapi.co/api/v2";
const cache = new Map();

async function get(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

// Lista leggera: solo id e nome (prima generazione)
export async function fetchPokemonList(limit = 151) {
  const data = await get(`${BASE}/pokemon?limit=${limit}`);
  return data.results.map((p) => ({
    id: Number(p.url.split("/").filter(Boolean).pop()),
    name: p.name,
  }));
}

// Dettaglio normalizzato: il resto dell'app non conosce la forma dell'API
export async function fetchPokemon(id) {
  const d = await get(`${BASE}/pokemon/${id}`);
  return {
    id: d.id,
    name: d.name,
    height: d.height / 10,
    weight: d.weight / 10,
    types: d.types.map((t) => t.type.name),
    stats: d.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    abilities: d.abilities.map((a) => a.ability.name.replace("-", " ")),
    image: d.sprites.other["official-artwork"].front_default || d.sprites.front_default,
    shiny: d.sprites.other["official-artwork"].front_shiny,
  };
}

// Id dei Pokémon di un elemento (es. "fire")
export async function fetchPokemonIdsByType(type) {
  const d = await get(`${BASE}/type/${type}`);
  return new Set(d.pokemon.map((p) => Number(p.pokemon.url.split("/").filter(Boolean).pop())));
}

// ---------- Mosse ----------
const GEN1 = new Set(["red-blue", "yellow"]);
const LEARN = new Set(["level-up", "machine"]);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const normalizeMove = (d) => ({
  id: d.name,
  name: d.names.find((n) => n.language.name === "it")?.name ?? d.name.replace(/-/g, " "),
  type: d.type.name,
  power: d.power ?? 0,
  accuracy: d.accuracy ?? 100,
  pp: Math.min(d.pp ?? 10, 25),
  cls: d.damage_class.name, // physical | special | status
  priority: d.priority ?? 0,
});

// Un campione casuale delle mosse che il Pokémon impara in prima generazione (livello o MT).
// Il dettaglio del Pokémon è già in cache, quindi costa solo le chiamate alle mosse.
export async function fetchMovePool(id, sample = 18) {
  const d = await get(`${BASE}/pokemon/${id}`);
  const urls = d.moves
    .filter((m) => m.version_group_details.some((v) => GEN1.has(v.version_group.name) && LEARN.has(v.move_learn_method.name)))
    .map((m) => m.move.url);
  const moves = await Promise.all(shuffle(urls).slice(0, sample).map((u) => get(u).then(normalizeMove).catch(() => null)));
  return moves.filter(Boolean);
}
