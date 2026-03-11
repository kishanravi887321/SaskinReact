import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Settings, LogOut, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function AuthStatus() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-white/50 mb-8">You're already signed in. Where would you like to go?</p>
            <div className="space-y-3">
              <Link to="/dashboard" className="block">
                <Button className="w-full" size="lg">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
                </Button>
              </Link>
              <Link to="/profile" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  <Settings className="w-4 h-4 mr-2" /> Profile Settings
                </Button>
              </Link>
              <Button variant="ghost" className="w-full" size="lg" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}
