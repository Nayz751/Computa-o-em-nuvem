import type { PublicUser } from '../../models';
import { pluralize } from '../../utils/format';

export function PhotographerCard({ user, photoCount, onSelect }: { user: PublicUser; photoCount: number; onSelect: () => void }) {
  return (
    <button type="button" className="info-card" onClick={onSelect}>
      <span className="info-card__title">{user.name}</span>
      <span className="info-card__meta">{user.handle}</span>
      <span className="info-card__count">{pluralize(photoCount, 'fotografia', 'fotografias')} · Ver fotos</span>
    </button>
  );
}
