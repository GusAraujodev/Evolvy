import { motion } from "framer-motion";
import { Droplet, Plus, Minus } from "lucide-react";

// Water tracked in milliliters. Goal = 2500ml (2.5L). Step = 250ml.
export function WaterWidget({ ml, goalMl, onAdd, onRemove }: { ml: number; goalMl: number; onAdd: () => void; onRemove: () => void }) {
  const pct = Math.min(100, (ml / goalMl) * 100);
  const liters = (ml / 1000).toFixed(2).replace(".", ",");
  const goalLiters = (goalMl / 1000).toFixed(1).replace(".", ",");

  return (
    <div className="bg-card rounded-3xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-background flex items-center justify-center">
            <Droplet className="w-4 h-4 text-foreground" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Hidratação</p>
            <p className="text-base font-bold text-foreground tabular-nums">
              {liters}L <span className="text-muted-foreground font-medium">/ {goalLiters}L</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="water-remove-btn"
            onClick={onRemove}
            className="w-9 h-9 rounded-full bg-background flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Remover 250ml"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            id="water-add-btn"
            onClick={onAdd}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform shadow-glow"
            aria-label="Adicionar 250ml"
          >
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
      <div className="relative h-3 bg-background rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.6 }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full opacity-60"
          style={{
            background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.55), transparent)",
          }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.6 }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">+250ml por toque</p>
    </div>
  );
}
