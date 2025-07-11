import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      {/* if logged in and you hit "/", jump to /chat */}
      <Route
        path="/"
        element={user ? <Navigate to="/chat" replace /> : <AuthPage />}
      />

      {/* protected chat route */}
      <Route
        path="/chat"
        element={user ? <ChatPage /> : <Navigate to="/" replace />}
      />

      {/* fallback for any other URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
