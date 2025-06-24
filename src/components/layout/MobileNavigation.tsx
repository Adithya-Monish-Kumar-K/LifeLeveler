import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Sword, Award, Crown, User } from 'lucide-react';
import { useCapacitor } from '../../hooks/useCapacitor';
import { ImpactStyle } from '@capacitor/haptics';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Quests', href: '/app/quests', icon: Target },
  { name: 'Skills', href: '/app/skills', icon: Sword },
  { name: 'Achievements', href: '/app/achievements', icon: Award },
  { name: 'Titles', href: '/app/titles', icon: Crown },
  { name: 'Profile', href: '/app/profile', icon: User },
];

export function MobileNavigation() {
  const location = useLocation();
  const { triggerHaptic, isNative } = useCapacitor();

  const handleNavClick = async () => {
    if (isNative) {
      await triggerHaptic(ImpactStyle.Light);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 lg:hidden z-50">
      <div className="grid grid-cols-6 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? 'text-yellow-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}