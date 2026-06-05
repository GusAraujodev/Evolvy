import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight, AlertCircle, Calendar, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export type ProfileData = { name: string; birthDate: string; weight: string; height: string };

type FieldId = keyof ProfileData;

type FieldDef = {
  id: FieldId;
  label: string;
  type: 'text' | 'number' | 'date';
  placeholder: string;
  suffix?: string;
  min?: number;
  max?: number;
};

const fields: FieldDef[] = [
  { id: 'name', label: 'Seu nome', type: 'text', placeholder: 'Como podemos te chamar?' },
  { id: 'birthDate', label: 'Data de nascimento', type: 'date', placeholder: 'DD/MM/YYYY' },
  { id: 'weight', label: 'Peso atual', type: 'number', placeholder: '—', suffix: 'kg', min: 1, max: 400 },
  { id: 'height', label: 'Altura', type: 'number', placeholder: '—', suffix: 'cm', min: 30, max: 260 },
];

function validateField(f: FieldDef, value: string): string | null {
  if (!value.trim()) return null;
  if (f.type === 'date') {
    const parts = value.split('/');
    if (parts.length !== 3) return 'Use o formato DD/MM/YYYY.';
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Use apenas números.';
    if (day < 1 || day > 31) return 'Dia inválido (1-31).';
    if (month < 1 || month > 12) return 'Mês inválido (1-12).';
    if (year < 1900 || year > new Date().getFullYear()) return 'Ano inválido.';
    
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day) return 'Data inválida.';
    
    const today = new Date();
    if (date > today) return 'A data não pode ser no futuro.';
    
    const age = today.getFullYear() - date.getFullYear();
    if (age < 13) return 'Você deve ter pelo menos 13 anos.';
    if (age > 120) return 'Data de nascimento inválida.';
  }
  if (f.type === 'number') {
    const n = Number(value);
    if (Number.isNaN(n)) return 'Use apenas números.';
    if (n < 0) return 'Não aceitamos valores negativos.';
    if (f.min !== undefined && n < f.min) return `Valor mínimo: ${f.min}.`;
    if (f.max !== undefined && n > f.max) return `Valor máximo: ${f.max}.`;
  }
  return null;
}

