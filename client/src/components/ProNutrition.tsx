import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, UserCircle2, ChevronRight, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type NutritionPlanRow = {
  id: string;
  content: any;
  status: string;
  created_at: string;
  notes: string | null;
  profiles?: {
    name?: string | null;
    age?: number | null;
    weight_kg?: number | null;
    height_cm?: number | null;
  } | null;
};

type ParsedMeal = {
  nome: string;
  horario: string;
  kcal_total: number;
  proteina_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  alimentos: Array<{
    nome: string;
    quantidade: string;
    kcal: number;
    proteina_g: number;
  }>;
};

type ParsedNutrition = {
  calorias_diarias: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  refeicoes: ParsedMeal[];
  dicas: string[];
};

function parseContent(content: any): ParsedNutrition {
  const parsed = typeof content === 'string'
    ? (() => {
        try {
          return JSON.parse(content);
        } catch {
          return {};
        }
      })()
    : content ?? {};

  const refeicoes = Array.isArray(parsed?.refeicoes)
    ? parsed.refeicoes.map((meal: any) => ({
        nome: String(meal?.nome ?? meal?.name ?? 'Refeição'),
        horario: String(meal?.horario ?? meal?.time ?? ''),
        kcal_total: Number(meal?.kcal_total ?? meal?.calories ?? 0) || 0,
        proteina_g: Number(meal?.proteina_g ?? meal?.macros?.protein ?? 0) || 0,
        carboidratos_g: Number(meal?.carboidratos_g ?? meal?.macros?.carbs ?? 0) || 0,
        gorduras_g: Number(meal?.gorduras_g ?? meal?.macros?.fat ?? 0) || 0,
        alimentos: Array.isArray(meal?.alimentos)
          ? meal.alimentos.map((food: any) => ({
              nome: String(food?.nome ?? food?.name ?? 'Alimento'),
              quantidade: String(food?.quantidade ?? food?.amount ?? ''),
              kcal: Number(food?.kcal ?? food?.calories ?? 0) || 0,
              proteina_g: Number(food?.proteina_g ?? food?.protein ?? 0) || 0,
            }))
          : [],
      }))
    : [];

  return {
    calorias_diarias: Number(parsed?.calorias_diarias ?? 0) || 0,
    proteinas_g: Number(parsed?.proteinas_g ?? 0) || 0,
    carboidratos_g: Number(parsed?.carboidratos_g ?? 0) || 0,
    gorduras_g: Number(parsed?.gorduras_g ?? 0) || 0,
    refeicoes,
    dicas: Array.isArray(parsed?.dicas) ? parsed.dicas.map((tip: any) => String(tip)) : [],
  };
}

