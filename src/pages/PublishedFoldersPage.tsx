import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { normalize } from '../services/searchService';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { AdminNav } from '../components/layout/AdminNav';
import { SearchBar } from '../components/common/SearchBar';
import { EmptyState } from '../components/common/Feedback';
import { ButtonLink } from '../components/common/Button';
import { PhotoPreview } from '../components/photos/PhotoPreview';
import { formatDate, pluralize } from '../utils/format';
import { StatusPill } from '../components/common/StatusPill';

export function PublishedFoldersPage() {
  const { state, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const me = currentUser!.id;

  const folders = useMemo(() => {
    const q = normalize(query);
    return state.events
      .map((event) => {
        const photos = state.photos.filter((p) => p.eventId === event.id && p.photographerId === me);
        return { event, photos };
      })
      .filter((f) => f.photos.length > 0 && (!q || normalize(`${f.event.name} ${f.event.city}`).includes(q)))
      .sort((a, b) => b.event.date.localeCompare(a.event.date));
  }, [state, me, query]);

  return (
    <PageLayout>
      <PageIntro line1="Minhas fotografias." eyebrow="ÁREA DO FOTÓGRAFO" description="Consulte suas fotografias publicadas, organizadas por evento."/>
      <AdminNav />
      <SearchBar eyebrow="PESQUISAR PASTAS" placeholder="Nome do evento ou cidade" value={query} onChange={setQuery} actionLabel="Pesquisar" compact />
      {folders.length === 0 ? (
        <EmptyState title={query ? 'Nenhuma pasta encontrada' : 'Você ainda não publicou fotografias'} description={query ? 'Tente outro termo.' : 'Envie suas primeiras fotos para criar uma pasta de evento.'} action={!query && <ButtonLink to="/admin/enviar" variant="accent">＋ Enviar fotos</ButtonLink>} />
      ) : (
        <div className="grid grid--info">
          {folders.map(({ event, photos }) => (
            <Link key={event.id} to={`/admin/fotos/${event.id}`} className="folder-card">
              <PhotoPreview photo={photos[0]} size="card" />
              <span className="info-card__title">{event.name}</span>
              <span className="info-card__meta">{event.city} • {formatDate(event.date)}</span>
              <span className="info-card__count">{pluralize(photos.length, 'fotografia', 'fotografias')}</span>
              {photos.map((photo) => (<StatusPill key={photo.id} status={photo.processingStatus ?? 'processing'} />))}
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
