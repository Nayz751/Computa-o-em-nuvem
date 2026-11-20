import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRequestResponder } from '../hooks/useRequestResponder';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { AdminNav } from '../components/layout/AdminNav';
import { EmptyState } from '../components/common/Feedback';
import { RequestCard } from '../components/requests/RequestCard';
import { RequestFilters, emptyRequestFilter, filterRequests } from '../components/requests/RequestFilters';

export function PhotographerRequestsPage() {
  const { state, currentUser, photosById } = useApp();
  const { busyId, respond } = useRequestResponder();
  const [filter, setFilter] = useState(emptyRequestFilter);
  const me = currentUser!.id;

  const mine = useMemo(() => state.requests.filter((r) => r.photographerId === me), [state.requests, me]);
  const list = useMemo(() => filterRequests(mine, filter), [mine, filter]);
  const pending = mine.filter((r) => r.status === 'pending').length;

  return (
    <PageLayout>
      <PageIntro line1="Solicitações recebidas." eyebrow="ÁREA DO FOTÓGRAFO — ADMINISTRADOR" description={`${pending} pendente${pending === 1 ? '' : 's'} de ${mine.length} recebida${mine.length === 1 ? '' : 's'}. Confirme para liberar o download ao corredor.`} />
      <AdminNav />
      {mine.length === 0 ? (
        <EmptyState title="Nenhuma solicitação recebida" description="Quando um corredor pedir uma foto original, ela aparecerá aqui." />
      ) : (
        <>
          <RequestFilters value={filter} onChange={setFilter} placeholder="Corredor, evento ou fotografia" />
          {list.length === 0 ? <EmptyState title="Nenhuma solicitação encontrada" description="Ajuste a pesquisa ou o filtro de status." /> : (
            <div className="list">
              {list.map((r) => (
                <RequestCard key={r.id} variant="photographer" request={r} photo={photosById.get(r.photoId)} busy={busyId === r.id}
                  onConfirm={() => respond(r.id, 'fulfilled')} onDecline={() => respond(r.id, 'declined')} />
              ))}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
