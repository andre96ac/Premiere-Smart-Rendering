 3. I calcoli dei tempi non gestiscono NTSC
Alta priorità

src/core/functions/utils.ts · righe 14–28

Attualmente calcoli il tempo dividendo il numero di frame per timebase:
return frameIn / timeBase;


Ma nel formato XML utilizzato da Premiere, timebase: 30 e ntsc: TRUE indicano una frequenza effettiva di circa 29,97 fps, non 30. Questo è confermato dalla documentazione del formato XMEML di Apple. 
developer.apple.com

Esempio: 108.000 frame a 29,97 fps
Calcolo attuale
3.600 s

Tempo corretto
3.603,6 s


3,6 secondi di differenza

Il problema cresce con l'avanzare della registrazione e può causare tagli in punti sbagliati.

Correzione: utilizzare anche rate.ntsc, con il fattore 1000/1001 quando è attivo, e verificare i risultati con file di prova a 23,976, 29,97 e 59,94 fps.