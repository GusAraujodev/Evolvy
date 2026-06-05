import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!geminiKey) {
    console.error('GEMINI_API_KEY não encontrada');
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY ausente' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    const { anamnese_id, user_id } = await req.json();

    console.log('Recebido:', { anamnese_id, user_id });

    if (!anamnese_id || !user_id) throw new Error('anamnese_id ou user_id ausente');

    const { data: anamnese, error: aErr } = await supabase
      .from('anamneses').select('*').eq('id', anamnese_id).single();
    if (aErr || !anamnese) throw new Error('Anamnese não encontrada: ' + aErr?.message);

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user_id).single();

    console.log('Dados carregados. Montando prompt...');

    const goalMap: Record<string, string> = {
      hipertrofia: 'Ganho de massa muscular e hipertrofia',
      emagrecimento: 'Perda de gordura e definição muscular',
      saude: 'Melhora da saúde geral e bem-estar',
      performance: 'Melhora de performance esportiva',
    };
    const locationMap: Record<string, string> = {
      academia: 'Academia completa com máquinas, halteres e barras',
      casa_com_peso: 'Em casa com halteres e barras disponíveis',
      casa_sem_peso: 'Em casa apenas com peso do próprio corpo',
      ar_livre: 'Ao ar livre sem equipamentos',
    };
    const expMap: Record<string, string> = {
      iniciante: 'Iniciante',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
    };
    const dinnerMap: Record<string, string> = {
      completo: 'Jantar completo com arroz, proteína e legumes',
      leve: 'Jantar leve como omelete ou salada',
      substituto: 'Substituto como shake ou vitamina',
      nao_janto: 'Geralmente não janta',
    };

    const diasTreino = anamnese.dias_por_semana ?? 3;
    const refeicoes = anamnese.refeicoes_por_dia ?? 3;

    const prompt = `Você é personal trainer e nutricionista esportivo com 15 anos de experiência.
Crie um plano COMPLETO e PERSONALIZADO de treino e nutrição.

DADOS DO USUÁRIO:
- Nome: ${profile?.name ?? 'Usuário'}
- Peso: ${profile?.weight_kg ?? 'não informado'}kg
- Altura: ${profile?.height_cm ?? 'não informado'}cm
- Objetivo: ${goalMap[anamnese.objetivo] ?? anamnese.objetivo ?? 'não informado'}
- Local de treino: ${locationMap[anamnese.local_treino] ?? anamnese.local_treino ?? 'academia'}
- Dias disponíveis: ${diasTreino} dias por semana
- Nível: ${expMap[anamnese.historico_treino] ?? anamnese.historico_treino ?? 'intermediário'}
- Lesões: ${anamnese.lesoes_ativas?.length > 0 ? anamnese.lesoes_ativas.join(', ') : 'nenhuma'}
- Refeições por dia: ${refeicoes}
- Restrições alimentares: ${anamnese.restricoes_alimentares?.length > 0 ? anamnese.restricoes_alimentares.join(', ') : 'nenhuma'}
- Preferência de jantar: ${dinnerMap[anamnese.preferencia_jantar] ?? anamnese.preferencia_jantar ?? 'completo'}
- Hidratação: ${anamnese.ingestao_agua ?? 'média'}
- Sono: ${anamnese.qualidade_sono ?? 'regular'}

REGRAS OBRIGATÓRIAS:
1. Crie exatamente ${diasTreino} dias de treino, os demais como descanso (7 dias no total)
2. Crie exatamente ${refeicoes} refeições por dia
3. Adapte os exercícios ao local: ${locationMap[anamnese.local_treino] ?? 'academia'}
4. Respeite lesões: ${anamnese.lesoes_ativas?.join(', ') || 'nenhuma'}
5. Retorne APENAS JSON válido, sem texto antes ou depois, sem marcadores de código

Retorne exatamente neste formato:
{"workout":{"divisao":"string","objetivo_resumo":"string","semana":[{"dia":"Segunda-feira","tipo":"treino","foco":"string","duracao_minutos":60,"exercicios":[{"nome":"string","series":4,"repeticoes":"10-12","descanso":"90s","tecnica":"string"}]},{"dia":"Terça-feira","tipo":"descanso","foco":"Descanso ativo","duracao_minutos":0,"exercicios":[]}],"observacoes":"string"},"nutrition":{"calorias_diarias":2000,"proteinas_g":150,"carboidratos_g":200,"gorduras_g":60,"agua_litros":2.5,"objetivo_resumo":"string","refeicoes":[{"nome":"Café da manhã","horario":"07:30","kcal_total":450,"proteina_g":30,"alimentos":[{"nome":"string","quantidade":"string","kcal":200,"proteina_g":20}]}],"dicas":["string","string","string"]}}`;

    console.log('Chamando gemini-2.0-flash via /v1/...');

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      throw new Error(`Gemini HTTP ${geminiRes.status}: ${errBody}`);
    }

    const geminiJson = await geminiRes.json();
    const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Gemini retornou vazio: ' + JSON.stringify(geminiJson).slice(0, 400));
    }

    console.log('Gemini respondeu. Limpando e parseando JSON...');

    // Remove qualquer marcador de código que o Gemini possa adicionar
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let plan: { workout: unknown; nutrition: unknown };
    try {
      plan = JSON.parse(cleaned);
    } catch {
      throw new Error('JSON inválido do Gemini: ' + cleaned.slice(0, 400));
    }

    if (!plan.workout || !plan.nutrition) {
      throw new Error('Plano incompleto — workout ou nutrition ausentes');
    }

    console.log('JSON válido. Salvando no banco...');

    const { error: wErr } = await supabase.from('plans').insert({
      user_id, anamnese_id,
      type: 'workout',
      content: plan.workout,
      status: 'pending_review',
    });
    if (wErr) throw new Error('Erro ao salvar workout: ' + wErr.message);

    const { error: nErr } = await supabase.from('plans').insert({
      user_id, anamnese_id,
      type: 'nutrition',
      content: plan.nutrition,
      status: 'pending_review',
    });
    if (nErr) throw new Error('Erro ao salvar nutrition: ' + nErr.message);

    await supabase.from('anamneses')
      .update({ status: 'pending_review' })
      .eq('id', anamnese_id);

    console.log('✅ Plano gerado e salvo com sucesso!');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('ERRO FATAL:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});