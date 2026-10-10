import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { MemoryItem } from '../types/otto';
import { ApiBridge } from '../services/apiBridge';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryChanged?: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  onMemoryChanged,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const loadMemories = async () => {
    try {
      const data = await ApiBridge.getMemories();
      setMemories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;

    setLoading(true);
    try {
      const updated = await ApiBridge.saveMemory(key.trim(), value.trim());
      setMemories(updated);
      setKey('');
      setValue('');
      onMemoryChanged?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const updated = await ApiBridge.deleteMemory(id);
      setMemories(updated);
      onMemoryChanged?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-[#12151c] p-6 shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-white tracking-tight">
            Memória do OTTO
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Ensine preferências e fatos. O OTTO usará isso como contexto.
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                CHAVE
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="projeto_principal"
                className="bg-[#1a1d24] border border-[#2a2f3d] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                CONTEÚDO
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="caminho/para/projeto"
                className="bg-[#1a1d24] border border-[#2a2f3d] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !key.trim() || !value.trim()}
            className="w-full mt-1 py-2.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/40 disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>+ Adicionar memória</span>
          </button>
        </form>

        {/* Memories list / Empty State */}
        <div className="mt-6 pt-2 border-t border-[#1c202a] max-h-48 overflow-y-auto">
          {memories.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-6 font-mono">
              Nenhuma memória salva.
            </div>
          ) : (
            <div className="space-y-2 py-1 font-mono text-xs">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#181b22] border border-[#242936] group"
                >
                  <div className="truncate pr-2">
                    <span className="text-white font-bold">{m.key}: </span>
                    <span className="text-slate-300">{m.value}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 text-slate-500 hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Excluir memória"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