function calculateAge(dateStr: string): number | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${day}/${month}/${year}`;
}

function dateStringToISO(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function DataCapture({
  initialName,
  onComplete,
  onBack,
}: {
  initialName: string;
  onComplete: (d: ProfileData) => void;
  onBack: () => void;
}) {
  const [data, setData] = useState<ProfileData>({ name: initialName, birthDate: '', weight: '', height: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldId, string | null>>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'day' | 'month' | 'year'>('day');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const update = (f: FieldDef, v: string) => {
    if (f.type === 'number') {
      if (v.includes('-') || v.includes('e') || v.includes('E')) return;
    }
    if (f.type === 'date') {
      // Formatar entrada para DD/MM/YYYY
      let formatted = v.replace(/\D/g, '');
      if (formatted.length > 8) formatted = formatted.slice(0, 8);
      if (formatted.length >= 2) formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
      if (formatted.length >= 5) formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
      v = formatted;
    }
    setData((p) => ({ ...p, [f.id]: v }));
    setErrors((p) => ({ ...p, [f.id]: validateField(f, v) }));
  };

  const selectDate = (day: number) => {
    const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    update(fields[1], dateStr);
    setShowCalendar(false);
    setCalendarMode('day');
  };

  const selectMonth = (month: number) => {
    const newDate = new Date(calendarDate.getFullYear(), month, 1);
    setCalendarDate(newDate);
    setCalendarMode('day');
  };

  const selectYear = (year: number) => {
    const newDate = new Date(year, calendarDate.getMonth(), 1);
    setCalendarDate(newDate);
    setCalendarMode('month');
  };

  const allFilled = fields.every((f) => data[f.id].trim());
  const noErrors = fields.every((f) => !validateField(f, data[f.id]));
  const valid = allFilled && noErrors;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!valid || isLoading || saving) return;

    setIsLoading(true);

    try {
      setSaving(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                name: data.name,
                age: data.birthDate
                  ? new Date().getFullYear() - new Date(data.birthDate).getFullYear()
                  : null,
                weight_kg: data.weight ? parseFloat(data.weight) : null,
                height_cm: data.height ? parseInt(data.height) : null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

          if (error) console.error('Erro ao salvar perfil:', error);
          else console.log('✅ Perfil salvo');
        }
      } catch (e) {
        console.error('Erro inesperado:', e);
      } finally {
        setSaving(false);
      }

      onComplete(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(calendarDate);
  const firstDay = getFirstDayOfMonth(calendarDate);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const age = calculateAge(data.birthDate);
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i).reverse();

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 pt-8 sm:pt-12 pb-10">
      <button
        onClick={onBack}
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted active:scale-90 transition-all"
        aria-label="Voltar"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 sm:mt-10">
        <p className="text-[11px] font-bold text-primary-foreground bg-primary inline-block px-3 py-1 rounded-full uppercase tracking-wider">
          Seus dados
        </p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mt-4">
          Personalize sua
          <br />
          <span className="text-muted-foreground">experiência.</span>
        </h2>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 sm:gap-8 mt-10 sm:mt-12" noValidate>
        {/* Name */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {fields[0].label}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={data.name}
            onChange={(e) => update(fields[0], e.target.value)}
            placeholder={fields[0].placeholder}
            className={`w-full mt-3 px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-card outline-none font-medium transition-colors ${
              errors.name ? 'border-destructive/60 bg-destructive/5' : 'border-foreground/10 focus:border-primary'
            }`}
          />
          {errors.name && (
            <p className="text-xs font-semibold text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </motion.div>

        {/* Birth Date with Calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label htmlFor="birthDate" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {fields[1].label}
            {age !== null && <span className="ml-2 text-primary">({age} anos)</span>}
          </label>
          <div className="relative mt-3">
            <div className="flex gap-2">
              <input
                id="birthDate"
                type="text"
                inputMode="numeric"
                value={data.birthDate}
                onChange={(e) => update(fields[1], e.target.value)}
                placeholder="DD/MM/YYYY"
                maxLength={10}
                className={`flex-1 px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-card outline-none font-medium transition-colors ${
                  errors.birthDate ? 'border-destructive/60 bg-destructive/5' : 'border-foreground/10 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-foreground/10 hover:border-foreground/20 bg-card flex items-center justify-center transition-colors"
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 bg-card border-2 border-border rounded-2xl p-4 z-50 w-full sm:w-96 shadow-lg"
              >
                {/* Header com navegação */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCalendarDate(newDate);
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>

                  {calendarMode === 'day' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCalendarMode('month')}
                        className="px-3 py-1 text-sm font-bold hover:bg-muted rounded transition-colors"
                      >
                        {monthNames[calendarDate.getMonth()]}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarMode('year')}
                        className="px-3 py-1 text-sm font-bold hover:bg-muted rounded transition-colors"
                      >
                        {calendarDate.getFullYear()}
                      </button>
                    </div>
                  )}

                  {calendarMode === 'month' && (
                    <p className="text-sm font-bold">{calendarDate.getFullYear()}</p>
                  )}

                  {calendarMode === 'year' && (
                    <p className="text-sm font-bold">
                      {yearRange[0]} - {yearRange[yearRange.length - 1]}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCalendarDate(newDate);
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Mode */}
                {calendarMode === 'day' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d) => (
                        <div key={d} className="font-bold text-muted-foreground py-2">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {calendarDays.map((day) => {
                        const isSelected =
                          data.birthDate &&
                          new Date(dateStringToISO(data.birthDate)).getDate() === day &&
                          new Date(dateStringToISO(data.birthDate)).getMonth() === calendarDate.getMonth() &&
                          new Date(dateStringToISO(data.birthDate)).getFullYear() === calendarDate.getFullYear();
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => selectDate(day)}
                            className={`py-2 rounded text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Month Mode */}
                {calendarMode === 'month' && (
                  <div className="grid grid-cols-3 gap-2">
                    {monthNames.map((month, idx) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => selectMonth(idx)}
                        className={`py-3 px-2 rounded-lg text-sm font-bold transition-colors ${
                          calendarDate.getMonth() === idx
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}

                {/* Year Mode */}
                {calendarMode === 'year' && (
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {yearRange.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => selectYear(year)}
                        className={`py-2 px-1 rounded text-sm font-bold transition-colors ${
                          calendarDate.getFullYear() === year
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {errors.birthDate && (
              <p className="text-xs font-semibold text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.birthDate}
              </p>
            )}
          </div>
        </motion.div>

        {/* Weight */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label htmlFor="weight" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {fields[2].label}
          </label>
          <div
            className={`flex items-center gap-3 mt-3 px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-card transition-colors ${
              errors.weight ? 'border-destructive/60 bg-destructive/5' : 'border-foreground/10 focus-within:border-primary'
            }`}
          >
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              value={data.weight}
              onChange={(e) => update(fields[2], e.target.value)}
              placeholder={fields[2].placeholder}
              className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-foreground/25"
            />
            <span className="text-sm font-semibold text-muted-foreground">{fields[2].suffix}</span>
          </div>
          {errors.weight && (
            <p className="text-xs font-semibold text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.weight}
            </p>
          )}
        </motion.div>

        {/* Height */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label htmlFor="height" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {fields[3].label}
          </label>
          <div
            className={`flex items-center gap-3 mt-3 px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-card transition-colors ${
              errors.height ? 'border-destructive/60 bg-destructive/5' : 'border-foreground/10 focus-within:border-primary'
            }`}
          >
            <input
              id="height"
              type="number"
              inputMode="decimal"
              value={data.height}
              onChange={(e) => update(fields[3], e.target.value)}
              placeholder={fields[3].placeholder}
              className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-foreground/25"
            />
            <span className="text-sm font-semibold text-muted-foreground">{fields[3].suffix}</span>
          </div>
          {errors.height && (
            <p className="text-xs font-semibold text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.height}
            </p>
          )}
        </motion.div>

        <div className="mt-auto">
          <button
            type="submit"
            disabled={!valid || isLoading || saving}
            className={`w-full py-4 sm:py-5 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              valid && !isLoading && !saving
                ? 'bg-foreground text-background hover:shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
