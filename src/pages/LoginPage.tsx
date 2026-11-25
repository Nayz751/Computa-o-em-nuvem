import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { authService, errorMessage } from '../services';
import { AuthLayout } from '../components/layout/AuthLayout';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Feedback';

export function LoginPage() {
  const { login } = useApp();
  const { notify } = useToast();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Informe seu e-mail.';
    else if (!authService.isValidEmail(email)) next.email = 'Informe um e-mail válido.';
    if (!password) next.password = 'Informe sua senha.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      notify('success', `Bem-vindo(a), ${user.name.split(' ')[0]}!`);
      // GuestRoute redireciona para a página de origem ou para a área do perfil.
    } catch (e) {
      setFormError(errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link to="/" className="auth__back">← Voltar ao mural</Link>
      <h1 className="auth__heading">Bem-vinda(o) de volta!</h1>
      <p className="auth__sub">Entre para encontrar suas fotos ou acompanhar seus registros.</p>
      <span className="pill pill--accent">ACESSO À PLATAFORMA</span>
      {location.state && (location.state as { from?: string }).from && <Alert kind="info">Entre para continuar de onde parou.</Alert>}
      <form onSubmit={onSubmit} noValidate className="form">
        {formError && <Alert>{formError}</Alert>}
        <TextField label="E-mail" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <TextField label="Senha" type="password" autoComplete="current-password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Button type="submit" variant="accent" block loading={loading}>Entrar</Button>
      </form>
      <p className="auth__switch">Ainda não tem uma conta? <Link to="/cadastro" state={location.state}>Criar cadastro</Link></p>
      <hr className="divider" />
      <details className="demo">
        <summary>Contas de demonstração</summary>
        <p>Senha de todas: <code>123456</code></p>
        <ul>
          <li><code>maria@tracemark.dev</code> — corredora</li>
          <li><code>joao@tracemark.dev</code> — corredor</li>
          <li><code>foto@tracemark.dev</code> — fotógrafa (@foto.runner)</li>
          <li><code>lucas@tracemark.dev</code> — fotógrafo (@lucas.lens)</li>
        </ul>
      </details>
      <p className="auth__switch"></p>
    </AuthLayout>
  );
}
