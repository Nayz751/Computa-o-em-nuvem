
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services';
import type { Photo } from '../models';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { AdminNav } from '../components/layout/AdminNav';
import { EmptyState } from '../components/common/Feedback';
import { Button, ButtonLink } from '../components/common/Button';
import { ConfirmModal } from '../components/common/Modal';
import { PhotoPreview } from '../components/photos/PhotoPreview';
import { formatDate, formatPrice, pluralize } from '../utils/format';
import { normalize } from '../services/searchService';
import { StatusPill } from '../components/common/StatusPill';

export function FolderDetailPage() {
  const { eventId = '' } = useParams();
  const { state, currentUser, eventsById, deletePhoto } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [photoQuery, setPhotoQuery] = useState('');
  const [toDelete, setToDelete] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const me = currentUser!.id;
  const event = eventsById.get(eventId);

  const photos = useMemo(
    () => state.photos.filter(
      (photo) => photo.eventId === eventId && photo.photographerId === me
    ),
    [state.photos, eventId, me]
  );

  const shownPhotos = useMemo(
    () => photos.filter(
      (photo) => !photoQuery || normalize(photo.title).includes(normalize(photoQuery))
    ),
    [photos, photoQuery]
  );

  if (!event || event.createdBy !== me) {
    return (
      <PageLayout>
        <Link to="/admin/fotos" className="back-link">
          ← Todas as fotografias
        </Link>

        <EmptyState
          title="Evento não encontrado"
          description="Este evento não existe ou não pertence à sua conta."
          action={
            <ButtonLink to="/admin/fotos">
              Voltar às fotografias
            </ButtonLink>
          }
        />
      </PageLayout>
    );
  }

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deletePhoto(toDelete.id);
      notify('success', 'Fotografia excluída.');
    } catch (e) {
      notify('error', errorMessage(e));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <PageLayout>
      <Link to="/admin/fotos" className="back-link">
        ← Todas as fotografias
      </Link>

      <PageIntro
        line1={event.name}
        eyebrow="ÁREA DO FOTÓGRAFO"
        description={`${event.city} • ${formatDate(event.date)} • ${pluralize(
          photos.length,
          'fotografia publicada',
          'fotografias publicadas'
        )}`}
      />

      <AdminNav />

      <div className="field field--inline">
        <label htmlFor="folder-search" className="field__label">
          Pesquisar fotografias
        </label>

        <input
          id="folder-search"
          type="search"
          className="field__control"
          placeholder="Nome da fotografia"
          value={photoQuery}
          onChange={(e) => setPhotoQuery(e.target.value)}
        />
      </div>

      {shownPhotos.length === 0 ? (
        <EmptyState
          title="Nenhuma fotografia encontrada"
          description={
            photos.length === 0
              ? 'Este evento ainda não possui fotografias.'
              : 'Tente pesquisar por outro nome.'
          }
          action={
            photos.length === 0 ? (
              <ButtonLink to="/admin/enviar" variant="accent">
                Enviar fotografias
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <div className="feed">
          {shownPhotos.map((photo) => (
            <article key={photo.id} className="photo-card">
              <Link
                to={`/foto/${photo.id}`}
                className="photo-card__media"
                aria-label={`Abrir detalhes de ${photo.title}`}
              >
                <PhotoPreview photo={photo} />
              </Link>

              <div className="photo-card__body">
                <h3 className="photo-card__title">
                  {photo.title}
                </h3>

                <p className="photo-card__meta">
                  {formatPrice(photo.price)}
                </p>

                <StatusPill status={photo.processingStatus ?? 'processing'} />

                <div className="btn-row">
                  <ButtonLink
                    to={`/foto/${photo.id}`}
                    variant="outline"
                    size="sm"
                  >
                    Detalhes
                  </ButtonLink>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setToDelete(photo)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <p className="footnote">
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate('/admin/enviar')}
          >
            Enviar novas fotografias
          </button>
        </p>
      )}

      {toDelete && (
        <ConfirmModal
          title="Excluir fotografia"
          confirmLabel="Excluir"
          danger
          loading={deleting}
          message={
            <>
              Excluir <strong>{toDelete.title}</strong>?
              Esta ação não pode ser desfeita.
            </>
          }
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </PageLayout>
  );
}
