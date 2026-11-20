import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { Event, Photo, PhotoComment, PhotoProcessingStatus, PhotoRequest, PublicUser, UserRole, Notification } from '../models';
import {
  authService, loadSnapshot, photoService, requestService, uploadService, userService,
} from '../services';
import type { PublishInput } from '../services/uploadService';
import { appReducer, type AppState } from './appReducer';

interface AppContextValue {
  state: AppState;
  currentUser: PublicUser | null;
  usersById: Map<string, PublicUser>;
  eventsById: Map<string, Event>;
  photosById: Map<string, Photo>;
  comments: PhotoComment[];
  notifications: Notification[];
  requestForPhoto: (photoId: string) => PhotoRequest | undefined;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: { name: string; email: string; password: string; confirmPassword: string; role: UserRole }) => Promise<PublicUser>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; bio?: string }) => Promise<void>;
  becomePhotographer: () => Promise<void>;
  publishPhotos: (input: PublishInput) => Promise<{ event: Event; photos: Photo[] }>;
  deletePhoto: (photoId: string) => Promise<void>;
  requestOriginal: (photoId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  respondRequest: (requestId: string, decision: 'fulfilled' | 'declined') => Promise<void>;
  downloadOriginal: (requestId: string) => Promise<{ filename: string; dataUrl: string }>;
  addComment: (photoId: string, content: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  updatePhotoProcessing: (photoId: string, status: PhotoProcessingStatus) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadSnapshot);
  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  const actorId = currentUser?.id ?? '';

  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    dispatch({ type: 'USER_UPSERT', user });
    dispatch({ type: 'SESSION_SET', userId: user.id });
    return user;
  }, []);

  const register = useCallback<AppContextValue['register']>(async (input) => {
    const user = await authService.register(input);
    dispatch({ type: 'USER_UPSERT', user });
    dispatch({ type: 'SESSION_SET', userId: user.id });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: 'SESSION_SET', userId: null });
  }, []);

  const updateProfile = useCallback(async (data: { name: string; bio?: string }) => {
    dispatch({ type: 'USER_UPSERT', user: await userService.updateProfile(actorId, data) });
  }, [actorId]);

  const becomePhotographer = useCallback(async () => {
    dispatch({ type: 'USER_UPSERT', user: await userService.becomePhotographer(actorId) });
  }, [actorId]);

  const publishPhotos = useCallback(async (input: PublishInput) => {
  const result = await uploadService.publishPhotos(actorId, input);
  dispatch({ type: 'PHOTOS_PUBLISHED', ...result });

  const runners = state.users.filter((user) => user.role === 'runner');

  result.photos.forEach((photo) => {
    runners.forEach((runner) => {
      dispatch({
        type: 'NOTIFICATION_UPSERT',
        notification: {
          id: `notification-${photo.id}-${runner.id}`,
          userId: runner.id,
          photoId: photo.id,
          type: 'photo_published',
          message: `Uma nova foto foi publicada no evento ${result.event.name}.`,
          isRead: false,
          createdAt: new Date().toISOString(),},
      });
    });
  });

    return result;
  }, [actorId, state.users]);

  const deletePhoto = useCallback(async (photoId: string) => {
    const result = await photoService.deletePhoto(actorId, photoId);
    dispatch({ type: 'PHOTO_DELETED', ...result });
  }, [actorId]);

  const requestOriginal = useCallback(async (photoId: string) => {
    dispatch({ type: 'REQUEST_UPSERT', request: await requestService.createRequest(actorId, photoId) });
  }, [actorId]);

  const cancelRequest = useCallback(async (requestId: string) => {
    dispatch({ type: 'REQUEST_UPSERT', request: await requestService.cancelRequest(actorId, requestId) });
  }, [actorId]);

  const respondRequest = useCallback(async (requestId: string, decision: 'fulfilled' | 'declined') => {
    dispatch({ type: 'REQUEST_UPSERT', request: await requestService.respondToRequest(actorId, requestId, decision) });
  }, [actorId]);

  const downloadOriginal = useCallback((requestId: string) => photoService.getOriginalForDownload(actorId, requestId), [actorId]);

  const addComment = useCallback((photoId: string, content: string) => {
    if (!actorId || !content.trim()) return;
    const comment: PhotoComment = {
      id: `comment-${Date.now()}`,
      photoId,
      userId: actorId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'COMMENT_UPSERT', comment });
  }, [actorId]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    dispatch({ type: 'NOTIFICATION_READ', notificationId });
  }, []);

  const updatePhotoProcessing = useCallback((photoId: string, status: PhotoProcessingStatus) => {
    dispatch({ type: 'PHOTO_PROCESSING_UPDATED', photoId, status });
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    state,
    currentUser,
    usersById: new Map(state.users.map((u) => [u.id, u])),
    eventsById: new Map(state.events.map((e) => [e.id, e])),
    photosById: new Map(state.photos.map((p) => [p.id, p])),
    comments: state.comments,
    notifications: state.notifications,
    requestForPhoto: (photoId) =>
      state.requests
        .filter((r) => r.photoId === photoId && r.runnerId === state.currentUserId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    login, register, logout, updateProfile, becomePhotographer, publishPhotos, deletePhoto,
    requestOriginal, cancelRequest, respondRequest, downloadOriginal,
    addComment, markNotificationAsRead, updatePhotoProcessing,
  }), [state, currentUser, login, register, logout, updateProfile, becomePhotographer, publishPhotos, deletePhoto, requestOriginal, cancelRequest, respondRequest, downloadOriginal, addComment, markNotificationAsRead, updatePhotoProcessing]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>.');
  return ctx;
}