







Caso	Comportamento del parser attuale	Priorità
XML contenente direttamente una sequenza	Rifiuta l'XML	Alta
Sequenze all'interno di cartelle (bin)	Non le trova	Alta
File identificati tramite ID	Può associare il percorso sbagliato	Alta
Sequenze nidificate e clip unite	Non segue i riferimenti interni	Alta
Clip con modifiche alla velocità	Può calcolare un intervallo non corretto	Alta
Clip e tracce disabilitate	Le elabora comunque	Media
Frame rate misti o NTSC	Tempi potenzialmente errati	Media
Campi omessi o ereditati	Può rifiutare clip valide	Media
Immagini, generatori e solo audio	Ignorati o elaborati impropriamente	Da definire





https://chatgpt.com/share/6af36eac-82a8-83ed-a3b7-c8aafeb5d93d




flowchart TD
    A["XML Premiere"] --> B["Normalizzazione della struttura"]
    B --> C["Registro dei file e degli ID"]
    C --> D["Ricerca ricorsiva delle sequenze"]
    D --> E["Analisi delle clip"]
    E --> F{"Clip supportata?"}
    F -->|Sì| G["Calcolo intervallo sorgente"]
    F -->|No| H["Avviso con motivazione"]
    G --> I["Elenco delle estrazioni"]