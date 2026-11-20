import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services';

/** Confirmar/recusar solicitações com estado de carregamento e feedback. */
export function useRequestResponder() {
  const { respondRequest } = useApp();
  const { notify } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const respond = async (requestId: string, decision: 'fulfilled' | 'declined') => {
    setBusyId(requestId);
    try {
      await respondRequest(requestId, decision);
      notify('success', decision === 'fulfilled' ? 'Solicitação confirmada. O download foi liberado ao corredor.' : 'Solicitação recusada.');
    } catch (e) {
      notify('error', errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };
  return { busyId, respond };
}
