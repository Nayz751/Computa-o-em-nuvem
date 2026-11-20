import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { authService, errorMessage } from '../services';
import type { UserRole } from '../models';
import { AuthLayout } from '../components/layout/AuthLayout';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Feedback';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

export function RegisterPage() {
  const { register } = useApp();
  const { notify } = useToast();
  const location = useLocation();
  const [role, setRole] = useState<UserRole>('runner');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Informe seu nome.';
    if (!form.email.trim()) next.email = 'Informe seu e-mail.';
    else if (!authService.isValidEmail(form.email)) next.email = 'Informe um e-mail válido.';
    if (form.password.length < 6) next.password = 'A senha deve ter ao menos 6 caracteres.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'As senhas não conferem.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      notify('success', `Conta criada com sucesso! Bem-vindo(a), ${user.name.split(' ')[0]}.`);
    } catch (e) {
      setFormError(errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth__heading">Criar sua conta</h1>
      <p className="auth__sub">Faça parte do TraceMark e encontre os melhores momentos da sua corrida.</p>
      <form onSubmit={onSubmit} noValidate className="form">
        {formError && <Alert>{formError}</Alert>}
        <fieldset className="role-select">
          <legend className="visually-hidden">Tipo de perfil</legend>
          {([['runner', 'Sou corredor(a)'], ['photographer', 'Sou fotógrafo(a)']] as const).map(([value, label]) => (
            <label key={value} className={role === value ? 'role-select__item is-selected' : 'role-select__item'}>
              <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} />
              {label}
            </label>
          ))}
        </fieldset>
        <TextField label="Nome" autoComplete="name" placeholder="Seu nome" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField label="E-mail" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField label="Senha" type="password" autoComplete="new-password" placeholder="••••••••••••" hint="Mínimo de 6 caracteres." value={form.password} onChange={set('password')} error={errors.password} />
        <TextField label="Confirmar senha" type="password" autoComplete="new-password" placeholder="••••••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        <Button type="submit" variant="accent" block loading={loading}>Criar cadastro</Button>
      </form>
      <hr className="divider" />
      <p className="auth__switch">Já tem uma conta? <Link to="/entrar" state={location.state}>Entrar</Link></p>
      <p className="auth__switch"><Link to="/">← Voltar ao mural</Link></p>
    </AuthLayout>
  );
}
