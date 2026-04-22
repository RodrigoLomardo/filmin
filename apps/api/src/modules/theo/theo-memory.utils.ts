import type { TheoResponse } from './theo.service';

/**
 * Extrai títulos citados na resposta do Theo.
 * Usa aspas como heurística primária.
 */
export function extractTitlesFromResponse(response: TheoResponse): string[] {
  const quoted = response.message.match(/"([^"]+)"/g);
  if (!quoted) return [];
  return quoted.map((t) => t.replace(/"/g, '').trim()).filter(Boolean);
}
