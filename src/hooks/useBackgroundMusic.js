import { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.BASE_URL;

// Una traccia per ogni "scena". I file stanno in public/ (vedi public/README.txt).
export const TRACKS = {
  menu:    { file: "sound.mp3",     loop: true,  volume: 0.35 },
  battle:  { file: "battaglia.mp3", loop: true,  volume: 0.45 },
  victory: { file: "vittoria.mp3",  loop: false, volume: 0.6 },
  defeat:  { file: "sconfitta.mp3", loop: false, volume: 0.6 },
};

// Musica per scena: "menu" | "battle" | "victory" | "defeat". `enabled` = deve suonare adesso.
//
// Usa UN SOLO elemento audio e ne cambia il file a ogni scena: così la musica precedente si ferma
// per forza, e il permesso di riprodurre ottenuto con il primo click/tasto (iPhone e Safari lo
// richiedono per ogni elemento audio) vale per tutte le scene.
// Battaglia, vittoria e sconfitta ripartono sempre dall'inizio, il menu riprende da dove era rimasto.
//
// Restituisce `missing`: i file che non si riescono a trovare in public/ (con Vite un file mancante
// risponde con la pagina HTML, quindi si controlla anche il tipo).
export function useBackgroundMusic(enabled, scene = "menu") {
  const audioRef = useRef(null);
  const loaded = useRef(null);    // scena attualmente caricata nell'elemento audio
  const menuTime = useRef(0);     // dove era arrivato il menu
  const [missing, setMissing] = useState([]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => { audio.pause(); audio.removeAttribute("src"); audioRef.current = null; loaded.current = null; };
  }, []);

  // Controllo una volta sola quali file ci sono davvero
  useEffect(() => {
    let dead = false;
    Promise.all(Object.values(TRACKS).map((t) =>
      fetch(BASE + t.file, { method: "HEAD" })
        .then((r) => (r.ok && !(r.headers.get("content-type") || "").includes("text/html") ? null : t.file))
        .catch(() => null)
    )).then((list) => {
      if (dead) return;
      const absent = list.filter(Boolean);
      if (absent.length) console.warn("Audio non trovato in public/:", absent.join(", "));
      setMissing(absent);
    });
    return () => { dead = true; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = TRACKS[scene];

    if (loaded.current !== scene) {            // cambio scena: ferma tutto e carica la nuova traccia
      if (loaded.current === "menu") menuTime.current = audio.currentTime;
      audio.pause();
      audio.loop = track.loop;
      audio.volume = track.volume;
      audio.src = BASE + track.file;
      if (scene === "menu" && menuTime.current) { try { audio.currentTime = menuTime.current; } catch { /* ignora */ } }
      loaded.current = scene;
    }
    if (!enabled) { audio.pause(); return; }

    // I browser bloccano l'audio finché la persona non interagisce: se la partenza viene
    // bloccata, riproviamo al primo click o tasto premuto.
    let cancelled = false;
    const start = () => audio.play().catch(() => {});
    audio.play().catch(() => {
      if (cancelled) return;
      window.addEventListener("pointerdown", start, { once: true });
      window.addEventListener("keydown", start, { once: true });
    });
    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [enabled, scene]);

  return { missing };
}
