import { motion } from 'framer-motion';
import { ArrowRight, Sun, Moon, Dumbbell, Apple, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeviceType } from '@/hooks/useDeviceType';

function ThemeToggle() {
  const { isDark, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Alternar tema"
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors shadow-soft"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export function Splash({ onStart }: { onStart: () => void }) {
  const device = useDeviceType();

  const bullets = [
    { icon: Dumbbell, text: 'Treino sob medida' },
    { icon: Apple,    text: 'Nutrição personalizada' },
    { icon: Users,    text: 'Acompanhamento profissional' },
  ];

  // ── MOBILE ───────────────────────────────────────────────────────────────
  if (device === 'mobile') {
    return (
      <>
        <ThemeToggle />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
          <motion.div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-primary/10"
            animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 7, repeat: Infinity }} />
          <motion.div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-primary/6"
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity }} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} className="relative z-10 text-center w-full max-w-sm">
            <div className="w-16 h-16 mx-auto mb-8 bg-foreground rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-black text-background">E</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-[1.05] mb-4">
              Evoluir é para<br /><span className="text-primary">todos</span>
            </h1>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed">
              Transforme seu corpo e sua rotina com um plano feito para você, guiado por profissionais de saúde.
            </p>
            <motion.button onClick={onStart} whileTap={{ scale: 0.97 }}
              className="w-full bg-foreground text-background font-bold py-4 rounded-full flex items-center justify-center gap-2 text-base">
              Começar minha evolução <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-xs text-muted-foreground mt-6">
              ✓ Sem cartão de crédito · ✓ Cancele quando quiser
            </p>
          </motion.div>
        </div>
      </>
    );
  }

  // ── DESKTOP ──────────────────────────────────────────────────────────────
  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen w-full bg-background flex items-stretch overflow-hidden relative">

        {/* Blob decorativo */}
        <motion.div aria-hidden
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-primary/5 pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── ESQUERDA ── */}
        <div className="flex-1 flex flex-col justify-center px-[8vw] py-20 relative z-10">
          {/* Logo + badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }} className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
              <span className="text-lg font-black text-background">E</span>
            </div>
            <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Evolvy</span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              ✦ Método Evolvy
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="font-black tracking-tight text-foreground leading-[1.04]"
            style={{ fontSize: 'clamp(52px, 5vw, 80px)', marginBottom: 20 }}>
            Evoluir é para<br />
            <span className="text-primary">todos</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.55 }}
            className="text-muted-foreground leading-relaxed max-w-[400px]"
            style={{ fontSize: 18, marginBottom: 36 }}>
            Transforme seu corpo e sua rotina com um plano feito para você, guiado por profissionais de saúde.
          </motion.p>

          {/* Bullets */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }} className="flex flex-col gap-4 mb-12">
            {bullets.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div key={b.text} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{b.text}</span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}>
            <motion.button onClick={onStart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="bg-foreground text-background font-bold rounded-full flex items-center gap-3 hover:shadow-md transition-shadow"
              style={{ padding: '16px 36px', fontSize: 16 }}>
              Começar minha evolução <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-xs text-muted-foreground mt-4">
              ✓ Sem cartão de crédito · ✓ Cancele quando quiser
            </p>
          </motion.div>
        </div>

        {/* ── DIREITA — visual abstrato sem info fake ── */}
        <div className="w-[42%] max-w-[580px] relative flex items-center justify-center overflow-hidden"
          style={{ background: 'oklch(0.07 0 0)' }}>

          {/* Glow central */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full blur-[100px]" style={{ background: '#CCFF00', opacity: 0.08 }} />
          </div>

          {/* Grid decorativo */}
          <div aria-hidden className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Conteúdo visual */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-12">
            {/* Logo grande */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: '#CCFF00' }}>
              <span className="text-6xl font-black text-black">E</span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-center font-black tracking-tight"
              style={{ fontSize: 28, color: '#fff', lineHeight: 1.2 }}>
              O seu plano.<br />Do seu jeito.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center max-w-[240px]"
              style={{ fontSize: 14, color: 'oklch(1 0 0 / 0.4)', lineHeight: 1.6 }}>
              Treino e nutrição personalizados por profissionais de saúde certificados.
            </motion.p>

            {/* 3 pills */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="flex flex-col gap-2 w-full max-w-[220px]">
              {['Plano de treino', 'Plano nutricional', 'Personal e nutricionista'].map((t, i) => (
                <div key={t} className="flex items-center gap-3 px-4 py-2.5 rounded-full"
                  style={{ background: 'oklch(1 0 0 / 0.05)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#CCFF00' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'oklch(1 0 0 / 0.7)' }}>{t}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}