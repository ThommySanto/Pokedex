// Effetti sonori sintetizzati con Web Audio: nessun file da aggiungere.
let ctx = null;
const audio = () => {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

function tone({ f = 440, to, dur = 0.15, type = "square", vol = 0.12, delay = 0 }) {
  const c = audio(), t = c.currentTime + delay;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ dur = 0.15, vol = 0.2, delay = 0, freq = 1500 }) {
  const c = audio(), t = c.currentTime + delay;
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), filter = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buf;
  filter.type = "lowpass";
  filter.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
}

const HIT = 0.4; // secondi dall'inizio dell'evento: coincide con l'impatto nell'animazione

export function playEventSfx(ev) {
  try {
    if (ev.enter !== undefined) return tone({ f: 250, to: 900, dur: 0.3, type: "triangle", vol: 0.15 });
    if (ev.faint !== undefined) return tone({ f: 520, to: 50, dur: 0.9, type: "sawtooth", vol: 0.12 });
    const at = ev.attack;
    if (!at) return;
    noise({ dur: 0.18, vol: 0.07, freq: 3000 }); // il "whoosh" dell'attacco
    if (at.miss || at.none) return;
    if (at.eff > 1) {
      noise({ dur: 0.35, vol: 0.3, delay: HIT, freq: 2200 });
      tone({ f: 220, to: 40, dur: 0.35, vol: 0.2, delay: HIT });
      tone({ f: 1100, to: 1700, dur: 0.12, type: "triangle", vol: 0.1, delay: HIT + 0.05 });
    } else if (at.eff < 1) {
      noise({ dur: 0.12, vol: 0.1, delay: HIT, freq: 700 });
      tone({ f: 120, to: 60, dur: 0.15, vol: 0.1, delay: HIT });
    } else {
      noise({ dur: 0.22, vol: 0.2, delay: HIT, freq: 1500 });
      tone({ f: 180, to: 50, dur: 0.22, vol: 0.15, delay: HIT });
    }
    if (at.crit) tone({ f: 1500, to: 400, dur: 0.25, type: "sawtooth", vol: 0.08, delay: HIT });
  } catch {
    /* audio non disponibile: nessun errore a schermo */
  }
}
