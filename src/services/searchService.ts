import type { Event, Photo, PublicUser } from '../models';

export interface CatalogData {
  photos: Photo[];
  events: Event[];
  users: PublicUser[];
}

export interface PhotoFilter {
  eventId?: string;
  photographerId?: string;
}

export const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function searchPhotos(data: CatalogData, query: string, filter: PhotoFilter = {}): Photo[] {
  const q = normalize(query);
  return data.photos.filter((photo) => {
    if (filter.eventId && photo.eventId !== filter.eventId) return false;
    if (filter.photographerId && photo.photographerId !== filter.photographerId) return false;
    if (!q) return true;
    const event = data.events.find((e) => e.id === photo.eventId);
    const photographer = data.users.find((u) => u.id === photo.photographerId);
    return normalize([photo.title, event?.name, event?.city, photographer?.name, photographer?.handle].join(' ')).includes(q);
  });
}

export function searchEvents(data: CatalogData, query: string): Event[] {
  const q = normalize(query);
  return data.events.filter((e) => !q || normalize(`${e.name} ${e.city}`).includes(q));
}

export function searchPhotographers(data: CatalogData, query: string): PublicUser[] {
  const q = normalize(query);
  return data.users.filter((u) => u.role === 'photographer' && (!q || normalize(`${u.name} ${u.handle}`).includes(q)));
}
