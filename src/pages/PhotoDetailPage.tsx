import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services';
import { PageLayout } from '../components/layout/PageLayout';
import { PhotoPreview } from '../components/photos/PhotoPreview';
import { Button, ButtonLink } from '../components/common/Button';
import { ConfirmModal } from '../components/common/Modal';
import { Alert, EmptyState } from '../components/common/Feedback';
import { StatusPill } from '../components/common/StatusPill';
import { OriginalModal } from '../components/requests/OriginalModal';
import { formatDate, formatPrice, pluralize } from '../utils/format';

type Dialog = null | 'request' | 'cancel' | 'delete' | 'download';

export function PhotoDetailPage() {
  const { photoId = '' } = useParams();
  const { state, currentUser, photosById, eventsById, usersById, requestForPhoto, requestOriginal, cancelRequest, deletePhoto, comments, addComment } = useApp();
  const [commentText, setCommentText] = useState('');
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const resumed = useRef(false);

  const photo = photosById.get(photoId);
  const request = photo ? requestForPhoto(photo.id) : undefined;
  const status = request?.status ?? 'not_requested';
  const hasActive = status === 'pending' || status === 'fulfilled';
  const isRunner = currentUser?.role === 'runner';

  // Após login/cadastro, retoma o contexto da solicitação que o visitante iniciou.
  useEffect(() => {
    const resume = (location.state as { resumeRequest?: boolean } | null)?.resumeRequest;
    if (resume && isRunner && photo && !hasActive && !resumed.current) {
      resumed.current = true;
      setDialog('request');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, isRunner, photo, hasActive, navigate]);

  if (!photo) {
    return (
      <PageLayout>
        <EmptyState title="Fotografia não encontrada" description="Ela pode ter sido removida pelo fotógrafo." action={<ButtonLink to="/">Voltar ao mural</ButtonLink>} />
      </PageLayout>
    );
  }

  const event = eventsById.get(photo.eventId);
  const photographer = usersById.get(photo.photographerId);
  const isOwner = currentUser?.id === photo.photographerId;
  const related = state.requests.filter((r) => r.photoId === photo.id);
  const relatedPending = related.filter((r) => r.status === 'pending').length;

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      notify('success', success);
      setDialog(null);
      return true;
    } catch (e) {
      notify('error', errorMessage(e));
      setDialog(null);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const goLogin = (to: '/entrar' | '/cadastro') => navigate(to, { state: { from: `/foto/${photo.id}`, resumeRequest: true } });

  return (
    <PageLayout>
      <Link to="/" className="back-link">← Voltar ao mural</Link>

      <header className="detail__head">
        <h1 className="intro__title intro__title--md">Uma lembrança de cada quilômetro.</h1>
        <p className="intro__text">{event ? `${event.name}  •  ${formatDate(event.date)}` : photo.title}</p>
      </header>
      <div className="detail">
        <div className="detail__media">
          <span className="pill pill--dark detail__badge">
            {isOwner ? 'VISUALIZAÇÃO DO FOTÓGRAFO' : 'PRÉVIA COM MARCA D’ÁGUA'}
          </span>
          <PhotoPreview photo={photo} size="detail" variant={isOwner ? 'original' : 'watermarked'}/>
        </div>
        <aside className="detail__panel" aria-label="Informações da fotografia">
          <h2 className="detail__title">O momento é seu.</h2>
          <p className="detail__label">Fotógrafo(a)</p>
          <p className="detail__value">{photographer?.handle ?? '—'}</p>
          <hr className="divider" />
          <p className="detail__label">Sobre esta foto</p>
          <p className="detail__text">{photo.title} — {event ? `${event.name}, ${event.city}.` : ''} Um registro da sua prova.</p>
          <p className="detail__label">Valor da foto</p>
          <p className="detail__price">{formatPrice(photo.price)}</p>

          <div className="detail__actions">
            {!currentUser && (
              <>
                <Button variant="accent" block onClick={() => goLogin('/entrar')}>Entrar para solicitar original</Button>
                <Button variant="outline" block onClick={() => goLogin('/cadastro')}>Criar cadastro</Button>
                <p className="field__hint">Você precisa estar autenticado como corredor para solicitar a foto original.</p>
              </>
            )}
            {isRunner && (
              <>
                {request && <p className="detail__status">Sua solicitação: <StatusPill status={status} /></p>}
                {status === 'pending' && (
                  <>
                    <Button block disabled>Solicitação pendente</Button>
                    <Button variant="outline" block onClick={() => setDialog('cancel')}>Cancelar solicitação</Button>
                  </>
                )}
                {status === 'fulfilled' && <Button variant="accent" block onClick={() => setDialog('download')}>Ver / baixar original</Button>}
                {(status === 'not_requested' || status === 'declined' || status === 'cancelled') && (
                  <Button variant="accent" block onClick={() => setDialog('request')}>
                    {status === 'not_requested' ? 'Solicitar original' : 'Solicitar novamente'}
                  </Button>
                )}
                {status === 'declined' && <p className="field__hint">O fotógrafo recusou o envio anterior. O download segue bloqueado.</p>}
              </>
            )}
            {isOwner && (
              <>
                <Alert kind="info">Esta é uma das suas fotografias. {pluralize(related.length, 'solicitação', 'solicitações')} ({relatedPending} pendente{relatedPending === 1 ? '' : 's'}).</Alert>
                <ButtonLink to={`/admin/fotos/${photo.eventId}`} variant="outline" block>Abrir pasta do evento</ButtonLink>
                <Button variant="danger" block onClick={() => setDialog('delete')}>Excluir fotografia</Button>
              </>
            )}
            {currentUser?.role === 'photographer' && !isOwner && (
              <Alert kind="info">Você está vendo a fotografia de outro profissional. Somente o autor pode administrá-la.</Alert>
            )}
          </div>
        </aside>
      </div>
      <p className="footnote">A versão original é disponibilizada pelo fotógrafo. A prévia pública mantém a marca d’água.</p>

      
      <section className="detail__comments">
        <h2>Comentários</h2>

        {comments.filter((comment) => comment.photoId === photo.id).length === 0 ? (
          <p className="field__hint">Ainda não há comentários nesta fotografia.</p>
        ) : (
          comments
            .filter((comment) => comment.photoId === photo.id)
            .map((comment) => (
              <article key={comment.id} className="detail__comment">
                <strong>{usersById.get(comment.userId)?.name ?? 'Usuário'}</strong>
                <p>{comment.content}</p>
                <small>{formatDate(comment.createdAt)}</small>
              </article>
            ))
        )}

        {currentUser ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentText.trim()) return;
              addComment(photo.id, commentText);
              setCommentText('');
              notify('success', 'Comentário publicado!');
            }}
          >
            <label htmlFor="photo-comment">Deixe seu comentário</label>
            <textarea
              id="photo-comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva algo sobre esta fotografia..."
              maxLength={500}
              required
            />
            <Button type="submit" disabled={!commentText.trim()}>
              Comentar
            </Button>
          </form>
        ) : (
          <p className="field__hint">Entre na sua conta para comentar.</p>
        )}
      </section>

      {dialog === 'request' && (
        <ConfirmModal title="Solicitar fotografia original" confirmLabel="Enviar solicitação" loading={busy}
          message={<>O fotógrafo <strong>{photographer?.handle}</strong> receberá seu pedido e poderá autorizar ou recusar o envio da imagem original de “{photo.title}”.</>}
          onCancel={() => setDialog(null)} onConfirm={() => run(() => requestOriginal(photo.id), 'Solicitação enviada! Acompanhe em “Minhas solicitações”.')} />
      )}
      {dialog === 'cancel' && request && (
        <ConfirmModal title="Cancelar solicitação" confirmLabel="Cancelar solicitação" cancelLabel="Manter" danger loading={busy}
          message="Tem certeza de que deseja cancelar esta solicitação pendente?"
          onCancel={() => setDialog(null)} onConfirm={() => run(() => cancelRequest(request.id), 'Solicitação cancelada.')} />
      )}
      {dialog === 'delete' && (
        <ConfirmModal title="Excluir fotografia" confirmLabel="Excluir" danger loading={busy}
          message={<>Excluir <strong>{photo.title}</strong>? Esta ação não pode ser desfeita.{related.length > 0 && <> Há {pluralize(related.length, 'solicitação relacionada', 'solicitações relacionadas')}{relatedPending > 0 && <> — {pluralize(relatedPending, 'pendente será cancelada', 'pendentes serão canceladas')}</>}. Corredores já atendidos perderão o acesso ao download.</>}</>}
          onCancel={() => setDialog(null)}
          onConfirm={async () => { if (await run(() => deletePhoto(photo.id), 'Fotografia excluída.')) navigate(`/admin/fotos/${photo.eventId}`); }} />
      )}
      {dialog === 'download' && request && <OriginalModal request={request} onClose={() => setDialog(null)} />}
    </PageLayout>
  );
}