function getStatusMeta(status: string) {
  switch (status) {
    case 'approved':
      return { label: 'Aprovado', className: 'bg-green-500/15 text-green-600 border-green-500/20' };
    case 'rejected':
      return { label: 'Rejeitado', className: 'bg-red-500/15 text-red-600 border-red-500/20' };
    default:
      return { label: 'Pendente', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/20' };
  }
}

function getInitials(name?: string | null) {
  const safeName = (name ?? '').trim();
  if (!safeName) return '??';
  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function ProNutrition() {
  const [plans, setPlans] = useState<NutritionPlanRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [notesText, setNotesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    // Busca os planos primeiro
    const { data: rawPlans } = await supabase
      .from('plans')
      .select('id, status, created_at, notes, content, user_id')
      .eq('type', 'nutrition')
      .in('status', ['pending_review', 'approved', 'rejected'])
      .order('created_at', { ascending: false });

    // Busca os perfis separadamente
    const userIds = [...new Set((rawPlans ?? []).map(p => p.user_id))];
    const { data: profiles } = userIds.length > 0
      ? await supabase.from('profiles').select('id, name, age, weight_kg, height_cm').in('id', userIds)
      : { data: [] };

    // Combina manualmente os dados
    const plans = (rawPlans ?? []).map(p => ({
      ...p,
      profiles: profiles?.find(pr => pr.id === p.user_id) ?? null,
    }));

    setPlans(plans as NutritionPlanRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedId) ?? null,
    [plans, selectedId]
  );

  const selectedNutrition = useMemo(
    () => parseContent(selectedPlan?.content),
    [selectedPlan]
  );

  useEffect(() => {
    setNotesText(selectedPlan?.notes ?? '');
  }, [selectedPlan]);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedPlan) return;

    setSaving(true);
    await supabase.from('plans').update({
      status,
      reviewed_at: new Date().toISOString(),
      notes: notesText,
    }).eq('id', selectedPlan.id);
    setSaving(false);
    await loadPlans();
    setSelectedId('');
    setNotesText('');
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-72 border-r border-border bg-card/40 backdrop-blur-sm p-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Nutrição Pro</p>
          <h1 className="text-2xl font-black mt-1">Revisão de planos</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando planos...
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
              Nenhum plano de nutrição para revisar.
            </div>
          ) : (
            plans.map((plan) => {
              const profile = plan.profiles ?? {};
              const name = profile.name ?? 'Paciente';
              const statusMeta = getStatusMeta(plan.status);
              const isSelected = plan.id === selectedId;

              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedId(plan.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-background border-border hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary text-background flex items-center justify-center font-black shrink-0">
                      {getInitials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold truncate">{name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {profile.age ? `${profile.age} anos` : 'Sem idade'}
                            {profile.weight_kg ? ` · ${profile.weight_kg} kg` : ''}
                            {profile.height_cm ? ` · ${profile.height_cm} cm` : ''}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {!selectedPlan ? (
          <div className="h-full min-h-[70vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <UserCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black mt-6">Selecione um paciente</h2>
              <p className="text-muted-foreground mt-3">
                Escolha um plano na lista ao lado para revisar os macros, refeições e registrar sua decisão.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Plano selecionado</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2">
                  {selectedPlan.profiles?.name ?? 'Paciente'}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Criado em {new Date(selectedPlan.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold ${getStatusMeta(selectedPlan.status).className}`}>
                {getStatusMeta(selectedPlan.status).label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Kcal</p>
                <p className="text-3xl font-black mt-3">{selectedNutrition.calorias_diarias || 0}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Proteína</p>
                <p className="text-3xl font-black mt-3">{selectedNutrition.proteinas_g || 0}g</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Carboidratos</p>
                <p className="text-3xl font-black mt-3">{selectedNutrition.carboidratos_g || 0}g</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Gorduras</p>
                <p className="text-3xl font-black mt-3">{selectedNutrition.gorduras_g || 0}g</p>
              </div>
            </div>

            <div className="grid gap-4">
              {selectedNutrition.refeicoes.length > 0 ? (
                selectedNutrition.refeicoes.map((meal, mealIndex) => (
                  <motion.div
                    key={mealIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-border bg-card p-5 md:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-black">{meal.nome}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{meal.horario}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p className="font-bold text-foreground">{meal.kcal_total} kcal</p>
                        <p>{meal.proteina_g}g prot · {meal.carboidratos_g}g carb · {meal.gorduras_g}g gord</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {meal.alimentos.map((food, foodIndex) => (
                        <div key={foodIndex} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-background border border-border px-4 py-3">
                          <div>
                            <p className="font-semibold">{food.nome}</p>
                            <p className="text-xs text-muted-foreground">{food.quantidade}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{food.kcal} kcal</p>
                            <p>{food.proteina_g}g prot</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  Este plano não contém refeições estruturadas.
                </div>
              )}
            </div>

            {selectedNutrition.dicas.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-black">Dicas</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {selectedNutrition.dicas.map((tip, index) => (
                    <p key={index}>• {tip}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-xl font-black">Observações da nutricionista</h3>
                <p className="text-sm text-muted-foreground mt-1">Atualize as notas antes de aprovar ou rejeitar.</p>
              </div>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Digite suas observações..."
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  Aprovar
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 font-bold text-foreground transition-all hover:bg-muted disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  Rejeitar
                </button>
                {saving && (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground self-center sm:ml-auto">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
