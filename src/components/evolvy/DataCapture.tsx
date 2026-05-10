import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowRight, AlertCircle } from "lucide-react";

export type ProfileData = { name: string; age: string; weight: string; height: string };

type FieldId = keyof ProfileData;

type FieldDef = {
  id: FieldId;
  label: string;
  type: "text" | "number";
  placeholder: string;
  suffix?: string;
  min?: number;
  max?: number;
};

const fields: FieldDef[] = [
  { id: "name", label: "Seu nome", type: "text", placeholder: "Como podemos te chamar?" },
  { id: "age", label: "Idade", type: "number", placeholder: "—", suffix: "anos", min: 1, max: 120 },
  { id: "weight", label: "Peso atual", type: "number", placeholder: "—", suffix: "kg", min: 1, max: 400 },
  { id: "height", label: "Altura", type: "number", placeholder: "—", suffix: "cm", min: 30, max: 260 },
];

function validateField(f: FieldDef, value: string): string | null {
  if (!value.trim()) return null;
  if (f.type === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return "Use apenas números.";
    if (n < 0) return "Não aceitamos valores negativos.";
    if (f.min !== undefined && n < f.min) return `Valor mínimo: ${f.min}.`;
    if (f.max !== undefined && n > f.max) return `Valor máximo: ${f.max}.`;
  }
  return null;
}

export function DataCapture({ initialName, onComplete, onBack }: { initialName: string; onComplete: (d: ProfileData) => void; onBack: () => void }) {
  const [data, setData] = useState<ProfileData>({ name: initialName, age: "", weight: "", height: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldId, string | null>>>({});

  const update = (f: FieldDef, v: string) => {
    // Block negatives & invalid chars at input level for number fields
    if (f.type === "number") {
      if (v.includes("-") || v.includes("e") || v.includes("E")) return;
    }
    setData((p) => ({ ...p, [f.id]: v }));
    setErrors((p) => ({ ...p, [f.id]: validateField(f, v) }));
  };

  const allFilled = fields.every((f) => data[f.id].trim());
  const noErrors = fields.every((f) => !validateField(f, data[f.id]));
  const valid = allFilled && noErrors;

  const submit = () => {
    const next: Partial<Record<FieldId, string | null>> = {};
    fields.forEach((f) => { next[f.id] = validateField(f, data[f.id]); });
    setErrors(next);
    if (valid) onComplete(data);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-12 pb-10">
      <button
        onClick={onBack}
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Voltar"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10"
      >
        <p className="text-xs font-semibold text-primary-foreground bg-foreground inline-block px-3 py-1 rounded-full">
          Quase lá
        </p>
        <h2 className="text-[1.9rem] font-extrabold tracking-tight leading-[1.15] mt-4">
          Agora, vamos aos detalhes<br />
          <span className="text-muted-foreground">para personalizar seu treino e dieta.</span>
        </h2>
      </motion.div>

      <div className="flex-1 flex flex-col gap-5 mt-10">
        {fields.map((f, i) => {
          const err = errors[f.id];
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <label htmlFor={f.id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {f.label}
              </label>
              <div className={`flex items-baseline gap-2 mt-1 border-b transition-colors ${err ? "border-destructive" : "border-foreground/15 focus-within:border-primary"}`}>
                <input
                  id={f.id}
                  type={f.type}
                  inputMode={f.type === "number" ? "numeric" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  max={f.max}
                  value={data[f.id]}
                  onChange={(e) => update(f, e.target.value)}
                  onKeyDown={(e) => {
                    if (f.type === "number" && (e.key === "-" || e.key === "e" || e.key === "E")) e.preventDefault();
                  }}
                  placeholder={f.placeholder}
                  className="flex-1 bg-transparent outline-none text-2xl font-bold py-3 placeholder:text-foreground/20"
                />
                {f.suffix && <span className="text-sm font-semibold text-muted-foreground">{f.suffix}</span>}
              </div>
              {err && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="flex items-center gap-1.5 text-xs font-medium text-destructive mt-2"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> {err}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        disabled={!valid}
        onClick={submit}
        className="w-full bg-foreground text-background disabled:opacity-30 font-semibold py-5 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-8"
      >
        Continuar <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
