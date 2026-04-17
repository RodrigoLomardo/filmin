export interface GoogleBooksImageLinks {
  thumbnail?: string;
  smallThumbnail?: string;
}

export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  imageLinks?: GoogleBooksImageLinks;
}

export interface GoogleBooksRaw {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

export interface BookSearchResult {
  googleBooksId: string;
  titulo: string;
  autores: string[];
  anoPublicacao: number | null;
  descricao: string | null;
  imagemUrl: string | null;
}
