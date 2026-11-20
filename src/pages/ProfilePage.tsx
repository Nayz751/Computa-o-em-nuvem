import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../services';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { TextField, TextArea } from '../components/common/TextField';
import { Button, ButtonLink } from '../components/common/Button';
import { RequestCard } from '../components/requests/RequestCard';
import { formatDate } from '../utils/format';

export function ProfilePage() {
  const { currentUser, state, photosById, updateProfile, logout } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!currentUser) return null;
  const isPhotographer = currentUser.role === 'photographer';
  // Histórico preservado da época em que a conta era de corredor.
  const history = state.requests.filter((r) => r.runnerId === currentUser.id);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('Informe um nome com ao menos 2 caracteres.'); return; }
    setSaving(true);
    try {
      await updateProfile({ name, bio });
      notify('success', 'Perfil atualizado.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout narrow>
      <PageIntro line1="Seu perfil." eyebrow={isPhotographer ? 'FOTÓGRAFO(A)' : 'CORREDOR(A)'} description={`${currentUser.handle} · ${currentUser.email} · membro desde ${formatDate(currentUser.createdAt)}`} />
      <form className="card form" onSubmit={onSubmit} noValidate>
        <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} error={error} />
        <TextField label="E-mail" value={currentUser.email} readOnly hint="O e-mail não pode ser alterado nesta versão." />
        <TextArea label="Sobre você" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={240} />
        <div className="btn-row">
          <Button type="submit" variant="accent" loading={saving}>Salvar alterações</Button>
          <Button variant="outline" onClick={async () => { await logout(); notify('info', 'Você saiu da sua conta.'); navigate('/'); }}>Sair da conta</Button>
        </div>
      </form>

      {isPhotographer && (
        <section className="card">
          <h2>Área do fotógrafo</h2>
          <p>Envie novas fotografias ou consulte as imagens já publicadas.</p>
          <ButtonLink to="/admin/enviar" variant="dark">Acessar área do fotógrafo</ButtonLink>
        </section>
      )}
      {!isPhotographer && (
        <section className="card">
          <h2>Encontre suas fotografias</h2>
          <p>Explore o mural para visualizar os registros publicados pelos fotógrafos.</p>
          <ButtonLink to="/" variant="outline">Voltar ao mural</ButtonLink>
        </section>
      )}
    </PageLayout>
  );
}
