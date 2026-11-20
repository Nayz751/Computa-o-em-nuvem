import type { Photo, PhotoRequest } from '../../models';
import { formatDate } from '../../utils/format';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { PhotoPreview } from '../photos/PhotoPreview';
import { Link } from 'react-router-dom';

interface RunnerProps {
  variant: 'runner';
  request: PhotoRequest;
  photo?: Photo;
  onCancel: () => void;
  onOpen: () => void;
}
interface PhotographerProps {
  variant: 'photographer';
  request: PhotoRequest;
  photo?: Photo;
  busy?: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}
interface ReadOnlyProps { variant: 'readonly'; request: PhotoRequest; photo?: Photo }

export function RequestCard(props: RunnerProps | PhotographerProps | ReadOnlyProps) {
  const { request, photo } = props;
  const fallback = { tone: 'orange' as const, title: request.photoTitle };
  return (
    <article className="request-card">
      <div className="request-card__thumb"><PhotoPreview photo={photo ?? fallback} size="thumb" /></div>
      <div className="request-card__info">
        <h3 className="request-card__title">{request.eventName}</h3>
        <p className="request-card__line">Fotografia: {photo ? <Link to={`/foto/${photo.id}`}>{request.photoTitle}</Link> : <>{request.photoTitle} <em>(removida)</em></>}</p>
        <p className="request-card__line">
          {props.variant === 'photographer' ? <>Solicitante: <strong>{request.runnerName}</strong> · {request.runnerEmail}</> : <>Fotógrafo: <strong>{request.photographerName}</strong></>}
        </p>
        <p className="request-card__line">Evento em {formatDate(request.eventDate)} · Solicitada em {formatDate(request.createdAt)}</p>
      </div>
      <div className="request-card__side">
        <StatusPill status={request.status} />
        <div className="request-card__actions">
          {props.variant === 'photographer' && request.status === 'pending' && (
            <>
              <Button variant="accent" size="sm" onClick={props.onConfirm} disabled={props.busy}>Confirmar solicitação</Button>
              <Button variant="outline" size="sm" onClick={props.onDecline} disabled={props.busy}>Recusar</Button>
            </>
          )}
          {props.variant === 'runner' && request.status === 'pending' && (
            <Button variant="outline" size="sm" onClick={props.onCancel}>Cancelar solicitação</Button>
          )}
          {props.variant === 'runner' && request.status === 'fulfilled' && (
            <Button variant="accent" size="sm" onClick={props.onOpen}>Ver / baixar original</Button>
          )}
          {props.variant === 'runner' && request.status === 'declined' && <span className="request-card__note">Download bloqueado</span>}
          {photo && props.variant !== 'readonly' && <Link className="btn btn--ghost btn--sm" to={`/foto/${photo.id}`}>Detalhes</Link>}
        </div>
      </div>
    </article>
  );
}
