import { apiFetch } from './client';
import { Genero } from '@/types/genero';

export async function getGeneros() {
  return apiFetch<Genero[]>('/generos');
}