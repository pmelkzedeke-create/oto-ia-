import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Terminal, FolderKanban, Cpu, Brain, Eye, Settings, MessageSquare } from 'lucide-react';
import { SystemTelemetry } from '../types/otto';

interface HudHeaderProps {
  systemInfo: SystemTelemetry | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenSystem: () => void;
  onOpenWorkspace: () => void;
  onOpenTerminal: () => void;
  onOpenMemory: () => void;
  onOpenVision: () => void;
  onOpenSettings: () => void;
  onToggleChat: () => void;
  unreadCount?: number;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  systemInfo,
  voiceEnabled,
  onToggleVoice,
  onOpenSystem,
  onOpenWorkspace,
  onOpenTerminal,
  onOpenMemory,
  onOpenVision,
  onOpenSettings,
  onToggleChat,
  unreadCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-30">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded border border-white/30 bg-white/10 text-white font-mono font-bold tracking-widest text-sm shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            O
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wider text-white flex items-center gap-2">
              OTTO
              <span className="text-[10px] font-mono font-normal text-slate-300 px-1.5 py-0.5 rounded border border-white/20 bg-white/10">
                v2.5 ONLINE
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Seu computador. Sua voz. Seu assistente.
            </span>
          </div>
        </div>
      </div>

      {/* Center contextual metrics */}
      <div className="hidden md:flex items-center gap-6 font-mono text-xs text-slate-300">
        <button
          onClick={onOpenSystem}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-all text-slate-300 hover:text-white"
          title="Ver Integridade do Sistema"
        >
          <Cpu className="w-3.5 h-3.5 text-slate-300" />
          <span>CPU {systemInfo ? `${systemInfo.cpuUsagePercent}%` : '32%'}</span>
          <span className="text-slate-600">|</span>
          <span>RAM {systemInfo ? `${systemInfo.memoryUsagePercent}%` : '48%'}</span>
        </button>

        <div className="flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-4">
          <span className="text-slate-200">{currentTime}</span>
          <span className="text-slate-600">·</span>
          <span className="text-[10px] text-slate-500">{currentDate}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleVoice}
          className={`p-2 rounded border text-xs font-mono transition-all flex items-center gap-1.5 ${
            voiceEnabled
              ? 'border-white/40 bg-white/15 text-white shadow-[0_0_10px_rgba(255,255,255,0.15)]'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300'
          }`}
          title={voiceEnabled ? 'Voz ativa (clique para silenciar)' : 'Voz desativada (clique para ativar som)'}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden lg:inline text-[11px]">{voiceEnabled ? 'VOZ LIGADA' : 'MUDO'}</span>
        </button>

        <button
          onClick={onOpenWorkspace}
          className="p-2 rounded border border-slate-800 hover:border-white/30 bg-slate-900/40 text-slate-300 hover:text-white transition-all"
          title="Arquivos e Espaço de Trabalho"
        >
          <FolderKanban className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenTerminal}
          className="p-2 rounded border border-slate-800 hover:border-white/30 bg-slate-900/40 text-slate-300 hover:text-white transition-all"
          title="Terminal do Sistema"
        >
          <Terminal className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenMemory}
          className="p-2 rounded border border-slate-800 hover:border-white/30 bg-slate-900/40 text-slate-300 hover:text-white transition-all"
          title="Memória & Preferências"
        >
          <Brain className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenVision}
          className="p-2 rounded border border-slate-800 hover:border-white/30 bg-slate-900/40 text-slate-300 hover:text-white transition-all"
          title="Visão Computacional (Analisar Tela)"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded border border-slate-800 hover:border-white/30 bg-slate-900/40 text-slate-300 hover:text-white transition-all"
          title="Configurações do OTTO"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleChat}
          className="relative p-2 rounded border border-slate-800 hover:border-white/30 bg-slate-900/40 text-slate-300 hover:text-white transition-all"
          title="Histórico de Conversas (Chat)"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </button>
      </div>
    </header>
  );
};
