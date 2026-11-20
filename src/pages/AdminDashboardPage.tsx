import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { dashboardService } from '../services';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { AdminNav } from '../components/layout/AdminNav';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/Feedback';
import { formatDate, pluralize } from '../utils/format';

export function AdminDashboardPage() {
  const { state, currentUser } = useApp();
  const me = currentUser!.id;
  const metrics = useMemo(() => dashboardService.computeMetrics(state.photos, state.requests, me), [state.photos, state.requests, me]);
  const folders = useMemo(
    () => state.events.filter((e) => state.photos.some((p) => p.eventId === e.id && p.photographerId === me)).sort((a, b) => b.date.localeCompare(a.date)),
    [state.events, state.photos, me],
  );

  return (
    <PageLayout>
      <PageIntro line1="Seu olhar em movimento." eyebrow="ÁREA DO FOTÓGRAFO — ADMINISTRADOR" description="Gerencie seus envios e acompanhe as solicitações das suas fotos." />
      <AdminNav />
      <section className="banner">
        <div>
          <h2>Tem fotos novas da última prova?</h2>
          <p>Envie uma ou várias imagens. Nós aplicamos a marca d’água para publicação.</p>
        </div>
        <ButtonLink to="/admin/enviar" variant="accent">＋ Enviar fotos</ButtonLink>
      </section>

      <h2 className="section-title">Visão geral</h2>
      <div className="grid grid--metrics">
        <MetricCard value={metrics.totalPhotos} label="Fotografias publicadas" />
        <MetricCard value={metrics.totalRequests} label="Solicitações recebidas" />
        <MetricCard value={metrics.pendingRequests} label="Solicitações pendentes" />
        <MetricCard value={metrics.fulfilledRequests} label="Solicitações atendidas" />
      </div>

      <h2 className="section-title">Envios recentes</h2>
      <p className="section-sub">Suas pastas por evento.</p>
      {folders.length === 0 ? (
        <EmptyState title="Nenhuma foto publicada ainda" description="Envie suas primeiras fotos para vê-las no mural." />
      ) : (
        <ul className="rows">
          {folders.map((e) => {
            const count = state.photos.filter((p) => p.eventId === e.id && p.photographerId === me).length;
            return (
              <li key={e.id} className="rows__item">
                <Link to={`/admin/fotos/${e.id}`} className="rows__name">{e.name} <small>· {formatDate(e.date)}</small></Link>
                <span>{pluralize(count, 'foto', 'fotos')}</span>
                <span className="pill pill--status pill--fulfilled">Publicado</span>
              </li>
            );
          })}
        </ul>
      )}
    </PageLayout>
  );
}
