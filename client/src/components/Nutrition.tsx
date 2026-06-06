import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, ShoppingCart, Utensils } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Tab = 'diet' | 'shopping';

interface Meal {
  name: string;
  time: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  foods: Array<{ name: string; amount: string; calories: number; protein?: number }>;
}

interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

const dietPlan: Meal[] = [
  {
    name: 'Café da Manhã',
    time: '07:30',
    calories: 450,
    macros: { protein: 25, carbs: 55, fat: 12 },
    foods: [
      { name: 'Ovos (3 unidades)', amount: '150g', calories: 155 },
      { name: 'Pão integral', amount: '2 fatias', calories: 160 },
      { name: 'Manteiga', amount: '1 colher', calories: 100 },
      { name: 'Suco natural', amount: '200ml', calories: 35 },
    ],
  },
  {
    name: 'Lanche da Manhã',
    time: '10:30',
    calories: 200,
    macros: { protein: 15, carbs: 25, fat: 5 },
    foods: [
      { name: 'Iogurte grego', amount: '150g', calories: 100 },
      { name: 'Granola', amount: '30g', calories: 100 },
    ],
  },
  {
    name: 'Almoço',
    time: '12:30',
    calories: 750,
    macros: { protein: 50, carbs: 80, fat: 20 },
    foods: [
      { name: 'Peito de frango', amount: '200g', calories: 330 },
      { name: 'Arroz integral', amount: '150g', calories: 195 },
      { name: 'Brócolis', amount: '150g', calories: 50 },
      { name: 'Azeite', amount: '1 colher', calories: 120 },
      { name: 'Salada mista', amount: '100g', calories: 35 },
    ],
  },
  {
    name: 'Lanche da Tarde',
    time: '15:30',
    calories: 250,
    macros: { protein: 20, carbs: 30, fat: 8 },
    foods: [
      { name: 'Whey protein', amount: '30g', calories: 120 },
      { name: 'Banana', amount: '1 unidade', calories: 105 },
      { name: 'Amendoim', amount: '25g', calories: 25 },
    ],
  },
  {
    name: 'Jantar',
    time: '19:30',
    calories: 600,
    macros: { protein: 45, carbs: 60, fat: 18 },
    foods: [
      { name: 'Salmão', amount: '180g', calories: 280 },
      { name: 'Batata doce', amount: '150g', calories: 130 },
      { name: 'Espinafre', amount: '100g', calories: 23 },
      { name: 'Azeite', amount: '1 colher', calories: 120 },
      { name: 'Limão', amount: '1 unidade', calories: 47 },
    ],
  },
];

const shoppingListData: ShoppingItem[] = [
  { id: '1', name: 'Ovos', amount: '2 dúzias', category: 'Proteínas', checked: false },
  { id: '2', name: 'Peito de Frango', amount: '1,5kg', category: 'Proteínas', checked: false },
  { id: '3', name: 'Salmão', amount: '500g', category: 'Proteínas', checked: false },
  { id: '4', name: 'Iogurte Grego', amount: '500g', category: 'Laticínios', checked: false },
  { id: '5', name: 'Leite', amount: '1L', category: 'Laticínios', checked: false },
  { id: '6', name: 'Arroz Integral', amount: '1kg', category: 'Carboidratos', checked: false },
  { id: '7', name: 'Batata Doce', amount: '1kg', category: 'Carboidratos', checked: false },
  { id: '8', name: 'Pão Integral', amount: '1 unidade', category: 'Carboidratos', checked: false },
  { id: '9', name: 'Brócolis', amount: '500g', category: 'Vegetais', checked: false },
  { id: '10', name: 'Espinafre', amount: '300g', category: 'Vegetais', checked: false },
  { id: '11', name: 'Banana', amount: '1kg', category: 'Frutas', checked: false },
  { id: '12', name: 'Maçã', amount: '1kg', category: 'Frutas', checked: false },
  { id: '13', name: 'Azeite', amount: '500ml', category: 'Óleos', checked: false },
  { id: '14', name: 'Whey Protein', amount: '900g', category: 'Suplementos', checked: false },
];

function parsePlanContent(content: any) {
  if (!content) return null;

  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  return content;
}

function normalizeNutritionMeals(refeicoes: any): Meal[] | null {
  if (!Array.isArray(refeicoes)) return null;

  const normalized = refeicoes.map((meal: any) => {
    const foodsSource = Array.isArray(meal?.alimentos) ? meal.alimentos : [];

    return {
      name: String(meal?.nome ?? meal?.name ?? 'Refeição'),
      time: String(meal?.horario ?? meal?.time ?? ''),
      calories: Number(meal?.kcal_total ?? meal?.calories ?? 0) || 0,
      macros: {
        protein: Number(meal?.proteina_g ?? meal?.macros?.protein ?? 0) || 0,
        carbs: Number(meal?.carboidratos_g ?? meal?.macros?.carbs ?? 0) || 0,
        fat: Number(meal?.gorduras_g ?? meal?.macros?.fat ?? 0) || 0,
      },
      foods: foodsSource.map((food: any) => ({
        name: String(food?.nome ?? food?.name ?? 'Alimento'),
        amount: String(food?.quantidade ?? food?.amount ?? ''),
        calories: Number(food?.kcal ?? food?.calories ?? 0) || 0,
        protein: Number(food?.proteina_g ?? food?.protein ?? 0) || 0,
      })),
    } satisfies Meal;
  });

  return normalized.length > 0 ? normalized : null;
}

