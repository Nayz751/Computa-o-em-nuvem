import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { SearchBar } from '../components/common/SearchBar';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { EmptyState } from '../components/common/Feedback';
import { PhotoGrid } from '../components/photos/PhotoGrid';
import { EventCard } from '../components/photos/EventCard';
import { PhotographerCard } from '../components/photos/PhotographerCard';
import { searchService } from '../services';
import type { SearchScope } from '../models';

type Filter = { type: 'event' | 'photographer'; id: string } | null;

const SCOPES: { value: SearchScope; label: string }[] = [
  { value: 'photos', label: 'Fotografias' },
  { value: 'events', label: 'Eventos' },
  { value: 'photographers', label: 'Fotógrafos' },
];

export function MuralPage() {
  const { state, eventsById, usersById } = useApp();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('photos');
  const [filter, setFilter] = useState<Filter>(null);

  const data = useMemo(() => ({ photos: state.photos, events: state.events, users: state.users }), [state.photos, state.events, state.users]);

  const photos = useMemo(() => {
    const result = searchService.searchPhotos(data, query, {
      eventId: filter?.type === 'event' ? filter.id : undefined,
      photographerId: filter?.type === 'photographer' ? filter.id : undefined,
    });
    return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, query, filter]);
  const events = useMemo(() => searchService.searchEvents(data, query), [data, query]);
  const photographers = useMemo(() => searchService.searchPhotographers(data, query), [data, query]);

  const countFor = (key: 'eventId' | 'photographerId', id: string) => state.photos.filter((p) => p[key] === id).length;
  const select = (next: Exclude<Filter, null>) => { setFilter(next); setScope('photos'); setQuery(''); };
  const filterLabel = filter
    ? filter.type === 'event' ? `Evento: ${eventsById.get(filter.id)?.name ?? ''}` : `Fotógrafo: ${usersById.get(filter.id)?.handle ?? ''}`
    : '';

  return (
    <PageLayout>
      <PageIntro line1="A corrida passa." line2="A memória fica." description="Encontre seus registros. Reviva cada chegada." />
      <SearchBar
        eyebrow="ENCONTRE SUAS FOTOS"
        placeholder={scope === 'events' ? 'Busque por evento ou cidade' : scope === 'photographers' ? 'Busque por fotógrafo' : 'Busque por prova, cidade ou fotógrafo'}
        value={query} onChange={setQuery} actionLabel="Buscar fotos"
      />
      <div className="toolbar">
        <SegmentedControl label="Pesquisar em" options={SCOPES} value={scope} onChange={setScope} />
        {filter && (
          <button type="button" className="chip" onClick={() => setFilter(null)} aria-label={`Remover filtro: ${filterLabel}`}>{filterLabel} <span aria-hidden="true">×</span></button>
        )}
      </div>

      <section aria-labelledby="mural-title">
        <h2 id="mural-title" className="section-title">{scope === 'photos' ? 'Fotos recentes' : scope === 'events' ? 'Eventos' : 'Fotógrafos'}</h2>
        <p className="section-sub">
          {scope === 'photos' ? 'Momentos capturados em provas e corridas' : scope === 'events' ? 'Selecione um evento para ver suas fotos' : 'Selecione um fotógrafo para ver suas fotos'}
        </p>
        {scope === 'photos' && <PhotoGrid photos={photos} />}
        {scope === 'events' && (events.length === 0 ? <EmptyState title="Nenhum evento encontrado" /> : (
          <div className="grid grid--info">{events.map((e) => <EventCard key={e.id} event={e} photoCount={countFor('eventId', e.id)} onSelect={() => select({ type: 'event', id: e.id })} />)}</div>
        ))}
        {scope === 'photographers' && (photographers.length === 0 ? <EmptyState title="Nenhum fotógrafo encontrado" /> : (
          <div className="grid grid--info">{photographers.map((u) => <PhotographerCard key={u.id} user={u} photoCount={countFor('photographerId', u.id)} onSelect={() => select({ type: 'photographer', id: u.id })} />)}</div>
        ))}
      </section>
      <p className="footnote">As imagens do mural aparecem com marca d’água até a visualização do original.</p>
    </PageLayout>
  );
}
