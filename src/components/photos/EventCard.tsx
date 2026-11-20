import type { Event } from '../../models';
import { formatDate, pluralize } from '../../utils/format';

export function EventCard({ event, photoCount, onSelect }: { event: Event; photoCount: number; onSelect: () => void }) {
  return (
    <button type="button" className="info-card" onClick={onSelect}>
      <span className="info-card__title">{event.name}</span>
      <span className="info-card__meta">{event.city} • {formatDate(event.date)}</span>
      <span className="info-card__count">{pluralize(photoCount, 'fotografia', 'fotografias')} · Ver fotos</span>
    </button>
  );
}
