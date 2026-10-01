const SRC = `${import.meta.env.BASE_URL}abutton.mp3`; // file in public/abutton.mp3
const VOLUME = 0.6;

let base = null;

// Suono dei tasti. Si duplica l'audio a ogni pressione, così
// più tasti premuti in fretta non si interrompono a vicenda.
export function playButtonSound() {
  if (!base) {
    base = new Audio(SRC);
    base.preload = "auto";
  }
  const sound = base.cloneNode();
  sound.volume = VOLUME;
  sound.play().catch(() => {}); // file mancante o audio bloccato: nessun errore a schermo
}
