import { ReactNode, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Sword, Target, Award, Crown, User, LogOut, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { Button } from '../ui/Button';
import { LevelUpModal } from '../ui/LevelUpModal';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Quests', href: '/app/quests', icon: Target },
  { name: 'Skills', href: '/app/skills', icon: Sword },
  { name: 'Achievements', href: '/app/achievements', icon: Award },
  { name: 'Titles', href: '/app/titles', icon: Crown },
  { name: 'Profile', href: '/app/profile', icon: User },
];

export function DashboardLayout() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { profile, titles, loadProfile, levelUpNotification, hideLevelUp } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && !profile) {
      loadProfile(user.id);
    }
  }, [user, profile, loadProfile]);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your profile...</div>
      </div>
    );
  }

  const activeTitle = titles.find(t => t.id === profile.activeTitleId);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-yellow-500">LifeLeveler</h2>
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-yellow-500/10 text-yellow-500 border-r-2 border-yellow-500'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="${sidebarOpen ? 'flex' : 'hidden'}  lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-yellow-500">LifeLeveler</h2>
          </div>
          <nav className="flex-1 mt-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-yellow-500/10 text-yellow-500 border-r-2 border-yellow-500'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:pl-64">
        {/* Top bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="mr-3"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white">{profile.name}</h1>
                <div className="flex items-center text-sm text-gray-400">
                  <span>Level {profile.level}</span>
                  {profile.bonusStatPoints > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-500">{profile.bonusStatPoints} bonus points</span>
                    </>
                  )}
                  {activeTitle && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-500">{activeTitle.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Level up modal */}
      <LevelUpModal
        show={levelUpNotification.show}
        oldLevel={levelUpNotification.oldLevel}
        newLevel={levelUpNotification.newLevel}
        bonusPointsAwarded={levelUpNotification.bonusPointsAwarded}
        onClose={hideLevelUp}
      />
    </div>
  );
}