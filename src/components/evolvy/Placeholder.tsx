import { motion } from "framer-motion";

export function PlaceholderScreen({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-dvh pb-32 px-6 pt-14"
    >
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>

      <div className="mt-10 rounded-3xl bg-card p-10 flex flex-col items-center text-center shadow-soft">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow mb-4">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="font-bold text-foreground">Em breve</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Estamos preparando essa área com tudo que você precisa.
        </p>
      </div>
    </motion.div>
  );
}
