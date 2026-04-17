export interface BookResult {
  googleBooksId: string;
  titulo: string;
  autores: string[];
  anoPublicacao: number | null;
  descricao: string | null;
  imagemUrl: string | null;
}
