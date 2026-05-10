import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

type Mode = "signup" | "login";
type FieldError = { field: "email" | "password" | "form"; message: string } | null;

// Demo credential (until Firebase is wired)
const DEMO_USER = { email: "demo@evolvy.app", password: "evolvy123" };

export function Auth({ onAuthenticated, onBack }: { onAuthenticated: (email: string) => void; onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState<FieldError>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const triggerError = (err: NonNullable<FieldError>) => {
    setError(err);
    setShakeKey((k) => k + 1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (forgot) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        triggerError({ field: "email", message: "Informe um e-mail válido." });
        return;
      }
      setError(null);
      // TODO: Firebase sendPasswordResetEmail
      setForgot(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      triggerError({ field: "email", message: "Informe um e-mail válido." });
      return;
    }
    if (password.length < 6) {
      triggerError({ field: "password", message: "A senha precisa ter ao menos 6 caracteres." });
      return;
    }

    if (mode === "login") {
      // Simulate field-specific errors. Replace with Firebase error mapping:
      // auth/user-not-found → email; auth/wrong-password → password.
      if (email !== DEMO_USER.email) {
        triggerError({ field: "email", message: "E-mail não encontrado" });
        return;
      }
      if (password !== DEMO_USER.password) {
        triggerError({ field: "password", message: "Senha incorreta" });
        return;
      }
    }

    setError(null);
    onAuthenticated(email);
  };

  const emailErr = error?.field === "email" ? error.message : null;
  const passErr = error?.field === "password" ? error.message : null;

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
        <p className="text-[11px] font-bold text-foreground bg-primary inline-block px-3 py-1 rounded-full uppercase tracking-wider">
          {forgot ? "Recuperação" : mode === "signup" ? "Sua jornada está pronta" : "Bem-vindo de volta"}
        </p>
        <h2 className="text-[2rem] font-extrabold tracking-tight leading-[1.1] mt-4">
          {forgot ? (
            <>Recupere o acesso<br /><span className="text-muted-foreground">à sua evolução.</span></>
          ) : mode === "signup" ? (
            <>Crie sua conta para<br /><span className="text-muted-foreground">salvar seu progresso.</span></>
          ) : (
            <>Entre e continue<br /><span className="text-muted-foreground">de onde parou.</span></>
          )}
        </h2>
      </motion.div>

      <form onSubmit={submit} className="flex-1 flex flex-col gap-6 mt-12" noValidate>
        {/* Email */}
        <motion.div
          key={`email-${shakeKey}-${emailErr ? "err" : "ok"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={emailErr ? "animate-shake" : ""}
        >
          <label htmlFor="email" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            E-mail
          </label>
          <div className={`flex items-center gap-3 mt-2 px-4 h-14 rounded-2xl border bg-card transition-colors ${
            emailErr ? "border-destructive/60 bg-destructive/5" : "border-foreground/10 focus-within:border-foreground"
          }`}>
            <Mail className={`w-4 h-4 ${emailErr ? "text-destructive" : "text-muted-foreground"}`} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error?.field === "email") setError(null); }}
              placeholder="voce@email.com"
              className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-foreground/25"
            />
          </div>
          {emailErr && (
            <p role="alert" className="text-xs font-semibold text-destructive mt-2">
              {emailErr}
            </p>
          )}
        </motion.div>

        {/* Password */}
        {!forgot && (
          <motion.div
            key={`pass-${shakeKey}-${passErr ? "err" : "ok"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={passErr ? "animate-shake" : ""}
          >
            <label htmlFor="password" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Senha
            </label>
            <div className={`flex items-center gap-3 mt-2 px-4 h-14 rounded-2xl border bg-card transition-colors ${
              passErr ? "border-destructive/60 bg-destructive/5" : "border-foreground/10 focus-within:border-foreground"
            }`}>
              <Lock className={`w-4 h-4 ${passErr ? "text-destructive" : "text-muted-foreground"}`} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error?.field === "password") setError(null); }}
                placeholder="Mínimo de 6 caracteres"
                className="flex-1 bg-transparent outline-none text-base font-medium placeholder:text-foreground/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground active:scale-90 transition-transform"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passErr && (
              <p role="alert" className="text-xs font-semibold text-destructive mt-2">
                {passErr}
              </p>
            )}
          </motion.div>
        )}

        <div className="mt-auto space-y-4">
          <button
            type="submit"
            className="w-full bg-foreground text-background font-semibold py-5 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {forgot ? "Enviar link de recuperação" : mode === "signup" ? "Criar conta" : "Entrar"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {!forgot ? (
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); }}
                className="font-semibold text-foreground"
              >
                {mode === "signup" ? "Já tenho conta" : "Criar nova conta"}
              </button>
              <button
                type="button"
                onClick={() => { setForgot(true); setError(null); }}
                className="font-medium text-muted-foreground"
              >
                Esqueci minha senha
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setForgot(false); setError(null); }}
              className="w-full text-sm font-medium text-muted-foreground py-2"
            >
              Voltar ao login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
