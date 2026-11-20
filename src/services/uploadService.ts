import type { Event, Photo, PhotoTone } from '../models';
import { ServiceError } from './errors';
import { commit, getDb, newId, wait } from './db';
import { requireRole, requireUser } from './access';
import { applyWatermark } from '../utils/watermark';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
export const MAX_FILES = 30;
export const MAX_FILE_MB = 15;

export interface PublishInput {
  files: File[];
  eventName: string;
  city: string;
  date: string;
  price: number;
}

export const fingerprintOf = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

/** Valida tipo e tamanho; devolve uma lista de mensagens de erro (vazia = ok). */
export function validateFiles(files: File[]): string[] {
  const errors: string[] = [];
  files.forEach((file) => {
    const okType = ACCEPTED_TYPES.includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!okType) errors.push(`"${file.name}": formato inválido. Use JPG, JPEG ou PNG.`);
    else if (file.size > MAX_FILE_MB * 1024 * 1024) errors.push(`"${file.name}": acima de ${MAX_FILE_MB} MB.`);
  });
  if (files.length > MAX_FILES) errors.push(`Envie no máximo ${MAX_FILES} fotos por vez.`);
  return errors;
}

let inFlight = false;
const TONES: PhotoTone[] = ['orange', 'blue', 'yellow'];

export async function publishPhotos(actorId: string, input: PublishInput): Promise<{ event: Event; photos: Photo[] }> {
  if (inFlight) throw new ServiceError('Já existe um envio em andamento.', 'DUPLICATE');
  inFlight = true;
  try {
    await wait(300);
    const actor = requireUser(actorId);
    requireRole(actor, 'photographer', 'Apenas fotógrafos podem publicar fotografias.');
    if (!input.eventName.trim()) throw new ServiceError('Informe o nome do evento.', 'VALIDATION');
    if (!input.city.trim()) throw new ServiceError('Informe a cidade do evento.', 'VALIDATION');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new ServiceError('Informe a data do evento.', 'VALIDATION');
    if (!Number.isFinite(input.price) || input.price < 0) throw new ServiceError('Informe um valor válido.', 'VALIDATION');
    if (input.files.length === 0) throw new ServiceError('Selecione ao menos uma imagem.', 'VALIDATION');
    const fileErrors = validateFiles(input.files);
    if (fileErrors.length) throw new ServiceError(fileErrors.join(' '), 'VALIDATION');

    const db = getDb();
    const name = input.eventName.trim();
    let event = db.events.find(
      (e) => e.createdBy === actor.id && e.date === input.date && e.name.trim().toLowerCase() === name.toLowerCase(),
    );
    const known = new Set(
      db.photos.filter((p) => p.photographerId === actor.id && p.eventId === event?.id).map((p) => p.fingerprint),
    );
    const repeated = input.files.filter((f) => known.has(fingerprintOf(f)));
    if (repeated.length) {
      throw new ServiceError(`Estas imagens já foram publicadas neste evento: ${repeated.map((f) => f.name).join(', ')}.`, 'DUPLICATE');
    }

    const previews: string[] = [];
    for (const file of input.files) {
      try {
        previews.push(await applyWatermark(file));
      } catch (error) {
        throw new ServiceError(error instanceof Error ? error.message : 'Falha ao aplicar a marca d\'água.', 'UNKNOWN');
      }
    }

    if (!event) {
      event = { id: newId('e'), name, city: input.city.trim(), date: input.date, createdBy: actor.id };
      db.events.push(event);
    }
    const now = new Date().toISOString();
    const created: Photo[] = input.files.map((file, index) => ({
      id: newId('p'), eventId: event!.id, photographerId: actor.id,
      title: file.name.replace(/\.[^.]+$/, ''), price: input.price,
      tone: TONES[index % TONES.length], previewUrl: previews[index], processingStatus: 'publishable',
      fingerprint: fingerprintOf(file), createdAt: now,
    }));
    db.photos.unshift(...created);
    commit();
    return { event, photos: created };
  } finally {
    inFlight = false;
  }
}
