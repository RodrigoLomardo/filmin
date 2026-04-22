import type { GoogleBooksRaw, BookSearchResult } from './books.types';

// Mapeamento de categorias do Google Books para os nomes dos gêneros do sistema.
// As categorias do Google Books são em inglês e frequentemente compostas (ex.: "Juvenile Fiction / Fantasy").
// Fazemos correspondência por substring case-insensitive.
const BOOKS_CATEGORY_MAP: { pattern: RegExp; nome: string }[] = [
  { pattern: /sci.?fi|science.?fiction|ficção\s*científica/i, nome: 'Ficção Científica' },
  { pattern: /fantasy|fantasia/i,                              nome: 'Fantasia' },
  { pattern: /horror|terror/i,                                 nome: 'Terror' },
  { pattern: /thriller|suspense/i,                             nome: 'Suspense' },
  { pattern: /mystery|mist[eé]rio/i,                          nome: 'Suspense' },
  { pattern: /crime/i,                                         nome: 'Crime' },
  { pattern: /romance|love story/i,                            nome: 'Romance' },
  { pattern: /comedy|humor|comédia/i,                          nome: 'Comédia' },
  { pattern: /drama/i,                                         nome: 'Drama' },
  { pattern: /action|ação/i,                                   nome: 'Ação' },
  { pattern: /adventure|aventura/i,                            nome: 'Aventura' },
  { pattern: /animation|animação/i,                            nome: 'Animação' },
  { pattern: /documentary|documentário/i,                      nome: 'Documentário' },
];

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.substring(0, 4), 10);
  return isNaN(year) ? null : year;
}

function mapCategories(categories: string[] = []): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const cat of categories) {
    for (const { pattern, nome } of BOOKS_CATEGORY_MAP) {
      if (pattern.test(cat) && !seen.has(nome)) {
        seen.add(nome);
        result.push(nome);
      }
    }
  }
  return result;
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
    generosNomes: mapCategories(info.categories),
  };
}
