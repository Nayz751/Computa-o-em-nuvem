import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services';
import type { PhotoRequest } from '../models';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { EmptyState } from '../components/common/Feedback';
import { ButtonLink } from '../components/common/Button';
import { ConfirmModal } from '../components/common/Modal';
import { RequestCard } from '../components/requests/RequestCard';
import { RequestFilters, emptyRequestFilter, filterRequests } from '../components/requests/RequestFilters';
import { OriginalModal } from '../components/requests/OriginalModal';

export function MyRequestsPage() {
  const { state, currentUser, photosById, cancelRequest } = useApp();
  const { notify } = useToast();
  const [filter, setFilter] = useState(emptyRequestFilter);
  const [toCancel, setToCancel] = useState<PhotoRequest | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = useMemo(() => state.requests.filter((r) => r.runnerId === currentUser?.id), [state.requests, currentUser]);
  const list = useMemo(() => filterRequests(mine, filter), [mine, filter]);
  const openedRequest = mine.find((r) => r.id === opened);

  const confirmCancel = async () => {
    if (!toCancel) return;
    setBusy(true);
    try {
      await cancelRequest(toCancel.id);
      notify('success', 'Solicitação cancelada.');
    } catch (e) {
      notify('error', errorMessage(e));
    } finally {
      setBusy(false);
      setToCancel(null);
    }
  };

  return (
    <PageLayout>
      <PageIntro line1="Suas solicitações." eyebrow="MINHAS SOLICITAÇÕES" description="Acompanhe o status de cada pedido de foto original." />
      {mine.length === 0 ? (
        <EmptyState title="Você ainda não fez solicitações" description="Encontre sua foto no mural e solicite a versão original." action={<ButtonLink to="/" variant="accent">Ir para o mural</ButtonLink>} />
      ) : (
        <>
          <RequestFilters value={filter} onChange={setFilter} placeholder="Evento, foto ou fotógrafo" />
          {list.length === 0 ? <EmptyState title="Nenhuma solicitação encontrada" description="Ajuste a pesquisa ou o filtro de status." /> : (
            <div className="list">
              {list.map((r) => (
                <RequestCard key={r.id} variant="runner" request={r} photo={photosById.get(r.photoId)} onCancel={() => setToCancel(r)} onOpen={() => setOpened(r.id)} />
              ))}
            </div>
          )}
        </>
      )}
      {toCancel && (
        <ConfirmModal title="Cancelar solicitação" confirmLabel="Cancelar solicitação" cancelLabel="Manter" danger loading={busy}
          message={<>Cancelar a solicitação de <strong>{toCancel.photoTitle}</strong> ({toCancel.eventName})?</>}
          onCancel={() => setToCancel(null)} onConfirm={confirmCancel} />
      )}
      {openedRequest && <OriginalModal request={openedRequest} onClose={() => setOpened(null)} />}
    </PageLayout>
  );
}
