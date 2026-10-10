import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Eye,
  Camera,
  Mic,
  Send,
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Settings,
  Zap,
  Radio,
  Check,
} from 'lucide-react';
import { OttoState } from '../types/otto';
import { OttoLiquidMascot } from './OttoLiquidMascot';
import { desktopOverlayBridge, VisionMode, OverlayState } from '../services/desktopOverlayBridge';

interface DesktopGlobalOverlayProps {
  state: OttoState;
  isListening: boolean;
  isSpeaking: boolean;
  toggleListening: () => void;
  onSendCommand: (cmd: string) => void;
  onOpenFullChat?: () => void;
  onOpenSettings?: () => void;
  interimTranscript?: string;
  latestResponse?: string;
}

export const DesktopGlobalOverlay: React.FC<DesktopGlobalOverlayProps> = ({
  state,
  isListening,
  isSpeaking,
  toggleListening,
  onSendCommand,
  onOpenFullChat,
  interimTranscript,
  latestResponse,
}) => {
  const [overlayState, setOverlayState] = useState<OverlayState>(desktopOverlayBridge.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showVisionMenu, setShowVisionMenu] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [visionNotification, setVisionNotification] = useState<string | null>(null);

  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    posX: number;
    posY: number;
    hasMoved: boolean;
  }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
    hasMoved: false,
  });

  useEffect(() => {
    const unsub = desktopOverlayBridge.subscribe((newState) => {
      setOverlayState(newState);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsubVision = desktopOverlayBridge.onVisionChange((mode) => {
      if (mode === 'LIVE') {
        setVisionNotification('👁️ OTTO LIVE VISION ATIVO');
        setTimeout(() => setVisionNotification(null), 3000);
      } else if (mode === 'ASSIST') {
        setVisionNotification('👁️ VISION: MODO ASSIST ATIVO');
        setTimeout(() => setVisionNotification(null), 3000);
      }
    });
    return unsubVision;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (overlayState.isPipActive) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: overlayState.position.x,
      posY: overlayState.position.y,
      hasMoved: false,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartRef.current.mouseX;
      const dy = ev.clientY - dragStartRef.current.mouseY;

      if (!dragStartRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        dragStartRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragStartRef.current.hasMoved) {
        desktopOverlayBridge.setPosition(
          dragStartRef.current.posX + dx,
          dragStartRef.current.posY + dy
        );
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim();
    setCommandInput('');
    onSendCommand(cmd);
  };

  const handleSetVision = async (mode: VisionMode) => {
    setShowVisionMenu(false);
    await desktopOverlayBridge.setVisionMode(mode, (response) => {
      if (response) {
        setVisionNotification(`OTTO Vision: ${response.slice(0, 45)}...`);
        setTimeout(() => setVisionNotification(null), 4000);
      }
    });
  };

  const handleSingleCapture = async () => {
    setShowVisionMenu(false);
    setVisionNotification('Capturando tela para análise com IA...');
    try {
      const res = await desktopOverlayBridge.captureAndAnalyzeScreen();
      setVisionNotification(`Análise: ${res.speechResponse.slice(0, 50)}...`);
      setTimeout(() => setVisionNotification(null), 5000);
    } catch {
      setVisionNotification('Captura cancelada ou indisponível.');
      setTimeout(() => setVisionNotification(null), 3000);
    }
  };

  const handlePopoutWindow = async () => {
    if (overlayState.isPipActive) {
      desktopOverlayBridge.closePipWindow();
    } else {
      await desktopOverlayBridge.requestPipWindow();
    }
  };

  const isVisionActive = overlayState.visionMode !== 'OFF';
  const isLiveVision = overlayState.visionMode === 'LIVE';

  const renderOverlayBody = (inPip: boolean) => (
    <div
      style={
        inPip
          ? { width: '100%', height: '100%', maxWidth: '240px' }
          : {
              left: `${overlayState.position.x}px`,
              top: `${overlayState.position.y}px`,
            }
      }
      className={`${
        inPip
          ? 'relative select-none flex flex-col items-center justify-center p-2'
          : `fixed z-50 select-none transition-shadow duration-300 ${
              isDragging ? 'cursor-grabbing scale-102' : 'cursor-grab'
            }`
      }`}
      onPointerDown={!inPip ? handlePointerDown : undefined}
    >
      {/* Visual Live Vision Scanner Ring when active */}
      {isLiveVision && (
        <div className="absolute -inset-2 rounded-[36px] pointer-events-none border border-white/80 animate-pulse shadow-[0_0_25px_rgba(255,255,255,0.4)] z-0" />
      )}
      {overlayState.visionMode === 'ASSIST' && (
        <div className="absolute -inset-1 rounded-[34px] pointer-events-none border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.25)] z-0" />
      )}

      {/* Main Frameless Liquid Glass Widget */}
      <div
        className={`relative z-10 glass-strong liquid-refraction transition-all duration-300 rounded-[30px] flex flex-col items-center ${
          isLiveVision
            ? 'border-white/80 ring-1 ring-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(255,255,255,0.35)]'
            : isVisionActive
            ? 'border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.2)]'
            : 'border-white/30 shadow-[0_16px_50px_rgba(0,0,0,0.85)]'
        } ${inPip ? 'w-full p-2' : isExpanded ? 'w-80 p-3.5' : 'w-[108px] p-2.5'}`}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between px-1 mb-1 text-slate-400 text-[10px]">
          <div className="flex items-center gap-1">
            {isLiveVision ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 text-white border border-white/40 font-mono text-[9px] font-bold animate-pulse">
                <Radio className="w-2.5 h-2.5 text-white animate-spin" />
                <span>LIVE VISION</span>
              </span>
            ) : overlayState.visionMode === 'ASSIST' ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 text-slate-200 border border-white/30 font-mono text-[9px] font-bold">
                <Eye className="w-2.5 h-2.5 text-white" />
                <span>VISION ASSIST</span>
              </span>
            ) : (
              <span className="text-[9px] font-mono text-white/90 font-semibold tracking-wider">
                {inPip ? 'WINDOWS PIP' : 'OTTO OVERLAY'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!inPip && (
              <button
                onClick={handlePopoutWindow}
                className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${
                  overlayState.isPipActive ? 'text-white' : 'text-slate-400'
                }`}
                title="Janela Flutuante Independente"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                showSettingsMenu ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Configurações do Overlay"
            >
              <Settings className="w-3 h-3" />
            </button>

            {!inPip && (
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isExpanded ? 'Modo Compacto' : 'Expandir Controles'}
              >
                {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            )}

            {!inPip && (
              <button
                onClick={() => desktopOverlayBridge.toggleOverlay(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Ocultar Overlay"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mascot Core & Micro-Actions */}
        <div className="relative flex items-center justify-center my-1">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={toggleListening}
          >
            <OttoLiquidMascot
              state={state}
              isListening={isListening || state === 'LISTENING'}
              isSpeaking={isSpeaking || state === 'SPEAKING'}
              onClick={toggleListening}
            />
          </div>
        </div>

        {/* Compact Quick Buttons */}
        <div className="w-full flex items-center justify-center gap-1.5 mt-1 pt-1 border-t border-white/10">
          <button
            onClick={toggleListening}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              state === 'LISTENING'
                ? 'bg-white text-black border border-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
            title="Microfone"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowVisionMenu((prev) => !prev)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isLiveVision
                  ? 'bg-white text-black border border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : isVisionActive
                  ? 'bg-white/30 text-white border border-white/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white border border-white/15'
              }`}
              title="OTTO Vision"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {showVisionMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 p-2 rounded-2xl backdrop-blur-3xl bg-[#12151d]/95 border border-white/20 shadow-2xl z-50 flex flex-col gap-1 text-xs font-sans animate-fade-in">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2 py-0.5">
                  OTTO VISION
                </span>

                <button
                  onClick={() => handleSetVision('OFF')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                    overlayState.visionMode === 'OFF'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span>OFF (Desativado)</span>
                  {overlayState.visionMode === 'OFF' && <Check className="w-3 h-3 text-white" />}
                </button>

                <button
                  onClick={() => handleSetVision('ASSIST')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                    overlayState.visionMode === 'ASSIST'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div>ASSIST (Sob Demanda)</div>
                    <div className="text-[9px] text-slate-400">Captura quando solicitado</div>
                  </div>
                  {overlayState.visionMode === 'ASSIST' && <Check className="w-3 h-3 text-white" />}
                </button>

                <button
                  onClick={() => handleSetVision('LIVE')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                    overlayState.visionMode === 'LIVE'
                      ? 'bg-white text-black font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div>LIVE (Contínuo)</div>
                    <div className="text-[9px] text-slate-400">Análise viva em streaming</div>
                  </div>
                  {overlayState.visionMode === 'LIVE' && <Check className="w-3 h-3 text-black" />}
                </button>

                <div className="h-px bg-white/10 my-0.5" />

                <button
                  onClick={handleSingleCapture}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-white hover:bg-white/20 transition-colors text-left cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capturar Tela Agora</span>
                </button>
              </div>
            )}
          </div>

          {onOpenFullChat && (
            <button
              onClick={onOpenFullChat}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Abrir Chat Completo"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* Settings Popover */}
        {showSettingsMenu && (
          <div className="w-full mt-2 p-2 rounded-2xl bg-[#161a24]/95 border border-white/20 text-[10px] flex flex-col gap-2 animate-fade-in font-sans">
            <div className="flex items-center justify-between font-mono text-slate-400 uppercase tracking-wider pb-1 border-b border-white/10">
              <span>Opções do Overlay</span>
              <button
                onClick={() => setShowSettingsMenu(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={overlayState.isAlwaysOnTop}
                onChange={(e) => desktopOverlayBridge.setAlwaysOnTop(e.target.checked)}
                className="rounded accent-white focus:ring-0"
              />
              <span>Always-on-Top (Sempre no topo)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={overlayState.startWithWindows}
                onChange={(e) => desktopOverlayBridge.setStartWithWindows(e.target.checked)}
                className="rounded accent-white focus:ring-0"
              />
              <span>Iniciar com o Windows</span>
            </label>

            <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/10 font-mono">
              <span>Atalho: Alt+O</span>
              <span>Posição salva</span>
            </div>
          </div>
        )}

        {/* Interim / Vision Notification Bubble */}
        {visionNotification && (
          <div className="w-full mt-2 px-2 py-1 rounded-xl bg-slate-900 border border-white/30 text-[10px] text-white text-center font-mono truncate animate-fade-in shadow-md">
            {visionNotification}
          </div>
        )}

        {interimTranscript && (
          <div className="w-full mt-2 px-2 py-1 rounded-xl bg-slate-900 border border-white/20 text-[10px] text-slate-200 text-center italic truncate animate-fade-in">
            "{interimTranscript}"
          </div>
        )}

        {/* Expanded Desktop Panel */}
        {(isExpanded || inPip) && (
          <div className="w-full mt-2 pt-2 border-t border-white/10 flex flex-col gap-2 animate-fade-in font-sans">
            {latestResponse && (
              <div className="text-[11px] text-slate-300 bg-white/[0.04] border border-white/[0.08] p-2 rounded-xl max-h-24 overflow-y-auto leading-relaxed">
                <span className="text-[9px] font-mono text-white uppercase font-bold block mb-0.5">
                  OTTO:
                </span>
                {latestResponse}
              </div>
            )}

            <form onSubmit={handleCommandSubmit} className="relative w-full flex items-center gap-1.5">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Comando para o OTTO..."
                className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-white font-sans"
              />
              <button
                type="submit"
                disabled={!commandInput.trim()}
                className="w-7 h-7 rounded-xl bg-white disabled:opacity-30 text-black flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 hover:bg-slate-200"
                title="Executar comando"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1">
              <span>Atalho: Alt+O</span>
              <span>Always on Top</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const pipWin = desktopOverlayBridge.getPipWindow();
  if (overlayState.isPipActive && pipWin && pipWin.document && pipWin.document.body) {
    return (
      <>
        {ReactDOM.createPortal(renderOverlayBody(true), pipWin.document.body)}
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
          <button
            onClick={() => desktopOverlayBridge.closePipWindow()}
            className="p-2.5 rounded-full backdrop-blur-3xl bg-[#0f1218]/90 border border-white/30 shadow-lg text-white hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-sans font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>OTTO PiP Ativo</span>
          </button>
        </div>
      </>
    );
  }

  if (!overlayState.isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={() => desktopOverlayBridge.toggleOverlay(true)}
          className="p-2.5 rounded-full backdrop-blur-3xl bg-[#0f1218]/90 border border-white/30 shadow-lg text-white hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-sans font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>OTTO</span>
        </button>
      </div>
    );
  }

  return renderOverlayBody(false);
};
