import React, { useState } from 'react';
import { Eye, Camera, X, Sparkles, AlertCircle } from 'lucide-react';
import { ApiBridge } from '../services/apiBridge';

interface ScreenVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisResult?: (speechResponse: string) => void;
}

export const ScreenVisionModal: React.FC<ScreenVisionModalProps> = ({
  isOpen,
  onClose,
  onAnalysisResult,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [question, setQuestion] = useState('O que está acontecendo nesta tela e quais são os elementos principais?');
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const captureScreenAndAnalyze = async () => {
    setErrorMsg(null);
    setAnalysisText(null);
    setAnalyzing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('A API de captura de tela (getDisplayMedia) não está disponível neste navegador.');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      track.stop();
      stream.getTracks().forEach((t) => t.stop());

      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);

      const res = await ApiBridge.analyzeScreen(dataUrl, question);
      setAnalysisText(res.analysis);
      onAnalysisResult?.(res.speechResponse);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Captura de tela cancelada pelo usuário ou permissão negada.');
      } else {
        setErrorMsg(err.message || 'Falha ao capturar e analisar a tela.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[85vh] rounded-2xl border border-white/20 bg-[#090D14] p-6 shadow-[0_0_35px_rgba(255,255,255,0.1)] flex flex-col gap-4 overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-base font-bold font-['Space_Grotesk'] text-white">
                Visão Computacional do OTTO
              </h2>
              <p className="text-[11px] text-slate-400">
                Captura real da tela com análise semântica de IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Question */}
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-300 font-semibold">O que o OTTO deve verificar na tela?</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Onde está o erro? O que tem aberto na tela?"
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-white"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center py-2">
          <button
            onClick={captureScreenAndAnalyze}
            disabled={analyzing}
            className="px-5 py-2.5 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 font-bold tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <Camera className="w-4 h-4 text-slate-200" />
            <span>{analyzing ? 'ANALISANDO TELA...' : 'CAPTURAR & ANALISAR TELA'}</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Image preview & analysis */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[160px]">
          {capturedImage && (
            <div className="rounded-lg overflow-hidden border border-slate-800">
              <img
                src={capturedImage}
                alt="Captura de tela"
                className="w-full max-h-48 object-cover bg-black"
              />
            </div>
          )}

          {analysisText && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Sparkles className="w-4 h-4 text-slate-300" />
                <span>Análise Visual do OTTO:</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{analysisText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
