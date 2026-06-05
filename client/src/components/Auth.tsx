import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight, Mail, Lock, Eye, EyeOff, Loader2, Dumbbell, Apple, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useDeviceType } from '@/hooks/useDeviceType';

type Mode = 'signup' | 'login';
type FieldError = { field: 'email' | 'password' | 'form'; message: string } | null;
type LoadingAction = 'login' | 'signup' | 'google' | null;

const translateError = (msg: string): FieldError => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return { field: 'password', message: 'E-mail ou senha incorretos.' };
  if (m.includes('already registered') || m.includes('user already registered')) return { field: 'email', message: 'Este e-mail já está cadastrado.' };
  if (m.includes('password should be at least') || m.includes('weak password')) return { field: 'password', message: 'A senha precisa ter ao menos 6 caracteres.' };
  if (m.includes('email not confirmed')) return { field: 'form', message: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' };
  if (m.includes('too many requests') || m.includes('rate limit')) return { field: 'form', message: 'Muitas tentativas. Aguarde alguns minutos.' };
  return { field: 'form', message: 'Não foi possível autenticar. Tente novamente.' };
};

function FormContent({
  onAuthenticated, onBack,
}: {
  onAuthenticated: (email: string) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState<FieldError>(null);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const loading = loadingAction !== null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!/\S+@\S+\.\S+/.test(email)) { setError({ field: 'email', message: 'Informe um e-mail válido.' }); return; }

    if (forgot) {
      setLoadingAction('login');
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoadingAction(null);
      if (err) setError(translateError(err.message));
      else setForgotSent(true);
      return;
    }

    if (password.length < 6) { setError({ field: 'password', message: 'A senha precisa ter ao menos 6 caracteres.' }); return; }

    setError(null);
    setLoadingAction(mode === 'signup' ? 'signup' : 'login');

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      setLoadingAction(null);
      if (err) { setError(translateError(err.message)); return; }
      if (data.user) onAuthenticated(email);
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoadingAction(null);
      if (err) { setError(translateError(err.message)); return; }
      if (data.user) onAuthenticated(data.user.email ?? email);
    }
  };

  const handleGoogle = async () => {
    setLoadingAction('google');
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/` } });
  };

  if (forgotSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-black mb-3">Verifique seu e-mail</h3>
        <p className="text-muted-foreground text-sm mb-8">Enviamos o link para <strong className="text-foreground">{email}</strong>.</p>
        <button onClick={() => { setForgot(false); setForgotSent(false); setError(null); }}
          className="font-semibold text-foreground underline text-sm">Voltar ao login</button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <span className="text-[10px] font-bold text-primary-foreground bg-primary px-3 py-1 rounded-full uppercase tracking-wider">
          {forgot ? 'Recuperação' : mode === 'signup' ? 'Sua jornada' : 'Bem-vindo de volta'}
        </span>
        <h2 className="text-3xl font-black tracking-tight leading-tight mt-4">
          {forgot ? <>Recupere seu<br />acesso</> : mode === 'signup' ? <>Crie sua conta<br /><span className="text-muted-foreground">para começar.</span></> : <>Entre e continue<br /><span className="text-muted-foreground">de onde parou.</span></>}
        </h2>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {/* Google */}
        {!forgot && (
          <button type="button" onClick={handleGoogle} disabled={loading}
            className="w-full h-12 rounded-full border-2 border-border hover:border-foreground/20 hover:bg-muted active:scale-98 transition-all flex items-center justify-center gap-3 font-semibold text-sm disabled:opacity-50">
            {loadingAction === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </>
            )}
          </button>
        )}

        {!forgot && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ou com e-mail</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {error?.field === 'form' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-destructive">{error.message}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">E-mail</label>
          <div className={`flex items-center gap-3 mt-2 px-4 h-12 rounded-xl border-2 bg-card transition-colors ${error?.field === 'email' ? 'border-destructive/60' : 'border-border focus-within:border-primary'}`}>
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <input type="email" autoComplete="email" value={email} disabled={loading}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              placeholder="voce@email.com"
              className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-foreground/25 disabled:opacity-50" />
          </div>
          {error?.field === 'email' && <p className="text-xs font-semibold text-destructive mt-1.5">{error.message}</p>}
        </div>

        {/* Senha */}
        {!forgot && (
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Senha</label>
            <div className={`flex items-center gap-3 mt-2 px-4 h-12 rounded-xl border-2 bg-card transition-colors ${error?.field === 'password' ? 'border-destructive/60' : 'border-border focus-within:border-primary'}`}>
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password} disabled={loading}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                placeholder="Mínimo 6 caracteres"
                className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-foreground/25 disabled:opacity-50" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="text-muted-foreground shrink-0">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error?.field === 'password' && <p className="text-xs font-semibold text-destructive mt-1.5">{error.message}</p>}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-foreground text-background font-bold py-3.5 rounded-full flex items-center justify-center gap-2 active:scale-98 transition-all hover:shadow-md disabled:opacity-60 mt-2">
          {loading && loadingAction !== 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>{forgot ? 'Enviar link' : mode === 'signup' ? 'Criar conta' : 'Entrar'} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {!forgot ? (
          <div className="flex items-center justify-between text-sm mt-1">
            <button type="button" disabled={loading} onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(null); }}
              className="font-semibold text-foreground hover:text-primary transition-colors">
              {mode === 'signup' ? 'Já tenho conta' : 'Criar nova conta'}
            </button>
            <button type="button" disabled={loading} onClick={() => { setForgot(true); setError(null); }}
              className="text-muted-foreground hover:text-foreground transition-colors">
              Esqueci minha senha
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => { setForgot(false); setError(null); }}
            className="text-sm text-center text-muted-foreground hover:text-foreground transition-colors">
            Voltar ao login
          </button>
        )}
      </form>
    </>
  );
}

export function Auth({ onAuthenticated, onBack }: { onAuthenticated: (email: string) => void; onBack: () => void }) {
  const device = useDeviceType();

  // ── MOBILE ───────────────────────────────────────────────────────────────
  if (device === 'mobile') {
    return (
      <div className="min-h-screen bg-background flex flex-col px-5 pt-8 pb-10">
        <button onClick={onBack} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex flex-col justify-center mt-6">
          <FormContent onAuthenticated={onAuthenticated} onBack={onBack} />
        </div>
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  const features = [
    { icon: Dumbbell, title: 'Treino personalizado', desc: 'Montado para seu corpo, seu objetivo e sua rotina.' },
    { icon: Apple, title: 'Nutrição de verdade', desc: 'Dieta equilibrada sem radicalismo, feita para funcionar.' },
    { icon: Users, title: 'Suporte profissional', desc: 'Personal e nutricionista revisam e aprovam seu plano.' },
  ];

  return (
    <div className="min-h-screen w-full flex items-stretch bg-background overflow-hidden">
      {/* ── Esquerda — visual escuro ── */}
      <div className="w-[45%] flex flex-col justify-center px-16 py-20 relative overflow-hidden"
        style={{ background: 'oklch(0.07 0 0)' }}>
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
          style={{ background: '#CCFF00', opacity: 0.07 }} />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#CCFF00' }}>
              <span className="text-lg font-black text-black">E</span>
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: 'oklch(1 0 0 / 0.5)' }}>Evolvy</span>
          </div>

          <h2 className="font-black tracking-tight leading-tight text-white" style={{ fontSize: 40, marginBottom: 16 }}>
            Sua evolução<br />começa aqui.
          </h2>
          <p style={{ fontSize: 15, color: 'oklch(1 0 0 / 0.45)', lineHeight: 1.7, marginBottom: 48, maxWidth: 340 }}>
            Plano completo de treino e nutrição feito para você por profissionais certificados.
          </p>

          <div className="flex flex-col gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'oklch(0.95 0.24 124 / 0.12)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#CCFF00' }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{f.title}</p>
                    <p className="text-xs mt-1" style={{ color: 'oklch(1 0 0 / 0.4)', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Direita — formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-16 py-20 relative">
        <button onClick={onBack}
          className="absolute top-8 left-8 w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }} className="w-full max-w-sm">
          <FormContent onAuthenticated={onAuthenticated} onBack={onBack} />
        </motion.div>
      </div>
    </div>
  );
}