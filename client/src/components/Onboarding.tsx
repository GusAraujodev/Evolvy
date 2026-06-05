import { useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Zap,
  Heart,
  Flame,
  Target,
  Check,
  Calendar,
  Dumbbell,
  Loader2,
  Home,
  Sun,
  Leaf,
  AlertTriangle,
  Apple,
  Coffee,
  Moon,
  Droplets,
  UtensilsCrossed,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Question = {
  id: string;
  title: string;
  subtitle: string;
  options: { id: string; label: string; icon: ComponentType<{ className?: string }> }[];
};

const questions: Question[] = [
  {
    id: 'goal',
    title: 'Qual é o seu objetivo principal?',
    subtitle: 'Isso define toda a estrutura do seu plano.',
    options: [
      { id: 'hipertrofia', label: 'Ganhar massa muscular', icon: Dumbbell },
      { id: 'emagrecimento', label: 'Perder gordura e definir', icon: Flame },
      { id: 'saude', label: 'Melhorar saúde e disposição', icon: Heart },
      { id: 'performance', label: 'Melhorar performance esportiva', icon: Target },
    ],
  },
  {
    id: 'training_location',
    title: 'Onde você vai treinar?',
    subtitle: 'Montamos o treino com os equipamentos que você tem.',
    options: [
      { id: 'academia', label: 'Academia completa', icon: Dumbbell },
      { id: 'casa_com_peso', label: 'Em casa com halteres/barras', icon: Home },
      { id: 'casa_sem_peso', label: 'Em casa só com peso do corpo', icon: Zap },
      { id: 'ar_livre', label: 'Ao ar livre / parque', icon: Sun },
    ],
  },
  {
    id: 'training_days',
    title: 'Quantos dias por semana você consegue treinar?',
    subtitle: 'Seja honesto — um plano realista gera mais resultado.',
    options: [
      { id: '2', label: '2 dias por semana', icon: Calendar },
      { id: '3', label: '3 dias por semana', icon: Calendar },
      { id: '4', label: '4 dias por semana', icon: Calendar },
      { id: '5', label: '5 ou mais dias', icon: Calendar },
    ],
  },
  {
    id: 'training_experience',
    title: 'Qual é o seu nível de experiência com treino?',
    subtitle: 'Isso define a intensidade e complexidade dos exercícios.',
    options: [
      { id: 'iniciante', label: 'Iniciante — nunca treinei ou parei há muito tempo', icon: Sparkles },
      { id: 'intermediario', label: 'Intermediário — treino há alguns meses', icon: TrendingUp },
      { id: 'avancado', label: 'Avançado — treino há mais de 1 ano consistente', icon: Flame },
    ],
  },
  {
    id: 'injury',
    title: 'Tem alguma limitação física ou lesão?',
    subtitle: 'Garante que nenhum exercício vai te machucar.',
    options: [
      { id: 'nenhuma', label: 'Não, estou bem fisicamente', icon: Check },
      { id: 'joelho', label: 'Problema nos joelhos', icon: AlertTriangle },
      { id: 'lombar', label: 'Dor lombar / coluna', icon: AlertTriangle },
      { id: 'ombro', label: 'Problema no ombro', icon: AlertTriangle },
    ],
  },
  {
    id: 'meals_per_day',
    title: 'Quantas refeições você faz por dia hoje?',
    subtitle: 'Vamos adaptar a dieta à sua rotina atual.',
    options: [
      { id: '2', label: '2 refeições (jejum intermitente)', icon: Moon },
      { id: '3', label: '3 refeições principais', icon: UtensilsCrossed },
      { id: '4', label: '4 refeições com lanches', icon: Apple },
      { id: '5', label: '5 ou mais refeições', icon: Coffee },
    ],
  },
  {
    id: 'diet_restriction',
    title: 'Tem alguma restrição alimentar?',
    subtitle: 'A dieta é feita para o que você pode e gosta de comer.',
    options: [
      { id: 'nenhuma', label: 'Nenhuma — como de tudo', icon: Check },
      { id: 'vegetariano', label: 'Sou vegetariano', icon: Leaf },
      { id: 'vegano', label: 'Sou vegano', icon: Leaf },
      { id: 'sem_lactose_gluten', label: 'Intolerância a lactose ou glúten', icon: AlertTriangle },
    ],
  },
  {
    id: 'breakfast_preference',
    title: 'Como é o seu café da manhã ideal?',
    subtitle: 'Sua dieta vai respeitar suas preferências reais.',
    options: [
      { id: 'completo', label: 'Completo — ovos, pão, fruta', icon: UtensilsCrossed },
      { id: 'rapido', label: 'Rápido — vitamina ou iogurte', icon: Zap },
      { id: 'jejum', label: 'Pulo o café da manhã', icon: Moon },
    ],
  },
  {
    id: 'dinner_preference',
    title: 'Como prefere seu jantar?',
    subtitle: 'Sem forçar hábitos que não cabem na sua vida.',
    options: [
      { id: 'completo', label: 'Refeição completa — arroz, proteína, legumes', icon: UtensilsCrossed },
      { id: 'leve', label: 'Leve — omelete, salada, lanche', icon: Apple },
      { id: 'substituto', label: 'Substituto — shake ou vitamina', icon: Coffee },
      { id: 'nao_janto', label: 'Geralmente não janto', icon: Moon },
    ],
  },
  {
    id: 'water_intake',
    title: 'Quantos copos de água você bebe por dia?',
    subtitle: 'Hidratação afeta muito a performance e o resultado.',
    options: [
      { id: 'pouco', label: 'Menos de 4 copos — preciso melhorar', icon: Droplets },
      { id: 'medio', label: 'Entre 4 e 7 copos', icon: Droplets },
      { id: 'bom', label: 'Mais de 8 copos — bebo bastante', icon: Droplets },
    ],
  },
  {
    id: 'sleep_quality',
    title: 'Como está sua qualidade de sono?',
    subtitle: 'Sono é parte fundamental da recuperação muscular.',
    options: [
      { id: 'ruim', label: 'Ruim — durmo pouco ou mal', icon: Moon },
      { id: 'regular', label: 'Regular — às vezes bem, às vezes mal', icon: Moon },
      { id: 'bom', label: 'Bom — durmo 7h+ sem problema', icon: Check },
    ],
  },
  {
    id: 'commitment',
    title: 'Você está pronto para se comprometer?',
    subtitle: 'Aqui não vendemos milagres. Vendemos resultados reais.',
    options: [
      { id: 'sim', label: 'Sim, estou 100% comprometido', icon: Check },
      { id: 'quase', label: 'Quero começar com calma e evoluir', icon: TrendingUp },
    ],
  },
];

export function Onboarding({
  onComplete,
  onBack,
}: {
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const total = questions.length;
  const progress = ((index + 1) / total) * 100;
  const q = questions[index];

  const handleSelect = async (value: string) => {
    if (saving) return;

    const next = { ...answers, [q.id]: value };
    setAnswers(next);

    if (index + 1 >= total) {
      setSaving(true);

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Usuário não autenticado:', authError);
          onComplete(next);
          return;
        }

        console.log('Salvando anamnese para usuário:', user.id);

        const anamneseData = {
          user_id: user.id,
          objetivo: next.goal ?? null,
          local_treino: next.training_location ?? null,
          dias_por_semana: next.training_days ? parseInt(next.training_days) : null,
          historico_treino: next.training_experience ?? null,
          lesoes_ativas: (next.injury && next.injury !== 'nenhuma') ? [next.injury] : [],
          refeicoes_por_dia: next.meals_per_day ? parseInt(next.meals_per_day) : null,
          restricoes_alimentares: (next.diet_restriction && next.diet_restriction !== 'nenhuma') ? [next.diet_restriction] : [],
          preferencia_jantar: next.dinner_preference ?? null,
          ingestao_agua: next.water_intake ?? null,
          qualidade_sono: next.sleep_quality ?? null,
          nivel_estresse: next.commitment ?? null,
          status: 'pending_ai',
        };

        console.log('Dados da anamnese:', anamneseData);

        const { data: insertedAnamnese, error: insertError } = await supabase
          .from('anamneses')
          .insert(anamneseData)
          .select('id')
          .single();

        if (insertError) {
          console.error('ERRO ao inserir anamnese:', insertError);
          onComplete(next);
          return;
        }

        console.log('✅ Anamnese salva! ID:', insertedAnamnese.id);

        const { error: invokeError } = await supabase.functions.invoke('generate-plan', {
          body: { anamnese_id: insertedAnamnese.id, user_id: user.id },
        });

        if (invokeError) {
          console.error('ERRO ao invocar Edge Function:', invokeError);
        } else {
          console.log('✅ Plano sendo gerado pela IA...');
        }

        onComplete(next);
      } finally {
        setSaving(false);
      }
      return;
    }

    setTimeout(() => {
      setIndex((current) => current + 1);
    }, 300);
  };

  const handleBack = () => {
    if (index === 0) onBack();
    else setIndex(index - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 pt-8 sm:pt-12 pb-10">
      {/* Header com progresso */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted active:scale-90 transition-all"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
          {index + 1}/{total}
        </span>
      </div>

      {/* Conteúdo da pergunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {q.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">{q.subtitle}</p>

          {/* Opções */}
          <div className="flex flex-col gap-3 mt-8 sm:mt-10">
            {q.options.map((opt, i) => {
              const Icon = opt.icon;
              const selected = answers[q.id] === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleSelect(opt.id)}
                  disabled={saving}
                  className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-left transition-all active:scale-[0.98] ${
                    selected
                      ? 'bg-primary border-primary shadow-glow'
                      : 'bg-card border-foreground/8 hover:border-foreground/20 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected ? 'bg-foreground/10' : 'bg-background'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  </div>
                  <p className="flex-1 font-semibold text-base sm:text-lg text-foreground">
                    {opt.label}
                  </p>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0"
                    >
                      {saving && index + 1 >= total ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
