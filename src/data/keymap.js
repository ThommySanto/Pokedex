// Unica fonte di verità: serve sia alla gestione della tastiera sia alla legenda.
// map: tasto del PC (KeyboardEvent.key, lettere in minuscolo) -> azione della console
export const CONTROLS = [
  { button: "Croce", label: ["↑", "↓", "←", "→"], text: "Scorri i Pokémon o le mosse", map: { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" } },
  { button: "A", label: ["Invio"], text: "Apri, conferma, scegli per la battaglia o attacca", map: { Enter: "a" } },
  { button: "B", label: ["Esc"], text: "Indietro, azzera la ricerca o esci", map: { Escape: "b" } },
  { button: "Mosse", label: ["1", "2", "3", "4"], text: "Scegli subito una mossa in battaglia", map: { 1: "m1", 2: "m2", 3: "m3", 4: "m4" } },
  { button: "X", label: ["X"], text: "Ricerca per nome", map: { x: "x" } },
  { button: "Y", label: ["Y"], text: "Versione shiny", map: { y: "y" } },
  { button: "L / R", label: ["Q", "E"], text: "Salta di 10 Pokémon", map: { q: "l", e: "r" } },
  { button: "Start", label: ["S"], text: "Pokémon casuale", map: { s: "start" } },
  { button: "Select", label: ["⌫"], text: "Azzera la ricerca", map: { Backspace: "select" } },
  { button: "Home", label: ["H"], text: "Torna all'inizio e annulla la scelta", map: { h: "home" } },
  { button: "Power", label: ["P"], text: "Accendi o spegni gli schermi", map: { p: "power" } },
  { button: "Musica", label: ["M"], text: "Musica accesa o spenta", map: { m: "music" } },
];

export const KEY_TO_ACTION = Object.assign({}, ...CONTROLS.map((c) => c.map));

// Mentre si scrive nella barra di ricerca restano attivi solo questi tasti
export const TYPING_KEYS = new Set(["ArrowUp", "ArrowDown", "Enter", "Escape"]);

// Azioni che si ripetono tenendo premuto il tasto
export const REPEATABLE = new Set(["up", "down", "left", "right", "l", "r"]);
