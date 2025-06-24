import { ReactNode, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { MobileOptimizedButton } from '../ui/MobileOptimizedButton';
import { LevelUpModal } from '../ui/LevelUpModal';
import { MobileNavigation } from './MobileNavigation';
import { useCapacitor } from '../../hooks/useCapacitor';
import { useState } from 'react';

export function MobileDashboardLayout() {
  const { user, signOut } = useAuthStore();
  const { profile, titles, loadProfile, levelUpNotification, hideLevelUp } = useUserStore();
  const { isNative, platform } = useCapacitor();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    if (user && !profile) {
      loadProfile(user.id);
    }
  }, [user, profile, loadProfile]);

  useEffect(() => {
    // Hide header when keyboard is shown on mobile
    const handleResize = () => {
      if (isNative && window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setShowHeader(heightDiff < 150); // Hide if keyboard is likely open
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, [isNative]);

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
    <div className="min-h-screen bg-gray-900 pb-16 lg:pb-0">
      {/* Mobile Header */}
      {showHeader && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-gray-800 border-b border-gray-700 px-4 py-3 lg:hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-black">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{profile.name}</h1>
                <div className="flex items-center text-sm text-gray-400">
                  <span>Level {profile.level}</span>
                  {profile.bonusStatPoints > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-500">{profile.bonusStatPoints} points</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <MobileOptimizedButton variant="secondary" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </MobileOptimizedButton>
          </div>
          
          {activeTitle && (
            <div className="mt-2 text-center">
              <span className="inline-block px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full text-purple-400 text-sm font-medium">
                {activeTitle.name}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Desktop Layout (unchanged) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col lg:w-64 lg:bg-gray-800 lg:border-r lg:border-gray-700 lg:z-50">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-500">LifeLeveler</h2>
        </div>
        {/* Desktop navigation would go here */}
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:pl-64">
        {/* Desktop top bar */}
        <div className="hidden lg:block bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
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
            <MobileOptimizedButton variant="secondary" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </MobileOptimizedButton>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Level up modal */}
      <LevelUpModal
        show={levelUpNotification.show}
        oldLevel={levelUpNotification.oldLevel}
        newLevel={levelUpNotification.newLevel}
        bonusPointsAwarded={levelUpNotification.bonusPointsAwarded}
        onClose={hideLevelUp}
      />

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-black/80 text-white text-xs p-2 z-50">
          Platform: {platform} | Native: {isNative ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}