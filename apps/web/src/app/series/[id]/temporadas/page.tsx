import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateTemporadasForm } from '@/components/watch-items/create-temporadas-form';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SerieTemporadasPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-300"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>

      <CreateTemporadasForm watchItemId={id} />
    </main>
  );
}