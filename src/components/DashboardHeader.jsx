import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Search, Bell, LogOut, User, Settings,
  Menu, X, LayoutDashboard, Target, BarChart3, UserCircle,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from './ui/DropdownMenu';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { normalizeUserData, getDisplayName, getUserInitials, getProfileImage } from '../lib/userUtils';
import { useMobile } from '../hooks/useMobile';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Practice', to: '/roles', icon: Target },
  { label: 'Insights', to: '/insights', icon: BarChart3 },
  { label: 'Profile', to: '/profile', icon: UserCircle },
];

const notifications = [
  { id: 1, text: 'New interview feedback available', time: '2 min ago', unread: true },
  { id: 2, text: 'Your weekly report is ready', time: '1 hour ago', unread: true },
  { id: 3, text: 'Achievement unlocked: Consistency!', time: '3 hours ago', unread: false },
];

export default function DashboardHeader() {
  const { logout } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const normalized = user ? normalizeUserData(user) : null;
  const displayName = normalized ? getDisplayName(normalized) : 'User';
  const initials = normalized ? getUserInitials(normalized) : 'U';
  const image = user ? getProfileImage(user) : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Sak<span className="text-emerald-400">Sin</span>
              </span>
            </Link>

            {!isMobile && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              {({ isOpen, toggle }) => (
                <>
                  <DropdownTrigger onClick={toggle} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-white/60" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                  </DropdownTrigger>
                  <DropdownContent isOpen={isOpen} className="w-80">
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white">Notifications</p>
                    </div>
                    {notifications.map((n) => (
                      <DropdownItem key={n.id}>
                        <div className="flex-1">
                          <p className={`text-sm ${n.unread ? 'text-white' : 'text-white/60'}`}>{n.text}</p>
                          <p className="text-xs text-white/40 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </>
              )}
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              {({ isOpen, toggle }) => (
                <>
                  <DropdownTrigger onClick={toggle} className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={image} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium text-white/80">{displayName}</span>
                  </DropdownTrigger>
                  <DropdownContent isOpen={isOpen}>
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white">{displayName}</p>
                      <p className="text-xs text-white/40">{normalized?.email}</p>
                    </div>
                    <DropdownItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4" /> Profile
                    </DropdownItem>
                    <DropdownItem onClick={() => navigate('/subscription')}>
                      <Settings className="w-4 h-4" /> Settings
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem onClick={handleLogout} destructive>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownItem>
                  </DropdownContent>
                </>
              )}
            </DropdownMenu>

            <button
              className="md:hidden text-white/70 hover:text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
