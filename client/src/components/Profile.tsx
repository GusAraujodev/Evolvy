import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, Edit2, LogOut, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ProfileData } from './DataCapture';

// Calcula a idade com base em uma string de data
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const date = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

// Calcula o valor do IMC
function calculateIMC(weight: number, height: number): number {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// Retorna a classificação textual e visual do IMC calculado
function getIMCCategory(imc: number): { label: string; color: string } {
  if (imc <= 0) return { label: 'Dados inválidos', color: 'text-muted-foreground' };
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

 // Busca dados do Supabase na inicialização para popular estados primitivos
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles')
        .select('name, age, weight_kg, height_cm, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          if (data.age) setDbAge(data.age);
          if (data.weight_kg) setDbWeight(data.weight_kg);
          if (data.height_cm) setDbHeight(data.height_cm);
          if (data.avatar_url) setProfilePhoto(data.avatar_url);
        });
    });
  }, []);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState(profile);
  const [editData, setEditData] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

 // Sincroniza dados completos da tabela com os estados locais do formulário
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('name, age, weight_kg, height_cm, avatar_url')
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
        if (data.avatar_url) setProfilePhoto(data.avatar_url);
        onNameUpdate?.(resolvedName);
      }
    };
    load();
  }, []);

  // Definições de fallback de layout baseados nos estados reativos
  const age = dbAge ?? (profile.birthDate ? calculateAge(profile.birthDate) : null) ?? 0;
  const weight = dbWeight ?? Number(profile.weight) ?? 0;
  const height = dbHeight ?? Number(profile.height) ?? 0;
  const imc = calculateIMC(weight, height);
  const imcCategory = getIMCCategory(imc);

  // Processa o upload seguro e real de imagens para o Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida se é imagem mesmo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato de arquivo não suportado. Use apenas JPG, PNG ou WEBP.');
      return;
    }

    // Valida o limite de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. O limite máximo permitido é 5MB.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Define o caminho organizando por ID de usuário
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    // Faz o upload para o Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Erro de upload:', uploadError.message);
      return;
    }

    // Pega a URL pública gerada
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Salva o link da foto na coluna avatar_url da tabela profiles
    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Mostra a foto na tela na mesma hora
    setProfilePhoto(publicUrl);
  };

  // Envia as alterações validadas para o banco usando apenas as colunas válidas da tabela
  const handleSaveEdit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsEditing(false); return; }

    const weightNum = parseFloat(editData.weight);
    const heightNum = parseInt(editData.height);
    let ageNum: number | null = null;
    if (editData.birthDate) {
      const birth = new Date(editData.birthDate);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let a = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
        ageNum = a;
      }
    }

    // Salva na tabela contendo exclusivamente os campos homologados que seu banco aceita
    await supabase.from('profiles').upsert({
      id: user.id,
      name: editData.name,
      age: ageNum ?? dbAge ?? null,
      weight_kg: isNaN(weightNum) ? null : weightNum,
      height_cm: isNaN(heightNum) ? null : heightNum,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    // Atualiza estados reativos locais para refletir em tela imediatamente
    if (ageNum !== null) setDbAge(ageNum);
    if (!isNaN(weightNum)) setDbWeight(weightNum);
    if (!isNaN(heightNum)) setDbHeight(heightNum);
    
    setLoadedProfile({ ...editData });
    onNameUpdate?.(editData.name);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-8">
      {/* Cabeçalho */}
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

      {/* Conteúdo */}
      <div className="flex-1 container py-8 max-w-3xl">
        {/* Cartão do Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 border-2 border-border mb-8"
        >
          <div className="flex gap-6 items-start">
            {/* Foto */}
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

            {/* Informações básicas com Input condicional de Nome */}
            <div className="flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Nome</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full max-w-sm px-3 py-1.5 rounded-lg border border-border bg-background text-base font-semibold outline-none focus:border-primary"
                  />
                </div>
              ) : (
                <h2 className="text-3xl font-black">{loadedProfile.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-3 bg-primary/10 px-4 py-2 rounded-full w-fit">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">Plano Premium</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Seção de Dados */}
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

          {/* Grade de Informações contendo inputs para edição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Idade com Input condicional numérico para o banco */}
            <div className="bg-card rounded-2xl p-6 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase">Idade</p>
              <p className="text-4xl font-black mt-3">{age}</p>
              <p className="text-xs text-muted-foreground mt-2">anos</p>
              {isEditing && (
                <input
                  type="number"
                  value={editData.birthDate} // Reutiliza a propriedade de string para tráfego local do número digitado
                  onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                  placeholder="Nova idade"
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              )}
            </div>

            {/* Altura */}
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

            {/* Peso */}
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

          {/* Botão Salvar */}
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

        {/* Botão Sair */}
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
