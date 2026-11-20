import type { Database } from '../services/db';
import type { Event, Photo, PhotoRequest, PhotoTone, StoredRequestStatus, User } from '../models';

const users: User[] = [
  { id: 'u-foto', name: 'Foto Runner', handle: '@foto.runner', email: 'foto@tracemark.dev', password: '123456', role: 'photographer', bio: 'Fotografia de corridas em Fortaleza e região.', createdAt: '2026-09-01T10:00:00.000Z', photographerSince: '2026-09-01T10:00:00.000Z' },
  { id: 'u-lucas', name: 'Lucas Pereira', handle: '@lucas.lens', email: 'lucas@tracemark.dev', password: '123456', role: 'photographer', bio: 'Provas de rua no interior do Ceará.', createdAt: '2026-09-05T10:00:00.000Z', photographerSince: '2026-09-05T10:00:00.000Z' },
  { id: 'u-maria', name: 'Maria Silva', handle: '@maria.silva', email: 'maria@tracemark.dev', password: '123456', role: 'runner', createdAt: '2026-09-10T10:00:00.000Z' },
  { id: 'u-joao', name: 'João Costa', handle: '@joao.costa', email: 'joao@tracemark.dev', password: '123456', role: 'runner', createdAt: '2026-09-12T10:00:00.000Z' },
];

const events: Event[] = [
  { id: 'e-fortaleza', name: 'Meia Maratona de Fortaleza', city: 'Fortaleza', date: '2026-11-02', createdBy: 'u-foto' },
  { id: 'e-praia', name: 'Circuito da Praia', city: 'Cumbuco', date: '2026-10-26', createdBy: 'u-foto' },
  { id: 'e-sol', name: 'Corrida do Sol', city: 'Aquiraz', date: '2026-10-19', createdBy: 'u-foto' },
  { id: 'e-russas', name: 'Corrida de Rua de Russas', city: 'Russas', date: '2026-10-11', createdBy: 'u-lucas' },
];

function photo(id: string, eventId: string, photographerId: string, title: string, price: number, tone: PhotoTone): Photo {
  return { id, eventId, photographerId, title, price, tone, processingStatus: 'publishable', createdAt: '2026-11-03T12:00:00.000Z' };
}

const photos: Photo[] = [
  photo('p-1', 'e-fortaleza', 'u-foto', 'Chegada 0412', 18, 'orange'),
  photo('p-2', 'e-fortaleza', 'u-foto', 'Reta final 0188', 18, 'orange'),
  photo('p-3', 'e-fortaleza', 'u-foto', 'Pelotão 0231', 18, 'orange'),
  photo('p-4', 'e-praia', 'u-foto', 'Areia 0071', 15, 'blue'),
  photo('p-5', 'e-praia', 'u-foto', 'Pôr do sol 0102', 15, 'blue'),
  photo('p-6', 'e-sol', 'u-foto', 'Largada 0007', 20, 'yellow'),
  photo('p-7', 'e-sol', 'u-foto', 'Subida 0054', 20, 'yellow'),
  photo('p-8', 'e-russas', 'u-lucas', 'Praça central 0010', 12, 'blue'),
  photo('p-9', 'e-russas', 'u-lucas', 'Chegada 0033', 12, 'orange'),
  photo('p-10', 'e-russas', 'u-lucas', 'Família 0045', 12, 'yellow'),
];

function request(id: string, photoId: string, runnerId: string, status: StoredRequestStatus): PhotoRequest {
  const p = photos.find((x) => x.id === photoId)!;
  const e = events.find((x) => x.id === p.eventId)!;
  const r = users.find((x) => x.id === runnerId)!;
  const f = users.find((x) => x.id === p.photographerId)!;
  return {
    id, photoId, eventId: e.id, runnerId, photographerId: f.id, status,
    photoTitle: p.title, eventName: e.name, eventDate: e.date,
    runnerName: r.name, runnerEmail: r.email, photographerName: f.name,
    createdAt: '2026-11-04T09:00:00.000Z', updatedAt: '2026-11-04T09:00:00.000Z',
  };
}

const requests: PhotoRequest[] = [
  request('r-1', 'p-1', 'u-maria', 'pending'),
  request('r-2', 'p-2', 'u-joao', 'pending'),
  request('r-3', 'p-4', 'u-maria', 'fulfilled'),
  request('r-4', 'p-5', 'u-joao', 'declined'),
  request('r-5', 'p-8', 'u-maria', 'pending'),
];

export function buildSeed(): Database {
  return JSON.parse(JSON.stringify({ users, events, photos, requests })) as Database;
}
