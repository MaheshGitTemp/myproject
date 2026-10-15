import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Moderation from './pages/Moderation.jsx';
import Members from './pages/Members.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import Settings from './pages/Settings.jsx';
import AuditLog from './pages/AuditLog.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Admin-guarded area */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:matId" element={<MemberDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="audit" element={<AuditLog />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
