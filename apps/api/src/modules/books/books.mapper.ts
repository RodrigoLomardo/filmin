import type { GoogleBooksRaw, BookSearchResult } from './books.types';

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.substring(0, 4), 10);
  return isNaN(year) ? null : year;
}

export function mapBook(raw: GoogleBooksRaw): BookSearchResult {
  const info = raw.volumeInfo;
  const thumbnail =
    info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;

  return {
    googleBooksId: raw.id,
    titulo: info.title,
    autores: info.authors ?? [],
    anoPublicacao: extractYear(info.publishedDate),
    descricao: info.description ?? null,
    imagemUrl: thumbnail ? thumbnail.replace('http://', 'https://') : null,
  };
}
