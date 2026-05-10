import { Home, Dumbbell, Apple, User } from "lucide-react";

export type Tab = "home" | "workouts" | "nutrition" | "profile";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "workouts", label: "Treinos", icon: Dumbbell },
  { id: "nutrition", label: "Nutrição", icon: Apple },
  { id: "profile", label: "Perfil", icon: User },
];

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2 pointer-events-none">
      <div className="glass border border-foreground/5 rounded-full px-2 py-2 mx-auto max-w-md flex items-center justify-around shadow-soft pointer-events-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-full transition-all ${
                isActive ? "bg-primary text-primary-foreground shadow-glow" : "text-foreground/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
