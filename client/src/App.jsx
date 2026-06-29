import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Board          from './pages/Board';
import ProtectedRoute from './components/UI/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/"         element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/board/:roomId" element={
          <ProtectedRoute><Board /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}