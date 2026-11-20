
import type { Event, Photo, PhotoComment, PhotoProcessingStatus, PhotoRequest, PublicUser, Notification } from '../models';
import type { Snapshot } from '../services/snapshotService';

export type AppState = Snapshot & {
  comments?: PhotoComment[];
  notifications?: Notification[];
};

export type AppAction =
  | { type: 'SESSION_SET'; userId: string | null }
  | { type: 'USER_UPSERT'; user: PublicUser }
  | { type: 'PHOTOS_PUBLISHED'; event: Event; photos: Photo[] }
  | { type: 'PHOTO_DELETED'; photoId: string; requests: PhotoRequest[] }
  | { type: 'REQUEST_UPSERT'; request: PhotoRequest }
  | { type: 'PHOTO_PROCESSING_UPDATED'; photoId: string; status: PhotoProcessingStatus }
  | { type: 'COMMENT_UPSERT'; comment: PhotoComment }
  | { type: 'NOTIFICATION_UPSERT'; notification: Notification }
  | { type: 'NOTIFICATION_READ'; notificationId: string };

function upsert<T extends { id: string }>(list: T[], item: T, atStart = false): T[] {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : atStart ? [item, ...list] : [...list, item];
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SESSION_SET':
      return { ...state, currentUserId: action.userId };
    case 'USER_UPSERT':
      return { ...state, users: upsert(state.users, action.user) };
    case 'PHOTOS_PUBLISHED':
      return { ...state, events: upsert(state.events, action.event), photos: [...action.photos, ...state.photos] };
    case 'PHOTO_DELETED': {
      const changed = new Map(action.requests.map((r) => [r.id, r]));
      return {
        ...state,
        photos: state.photos.filter((p) => p.id !== action.photoId),
        requests: state.requests.map((r) => changed.get(r.id) ?? r),
        comments: (state.comments ?? []).filter((c) => c.photoId !== action.photoId),
      };
    }
    case 'REQUEST_UPSERT':
      return { ...state, requests: upsert(state.requests, action.request, true) };
    case 'PHOTO_PROCESSING_UPDATED':
      return { ...state, photos: state.photos.map((p) => p.id === action.photoId ? { ...p, processingStatus: action.status } : p) };
    case 'COMMENT_UPSERT':
      return { ...state, comments: upsert(state.comments ?? [], action.comment, true) };
    case 'NOTIFICATION_UPSERT':
      return { ...state, notifications: upsert(state.notifications ?? [], action.notification, true) };
    case 'NOTIFICATION_READ':
      return { ...state, notifications: (state.notifications ?? []).map((n) => n.id === action.notificationId ? { ...n, isRead: true } : n) };
    default:
      return state;
  }
}
