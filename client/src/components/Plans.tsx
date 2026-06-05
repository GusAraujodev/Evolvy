import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, Zap, ArrowRight } from 'lucide-react';

type PlanId = 'essential' | 'premium';

const plans: {
  id: PlanId;
  name: string;
  price: string;
  badge?: string;
  benefits: string[];
  recommended?: boolean;
  cta: string;
}[] = [
  {
    id: 'essential',
    name: 'Plano Essencial',
    price: 'R$ 29,90',
    benefits: [
      'Cronograma de treino por IA',
      'Sugestão de macronutrientes',
      'Acesso completo ao esqueleto web',
    ],
    cta: 'Quero o Essencial',
  },
  {
    id: 'premium',
    name: 'Evolvy Premium',
    price: 'R$ 59,90',
    badge: 'IA + VALIDAÇÃO HUMANA',
    benefits: [
      'Treino validado por Personal Trainer',
      'Dieta ajustada por Nutricionista',
      'Plano dinâmico adaptável por IA',
      'Chat in-app direto com especialistas',
    ],
    recommended: true,
    cta: 'Garantir Vaga no Premium',
  },
];

export function Plans({
  onSelect,
  onSkip,
  onBack,
}: {
  onSelect: (p: PlanId) => void;
  onSkip: () => void;
  onBack?: () => void;
}) {
  const [selected, setSelected] = useState<PlanId>('premium');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center font-black text-sm">
              E
            </div>
            <span className="font-black hidden sm:inline">evolvy</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container py-8 sm:py-12 max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
            Painel do Usuário &gt; Planos
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Escolha seu caminho de evolução
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Selecione o plano ideal para seus objetivos. Cancele ou altere quando quiser.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {plans.map((p, i) => {
            const isSelected = selected === p.id;
            const isPremium = p.id === 'premium';

            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(p.id)}
                className={`relative text-left rounded-3xl p-8 sm:p-10 transition-all active:scale-[0.98] ${
                  isPremium
                    ? 'bg-card border-2 border-primary shadow-glow hover:shadow-lg dark:bg-card dark:border-primary'
                    : 'bg-card border-2 border-border hover:border-foreground/20 hover:shadow-md dark:bg-card dark:border-foreground/20'
                }`}
              >
                {/* Badge */}
                {p.badge && (
                  <div className="absolute -top-4 left-8 bg-foreground text-background text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-lg">
                    {p.badge}
                  </div>
                )}

                {/* Plan Name & Price */}
                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                    isPremium ? 'text-foreground/60' : 'text-muted-foreground'
                  }`}>
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                      isPremium ? 'text-foreground' : 'text-foreground'
                    }`}>
                      {p.price}
                    </span>
                    <span className={`text-sm font-medium ${
                      isPremium ? 'text-foreground/60' : 'text-muted-foreground'
                    }`}>
                      / mês
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className={`h-px mb-6 ${
                  isPremium ? 'bg-primary/20' : 'bg-border'
                }`} />

                {/* Benefits */}
                <ul className="space-y-4 mb-8">
                  {p.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        isPremium
                          ? 'bg-primary/20 border border-primary/40'
                          : 'bg-foreground/5 border border-foreground/10'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          isPremium ? 'text-foreground' : 'text-foreground'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium leading-relaxed ${
                        isPremium ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div
                  className={`w-full py-4 sm:py-5 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isPremium
                      ? 'bg-primary text-primary-foreground hover:shadow-glow shadow-glow'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {p.cta}
                  {isPremium && <ArrowRight className="w-4 h-4" />}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selectedPlan"
                    className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Secondary CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onSkip}
          className="w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 py-3"
        >
          Continuar gratuitamente por enquanto
        </motion.button>
      </main>

      {/* Mobile Bottom Padding */}
      <div className="h-8 lg:h-0" />
    </div>
  );
}
