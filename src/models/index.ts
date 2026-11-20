/** MODEL — tipos e estruturas de dados do TraceMark. */

export type UserRole = 'runner' | 'photographer';

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  /** Apenas para o mock local. Uma API real nunca deve devolver senhas. */
  password: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
  photographerSince?: string;
}

export type PublicUser = Omit<User, 'password'>;

export interface Event {
  id: string;
  name: string;
  city: string;
  /** yyyy-mm-dd */
  date: string;
  createdBy: string;
}

export type PhotoTone = 'orange' | 'blue' | 'yellow';

export type PhotoProcessingStatus =
  | 'processing'
  | 'publishable'
  | 'error';

export const PHOTO_PROCESSING_STATUS_LABEL: Record<PhotoProcessingStatus, string> = {
  processing: 'Em processamento',
  publishable: 'Publicável',
  error: 'Erro',
};


export interface Photo {
  id: string;
  eventId: string;
  photographerId: string;
  title: string;
  price: number;
  tone: PhotoTone;
  /** Prévia com marca d'água, exibida no mural. */
  previewUrl?: string;
  /** URL protegida da imagem original, fornecida pela API mediante autorização. */
  originalUrl?: string;
  processingStatus?: PhotoProcessingStatus;
  fingerprint?: string;
  createdAt: string;
}


export type RequestStatus = 'not_requested' | 'pending' | 'fulfilled' | 'declined' | 'cancelled';
export type StoredRequestStatus = Exclude<RequestStatus, 'not_requested'>;

export interface PhotoRequest {
  id: string;
  photoId: string;
  eventId: string;
  runnerId: string;
  photographerId: string;
  status: StoredRequestStatus;
  /** Dados copiados no momento da solicitação, para preservar o histórico. */
  photoTitle: string;
  eventName: string;
  eventDate: string;
  runnerName: string;
  runnerEmail: string;
  photographerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoComment {
  id: string;
  photoId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export type NotificationType = 'photo_published';

export interface Notification {
  id: string;
  userId: string;
  photoId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalPhotos: number;
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
}

export type SearchScope = 'photos' | 'events' | 'photographers';

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  not_requested: 'Não solicitada',
  pending: 'Pendente',
  fulfilled: 'Atendida',
  declined: 'Recusada',
  cancelled: 'Cancelada',
};
