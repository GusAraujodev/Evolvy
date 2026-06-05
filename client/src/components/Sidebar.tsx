import { Home, Dumbbell, Apple, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  userName: string;
  currentPage: 'home' | 'workouts' | 'nutrition' | 'profile';
  onNavigate: (page: 'home' | 'workouts' | 'nutrition' | 'profile') => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'nutrition', label: 'Dieta', icon: Apple },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function Sidebar({ userName, currentPage, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 h-screen bg-background border-r border-border flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-foreground text-background rounded-lg flex items-center justify-center font-black text-lg">
            E
          </div>
          <span className="font-black text-lg">evolvy</span>
          <span className="ml-auto text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-md">
            PRO
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="px-4 py-3 rounded-xl bg-muted">
          <p className="text-xs font-bold text-muted-foreground uppercase">Usuário</p>
          <p className="font-semibold mt-1 truncate">{userName}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
