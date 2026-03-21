import { Card } from '@/components/ui/card';
import { WatchItem } from '@/types/watch-item';

type WatchItemCardProps = {
  item: WatchItem;
};

export function WatchItemCard({ item }: WatchItemCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{item.titulo}</h3>
          <p className="text-sm text-zinc-400">
            {item.tipo} • {item.anoLancamento}
          </p>
        </div>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs capitalize">
          {item.status.replaceAll('_', ' ')}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {item.generos.map((genero) => (
          <span
            key={genero.id}
            className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
          >
            {genero.nome}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-300">
        <span>Nota: {item.notaGeral ?? '-'}</span>
        <span>Rewatch: {item.rewatchCount}</span>
      </div>
    </Card>
  );
}