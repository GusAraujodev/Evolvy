import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Moon, Check, Dumbbell, Sparkles, Flame, MessageCircle } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { WaterWidget } from "./WaterWidget";

const WATER_GOAL_ML = 2500;
const WATER_STEP_ML = 250;
const SUPPORT_WHATSAPP = "5500000000000"; // TODO: replace with real number
const SUPPORT_MSG = encodeURIComponent("Olá! Sou usuário Evolvy e gostaria de falar com um especialista.");

type Meal = { id: string; key: "breakfast" | "lunch" | "dinner"; label: string; time: string; icon: React.ComponentType<{ className?: string }> };

const meals: Meal[] = [
  { id: "m1", key: "breakfast", label: "Café da manhã", time: "07:30", icon: Coffee },
  { id: "m2", key: "lunch", label: "Almoço", time: "12:30", icon: UtensilsCrossed },
  { id: "m3", key: "dinner", label: "Jantar", time: "19:30", icon: Moon },
];

export function HomeScreen({ name }: { name: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [waterMl, setWaterMl] = useState(750);
  const [workoutDone, setWorkoutDone] = useState(false);

  const today = new Date();
  const isRestDay = today.getDay() === 0; // sunday = rest

  const progress = useMemo(() => {
    const mealPts = Object.values(checked).filter(Boolean).length * 20;
    const waterPts = (waterMl / WATER_GOAL_ML) * 30;
    const workoutPts = isRestDay ? 10 : workoutDone ? 10 : 0;
    return Math.min(100, mealPts + waterPts + workoutPts);
  }, [checked, waterMl, workoutDone, isRestDay]);

  const greeting = useMemo(() => {
    const h = today.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const dateLabel = today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-dvh pb-32">
      {/* header */}
      <header className="px-6 pt-14 pb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground capitalize">{dateLabel}</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">
            {greeting},<br />
            <span className="text-primary">{name || "amigo"}</span>
          </h1>
        </div>
        <ProgressRing progress={progress} size={72} />
      </header>

      <div className="px-6 space-y-6">
        {/* Workout card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold tracking-tight">Treino do dia</h2>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>

          {isRestDay ? (
            <div className="rounded-3xl bg-card border border-foreground/8 p-6 shadow-soft">
              <Moon className="w-6 h-6 text-foreground mb-3" />
              <p className="text-lg font-extrabold tracking-tight leading-tight text-foreground">
                O descanso faz parte da evolução.
              </p>
              <p className="text-sm text-muted-foreground mt-2">Seu corpo está se reconstruindo.</p>
            </div>
          ) : (
            <button
              onClick={() => setWorkoutDone((v) => !v)}
              className="w-full text-left bg-primary text-primary-foreground rounded-3xl p-6 shadow-glow active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Push Day</p>
                  <h3 className="text-2xl font-extrabold mt-1 leading-tight">Peito, ombro e tríceps</h3>
                  <div className="flex items-center gap-4 mt-4 text-sm font-semibold">
                    <span className="flex items-center gap-1.5"><Dumbbell className="w-4 h-4" /> 8 exercícios</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-4 h-4" /> ~45 min</span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${workoutDone ? "bg-foreground text-primary" : "bg-foreground/10"}`}>
                  {workoutDone ? <Check className="w-5 h-5" /> : <span className="text-xl font-bold">→</span>}
                </div>
              </div>
            </button>
          )}
        </motion.section>

        {/* Routine */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold tracking-tight mb-3">Sua rotina</h2>
          <div className="space-y-3">
            {meals.map((m) => {
              const Icon = m.icon;
              const done = !!checked[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => setChecked((p) => ({ ...p, [m.id]: !p[m.id] }))}
                  className="w-full bg-card rounded-3xl p-4 flex items-center gap-4 shadow-soft active:scale-[0.99] transition-transform"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.time} · ~520 kcal</p>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? "bg-primary border-primary shadow-glow" : "border-foreground/15"
                    }`}
                  >
                    {done && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Water */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <WaterWidget
            ml={waterMl}
            goalMl={WATER_GOAL_ML}
            onAdd={() => setWaterMl((m) => Math.min(WATER_GOAL_ML, m + WATER_STEP_ML))}
            onRemove={() => setWaterMl((m) => Math.max(0, m - WATER_STEP_ML))}
          />
        </motion.section>

        {/* Support */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${SUPPORT_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-3xl p-5 bg-foreground text-background shadow-soft active:scale-[0.99] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow shrink-0">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Suporte personalizado</p>
              <p className="text-sm font-semibold mt-1 leading-snug">
                Dúvidas no treino ou dieta? Fale com nossos especialistas agora.
              </p>
            </div>
          </a>
        </motion.section>
      </div>
    </div>
  );
}
