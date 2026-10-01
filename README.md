# Pokédex 3DS
React + Vite + PokeAPI. Skin "pokeball" (variabili CSS in console.css).

    npm install
    npm run dev

## Tastiera
La legenda è a sinistra della console (visibile oltre i 1000 px di larghezza).
I tasti sono definiti in `src/data/keymap.js`, che alimenta sia i comandi sia la legenda.

## Musica
Metti i file in `public/`; se uno manca, quella scena resta in silenzio e il resto funziona.

| File | Quando suona |
|---|---|
| `sound.mp3` | Pokédex e menu, in loop |
| `battaglia.mp3` | Durante la battaglia, in loop (riparte a ogni battaglia/rivincita) |
| `vittoria.mp3` | Quando vinci (una volta) |
| `sconfitta.mp3` | Quando perdi (una volta) |

Parte al primo click o tasto premuto (i browser bloccano l'audio prima di un'interazione). M accende/spegne la musica;
con la console spenta (P) è in pausa. I volumi si regolano in `src/hooks/useBackgroundMusic.js` (`TRACKS`).
Gli effetti dei colpi sono sintetizzati (`src/audio/sfx.js`): non serve nessun file.

## Ricerca
Per nome (default) o per elemento: il pulsante "Elementi" apre una pagina di conferma (A conferma, B annulla);
"Nome" (o X) riporta alla ricerca per nome. In fondo agli schermi c'è lo stato della ricerca attiva.

## Suono dei tasti
Metti `abutton.mp3` in `public/`: suona a ogni pressione di un tasto della console (click) o della tastiera.
Volume e nome del file si cambiano in `src/audio/buttonSound.js`.
Lo slider rosso a destra dello schermo alto scende quando la musica è spenta e risale quando è accesa.

## Battaglia
1. Apri un Pokémon (A) e premi **A Battaglia** nel dettaglio: è il tuo combattente.
2. Scegli l'avversario allo stesso modo (**A Avversario**): la battaglia parte.
   "Annulla" nel banner (o Home) cancella la scelta.
3. A ogni turno scegli una delle 4 mosse: croce direzionale + A, oppure i tasti **1-4**, oppure tocca la mossa.
   Durante i messaggi A salta avanti. B = esci. A fine battaglia A = rivincita.

Le mosse sono quelle vere di PokeAPI (nomi in italiano, tipo, potenza, precisione, PP, priorità): un campione
casuale di quelle che il Pokémon impara in prima generazione, scegliendo le 4 offensive migliori e di tipi diversi.
Cambiano a ogni rivincita. Se l'API non risponde, si usano mosse generate dai tipi.

Regole semplificate in `src/battle/engine.js`: livello 50, efficacia dei tipi, STAB, colpi critici, mancati,
PP (a 0 PP su tutte le mosse c'è Scontro, con contraccolpo), ordine di turno per priorità e velocità.
L'avversario sceglie quasi sempre la mossa migliore, ogni tanto una a caso.
Non ci sono ancora mosse di stato (veleno, sonno, aumenti di statistiche).
# Pokedex
