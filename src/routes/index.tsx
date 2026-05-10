import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Apple, User } from "lucide-react";
import { Splash } from "@/components/evolvy/Splash";
import { Onboarding } from "@/components/evolvy/Onboarding";
import { Auth } from "@/components/evolvy/Auth";
import { DataCapture, type ProfileData } from "@/components/evolvy/DataCapture";
import { Plans } from "@/components/evolvy/Plans";
import { HomeScreen } from "@/components/evolvy/Home";
import { BottomTabs, type Tab } from "@/components/evolvy/BottomTabs";
import { PlaceholderScreen } from "@/components/evolvy/Placeholder";

export const Route = createFileRoute("/")({
  component: Index,
});

type Stage = "splash" | "onboarding" | "auth" | "data" | "plans" | "app";

function Index() {
  const [stage, setStage] = useState<Stage>("splash");
  const [profile, setProfile] = useState<ProfileData>({ name: "", age: "", weight: "", height: "" });
  const [tab, setTab] = useState<Tab>("home");
  const [water, setWater] = useState(0);

  // Lógica de Água Corrigida (0.25L) e sem dependência de biblioteca externa
  const addWater = () => {
    const newAmount = Math.round((water + 0.25) * 100) / 100;
    setWater(newAmount);
  };

  if (stage === "splash") return <Splash onStart={() => setStage("onboarding")} />;
  
  if (stage === "onboarding") return (
    <Onboarding onBack={() => setStage("splash")} onComplete={() => setStage("auth")} />
  );

  if (stage === "auth") return (
    <Auth onBack={() => setStage("onboarding")} onAuthenticated={() => setStage("data")} />
  );

  if (stage === "data") return (
    <DataCapture
      initialName={profile.name}
      onBack={() => setStage("auth")}
      onComplete={(d) => {
        const cleanData = {
          ...d,
          age: Math.abs(Number(d.age)).toString(),
          weight: Math.abs(Number(d.weight)).toString(),
          height: Math.abs(Number(d.height)).toString(),
        };
        setProfile(cleanData);
        setStage("plans");
      }}
    />
  );

  if (stage === "plans") return (
    <Plans onBack={undefined} onSelect={() => setStage("app")} onSkip={() => setStage("app")} />
  );

  return (
    <div className="bg-white min-h-dvh max-w-md mx-auto relative shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-24"
        >
          {tab === "home" && (
            <HomeScreen 
              name={profile.name} 
              waterAmount={water} 
              onAddWater={addWater} 
            />
          )}
          {tab === "workouts" && <PlaceholderScreen title="Treinos" subtitle="Sua evolução física" icon={Dumbbell} />}
          {tab === "nutrition" && <PlaceholderScreen title="Nutrição" subtitle="Sua base de saúde" icon={Apple} />}
          {tab === "profile" && <PlaceholderScreen title="Perfil" subtitle={`Evoluindo sempre, ${profile.name}`} icon={User} />}
        </motion.div>
      </AnimatePresence>
      
      {/* Botão de Suporte WhatsApp */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank" 
        className="fixed top-6 right-6 z-50 bg-white/80 backdrop-blur-md p-2 rounded-full border border-zinc-100 shadow-sm hover:scale-110 transition-transform"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 opacity-80" alt="Suporte" />
      </a>

      <BottomTabs active={tab} onChange={setTab} />
    </div>
  );
}
