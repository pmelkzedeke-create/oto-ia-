import React, { useState } from 'react';
import { Mic, Square, Send, Sparkles, Command } from 'lucide-react';
import { OttoState } from '../types/otto';

interface VoiceControlsProps {
  state: OttoState;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  onToggleListen: () => void;
  onStop: () => void;
  onSubmitText: (text: string) => void;
  errorMessage?: string | null;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  state,
  isListening,
  isSpeaking,
  transcript,
  interimTranscript,
  onToggleListen,
  onStop,
  onSubmitText,
  errorMessage,
}) => {
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const sampleCommands = [
    'OTTO, abra o YouTube e pesquise músicas lofi',
    'OTTO, crie uma pasta chamada Projetos',
    'OTTO, abra o Chrome',
    'OTTO, me mostre o status do computador',
    'OTTO, procure meus arquivos',
    'OTTO, diminua o volume',
  ];

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onSubmitText(textInput.trim());
      setTextInput('');
    }
  };

  const isBusy = state === 'THINKING' || state === 'EXECUTING' || isSpeaking;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center gap-4">
      {/* Transcript feedback banner */}
      {(transcript || interimTranscript || isListening || errorMessage) && (
        <div className="w-full min-h-[44px] flex items-center justify-center text-center px-4 py-2 rounded-xl bg-slate-900/80 border border-white/20 backdrop-blur-md transition-all">
          {errorMessage ? (
            <p className="text-xs font-mono text-slate-300">{errorMessage}</p>
          ) : isListening ? (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-slate-200">
                {interimTranscript || transcript ? (
                  <span className="text-white italic">"{interimTranscript || transcript}"</span>
                ) : (
                  'Ouvindo sua voz... Diga algo ou diga "OTTO, pare"'
                )}
              </span>
            </div>
          ) : transcript ? (
            <p className="text-xs font-mono text-slate-300">
              <span className="text-slate-500 mr-1.5">Último comando:</span>
              <span className="text-white">"{transcript}"</span>
            </p>
          ) : null}
        </div>
      )}

      {/* Main Microphone Action Center */}
      <div className="flex items-center gap-4">
        {/* Interrupt / Stop Button */}
        {isBusy && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-white/40 bg-black/60 text-white hover:bg-white/20 font-mono text-xs transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] animate-pulse"
            title="Interromper OTTO (OTTO, pare)"
          >
            <Square className="w-3.5 h-3.5 fill-white text-white" />
            <span className="tracking-wider">PARAR</span>
          </button>
        )}

        {/* Big Silver / Chrome Mic Orb */}
        <button
          onClick={onToggleListen}
          className={`relative group flex items-center justify-center w-16 h-16 rounded-full border transition-all duration-300 ${
            isListening
              ? 'border-white bg-white/25 text-white shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-105'
              : 'border-white/20 bg-slate-900/90 text-slate-200 hover:border-white/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
          }`}
          title={isListening ? 'Clique para pausar microfone' : 'Clique para falar com o OTTO'}
        >
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
              <Mic className="w-7 h-7 animate-pulse text-white" />
            </>
          ) : (
            <Mic className="w-7 h-7 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Manual Keyboard Toggle */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className={`p-3 rounded-full border transition-all ${
            showTextInput
              ? 'border-white/40 bg-white/10 text-white'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
          }`}
          title="Digitar comando manualmente"
        >
          <Command className="w-4 h-4" />
        </button>
      </div>

      {/* Manual text input if toggled */}
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="w-full max-w-md flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ex: OTTO, crie uma pasta chamada Relatórios..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/50"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 disabled:opacity-40 transition-all text-xs font-mono flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ENVIAR</span>
          </button>
        </form>
      )}

      {/* Quick Suggested Voice Commands */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-400" />
          Comandos de Exemplo:
        </span>
        {sampleCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => onSubmitText(cmd)}
            className="text-[11px] font-mono px-2.5 py-1 rounded border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-white/30 transition-all hover:bg-white/10"
          >
            "{cmd}"
          </button>
        ))}
      </div>
    </div>
  );
};
