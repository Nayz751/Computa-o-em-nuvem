import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/Feedback';
import { PageLayout } from '../components/layout/PageLayout';

export function NotFoundPage() {
  return (
    <PageLayout>
      <EmptyState title="Página não encontrada" description="O endereço não existe ou foi movido." action={<ButtonLink to="/">Voltar ao mural</ButtonLink>} />
    </PageLayout>
  );
}

export function ForbiddenPage() {
  return (
    <PageLayout>
      <EmptyState title="Acesso restrito" description="Seu perfil não tem permissão para acessar esta área." action={<ButtonLink to="/">Voltar ao mural</ButtonLink>} />
    </PageLayout>
  );
}
