import React from 'react';
import { ActivityItem } from '../types/otto';
import { CheckCircle2, AlertTriangle, XCircle, Info, ChevronRight } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItem[];
  currentStep?: string | null;
  onOpenHistory?: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  currentStep,
  onOpenHistory,
}) => {
  const latestActivities = activities.slice(-3);

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Active Operational Step Banner */}
      {currentStep ? (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/30 bg-black/80 backdrop-blur-md text-white font-mono text-xs shadow-[0_0_15px_rgba(255,255,255,0.15)] animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="text-white font-semibold tracking-wider uppercase text-[10px]">OTTO ATIVO</span>
          <span className="text-slate-500">|</span>
          <span className="flex-1 truncate text-slate-100">{currentStep}</span>
        </div>
      ) : latestActivities.length > 0 ? (
        <div className="flex flex-col gap-1.5" data-testid="activity-feed">
          {latestActivities.map((act) => (
            <div
              key={act.id}
              data-testid="activity-item"
              className="animate-activity-slide-in slide-in flex items-center gap-2.5 px-3.5 py-1.5 rounded border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-xs font-mono transition-all duration-300"
            >
              {act.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
              {act.type === 'progress' && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
              {act.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              {act.type === 'error' && <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {act.type === 'info' && <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />}

              <span className="text-slate-300 truncate flex-1">{act.message}</span>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(act.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-xs font-mono text-slate-500 py-1 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span>SISTEMA PRONTO · NENHUMA TAREFA PENDENTE</span>
        </div>
      )}

      {activities.length > 3 && onOpenHistory && (
        <div className="flex justify-center mt-1.5">
          <button
            onClick={onOpenHistory}
            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Ver histórico de atividades ({activities.length}) <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
