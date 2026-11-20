
import { Link } from 'react-router-dom';
import type { Event, Photo, PublicUser } from '../../models';
import { useApp } from '../../context/AppContext';
import { formatDate, formatPrice } from '../../utils/format';
import { PhotoPreview } from './PhotoPreview';

interface Props { photo: Photo; event?: Event; photographer?: PublicUser }

export function PhotoCard({ photo, event, photographer }: Props) {
  const { currentUser } = useApp();
  const isOwner = currentUser?.id === photo.photographerId;

  return (
    <article className="photo-card">
      <Link to={`/foto/${photo.id}`} className="photo-card__media" aria-label={`Ver detalhes de ${photo.title}`}>
        <PhotoPreview photo={photo} variant={isOwner ? 'original' : 'watermarked'} />
      </Link>
      <div className="photo-card__body">
        <h3 className="photo-card__title">{event?.name ?? photo.title}</h3>
        <p className="photo-card__meta">{event ? `${event.city} • ${formatDate(event.date)}` : ''}</p>
        <div className="photo-card__foot">
          <span className="photo-card__author">Por {photographer?.handle ?? 'fotógrafo'}</span>
          <span className="photo-card__price">{formatPrice(photo.price)}</span>
        </div>
        <Link to={`/foto/${photo.id}`} className="photo-card__link">Ver detalhes</Link>
      </div>
    </article>
  );
}
