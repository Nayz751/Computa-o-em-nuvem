import { Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';
import { MuralPage } from '../pages/MuralPage';
import { PhotoDetailPage } from '../pages/PhotoDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { InfoPage } from '../pages/InfoPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UploadPage } from '../pages/UploadPage';
import { PublishedFoldersPage } from '../pages/PublishedFoldersPage';
import { FolderDetailPage } from '../pages/FolderDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MuralPage />} />
      <Route path="/foto/:photoId" element={<PhotoDetailPage />} />
      <Route path="/como-funciona" element={<InfoPage kind="how" />} />
      <Route path="/para-fotografos" element={<InfoPage kind="photographers" />} />
      <Route path="/entrar" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/cadastro" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="/admin/enviar" element={<ProtectedRoute role="photographer"><UploadPage /></ProtectedRoute>} />
      <Route path="/admin/fotos" element={<ProtectedRoute role="photographer"><PublishedFoldersPage /></ProtectedRoute>} />
      <Route path="/admin/fotos/:eventId" element={<ProtectedRoute role="photographer"><FolderDetailPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
