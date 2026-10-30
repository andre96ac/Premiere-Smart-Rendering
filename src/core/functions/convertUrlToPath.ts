import { fileURLToPath } from 'url';

/**
 * Converte un URL file:// (anche con localhost) in un percorso Windows standard.
 * @param fileUrl L'URL del file da convertire
 * @returns Il percorso Windows 
 */
export function convertUrlToPath(fileUrl: string): string {
  // 1. Rimuoviamo "localhost" se presente, altrimenti fileURLToPath lo interpreterebbe come un percorso di rete UNC 
  let cleanUrl = fileUrl.replace(/^file:\/\/localhost\//i, 'file:///');

  // 2. Usiamo la funzione nativa di Node.js per convertire l'URL in path
  const windowsPath = fileURLToPath(cleanUrl);

  return windowsPath;
}