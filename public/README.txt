Cartella "public": i file qui dentro vengono serviti così come sono, dalla radice del sito.

- sound.mp3     -> musica del Pokédex (in loop).            /sound.mp3
- battaglia.mp3 -> musica durante la battaglia (in loop).   /battaglia.mp3
- vittoria.mp3  -> jingle di vittoria (una volta).          /vittoria.mp3
- sconfitta.mp3 -> jingle di sconfitta (una volta).         /sconfitta.mp3
- abutton.mp3   -> suono di ogni pressione di tasto.        /abutton.mp3
- Altri file statici (immagini, suoni, icone) vanno messi qui e richiamati con /nomefile.ext

Se un file manca, il Pokédex funziona lo stesso (senza quel suono).
Se il tuo file ha un'altra estensione (es. .wav), cambia il nome in src/hooks/useBackgroundMusic.js
(musiche) o in src/audio/buttonSound.js (suono dei tasti).

Se la musica della battaglia non parte:
- i nomi devono essere esatti, tutto minuscolo: battaglia.mp3, vittoria.mp3, sconfitta.mp3
- su Windows controlla di non avere "battaglia.mp3.mp3" (estensioni nascoste in Esplora file)
- i file vanno in public/ (accanto a index.html), non in src/
- la legenda a sinistra della console elenca i file che non trova
