import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { Button, ButtonLink } from '../components/common/Button';
import { Alert } from '../components/common/Feedback';

const FEATURES = [
  'Publicar fotografias de eventos esportivos com marca d’água',
  'Organizar suas fotos por pastas ou eventos',
  'Receber solicitações e confirmar ou recusar o envio do original',
  'Acompanhar indicadores no painel Administrador',
  'Continuar pesquisando o mural e vendo fotos de outros profissionais',
];

export function BecomePhotographerPage() {
  const { becomePhotographer } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setLoading(true);
    setError('');
    try {
      await becomePhotographer();
      notify('success', 'Sua conta agora é de fotógrafo! Funcionalidades liberadas.');
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <PageLayout narrow>
      <PageIntro line1="Seu olhar em movimento." eyebrow="QUERO SER FOTÓGRAFO" description="Veja o que muda ao se tornar fotógrafo no TraceMark." />
      <section className="card">
        <h2>Com o perfil de fotógrafo você poderá</h2>
        <ul className="check-list">{FEATURES.map((f) => <li key={f}>{f}</li>)}</ul>
        <Alert kind="info">Esta é a mesma conta: seus dados e o histórico de solicitações serão preservados. Nenhuma conta nova será criada.</Alert>
        {error && <Alert>{error}</Alert>}
        <div className="btn-row">
          <ButtonLink to="/perfil" variant="outline">Voltar</ButtonLink>
          <Button variant="accent" onClick={confirm} loading={loading}>Tornar-me fotógrafo</Button>
        </div>
      </section>
    </PageLayout>
  );
}
