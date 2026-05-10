import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ChevronLeft } from "lucide-react";

type PlanId = "basic" | "premium";

const plans: { id: PlanId; name: string; price: string; tagline: string; benefits: string[]; recommended?: boolean }[] = [
  {
    id: "basic",
    name: "Básico",
    price: "R$ 29,90",
    tagline: "Comece com o essencial.",
    benefits: ["Treino base personalizado", "Dieta semanal em PDF", "Lembretes de hidratação"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 59,90",
    tagline: "Treino e dieta que cabem na sua rotina.",
    benefits: [
      "Treinos adaptáveis toda semana",
      "Plano alimentar com substituições",
      "Acompanhamento de evolução real",
      "Suporte prioritário",
    ],
    recommended: true,
  },
];

export function Plans({ onSelect, onSkip, onBack }: { onSelect: (p: PlanId) => void; onSkip: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<PlanId>("premium");

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-12 pb-10">
      <button
        onClick={onBack}
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Voltar"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <h2 className="text-[2rem] font-extrabold tracking-tight leading-[1.1]">
          Escolha o ritmo<br />da sua evolução.
        </h2>
        <p className="text-sm text-muted-foreground mt-3">
          Cancele quando quiser. Sem letras miúdas.
        </p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-4 mt-8">
        {plans.map((p, i) => {
          const isSelected = selected === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              onClick={() => setSelected(p.id)}
              className={`relative text-left rounded-3xl p-6 border-2 transition-all active:scale-[0.99] ${
                isSelected ? "border-foreground bg-card shadow-soft" : "border-foreground/10 bg-card"
              }`}
            >
              {p.recommended && (
                <div className="absolute -top-3 right-5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-glow">
                  <Sparkles className="w-3 h-3" /> Recomendado
                </div>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{p.name}</p>
                  <p className="text-3xl font-extrabold tracking-tight mt-1">
                    {p.price}
                    <span className="text-sm font-medium text-muted-foreground">/mês</span>
                  </p>
                </div>
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "bg-foreground border-foreground" : "border-foreground/20"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-background" />}
                </div>
              </div>
              <p className="text-sm font-medium mt-3">{p.tagline}</p>
              <ul className="mt-4 space-y-2">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={() => onSelect(selected)}
          className="w-full bg-primary text-primary-foreground font-semibold py-5 rounded-full active:scale-[0.98] transition-all shadow-glow"
        >
          Começar agora
        </button>
        <button
          onClick={onSkip}
          className="w-full text-sm font-medium text-muted-foreground underline underline-offset-4 py-2"
        >
          Continuar gratuitamente por enquanto
        </button>
      </div>
    </div>
  );
}
