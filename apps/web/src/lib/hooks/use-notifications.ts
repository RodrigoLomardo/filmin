'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export type DuoDissolvedPayload = { partnerName: string };
export type MemberJoinedPayload = { memberName: string; memberEmail: string | null };

export type AppNotification =
  | { type: 'duo_dissolved'; data: DuoDissolvedPayload }
  | { type: 'member_joined'; data: MemberJoinedPayload };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Conecta ao SSE stream do backend para receber notificações em tempo real.
 * Retorna a última notificação e uma função para limpá-la.
 */
export function useNotifications(): {
  notification: AppNotification | null;
  clearNotification: () => void;
} {
  const { session } = useAuth();
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;

    const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);
    sourceRef.current = source;

    function handleEvent(e: MessageEvent) {
      try {
        const parsed = JSON.parse(e.data);
        setNotification({ type: e.type as AppNotification['type'], data: parsed });
      } catch {
        // Ignora eventos malformados
      }
    }

    source.addEventListener('duo_dissolved', handleEvent);
    source.addEventListener('member_joined', handleEvent);

    source.onerror = () => {
      // EventSource reconecta automaticamente — não precisa fazer nada
    };

    return () => {
      source.removeEventListener('duo_dissolved', handleEvent);
      source.removeEventListener('member_joined', handleEvent);
      source.close();
      sourceRef.current = null;
    };
  }, [session?.access_token]);

  return {
    notification,
    clearNotification: () => setNotification(null),
  };
}
