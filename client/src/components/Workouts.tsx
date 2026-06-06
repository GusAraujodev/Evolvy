import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type WorkoutDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

interface Workout {
  day: WorkoutDay;
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: string;
    technique?: string;
  }>;
  duration: number;
  calories: number;
  completed?: boolean;
}

const workoutPlan: Workout[] = [
  {
    day: 'seg',
    name: 'Peito, Ombro e Tríceps',
    exercises: [
      { name: 'Supino Reto', sets: 4, reps: '8-10', rest: '2 min' },
      { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest: '90 seg' },
      { name: 'Crucifixo', sets: 3, reps: '12-15', rest: '60 seg' },
      { name: 'Ombro com Halteres', sets: 4, reps: '10-12', rest: '90 seg' },
      { name: 'Elevação Lateral', sets: 3, reps: '15-20', rest: '60 seg' },
      { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60 seg' },
    ],
    duration: 60,
    calories: 450,
  },
  {
    day: 'ter',
    name: 'Costas e Bíceps',
    exercises: [
      { name: 'Puxada Frontal', sets: 4, reps: '8-10', rest: '2 min' },
      { name: 'Remada Curvada', sets: 4, reps: '10-12', rest: '90 seg' },
      { name: 'Puxada Alta', sets: 3, reps: '12-15', rest: '60 seg' },
      { name: 'Rosca Direta', sets: 4, reps: '10-12', rest: '90 seg' },
      { name: 'Rosca Martelo', sets: 3, reps: '12-15', rest: '60 seg' },
    ],
    duration: 55,
    calories: 420,
  },
  {
    day: 'qua',
    name: 'Perna',
    exercises: [
      { name: 'Agachamento', sets: 4, reps: '8-10', rest: '2 min' },
      { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90 seg' },
      { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest: '60 seg' },
      { name: 'Cadeira Flexora', sets: 3, reps: '12-15', rest: '60 seg' },
      { name: 'Panturrilha', sets: 3, reps: '15-20', rest: '60 seg' },
    ],
    duration: 50,
    calories: 480,
  },
  {
    day: 'qui',
    name: 'Descanso',
    exercises: [],
    duration: 0,
    calories: 0,
  },
  {
    day: 'sex',
    name: 'Peito, Ombro e Tríceps',
    exercises: [
      { name: 'Supino Reto', sets: 4, reps: '8-10', rest: '2 min' },
      { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest: '90 seg' },
      { name: 'Crucifixo', sets: 3, reps: '12-15', rest: '60 seg' },
      { name: 'Ombro com Halteres', sets: 4, reps: '10-12', rest: '90 seg' },
      { name: 'Elevação Lateral', sets: 3, reps: '15-20', rest: '60 seg' },
      { name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60 seg' },
    ],
    duration: 60,
    calories: 450,
  },
  {
    day: 'sab',
    name: 'Costas e Bíceps',
    exercises: [
      { name: 'Puxada Frontal', sets: 4, reps: '8-10', rest: '2 min' },
      { name: 'Remada Curvada', sets: 4, reps: '10-12', rest: '90 seg' },
      { name: 'Puxada Alta', sets: 3, reps: '12-15', rest: '60 seg' },
      { name: 'Rosca Direta', sets: 4, reps: '10-12', rest: '90 seg' },
      { name: 'Rosca Martelo', sets: 3, reps: '12-15', rest: '60 seg' },
    ],
    duration: 55,
    calories: 420,
  },
  {
    day: 'dom',
    name: 'Descanso',
    exercises: [],
    duration: 0,
    calories: 0,
  },
];

const dayNames: Record<WorkoutDay, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sab',
  dom: 'Dom',
};

type WorkoutExercise = Workout['exercises'][number];

function normalizeDay(value: string | number | undefined, fallbackIndex: number): WorkoutDay {
  const dayKeys: WorkoutDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
  const normalized = String(value ?? '').toLowerCase();

  if (normalized.includes('seg') || normalized.includes('mon') || normalized.includes('monday')) return 'seg';
  if (normalized.includes('ter') || normalized.includes('tue') || normalized.includes('tuesday')) return 'ter';
  if (normalized.includes('qua') || normalized.includes('wed') || normalized.includes('wednesday')) return 'qua';
  if (normalized.includes('qui') || normalized.includes('thu') || normalized.includes('thursday')) return 'qui';
  if (normalized.includes('sex') || normalized.includes('fri') || normalized.includes('friday')) return 'sex';
  if (normalized.includes('sab') || normalized.includes('sat') || normalized.includes('saturday')) return 'sab';
  if (normalized.includes('dom') || normalized.includes('sun') || normalized.includes('sunday')) return 'dom';

  return dayKeys[fallbackIndex % dayKeys.length];
}

function normalizeExercise(exercise: any): WorkoutExercise {
  const reps = exercise?.reps ?? exercise?.repetitions ?? exercise?.repetition ?? '';
  const sets = Number(exercise?.sets ?? exercise?.series ?? exercise?.seriesCount ?? 0) || 0;
  const rest = exercise?.rest ?? exercise?.descanso ?? exercise?.interval ?? '';

  return {
    name: String(exercise?.name ?? exercise?.nome ?? exercise?.exercise ?? 'Exercício'),
    sets,
    reps: typeof reps === 'string' ? reps : String(reps ?? ''),
    rest: String(rest),
    technique: String(exercise?.technique ?? exercise?.tecnica ?? ''),
  };
}

function normalizeRealPlan(content: any): Workout[] | null {
  if (!content) return null;

  const parsedContent = typeof content === 'string'
    ? (() => {
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      })()
    : content;

  const rawDays = Array.isArray(parsedContent?.semana)
    ? parsedContent.semana
    : Array.isArray(parsedContent)
      ? parsedContent
      : Array.isArray(parsedContent?.days)
        ? parsedContent.days
        : Array.isArray(parsedContent?.workouts)
          ? parsedContent.workouts
          : Array.isArray(parsedContent?.treinos)
            ? parsedContent.treinos
            : null;

  if (!rawDays) return null;

  const normalized = rawDays
    .map((day: any, index: number) => {
      const exercisesSource =
        day?.exercises ?? day?.exercicios ?? day?.workouts ?? day?.items ?? day?.lista ?? [];

      const exercises = Array.isArray(exercisesSource) ? exercisesSource.map(normalizeExercise) : [];
      const dayKey = normalizeDay(day?.day ?? day?.dia ?? day?.weekday ?? day?.name ?? day?.title, index);

      return {
        day: dayKey,
        name: String(day?.foco ?? day?.tipo ?? day?.name ?? day?.titulo ?? day?.title ?? day?.dia ?? 'Treino'),
        exercises,
        duration: Number(day?.duration ?? day?.duracao ?? day?.minutes ?? 0) || 0,
        calories: Number(day?.calories ?? day?.calorias ?? 0) || 0,
        completed: Boolean(day?.completed),
      } satisfies Workout;
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : null;
}

export function Workouts({
  onBack,
  workoutDone,
  setWorkoutDone,
}: {
  onBack: () => void;
  workoutDone?: boolean;
  setWorkoutDone?: (val: boolean) => void;
}) {
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  const dayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const dayKeys: WorkoutDay[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
  const todayKey = dayKeys[dayIndex];

  const [realPlan, setRealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay>(todayKey);
  const [completed, setCompleted] = useState<Record<WorkoutDay, boolean>>({
    seg: false,
    ter: false,
    qua: false,
    qui: false,
    sex: false,
    sab: false,
    dom: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase.from('plans')
        .select('content')
        .eq('user_id', user.id)
        .eq('type', 'workout')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.content) setRealPlan(data.content);
          setLoading(false);
        });
    });
  }, []);

    useEffect(() => {
      if (typeof workoutDone === 'boolean') {
        setCompleted((prev) => ({ ...prev, [todayKey]: workoutDone }));
      }
    }, [workoutDone, todayKey]);

  const resolvedWorkoutPlan = useMemo(
    () => (realPlan?.semana ? normalizeRealPlan(realPlan) : null) ?? workoutPlan,
    [realPlan]
  );

  const selectedWorkout = useMemo(() => {
    return resolvedWorkoutPlan.find((w) => w.day === selectedDay);
  }, [resolvedWorkoutPlan, selectedDay]);

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(today);
    const currentDay = today.getDay();
    const diff = dayIndex - (currentDay === 0 ? 6 : currentDay - 1);
    date.setDate(today.getDate() + diff);
    return date;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Seu Treino</p>
            <h1 className="text-2xl font-black">Semana de Treino</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container py-8 max-w-5xl">
        {/* Week Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase mb-4">Escolha o dia</p>
          <div className="grid grid-cols-7 gap-2">
            {dayKeys.map((day, idx) => {
              const date = getDateForDay(idx);
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = day === selectedDay;
              const dayNum = date.getDate();

              return (
                <motion.button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : isToday
                      ? 'bg-card border-2 border-primary'
                      : 'bg-card border-2 border-border hover:border-foreground/20'
                  }`}
                >
                  <span className="text-xs font-bold uppercase">{dayNames[day]}</span>
                  <span className="text-sm font-black mt-1">{dayNum}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Workout Details */}
        {selectedWorkout && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{selectedWorkout.name}</h2>
              {selectedWorkout.exercises.length === 0 && (
                <p className="text-lg text-muted-foreground mt-2">Dia de descanso. Aproveite para recuperar! 💪</p>
              )}
            </div>

            {/* Stats */}
            {selectedWorkout.exercises.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-2xl p-4 border-2 border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Duração</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-black">{selectedWorkout.duration} min</span>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-4 border-2 border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Calorias</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Flame className="w-5 h-5 text-destructive" />
                    <span className="text-2xl font-black">{selectedWorkout.calories}</span>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-4 border-2 border-border col-span-2 md:col-span-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Exercícios</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-black">{selectedWorkout.exercises.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Exercises List */}
            {selectedWorkout.exercises.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase">Exercícios</p>
                {selectedWorkout.exercises.map((exercise, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-2xl p-5 border-2 border-border hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg">{exercise.name}</h3>
                      <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                        {exercise.sets}x{exercise.reps}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Descanso: {exercise.rest}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mark as Complete */}
            {selectedWorkout.exercises.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  setCompleted((p) => {
                    const nextValue = !p[selectedDay];
                    if (selectedDay === todayKey) {
                      setWorkoutDone?.(nextValue);
                    }
                    return { ...p, [selectedDay]: nextValue };
                  });
                }}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  completed[selectedDay]
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-card border-2 border-border hover:border-foreground/20'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {completed[selectedDay] ? 'Treino Concluído! 🎉' : 'Marcar como Concluído'}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
