import { Home, Dumbbell, Apple, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  currentPage: 'home' | 'workouts' | 'nutrition' | 'profile';
  onNavigate: (page: 'home' | 'workouts' | 'nutrition' | 'profile') => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'nutrition', label: 'Dieta', icon: Apple },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around h-20 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.id as any)}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors"
          >
            <Icon
              className={`w-6 h-6 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <span
              className={`text-[10px] font-semibold transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full"
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
