import React, { useState } from 'react';
import { Terminal as TerminalIcon, Play, X } from 'lucide-react';
import { ApiBridge } from '../services/apiBridge';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandRun?: (cmd: string) => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  isOpen,
  onClose,
  onCommandRun,
}) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; error?: string | null; time: string }>>([
    {
      cmd: 'otto --status',
      output: 'OTTO System Bridge v2.5.0\nStatus: Online & Ready\nWorkspace: /otto_workspace',
      time: '12:00:00',
    }
  ]);
  const [running, setRunning] = useState(false);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || running) return;

    const cmdToRun = command.trim();
    setRunning(true);
    try {
      const res = await ApiBridge.executeTerminal(cmdToRun);
      const out = res.stdout || res.stderr || (res.exitCode === 0 ? '✓ Comando finalizado sem saída.' : `Exit code: ${res.exitCode}`);
      setHistory((prev) => [
        ...prev,
        {
          cmd: cmdToRun,
          output: out,
          error: res.error,
          time: new Date().toLocaleTimeString('pt-BR'),
        },
      ]);
      setCommand('');
      onCommandRun?.(cmdToRun);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          cmd: cmdToRun,
          output: err.message || 'Erro ao executar comando',
          error: 'Execução falhou',
          time: new Date().toLocaleTimeString('pt-BR'),
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl h-[70vh] rounded-2xl border border-white/20 bg-[#070A0F] p-5 shadow-[0_0_35px_rgba(255,255,255,0.1)] flex flex-col gap-3 font-mono text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span className="text-slate-200 font-semibold tracking-wider ml-2 flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-white" /> OTTO TERMINAL CONSOLE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Output Screen */}
        <div className="flex-1 bg-black/80 rounded-xl p-3 border border-slate-800 overflow-y-auto space-y-3">
          {history.map((h, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 text-white">
                <span className="text-slate-600">[{h.time}]</span>
                <span className="text-slate-300 font-bold">otto@system:~$</span>
                <span className="text-white font-bold">{h.cmd}</span>
              </div>
              <pre className={`pl-4 whitespace-pre-wrap ${h.error ? 'text-slate-400 font-semibold' : 'text-slate-300'}`}>
                {h.output}
              </pre>
            </div>
          ))}
          {running && (
            <div className="flex items-center gap-2 text-slate-300 animate-pulse">
              <span>● Executando comando no ambiente...</span>
            </div>
          )}
        </div>

        {/* Command Input Prompt */}
        <form onSubmit={handleExecute} className="flex items-center gap-2 pt-1">
          <span className="text-white font-bold shrink-0">otto@system:~$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Digite ou fale: ls, pwd, date, echo 'Olá OTTO'..."
            disabled={running}
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded px-3 py-1.5 text-white focus:outline-none focus:border-white"
            autoFocus
          />
          <button
            type="submit"
            disabled={running || !command.trim()}
            className="px-3 py-1.5 rounded bg-white/20 border border-white/40 text-white hover:bg-white/30 disabled:opacity-40 flex items-center gap-1.5 font-bold"
          >
            <Play className="w-3 h-3" />
            <span>RODAR</span>
          </button>
        </form>
      </div>
    </div>
  );
};
