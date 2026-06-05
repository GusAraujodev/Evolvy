import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coffee,
  UtensilsCrossed,
  Moon,
  Check,
  Dumbbell,
  Sparkles,
  Flame,
  MessageCircle,
  Droplets,
  Plus,
  Minus,
  Moon as MoonIcon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Workouts } from './Workouts';
import { Nutrition } from './Nutrition';
import { Profile } from './Profile';
import { supabase } from '@/lib/supabase';

const WATER_GOAL_ML = 2500;
const WATER_STEP_ML = 250;

type Meal = {
  id: string;
  key: 'breakfast' | 'lunch' | 'dinner';
  label: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
};

const meals: Meal[] = [
  { id: 'm1', key: 'breakfast', label: 'Café da manhã', time: '07:30', icon: Coffee },
  { id: 'm2', key: 'lunch', label: 'Almoço', time: '12:30', icon: UtensilsCrossed },
  { id: 'm3', key: 'dinner', label: 'Jantar', time: '19:30', icon: Moon },
];

import { ProfileData } from './DataCapture';

export function Dashboard({ profile, onLogout }: { profile: ProfileData; onLogout: () => void }) {
  const [realName, setRealName] = useState('');
  const [planStatus, setPlanStatus] = useState<'loading' | 'pending' | 'ready'>('loading');
  const [workoutToday, setWorkoutToday] = useState<string>('');
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [waterMl, setWaterMl] = useState(750);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'workouts' | 'nutrition' | 'profile'>('home');
  const { theme, setTheme, isDark } = useTheme();
  const deviceType = useDeviceType();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profiles').select('name').eq('id', user.id).single();
      if (prof?.name) setRealName(prof.name);

      const { data: plans } = await supabase
        .from('plans')
        .select('type, content, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!plans || plans.length === 0) {
        setPlanStatus('pending');
        return;
      }

      const approved = plans.filter((p) => p.status === 'approved');
      const workout = (approved.length > 0 ? approved : plans).find((p) => p.type === 'workout');
      const nutrition = (approved.length > 0 ? approved : plans).find((p) => p.type === 'nutrition');

      if (workout) {
        setWorkoutPlan(workout.content);
        if (workout.content?.semana) {
          const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
          const todayIdx = new Date().getDay();
          const todayWorkout = workout.content.semana[todayIdx % workout.content.semana.length];
          if (todayWorkout?.tipo === 'treino') {
            setWorkoutToday(todayWorkout.foco);
          }
        }
      }

      if (nutrition) setNutritionPlan(nutrition.content);
      setPlanStatus(approved.length > 0 ? 'ready' : 'pending');

      // Carregar checkin de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: checkin } = await supabase
        .from('daily_checkins')
        .select('water_ml, meals_done, workout_done')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (checkin?.water_ml) setWaterMl(checkin.water_ml);
      if (checkin?.workout_done) setWorkoutDone(checkin.workout_done);
      if (checkin?.meals_done) {
        const obj: Record<string, boolean> = {};
        checkin.meals_done.forEach((id: string) => {
          obj[id] = true;
        });
        setChecked(obj);
      }
    };

    load();
  }, []);

  const saveCheckin = async (
    newWater: number,
    newChecked: Record<string, boolean>,
    newWorkoutDone: boolean
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_checkins').upsert(
      {
        user_id: user.id,
        date: today,
        water_ml: newWater,
        meals_done: Object.keys(newChecked).filter((k) => newChecked[k]),
        workout_done: newWorkoutDone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    );
  };

  const handleWaterAdd = () => {
    const newVal = Math.min(waterMl + WATER_STEP_ML, WATER_GOAL_ML);
    setWaterMl(newVal);
    saveCheckin(newVal, checked, workoutDone);
  };

  const handleWaterRemove = () => {
    const newVal = Math.max(0, waterMl - WATER_STEP_ML);
    setWaterMl(newVal);
    saveCheckin(newVal, checked, workoutDone);
  };

  const toggleMeal = (id: string) => {
    const newChecked = { ...checked, [id]: !checked[id] };
    setChecked(newChecked);
    saveCheckin(waterMl, newChecked, workoutDone);
  };

  const toggleWorkout = () => {
    const newWorkoutDone = !workoutDone;
    setWorkoutDone(newWorkoutDone);
    saveCheckin(waterMl, checked, newWorkoutDone);
  };

  const today = new Date();
  const isRestDay = today.getDay() === 0;

  const progress = useMemo(() => {
    const mealPts = Object.values(checked).filter(Boolean).length * 20;
    const waterPts = (waterMl / WATER_GOAL_ML) * 30;
    const workoutPts = isRestDay ? 10 : workoutDone ? 10 : 0;
    return Math.min(100, mealPts + waterPts + workoutPts);
  }, [checked, waterMl, workoutDone, isRestDay]);

  const greeting = useMemo(() => {
    const h = today.getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const dateLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const waterPercent = Math.min(100, (waterMl / WATER_GOAL_ML) * 100);

  // Renderizar Workouts
  if (currentPage === 'workouts') {
    return (
      <>
        <Workouts onBack={() => setCurrentPage('home')} />
        {deviceType === 'mobile' && <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />}
      </>
    );
  }

  // Renderizar Nutrition
  if (currentPage === 'nutrition') {
    return (
      <>
        <Nutrition onBack={() => setCurrentPage('home')} />
        {deviceType === 'mobile' && <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />}
      </>
    );
  }

  // Renderizar Profile
  if (currentPage === 'profile') {
    return (
      <>
        <Profile profile={profile} onBack={() => setCurrentPage('home')} onLogout={onLogout} />
        {deviceType === 'mobile' && <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />}
      </>
    );
  }

  // Renderizar apenas a Home por enquanto
  if (currentPage !== 'home') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Esta seção está em desenvolvimento</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Voltar para Home
          </button>
        </div>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar - Desktop Only */}
      <Sidebar
        userName={profile.name}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center font-black text-sm">
                E
              </div>
              <span className="font-black">evolvy</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Alternar tema"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {planStatus === 'pending' && (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Seu plano está sendo preparado</p>
              <p className="text-xs text-muted-foreground mt-0.5">Em breve você receberá treino e nutrição personalizados.</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 container py-8 md:py-12 max-w-5xl pb-24 lg:pb-8">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-12"
          >
            <p className="text-xs font-medium text-muted-foreground capitalize">{dateLabel}</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2">
              {greeting},
              <br />
              <span className="text-primary">{realName || profile.name || 'amigo'}</span>
            </h1>
          </motion.div>

          <div className="space-y-6">
            {/* Treino do dia */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Treino do dia</h2>
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              </div>

              {isRestDay ? (
                <div className="rounded-2xl md:rounded-3xl bg-card border-2 border-foreground/8 p-6 md:p-8 shadow-soft">
                  <Moon className="w-8 h-8 text-foreground mb-4" />
                  <p className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground">
                    O descanso faz parte da evolução.
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground mt-3">
                    Seu corpo está se reconstruindo. Aproveite para descansar e se recuperar.
                  </p>
                </div>
              ) : (
                <button
                  onClick={toggleWorkout}
                  className="w-full text-left bg-primary text-primary-foreground rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-glow active:scale-[0.99] transition-transform hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Push Day</p>
                      <h3 className="text-2xl md:text-3xl font-black mt-2 leading-tight">
                        Peito, ombro e tríceps
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="w-4 h-4" /> 8 exercícios
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4" /> ~45 min
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        workoutDone ? 'bg-foreground text-primary' : 'bg-foreground/10'
                      }`}
                    >
                      {workoutDone ? <Check className="w-6 h-6" /> : <span className="text-2xl font-black">→</span>}
                    </div>
                  </div>
                </button>
              )}
            </motion.section>

            {/* Progresso */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4">Progresso de hoje</h2>
              <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-soft border-2 border-foreground/8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">Atividades</span>
                  <span className="text-2xl font-black text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>
            </motion.section>

            {/* Rotina de refeições */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4">Sua rotina</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {meals.map((m) => {
                  const Icon = m.icon;
                  const done = !!checked[m.id];
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMeal(m.id)}
                      className="bg-card rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row md:flex-col items-start gap-4 shadow-soft active:scale-[0.99] transition-all hover:shadow-md border-2 border-foreground/8"
                    >
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-foreground">{m.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{m.time} · ~520 kcal</p>
                      </div>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                          done ? 'bg-primary border-primary shadow-glow' : 'border-foreground/15'
                        }`}
                      >
                        {done && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* Widget de água */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4">Hidratação</h2>
              <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-soft border-2 border-foreground/8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Meta diária</p>
                    <p className="text-3xl md:text-4xl font-black mt-2">
                      {(waterMl / 1000).toFixed(2)} <span className="text-lg text-muted-foreground">L</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">de 2,5 L</p>
                  </div>
                  <Droplets className="w-12 h-12 text-primary opacity-50" />
                </div>

                <div className="mb-6">
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full"
                      initial={false}
                      animate={{ width: `${waterPercent}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleWaterRemove}
                    className="flex-1 bg-muted text-foreground font-bold py-3 rounded-xl hover:bg-muted/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    <span className="hidden sm:inline">Remover</span>
                  </button>
                  <button
                    onClick={handleWaterAdd}
                    className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Suporte */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl md:rounded-3xl p-5 md:p-6 bg-foreground text-background shadow-soft active:scale-[0.99] transition-all hover:shadow-md"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center shadow-glow shrink-0">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Suporte personalizado</p>
                  <p className="text-sm md:text-base font-semibold mt-1 leading-snug">
                    Dúvidas no treino ou dieta? Fale com nossos especialistas agora.
                  </p>
                </div>
              </a>
            </motion.section>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}
