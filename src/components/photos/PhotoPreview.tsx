
import type { Photo } from '../../models';
import { cx } from '../../utils/cx';

interface Props {
  photo: Pick<Photo, 'tone' | 'previewUrl' | 'originalUrl' | 'title'>;
  size?: 'card' | 'detail' | 'thumb';
  variant?: 'watermarked' | 'original';
}

/** Exibe a prévia pública ou a imagem original autorizada pela API. */
export function PhotoPreview({ photo, size = 'card', variant = 'watermarked' }: Props) {
  const imageUrl = variant === 'original'
    ? photo.originalUrl
    : photo.previewUrl;

  return (
    <div className={cx('photo-preview', `photo-preview--${photo.tone}`, `photo-preview--${size}`)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${variant === 'watermarked' ? 'Prévia com marca d’água' : 'Foto original'}: ${photo.title}`}
          loading="lazy"
        />
      ) : (
        <div className="photo-preview__backdrop" role="img" aria-label={`Prévia: ${photo.title}`}>
          <span className="photo-preview__runner photo-preview__runner--a" />
          <span className="photo-preview__runner photo-preview__runner--b" />
          <span className="photo-preview__runner photo-preview__runner--c" />
          {size !== 'thumb' && <span className="photo-preview__label">TRACEMARK / FOTO DE PROVA</span>}
        </div>
      )}
    </div>
  );
}
