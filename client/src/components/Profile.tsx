import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, Edit2, LogOut, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ProfileData } from './DataCapture';

function calculateAge(birthDate: string): number {
  const date = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

function calculateIMC(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

function getIMCCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-500' };
  if (imc < 25) return { label: 'Peso normal', color: 'text-green-500' };
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-500' };
  return { label: 'Obesidade', color: 'text-red-500' };
}

export function Profile({
  profile,
  onBack,
  onLogout,
  onNameUpdate,
}: {
  profile: ProfileData;
  onBack: () => void;
  onLogout: () => void;
  onNameUpdate?: (name: string) => void;
}) {
  const [dbAge, setDbAge] = useState<number | null>(null);
  const [dbWeight, setDbWeight] = useState<number | null>(null);
  const [dbHeight, setDbHeight] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles')
        .select('name, age, weight_kg, height_cm')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          if (data.age) setDbAge(data.age);
          if (data.weight_kg) setDbWeight(data.weight_kg);
          if (data.height_cm) setDbHeight(data.height_cm);
        });
    });
  }, []);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState(profile);
  const [editData, setEditData] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('name, age, weight_kg, height_cm')
        .eq('id', user.id)
        .single();
      if (data) {
        const resolvedName = data.name ?? profile.name;
        setLoadedProfile({
          name: resolvedName,
          birthDate: profile.birthDate,
          weight: data.weight_kg?.toString() ?? profile.weight,
          height: data.height_cm?.toString() ?? profile.height,
        });
        setEditData({
          name: resolvedName,
          birthDate: profile.birthDate,
          weight: data.weight_kg?.toString() ?? profile.weight,
          height: data.height_cm?.toString() ?? profile.height,
        });
        onNameUpdate?.(resolvedName);
      }
    };
    load();
  }, []);

  const age = dbAge ?? calculateAge(profile.birthDate) ?? 0;
  const weight = dbWeight ?? Number(profile.weight);
  const height = dbHeight ?? Number(profile.height);
  const imc = calculateIMC(weight, height);
  const imcCategory = getIMCCategory(imc);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    // TODO: Integrar com backend para salvar dados atualizados
    setIsEditing(false);
  };

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
            <p className="text-xs font-bold text-muted-foreground uppercase">Configurações</p>
            <h1 className="text-2xl font-black">Perfil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container py-8 max-w-3xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 border-2 border-border mb-8"
        >
          <div className="flex gap-6 items-start">
            {/* Photo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={loadedProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-primary-foreground">{loadedProfile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:shadow-glow transition-all active:scale-90"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-black">{loadedProfile.name}</h2>
              <div className="flex items-center gap-2 mt-3 bg-primary/10 px-4 py-2 rounded-full w-fit">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">Plano Premium</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black">Meus dados</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Editar dados"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age */}
            <div className="bg-card rounded-2xl p-6 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase">Idade</p>
              <p className="text-4xl font-black mt-3">{age}</p>
              <p className="text-xs text-muted-foreground mt-2">anos</p>
            </div>

            {/* Height */}
            <div className="bg-card rounded-2xl p-6 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase">Altura</p>
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-4xl font-black">{height}</p>
                <p className="text-sm text-muted-foreground">cm</p>
              </div>
              {isEditing && (
                <input
                  type="number"
                  value={editData.height}
                  onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              )}
            </div>

            {/* Weight */}
            <div className="bg-card rounded-2xl p-6 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase">Peso</p>
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-4xl font-black">{weight}</p>
                <p className="text-sm text-muted-foreground">kg</p>
              </div>
              {isEditing && (
                <input
                  type="number"
                  value={editData.weight}
                  onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              )}
            </div>

            {/* IMC */}
            <div className="bg-card rounded-2xl p-6 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase">IMC</p>
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-4xl font-black">{imc.toFixed(1)}</p>
              </div>
              <p className={`text-sm font-semibold mt-2 ${imcCategory.color}`}>{imcCategory.label}</p>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleSaveEdit}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl transition-all hover:shadow-glow active:scale-[0.98]"
            >
              Salvar alterações
            </motion.button>
          )}
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onLogout}
          className="w-full mt-12 bg-destructive/10 text-destructive font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </motion.button>
      </div>
    </div>
  );
}
