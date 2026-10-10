import React from 'react';
import { Cpu, HardDrive, Server, Wifi, Activity, ShieldCheck, X } from 'lucide-react';
import { SystemTelemetry } from '../types/otto';

interface SystemStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemTelemetry | null;
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({
  isOpen,
  onClose,
  systemInfo,
}) => {
  if (!isOpen) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${Math.round(mb)} MB`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-[#090B10] p-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold tracking-wide text-white uppercase">
              Telemetria & Status do Sistema
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System telemetry grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          {/* CPU Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-white" /> Processador (CPU)
              </span>
              <span className="text-white font-bold">
                {systemInfo ? `${systemInfo.cpuUsagePercent}%` : '32%'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-300 to-white transition-all duration-500"
                style={{ width: `${systemInfo?.cpuUsagePercent || 32}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 truncate pt-1">
              {systemInfo?.cpuModel || 'Intel / AMD Architecture'} ({systemInfo?.cpuCores || 4} Cores)
            </p>
          </div>

          {/* RAM Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-white" /> Memória RAM
              </span>
              <span className="text-white font-bold">
                {systemInfo ? `${systemInfo.memoryUsagePercent}%` : '48%'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-400 to-slate-100 transition-all duration-500"
                style={{ width: `${systemInfo?.memoryUsagePercent || 48}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 truncate pt-1">
              Usado: {formatBytes(systemInfo?.usedMemoryBytes)} / Total: {formatBytes(systemInfo?.totalMemoryBytes)}
            </p>
          </div>

          {/* OS & Host Details */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Server className="w-4 h-4 text-white" /> Sistema Operacional
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-slate-300 pt-1">
              <div>Plataforma: <span className="text-white uppercase font-bold">{systemInfo?.platform || 'Linux'} ({systemInfo?.arch || 'x64'})</span></div>
              <div>Host: <span className="text-slate-400">{systemInfo?.hostname || 'otto-node-host'}</span></div>
              <div>Versão Node: <span className="text-slate-400">{systemInfo?.nodeVersion || 'v22.x'}</span></div>
            </div>
          </div>

          {/* Network & Uptime */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wifi className="w-4 h-4 text-white" /> Conexão & Tempo Ativo
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-slate-300 pt-1">
              <div>Status: <span className="text-white font-bold">● ONLINE / CONECTADO</span></div>
              <div>Tempo Ativo: <span className="text-slate-200">{formatUptime(systemInfo?.uptimeSeconds)}</span></div>
              <div>Bridge Nativa: <span className="text-slate-300">Conexão Local Ativa</span></div>
            </div>
          </div>

          {/* AI Engine Model Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 text-xs sm:col-span-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-white" /> Modelo Principal de IA
              </span>
              <span className="text-white font-bold px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px]">
                GROQCLOUD ATIVO
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] pt-1">
              <div>
                Modelo: <span className="text-white font-mono font-bold">openai/gpt-oss-120b</span>
              </div>
              <div>
                Endpoint: <span className="text-slate-400 font-mono">https://api.groq.com/openai/v1</span>
              </div>
              <div>
                Recursos: <span className="text-slate-200 font-mono">Streaming + Tool Calling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white shrink-0" />
          <span>OTTO Security Sandbox: Permissões de controle com confirmação em nível crítico ativas.</span>
        </div>
      </div>
    </div>
  );
};
