import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutWrapper from './components/LayoutWrapper';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Roles from './pages/Roles';
import Interview from './pages/Interview';
import Feedback from './pages/Feedback';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Subscription from './pages/Subscription';

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/interview/:role" element={<Interview />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscription" element={<Subscription />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-white/40 mb-6">Page not found</p>
        <a href="/" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
          Go home
        </a>
      </div>
    </div>
  );
}
