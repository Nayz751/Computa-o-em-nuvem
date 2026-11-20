import type { Photo } from '../../models';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/Feedback';
import { PhotoCard } from './PhotoCard';

export function PhotoGrid({ photos, emptyTitle = 'Nenhuma fotografia encontrada', emptyText }: { photos: Photo[]; emptyTitle?: string; emptyText?: string }) {
  const { eventsById, usersById } = useApp();
  if (photos.length === 0) return <EmptyState title={emptyTitle} description={emptyText ?? 'Tente buscar por outro evento, cidade ou fotógrafo.'} />;
  return (
    <div className="grid grid--photos">
      {photos.map((p) => <PhotoCard key={p.id} photo={p} event={eventsById.get(p.eventId)} photographer={usersById.get(p.photographerId)} />)}
    </div>
  );
}