export function Nutrition({
  onBack,
  checkedMeals,
  setCheckedMeals,
}: {
  onBack: () => void;
  checkedMeals?: Record<string, boolean>;
  setCheckedMeals?: (val: Record<string, boolean>) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('diet');
  const [realNutrition, setRealNutrition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(shoppingListData);
  void checkedMeals;
  void setCheckedMeals;

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('plans')
        .select('content, status')
        .eq('user_id', user.id)
        .eq('type', 'nutrition')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.content) setRealNutrition(data.content);
      setLoading(false);
    };

    load();
  }, []);

  const parsedNutrition = useMemo(() => parsePlanContent(realNutrition), [realNutrition]);
  const realMeals = useMemo(() => normalizeNutritionMeals(parsedNutrition?.refeicoes), [parsedNutrition]);
  const resolvedMeals = realMeals ?? dietPlan;

  const totalDayCalories = useMemo(() => {
    if (parsedNutrition?.calorias_diarias != null) return Number(parsedNutrition.calorias_diarias) || 0;
    return resolvedMeals.reduce((sum, meal) => sum + meal.calories, 0);
  }, [parsedNutrition, resolvedMeals]);

  const totalDayMacros = useMemo(() => {
    if (parsedNutrition?.proteinas_g != null || parsedNutrition?.carboidratos_g != null || parsedNutrition?.gorduras_g != null) {
      return {
        protein: Number(parsedNutrition?.proteinas_g ?? 0) || 0,
        carbs: Number(parsedNutrition?.carboidratos_g ?? 0) || 0,
        fat: Number(parsedNutrition?.gorduras_g ?? 0) || 0,
      };
    }

    return resolvedMeals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fat: acc.fat + meal.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  }, [parsedNutrition, resolvedMeals]);

  const nutritionTips = Array.isArray(parsedNutrition?.dicas) ? parsedNutrition.dicas : [];

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = shoppingList.filter((item) => item.checked).length;

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
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
            <p className="text-xs font-bold text-muted-foreground uppercase">Sua Nutrição</p>
            <h1 className="text-2xl font-black">Plano Alimentar</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container flex gap-2 py-4">
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'diet'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Dieta
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'shopping'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Lista ({checkedCount}/{shoppingList.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container py-8 max-w-5xl">
        {/* Diet Tab */}
        {activeTab === 'diet' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Daily Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl p-4 border-2 border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase">Calorias</p>
                <p className="text-3xl font-black mt-2">{totalDayCalories}</p>
                <p className="text-xs text-muted-foreground mt-1">kcal/dia</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border-2 border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase">Proteína</p>
                <p className="text-3xl font-black mt-2">{totalDayMacros.protein}g</p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((totalDayMacros.protein * 4) / totalDayCalories * 100)}%</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border-2 border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase">Carboidratos</p>
                <p className="text-3xl font-black mt-2">{totalDayMacros.carbs}g</p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((totalDayMacros.carbs * 4) / totalDayCalories * 100)}%</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border-2 border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase">Gordura</p>
                <p className="text-3xl font-black mt-2">{totalDayMacros.fat}g</p>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((totalDayMacros.fat * 9) / totalDayCalories * 100)}%</p>
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-4">
              {resolvedMeals.map((meal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-2xl p-6 border-2 border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{meal.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>

                  {/* Foods */}
                  <div className="space-y-2 mb-4">
                    {meal.foods.map((food, foodIdx) => (
                      <div key={foodIdx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{food.name}</span>
                        <span className="text-muted-foreground">{food.amount} • {food.calories} kcal</span>
                      </div>
                    ))}
                  </div>

                  {/* Macros */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                      P: {meal.macros.protein}g
                    </span>
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold">
                      C: {meal.macros.carbs}g
                    </span>
                    <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full font-semibold">
                      G: {meal.macros.fat}g
                    </span>
                  </div>
                </motion.div>
              ))}

              {nutritionTips.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border-2 border-border space-y-3">
                  <h3 className="text-lg font-black">Dicas</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {nutritionTips.map((tip: any, index: number) => (
                      <p key={index}>{String(tip)}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Progresso: {checkedCount} de {shoppingList.length} itens
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${(checkedCount / shoppingList.length) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>

            {/* Group by category */}
            {Array.from(new Set(shoppingList.map((item) => item.category))).map((category) => (
              <div key={category}>
                <h3 className="text-lg font-bold mb-3">{category}</h3>
                <div className="space-y-2">
                  {shoppingList
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => toggleShoppingItem(item.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border-2 ${
                          item.checked
                            ? 'bg-primary/10 border-primary'
                            : 'bg-card border-border hover:border-foreground/20'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? 'bg-primary border-primary'
                              : 'border-foreground/20'
                          }`}
                        >
                          {item.checked && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-semibold ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.amount}</p>
                        </div>
                      </motion.button>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
