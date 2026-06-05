import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProNutrition } from '@/components/ProNutrition';
import { ProTrainer } from '@/components/ProTrainer';
import NotFound from '@/pages/NotFound';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';

function ProDashboard() {
  const [tab, setTab] = useState<'nutrition' | 'trainer'>('nutrition');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center border-b border-border bg-card px-6 py-4 gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
          <span className="text-xs font-black text-primary-foreground">P</span>
        </div>
        <button
          onClick={() => setTab('nutrition')}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
            tab === 'nutrition' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          Nutricionista
        </button>
        <button
          onClick={() => setTab('trainer')}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
            tab === 'trainer' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
        >
          Personal Trainer
        </button>
      </div>
      {tab === 'nutrition' ? <ProNutrition /> : <ProTrainer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={'/pro'} component={ProDashboard} />
      <Route path={'/'} component={Home} />
      <Route path={'/404'} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
