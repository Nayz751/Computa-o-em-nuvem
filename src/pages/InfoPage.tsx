import { useApp } from '../context/AppContext';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { ButtonLink } from '../components/common/Button';

const CONTENT = {
  how: {
    line1: 'Do mural ao seu original.', line2: 'Em quatro passos.', eyebrow: 'COMO FUNCIONA',
    description: 'O TraceMark conecta corredores e fotógrafos esportivos.',
    steps: [
      ['Encontre', 'Pesquise por prova, cidade ou fotógrafo no mural público.'],
      ['Visualize', 'Veja a prévia com marca d’água e os detalhes da fotografia.'],
      ['Solicite', 'Entre como corredor e peça a versão original ao fotógrafo.'],
      ['Receba', 'Quando o fotógrafo autorizar, o download do original é liberado na sua conta.'],
    ],
  },
  photographers: {
    line1: 'Seu olhar em movimento.', line2: 'Seu trabalho em evidência.', eyebrow: 'PARA FOTÓGRAFOS',
    description: 'Publique suas fotos de prova e decida quem recebe o original.',
    steps: [
      ['Publique', 'Envie uma ou várias fotos e organize por evento.'],
      ['Proteja', 'A marca d’água é aplicada para a exibição pública no mural.'],
      ['Autorize', 'Receba solicitações e confirme ou recuse o envio do original.'],
      ['Acompanhe', 'Veja indicadores de fotos publicadas e solicitações no painel.'],
    ],
  },
} as const;

export function InfoPage({ kind }: { kind: keyof typeof CONTENT }) {
  const { currentUser } = useApp();
  const c = CONTENT[kind];
  let cta = <ButtonLink to="/cadastro" variant="accent">Criar cadastro</ButtonLink>;
  if (kind === 'how') cta = <ButtonLink to="/" variant="accent">Ver o mural</ButtonLink>;
  else if (currentUser?.role === 'runner') cta = <ButtonLink to="/perfil/ser-fotografo" variant="accent">Quero ser fotógrafo</ButtonLink>;
  else if (currentUser?.role === 'photographer') cta = <ButtonLink to="/admin" variant="accent">Ir para o Administrador</ButtonLink>;

  return (
    <PageLayout>
      <PageIntro line1={c.line1} line2={c.line2} eyebrow={c.eyebrow} description={c.description} />
      <ol className="steps">
        {c.steps.map(([title, text], i) => (
          <li key={title} className="steps__item"><span className="steps__n">{i + 1}</span><h2>{title}</h2><p>{text}</p></li>
        ))}
      </ol>
      <div className="cta-row">{cta}</div>
    </PageLayout>
  );
}
