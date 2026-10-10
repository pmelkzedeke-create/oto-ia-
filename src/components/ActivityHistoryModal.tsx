import React from 'react';
import { Activity, X, CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { ActivityItem } from '../types/otto';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onClear: () => void;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose,
  activities,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[80vh] rounded-2xl border border-white/20 bg-[#090D14] p-6 shadow-[0_0_35px_rgba(255,255,255,0.1)] flex flex-col gap-4 overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold font-['Space_Grotesk'] text-white">
              Histórico Operacional de Atividades
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                onClick={onClear}
                className="p-1.5 text-slate-500 hover:text-white transition-colors"
                title="Limpar histórico"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {activities.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500">
              <Activity className="w-8 h-8 opacity-30 mb-2" />
              <span>Nenhuma atividade operacional registrada ainda.</span>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                data-testid="activity-item"
                className="animate-activity-slide-in slide-in flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                {act.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                {act.type === 'progress' && <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0 mt-1" />}
                {act.type === 'warning' && <AlertTriangle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                {act.type === 'error' && <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-slate-200">{act.message}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(act.timestamp).toLocaleTimeString('pt-BR')} · {new Date(act.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
