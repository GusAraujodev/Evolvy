import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeOff, TrendingUp, History,
  Clock, DollarSign, Frown,
  Battery, Heart, Brain,
  Shirt, Zap, Dumbbell,
  Check, Sparkles,
  ChevronLeft,
} from "lucide-react";

type Question = {
  id: string;
  title: string;
  subtitle: string;
  options: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
};

const questions: Question[] = [
  {
    id: "identity",
    title: "Como você descreveria sua relação com o espelho hoje?",
    subtitle: "Não existe resposta errada. Comece pelo que é real.",
    options: [
      { id: "avoid", label: "Evito me olhar", icon: EyeOff },
      { id: "improve", label: "Quero melhorar", icon: TrendingUp },
      { id: "was-better", label: "Já fui melhor", icon: History },
    ],
  },
  {
    id: "obstacle",
    title: "O que mais sabotou sua evolução no último ano?",
    subtitle: "Vamos desenhar um plano que respeita isso.",
    options: [
      { id: "time", label: "Falta de tempo", icon: Clock },
      { id: "cost", label: "Dietas caras", icon: DollarSign },
      { id: "boring", label: "Treinos chatos", icon: Frown },
    ],
  },
  {
    id: "cost",
    title: "Quanto a falta de energia tem impactado sua produtividade e autoestima?",
    subtitle: "Seja honesto. É só entre você e o app.",
    options: [
      { id: "low", label: "Pouco — ainda dou conta", icon: Battery },
      { id: "mid", label: "Bastante — me sinto travado", icon: Brain },
      { id: "high", label: "Muito — está afetando tudo", icon: Heart },
    ],
  },
  {
    id: "desire",
    title: "Em 3 meses, qual seria sua conquista ideal?",
    subtitle: "Sua vitória orienta seu plano.",
    options: [
      { id: "clothes", label: "Roupas servindo melhor", icon: Shirt },
      { id: "energy", label: "Mais disposição", icon: Zap },
      { id: "muscle", label: "Músculos definidos", icon: Dumbbell },
    ],
  },
  {
    id: "commitment",
    title: "Você está pronto para um plano que se adapta à sua vida, sem soluções milagrosas?",
    subtitle: "Aqui não vendemos atalhos. Vendemos consistência.",
    options: [
      { id: "yes", label: "Sim, estou pronto", icon: Check },
      { id: "try", label: "Quero tentar com calma", icon: Sparkles },
    ],
  },
];

export function Onboarding({ onComplete, onBack }: { onComplete: (answers: Record<string, string>) => void; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = questions.length;
  const progress = ((index + 1) / total) * 100;
  const q = questions[index];

  const handleSelect = (value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    setTimeout(() => {
      if (index + 1 >= total) onComplete(next);
      else setIndex(index + 1);
    }, 280);
  };

  const handleBack = () => {
    if (index === 0) onBack();
    else setIndex(index - 1);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-12 pb-10">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-foreground rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="flex-1 flex flex-col mt-12"
        >
          <h2 className="text-[1.75rem] font-extrabold tracking-tight leading-[1.15]">
            {q.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-3">{q.subtitle}</p>

          <div className="flex flex-col gap-3 mt-8">
            {q.options.map((opt, i) => {
              const Icon = opt.icon;
              const selected = answers[q.id] === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => handleSelect(opt.id)}
                  className={`group relative flex items-center gap-4 p-5 rounded-3xl border text-left transition-all active:scale-[0.98] ${
                    selected
                      ? "bg-primary border-primary shadow-glow"
                      : "bg-card border-foreground/8 hover:border-foreground/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selected ? "bg-foreground/10" : "bg-background"}`}>
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <p className="flex-1 font-semibold text-base text-foreground">{opt.label}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
