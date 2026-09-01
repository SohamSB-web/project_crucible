import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import FixedBackground from './components/background/MoltenMetal';
import CustomCursor from './components/cursor/CustomCursor.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CursorProvider } from './context/CursorContext.jsx';
import { LenisProvider } from './context/LenisContext.jsx';
import Landing from './screens/Landing/Landing';
import Login from './screens/Login/Login';
import Register from './screens/Register/Register';
import AdminDashboard from './screens/AdminDashboard/AdminDashboard';
import UserDashboard from './screens/UserDashboard/UserDashboard';
import './styles/tokens.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(auth.role)) return <Navigate to="/login" replace />;

  return children;
}

function AppShell() {
  return (
    <>
      <FixedBackground
        color1="#0A0E17"
        color2="#2D5BFF"
        color3="#E8EEFF"
        speed={0.25}
        scale={5}
        detail={4}
        glow={1.4}
        coreSize={0.08}
        swirl={0.8}
        fold={-0.18}
        blackPoint={0.08}
        brightness={1.1}
        colorMode="molten"
        grain={true}
        grainIntensity={0.04}
        mouseInteraction={true}
        mouseStrength={0.18}
        opacity={0.85}
      />
      <CustomCursor />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<div className="container auth-shell"><div className="glass-panel"><h1>Reset flow pending</h1><p>Mock flow for future backend integration.</p></div></div>} />
          <Route path="/dashboard/user" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin', 'judge']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LenisProvider>
        <CursorProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </CursorProvider>
      </LenisProvider>
    </AuthProvider>
  );
}
