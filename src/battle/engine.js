import { typeLabel } from "../data/types.js";

// ---------- Tabella efficacia dei tipi ----------
const CHART = {
  normal:   { half: ["rock", "steel"], none: ["ghost"] },
  fire:     { double: ["grass", "ice", "bug", "steel"], half: ["fire", "water", "rock", "dragon"] },
  water:    { double: ["fire", "ground", "rock"], half: ["water", "grass", "dragon"] },
  electric: { double: ["water", "flying"], half: ["electric", "grass", "dragon"], none: ["ground"] },
  grass:    { double: ["water", "ground", "rock"], half: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"] },
  ice:      { double: ["grass", "ground", "flying", "dragon"], half: ["fire", "water", "ice", "steel"] },
  fighting: { double: ["normal", "ice", "rock", "dark", "steel"], half: ["poison", "flying", "psychic", "bug", "fairy"], none: ["ghost"] },
  poison:   { double: ["grass", "fairy"], half: ["poison", "ground", "rock", "ghost"], none: ["steel"] },
  ground:   { double: ["fire", "electric", "poison", "rock", "steel"], half: ["grass", "bug"], none: ["flying"] },
  flying:   { double: ["grass", "fighting", "bug"], half: ["electric", "rock", "steel"] },
  psychic:  { double: ["fighting", "poison"], half: ["psychic", "steel"], none: ["dark"] },
  bug:      { double: ["grass", "psychic", "dark"], half: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"] },
  rock:     { double: ["fire", "ice", "flying", "bug"], half: ["fighting", "ground", "steel"] },
  ghost:    { double: ["psychic", "ghost"], half: ["dark"], none: ["normal"] },
  dragon:   { double: ["dragon"], half: ["steel"], none: ["fairy"] },
  dark:     { double: ["psychic", "ghost"], half: ["fighting", "dark", "fairy"] },
  steel:    { double: ["ice", "rock", "fairy"], half: ["fire", "water", "electric", "steel"] },
  fairy:    { double: ["fighting", "dragon", "dark"], half: ["fire", "poison", "steel"] },
};

export function effectiveness(moveType, defenderTypes) {
  const c = CHART[moveType];
  if (!c) return 1;
  return defenderTypes.reduce((m, t) => (c.none?.includes(t) ? 0 : c.double?.includes(t) ? m * 2 : c.half?.includes(t) ? m * 0.5 : m), 1);
}

// ---------- Regole (semplificate, livello fisso) ----------
const LEVEL = 50;
const MAX_TURNS = 60;
const DAMAGE_SCALE = 0.5; // senza, un colpo superefficace con bonus tipo fa quasi sempre KO: così le battaglie durano di più
const SPECIAL = new Set(["fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"]); // solo per le mosse di riserva

// Mosse che richiedono regole speciali (due turni, ricarica, KO volontario…): le saltiamo
const EXCLUDED = new Set(["self-destruct", "explosion", "hyper-beam", "solar-beam", "skull-bash", "sky-attack", "razor-wind", "dig", "fly", "dream-eater", "struggle", "bide"]);

const STRUGGLE = { name: "Scontro", type: "normal", power: 50, accuracy: 100, pp: 1, cls: "physical", priority: 0, recoil: 0.25 };

export const displayName = (name) => name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const stat = (p, n) => p.stats.find((s) => s.name === n).value;

// Mosse di riserva generate dai tipi (se l'API non risponde o il Pokémon ne ha poche)
export function fallbackMoves(p) {
  const [t1, t2] = p.types;
  const cls = (t) => (SPECIAL.has(t) ? "special" : "physical");
  return [
    { id: "azione", name: "Azione", type: "normal", power: 40, accuracy: 100, pp: 25, cls: "physical", priority: 0 },
    { id: `colpo-${t1}`, name: `Colpo ${typeLabel(t1)}`, type: t1, power: 60, accuracy: 100, pp: 15, cls: cls(t1), priority: 0 },
    t2 ? { id: `colpo-${t2}`, name: `Colpo ${typeLabel(t2)}`, type: t2, power: 60, accuracy: 100, pp: 15, cls: cls(t2), priority: 0 }
       : { id: `super-${t1}`, name: `Super ${typeLabel(t1)}`, type: t1, power: 90, accuracy: 85, pp: 10, cls: cls(t1), priority: 0 },
    { id: "gran-colpo", name: "Gran Colpo", type: "normal", power: 85, accuracy: 85, pp: 10, cls: "physical", priority: 0 },
  ];
}

// Sceglie 4 mosse offensive dal campione dell'API: prima le migliori di tipi diversi, poi le altre
export function buildMoveset(p, pool) {
  const usable = (pool ?? []).filter((m) => m.power > 0 && m.cls !== "status" && !EXCLUDED.has(m.id));
  const score = (m) => m.power * (p.types.includes(m.type) ? 1.5 : 1) * (m.accuracy / 100);
  const sorted = [...usable].sort((a, b) => score(b) - score(a));
  const picked = [];
  for (const m of sorted) if (picked.length < 4 && !picked.some((x) => x.type === m.type)) picked.push(m);
  for (const m of sorted) if (picked.length < 4 && !picked.includes(m)) picked.push(m);
  for (const m of fallbackMoves(p)) if (picked.length < 4 && !picked.some((x) => x.name === m.name)) picked.push(m);
  return picked;
}

function makeFighter(p, moves) {
  return {
    name: displayName(p.name),
    types: p.types,
    maxHp: stat(p, "hp") + LEVEL + 10,
    atk: stat(p, "attack") + 5, def: stat(p, "defense") + 5,
    spa: stat(p, "special-attack") + 5, spd: stat(p, "special-defense") + 5,
    spe: stat(p, "speed") + 5,
    moves,
  };
}

function calcDamage(att, def, move, eff, crit, rng) {
  const special = move.cls ? move.cls === "special" : SPECIAL.has(move.type);
  const A = special ? att.spa : att.atk;
  const D = special ? def.spd : def.def;
  const base = Math.floor(((2 * LEVEL) / 5 + 2) * move.power * (A / D) / 50) + 2;
  const stab = att.types.includes(move.type) ? 1.5 : 1;
  const roll = 0.85 + rng() * 0.15;
  return Math.max(1, Math.floor(base * stab * eff * (crit ? 1.5 : 1) * roll * DAMAGE_SCALE));
}

// ---------- Stato della battaglia ----------
// Lo stato è mutabile e vive nell'hook; ogni funzione restituisce gli eventi da riprodurre:
// { id, text, turn, hp, max, pp, showA, showB, attack?, hit?, dmg?, faint?, enter?, winner?, done? }
export function createBattle(pa, pb, movesA, movesB) {
  const f = [makeFighter(pa, movesA), makeFighter(pb, movesB)];
  const max = [f[0].maxHp, f[1].maxHp];
  return { f, max, hp: [...max], pp: f.map((x) => x.moves.map((m) => m.pp)), turn: 0, nextId: 0 };
}

const emitter = (b, events) => (text, extra = {}) =>
  events.push({ id: b.nextId++, text, turn: b.turn, hp: [...b.hp], max: b.max, pp: b.pp.map((r) => [...r]), showA: true, showB: true, ...extra });

export function introEvents(b) {
  const events = [];
  const push = emitter(b, events);
  push(`Lo sfidante manda in campo ${b.f[1].name}!`, { showA: false, enter: 1 });
  push(`Vai, ${b.f[0].name}!`, { enter: 0 });
  return events;
}

function aiPick(b, i, rng) {
  const att = b.f[i], def = b.f[1 - i];
  const avail = att.moves.map((move, slot) => ({ move, slot })).filter((x) => b.pp[i][x.slot] > 0);
  if (!avail.length) return { move: STRUGGLE, slot: null };
  if (rng() < 0.25) return avail[Math.floor(rng() * avail.length)]; // ogni tanto una a caso
  const score = ({ move: m }) => m.power * effectiveness(m.type, def.types) * (att.types.includes(m.type) ? 1.5 : 1) * (m.accuracy / 100);
  return avail.reduce((best, x) => (score(x) > score(best) ? x : best));
}

function playerPick(b, idx) {
  if (b.pp[0].every((v) => v <= 0)) return { move: STRUGGLE, slot: null };
  return { move: b.f[0].moves[idx], slot: idx };
}

// Un turno completo: il giocatore (indice 0) sceglie la mossa, l'avversario decide da solo.
export function resolveTurn(b, idx, rng = Math.random) {
  const events = [];
  const push = emitter(b, events);
  b.turn++;

  const picks = [playerPick(b, idx), aiPick(b, 1, rng)];
  const prio = (i) => picks[i].move.priority ?? 0;
  const [f0, f1] = b.f;
  const secondFirst = prio(1) > prio(0) || (prio(1) === prio(0) && (f1.spe > f0.spe || (f1.spe === f0.spe && rng() < 0.5)));
  const order = secondFirst ? [1, 0] : [0, 1];

  for (const i of order) {
    if (b.hp[0] <= 0 || b.hp[1] <= 0) break;
    const j = 1 - i;
    const { move, slot } = picks[i];
    const A = b.f[i], D = b.f[j];
    if (slot !== null) b.pp[i][slot]--;
    const fx = { by: i, type: move.type, cls: move.cls };
    const eff = effectiveness(move.type, D.types);

    if (rng() * 100 >= move.accuracy) {
      push(`${A.name} usa ${move.name}!`, { attack: { ...fx, miss: true } });
      push("Ma l'attacco è fallito!");
      continue;
    }
    if (eff === 0) {
      push(`${A.name} usa ${move.name}!`, { attack: { ...fx, none: true } });
      push(`Non ha effetto su ${D.name}…`);
      continue;
    }

    const crit = rng() < 1 / 16;
    const dmg = calcDamage(A, D, move, eff, crit, rng);
    b.hp[j] = Math.max(0, b.hp[j] - dmg);
    push(`${A.name} usa ${move.name}!`, { attack: { ...fx, eff, crit }, hit: j, dmg });

    const note = [crit && "Brutto colpo!", eff > 1 && "È superefficace!", eff < 1 && "Non è molto efficace…"].filter(Boolean).join(" ");
    if (note) push(note);

    if (move.recoil && b.hp[i] > 0) {
      const back = Math.max(1, Math.floor(b.max[i] * move.recoil));
      b.hp[i] = Math.max(0, b.hp[i] - back);
      push(`${A.name} è ferito dal contraccolpo!`, { hit: i, dmg: back });
    }
    for (const k of [j, i]) if (b.hp[k] === 0) push(`${b.f[k].name} è esausto!`, { faint: k });
    if (b.hp[0] === 0 || b.hp[1] === 0) break;
  }

  const over = b.hp[0] === 0 || b.hp[1] === 0 || b.turn >= MAX_TURNS;
  if (over) {
    const winner = b.hp[0] > 0 && b.hp[1] > 0 ? null : b.hp[0] > 0 ? 0 : b.hp[1] > 0 ? 1 : null;
    const text = winner === 0 ? `Hai vinto! ${b.f[0].name} è il campione!`
      : winner === 1 ? `${b.f[0].name} non può più combattere… Hai perso!`
      : "Nessuno riesce a vincere: pareggio!";
    push(text, { winner, done: true });
  }
  return events;
}
