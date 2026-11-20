import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { errorMessage, uploadService } from '../services';
import { PageLayout } from '../components/layout/PageLayout';
import { PageIntro } from '../components/common/PageIntro';
import { AdminNav } from '../components/layout/AdminNav';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Feedback';
import { ImageDropzone } from '../components/uploads/ImageDropzone';
import { ImagePreviewList, type SelectedImage } from '../components/uploads/ImagePreviewList';
import { pluralize } from '../utils/format';

type Errors = Partial<Record<'event' | 'city' | 'date' | 'price' | 'files', string>>;

export function UploadPage() {
  const { state, currentUser, publishPhotos } = useApp();
  const { notify } = useToast();
  const [items, setItems] = useState<SelectedImage[]>([]);
  const [form, setForm] = useState({ eventName: '', city: '', date: '', price: '15.00' });
  const [errors, setErrors] = useState<Errors>({});
  const [fileMessages, setFileMessages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ count: number; eventName: string } | null>(null);
  const itemsRef = useRef<SelectedImage[]>([]);
  itemsRef.current = items;

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  const myEvents = useMemo(() => state.events.filter((e) => e.createdBy === currentUser?.id), [state.events, currentUser]);

  const addFiles = (files: File[]) => {
    setSuccess(null);
    const problems = uploadService.validateFiles(files);
    const valid = files.filter((f) => uploadService.validateFiles([f]).length === 0);
    const known = new Set(items.map((i) => i.key));
    const fresh: SelectedImage[] = [];
    valid.forEach((file) => {
      const key = uploadService.fingerprintOf(file);
      if (known.has(key)) { problems.push(`"${file.name}" já foi selecionada.`); return; }
      known.add(key);
      fresh.push({ key, file, url: URL.createObjectURL(file) });
    });
    if (items.length + fresh.length > uploadService.MAX_FILES) {
      fresh.forEach((f) => URL.revokeObjectURL(f.url));
      problems.push(`Limite de ${uploadService.MAX_FILES} fotos por envio.`);
    } else {
      setItems((list) => [...list, ...fresh]);
    }
    setFileMessages(problems);
    setErrors((e) => ({ ...e, files: undefined }));
  };

  const removeItem = (key: string) => {
    setItems((list) => {
      list.filter((i) => i.key === key).forEach((i) => URL.revokeObjectURL(i.url));
      return list.filter((i) => i.key !== key);
    });
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return; // impede envio duplicado
    const next: Errors = {};
    const price = Number(form.price);
    if (items.length === 0) next.files = 'Selecione ao menos uma imagem.';
    if (!form.eventName.trim()) next.event = 'Informe o nome do evento.';
    if (!form.city.trim()) next.city = 'Informe a cidade.';
    if (!form.date) next.date = 'Informe a data do evento.';
    if (form.price === '' || !Number.isFinite(price) || price < 0) next.price = 'Informe um valor válido.';
    setErrors(next);
    setError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const result = await publishPhotos({ files: items.map((i) => i.file), eventName: form.eventName, city: form.city, date: form.date, price });
      items.forEach((i) => URL.revokeObjectURL(i.url));
      setItems([]);
      setFileMessages([]);
      setSuccess({ count: result.photos.length, eventName: result.event.name });
      notify('success', `${pluralize(result.photos.length, 'foto publicada', 'fotos publicadas')} no mural.`);
    } catch (e) {
      setError(errorMessage(e));
      notify('error', 'Não foi possível concluir o envio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageIntro line1="Publicar fotografias." eyebrow="ÁREA DO FOTÓGRAFO" description="Envie suas fotografias, informe os dados do evento e defina o valor por imagem."/>
      <AdminNav />
      {success && (
        <Alert kind="success">
          {pluralize(success.count, 'fotografia publicada', 'fotografias publicadas')} em “{success.eventName}”. Já aparece no mural. <Link to="/admin/fotos">Ver fotografias publicadas</Link>
        </Alert>
      )}
      {error && <Alert>{error}</Alert>}
      <form className="upload" onSubmit={onSubmit} noValidate>
        <section className="card" aria-labelledby="up-files">
          <h2 id="up-files">1. Imagens</h2>
          <ImageDropzone onFiles={addFiles} disabled={submitting} />
          {errors.files && <p className="field__error" role="alert">{errors.files}</p>}
          {fileMessages.length > 0 && <Alert>{fileMessages.map((m) => <span key={m} className="block">{m}</span>)}</Alert>}
          <ImagePreviewList items={items} onRemove={removeItem} disabled={submitting} />
          {items.length > 0 && <p className="field__hint">{pluralize(items.length, 'imagem selecionada', 'imagens selecionadas')}. Remova as que não quiser enviar.</p>}
        </section>

        <section className="card" aria-labelledby="up-event">
          <h2 id="up-event">2. Dados do evento</h2>
          <div className="form-grid">
            <TextField label="Nome do evento" list="my-events" placeholder="Ex.: Meia Maratona de Fortaleza" value={form.eventName} onChange={set('eventName')} error={errors.event} disabled={submitting} />
            <datalist id="my-events">{myEvents.map((e) => <option key={e.id} value={e.name} />)}</datalist>
            <TextField label="Cidade" placeholder="Ex.: Fortaleza" value={form.city} onChange={set('city')} error={errors.city} disabled={submitting} />
            <TextField label="Data do evento" type="date" value={form.date} onChange={set('date')} error={errors.date} disabled={submitting} />
            <TextField label="Valor por foto (R$)" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set('price')} error={errors.price} disabled={submitting} />
          </div>
          <p className="field__hint">Se já existir um evento seu com o mesmo nome e data, as fotos entram na mesma pasta.</p>
        </section>

        <section className="card" aria-labelledby="up-wm">
          <h2 id="up-wm">3. Marca d’água e publicação</h2>
          <p>Após a publicação, as fotografias serão exibidas no mural.Nesta versão, a aplicação da marca d’água é simulada no navegador.</p>
          <Button type="submit" variant="accent" loading={submitting}>
            {submitting ? 'Publicando fotografias…' : 'Publicar fotografias'}
          </Button>
        </section>
      </form>
    </PageLayout>
  );
}
