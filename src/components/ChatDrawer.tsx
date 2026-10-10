import React, { useState } from 'react';
import { X, Bot, User, Trash2, Search, Zap } from 'lucide-react';
import { ChatMessage } from '../types/otto';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onClearHistory: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'otto' | 'actions'>('all');

  if (!isOpen) return null;

  const filteredMessages = messages.filter((msg) => {
    if (filterType === 'user' && msg.sender !== 'user') return false;
    if (filterType === 'otto' && msg.sender !== 'otto') return false;
    if (filterType === 'actions') {
      const hasAction = msg.actions && msg.actions.length > 0 && msg.actions.some((a) => a.action !== 'none');
      if (!hasAction) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const textMatch = msg.text.toLowerCase().includes(q);
      const actionMatch = msg.actions?.some(
        (a) => a.action?.toLowerCase().includes(q) || a.target?.toLowerCase().includes(q)
      );
      if (!textMatch && !actionMatch) return false;
    }

    return true;
  });

  const renderHighlighted = (text: string) => {
    if (!searchQuery.trim()) return text;
    const q = searchQuery.trim();
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-white/40 text-white px-0.5 rounded border border-white/50 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#080a0e]/95 backdrop-blur-xl border-l border-white/20 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-mono text-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide">
            TRANSCRIÇÃO & HISTÓRICO
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
              title="Limpar histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-col gap-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nos comandos..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-white transition-colors text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos ({messages.length})
            </button>
            <button
              onClick={() => setFilterType('user')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                filterType === 'user'
                  ? 'bg-white text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Comandos
            </button>
            <button
              onClick={() => setFilterType('actions')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-0.5 ${
                filterType === 'actions'
                  ? 'bg-white text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-2.5 h-2.5" />
              <span>Ações</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-500 shrink-0">
            {filteredMessages.length} msg
          </span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-8">
            <Bot className="w-8 h-8 opacity-30 mb-2" />
            <p>{searchQuery ? 'Nenhuma mensagem encontrada.' : 'Nenhuma mensagem ainda.'}</p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="mt-2 text-white hover:underline text-[11px]"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 p-3 rounded-xl border ${
                msg.sender === 'user'
                  ? 'bg-slate-900/40 border-slate-800 text-slate-200 ml-6'
                  : 'bg-white/10 border-white/20 text-white mr-6'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  {msg.sender === 'user' ? (
                    <>
                      <User className="w-3 h-3 text-slate-400" /> USUÁRIO
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-white" /> OTTO
                    </>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{renderHighlighted(msg.text)}</p>

              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 mt-1 border-t border-white/10 text-[10px] text-slate-300 flex flex-wrap gap-1.5">
                  {msg.actions.map((act, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-black/60 border border-white/20 font-mono"
                    >
                      ⚡ {act.action} {act.target ? `→ ${act.target}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
