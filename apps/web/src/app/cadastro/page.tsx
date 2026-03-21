'use client';

import { ArrowLeft } from 'lucide-react';
import { CreateWatchItemForm } from '@/components/watch-items/create-watch-item-form';

export default function CadastroPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-300"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      <CreateWatchItemForm />
    </main>
  );
}