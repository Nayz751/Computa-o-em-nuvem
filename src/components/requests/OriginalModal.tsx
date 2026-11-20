import { useState } from 'react';
import type { PhotoRequest } from '../../models';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../services';
import { triggerDownload } from '../../utils/download';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Feedback';

/** Tela "Solicitação da foto original" do protótipo, com o botão "Baixar foto". */
export function OriginalModal({ request, onClose }: { request: PhotoRequest; onClose: () => void }) {
  const { downloadOriginal } = useApp();
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const allowed = request.status === 'fulfilled';

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const file = await downloadOriginal(request.id);
      triggerDownload(file.dataUrl, file.filename);
      notify('success', 'Download iniciado (original simulada).');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Solicitação da foto original" onClose={onClose}>
      <p className="modal__text"><strong>{request.eventName}</strong><br />{request.photoTitle} · {request.photographerName}</p>
      {error && <Alert>{error}</Alert>}
      <Button variant="accent" block onClick={handleDownload} loading={loading} disabled={!allowed}>Baixar foto</Button>
      <p className="field__hint">Simulação: com um backend, a entrega do original usaria um link seguro e temporário, liberado apenas após a autorização do fotógrafo.</p>
    </Modal>
  );
}
