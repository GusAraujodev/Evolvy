# 🚀 Evolvy - Plataforma de Evolução Pessoal

Redesign completo e responsivo da plataforma Evolvy com design system moderno, modo dark nativo e formulários motivadores.

## ✨ Melhorias Implementadas

### 🎨 Design System Completo
- **Cores**: Branco puro (#FFFFFF) + Verde Limão (#CCFF00)
- **Tipografia**: Inter com hierarquia clara e pesos variados
- **Espaçamento**: Sistema consistente com breakpoints responsivos
- **Sombras**: Soft e Glow para profundidade visual
- **Animações**: Framer Motion com spring physics e easing customizado

### 📱 Responsividade Total
- **Mobile-first**: Design otimizado para celulares
- **Tablet**: Layout adaptado para 768px+
- **Desktop**: Sidebar fixa + conteúdo expandido para 1024px+
- **Sem max-width travado**: Aplicação se adapta a qualquer tamanho de tela

### 🌓 Modo Dark Nativo
- Toggle de tema no header (Sun/Moon icon)
- Persistência em localStorage
- Cores otimizadas para ambos os modos
- Suporte a preferência do sistema

### 💪 Formulários Motivadores
- **Onboarding**: Perguntas positivas e empoderadoras
  - "Como você se vê hoje?" (em vez de "Evito me olhar")
  - "O que mais te sabotou?" (com opções construtivas)
  - Ícones inspiradores e linguagem positiva
- **Auth**: Campos com validação inline e feedback visual
- **Data Capture**: Estilo minimalista com underline elegante

### 🎯 Componentes Principais

#### Splash
- Logo animado
- Headline aspiracional com destaque em verde-limão
- Blobs de fundo animados
- CTA clara com trust signals

#### Onboarding
- 5 perguntas com opções de escolha única
- Barra de progresso animada
- Transições suaves entre perguntas
- Feedback visual de seleção

#### Auth
- Modo signup/login/recuperação
- Validação em tempo real
- Ícones informativos
- Tratamento de erros com animação shake

#### Data Capture
- 4 campos (nome, idade, peso, altura)
- Validação com limites min/max
- CTA desabilitado até preenchimento completo
- Feedback de erro com ícone de alerta

#### Plans
- 2 planos com comparação clara
- Badge "Recomendado" no Premium
- Listagem de benefícios com ícones
- CTAs primária e secundária

#### Dashboard
- Sidebar responsivo (colapsável em mobile)
- Header com toggle de tema e logout
- Seções: Treino, Rotina, Hidratação, Suporte
- Cards com sombras e transições suaves
- Grid responsivo (1 col mobile, 3 cols desktop)

## 🛠️ Stack Técnico

- **React 19** com TypeScript
- **Tailwind CSS 4** com tokens customizados
- **Framer Motion** para animações
- **Lucide React** para ícones
- **Wouter** para roteamento
- **Next Themes** para gerenciamento de tema

## 📦 Estrutura de Arquivos

```
client/
├── src/
│   ├── components/
│   │   ├── Splash.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Auth.tsx
│   │   ├── DataCapture.tsx
│   │   ├── Plans.tsx
│   │   ├── Dashboard.tsx
│   │   └── ui/ (shadcn/ui components)
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css (Design System)
├── index.html
└── public/
```

## 🎮 Fluxo de Navegação

```
Splash → Onboarding → Auth → Data Capture → Plans → Dashboard
```

### Credenciais Demo
- **Email**: demo@evolvy.app
- **Senha**: evolvy123

## 🚀 Como Usar

### Desenvolvimento
```bash
pnpm install
pnpm dev
```

Acesse: http://localhost:3000

### Build
```bash
pnpm build
```

### Preview
```bash
pnpm preview
```

## 🎨 Customização do Design System

Todos os tokens estão em `client/src/index.css`:

- **Cores**: Variáveis CSS em formato OKLCH
- **Espaçamento**: Baseado em rem (16px base)
- **Tipografia**: Inter com weights 400-800
- **Animações**: Definidas em @keyframes customizadas

### Modo Dark
Para ativar modo dark em um elemento:
```html
<div class="dark">...</div>
```

Ou use o contexto:
```tsx
const { isDark, setTheme } = useTheme();
```

## 📊 Responsividade

| Breakpoint | Largura | Uso |
|-----------|---------|-----|
| Mobile | < 640px | Layout mobile padrão |
| Tablet | 640px - 1024px | Ajustes de espaçamento |
| Desktop | 1024px+ | Sidebar + conteúdo expandido |

## ✅ Checklist de Qualidade

- ✅ Design system completo e consistente
- ✅ Responsivo em todos os tamanhos
- ✅ Modo dark implementado
- ✅ Animações suaves e performáticas
- ✅ Formulários motivadores
- ✅ Validação inline
- ✅ Acessibilidade básica (labels, ARIA)
- ✅ TypeScript strict mode
- ✅ Sem erros de compilação

## 🔧 Próximos Passos

1. Integrar com backend real
2. Implementar autenticação Firebase
3. Adicionar mais telas (Treinos, Nutrição, Perfil)
4. Analytics e tracking
5. PWA capabilities
6. Otimizações de performance

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ e Verde Limão (#CCFF00)**
