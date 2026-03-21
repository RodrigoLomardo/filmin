import Link from 'next/link';
import { Plus } from 'lucide-react';
import { WatchItemsDashboard } from '@/components/watch-items/watch-items-dashboard';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-pink-500">Filmin</p>
          <h1 className="text-3xl font-bold">Seus filmes e séries</h1>
        </div>

        <Link
          href="/cadastro"
          className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-3 text-sm font-medium text-white"
        >
          <Plus size={18} />
          Novo
        </Link>
      </header>

      <WatchItemsDashboard />
    </main>
  );
}