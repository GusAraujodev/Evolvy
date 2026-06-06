import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Splash } from '@/components/Splash';
import { Onboarding } from '@/components/Onboarding';
import { Auth } from '@/components/Auth';
import { DataCapture, type ProfileData } from '@/components/DataCapture';
import { Plans } from '@/components/Plans';
import { Dashboard } from '@/components/Dashboard';
import { supabase } from '@/lib/supabase';

// ─── Fluxo correto ────────────────────────────────────────────────────────────
// Splash → Auth → DataCapture → Onboarding → Plans → App
// O usuário faz login PRIMEIRO, depois preenche o questionário.
// Assim o supabase.auth.getUser() funciona no Onboarding.
// ─────────────────────────────────────────────────────────────────────────────

type Stage = 'loading' | 'splash' | 'auth' | 'data' | 'onboarding' | 'plans' | 'app';

const fade = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

export default function Home() {
  const [stage, setStage] = useState<Stage>('loading');
  const [profile, setProfile] = useState<ProfileData>({
    name: '', birthDate: '', weight: '', height: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setStage('splash');
        return;
      }
      const [{ data: prof }, { data: anam }] = await Promise.all([
        supabase.from('profiles').select('name, weight_kg, height_cm').eq('id', session.user.id).maybeSingle(),
        supabase.from('anamneses').select('id').eq('user_id', session.user.id).limit(1).maybeSingle(),
      ]);
      const perfilCompleto = prof?.name && prof?.weight_kg && prof?.height_cm;
      if (perfilCompleto && anam) {
        if (prof?.name) setProfile(p => ({ ...p, name: prof.name }));
        setStage('app');
      } else if (perfilCompleto && !anam) {
        setStage('onboarding');
      } else {
        setStage('data');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile({ name: '', birthDate: '', weight: '', height: '' });
        setStage('splash');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAndRoute = async (userId: string) => {
    try {
      const [{ data: prof }, { data: anam }] = await Promise.all([
        supabase.from('profiles').select('name, weight_kg, height_cm').eq('id', userId).maybeSingle(),
        supabase.from('anamneses').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      ]);
      const perfilCompleto = prof?.name && prof?.weight_kg && prof?.height_cm;
      if (prof?.name) setProfile(p => ({ ...p, name: prof.name }));
      if (perfilCompleto && anam) {
        setStage('app');
      } else if (perfilCompleto && !anam) {
        setStage('onboarding');
      } else {
        setStage('data');
      }
    } catch (error) {
      console.error("Erro no roteamento:", error);
      setStage('data');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile({ name: '', birthDate: '', weight: '', height: '' });
    setStage('splash');
  };

  return (
    <AnimatePresence mode="wait">

      {stage === 'loading' && (
        <motion.div key="loading" {...fade}
          className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </motion.div>
      )}

      {stage === 'splash' && (
        <motion.div key="splash" {...fade}>
          <Splash onStart={() => setStage('auth')} />
        </motion.div>
      )}

      {/* AUTH vem logo depois do Splash */}
      {stage === 'auth' && (
        <motion.div key="auth" {...fade}>
          <Auth
            onBack={() => setStage('splash')}
            onAuthenticated={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) await checkAndRoute(user.id);
              else setStage('data');
            }}
          />
        </motion.div>
      )}

      {/* DataCapture: nome, peso, altura */}
      {stage === 'data' && (
        <motion.div key="data" {...fade}>
          <DataCapture
            initialName={profile.name}
            onBack={() => setStage('auth')}
            onComplete={(d) => {
              setProfile({
                ...d,
                weight: Math.abs(Number(d.weight)).toString(),
                height: Math.abs(Number(d.height)).toString(),
              });
              setStage('onboarding');
            }}
          />
        </motion.div>
      )}

      {/* Onboarding: questionário — usuário já está logado aqui */}
      {stage === 'onboarding' && (
        <motion.div key="onboarding" {...fade}>
          <Onboarding
            onBack={() => setStage('data')}
            onComplete={() => setStage('plans')}
          />
        </motion.div>
      )}

      {stage === 'plans' && (
        <motion.div key="plans" {...fade}>
          <Plans
            onBack={undefined}
            onSelect={() => setStage('app')}
            onSkip={() => setStage('app')}
          />
        </motion.div>
      )}

      {stage === 'app' && (
        <motion.div key="app" {...fade}>
          <Dashboard profile={profile} onLogout={handleLogout} />
        </motion.div>
      )}

    </AnimatePresence>
  );
}
