import React, { useState, useEffect } from 'react';
import { Folder, FileText, RefreshCw, X, FolderPlus, Trash2 } from 'lucide-react';
import { WorkspaceItem } from '../types/otto';
import { ApiBridge } from '../services/apiBridge';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileActionSuccess?: (msg: string) => void;
  onRequestDelete?: (filename: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  onFileActionSuccess,
  onRequestDelete,
}) => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeFileContent, setActiveFileContent] = useState<{ filename: string; content: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const loadFiles = async (subpath = currentPath) => {
    setLoading(true);
    try {
      const data = await ApiBridge.listFiles(subpath);
      setItems(data.items);
      setCurrentPath(data.currentPath);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles('');
    }
  }, [isOpen]);

  const handleOpenFolder = (folderName: string) => {
    const nextPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    loadFiles(nextPath);
  };

  const handleGoBack = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  const handleReadFile = async (filename: string) => {
    try {
      const res = await ApiBridge.readFile(filename, currentPath);
      setActiveFileContent({ filename: res.filename, content: res.content });
    } catch (err: any) {
      alert(err.message || 'Falha ao ler arquivo');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await ApiBridge.createFolder(newFolderName.trim(), currentPath);
      setNewFolderName('');
      setShowNewFolder(false);
      loadFiles();
      onFileActionSuccess?.(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/20 bg-[#090D14] p-6 shadow-[0_0_35px_rgba(255,255,255,0.1)] flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Folder className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-base font-bold text-white">
                Espaço de Trabalho do Computador
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Arquivos reais salvos em: <span className="text-slate-200">/otto_workspace/{currentPath}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadFiles()}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Atualizar arquivos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            {currentPath && (
              <button
                onClick={handleGoBack}
                className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                ← Voltar
              </button>
            )}
            <span className="text-slate-400">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all font-bold"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Nova Pasta</span>
          </button>
        </div>

        {showNewFolder && (
          <form onSubmit={handleCreateFolder} className="flex items-center gap-2 font-mono text-xs">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome da pasta..."
              className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-white"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-white text-slate-950 font-bold"
            >
              Criar
            </button>
          </form>
        )}

        {/* File items list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs min-h-[220px]">
          {items.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500">
              <Folder className="w-8 h-8 opacity-40 mb-2 text-white" />
              <span>Nenhum arquivo ou pasta neste diretório.</span>
              <span className="text-[11px] text-slate-500 mt-1">
                Fale "OTTO, crie uma pasta chamada Projetos" para criar.
              </span>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.path}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all group"
              >
                <div
                  className="flex items-center gap-2.5 flex-1 cursor-pointer truncate"
                  onClick={() =>
                    item.isDirectory ? handleOpenFolder(item.name) : handleReadFile(item.name)
                  }
                >
                  {item.isDirectory ? (
                    <Folder className="w-4 h-4 text-white shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-slate-200 group-hover:text-white truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-slate-500 text-[11px]">
                  <span>{item.isDirectory ? 'Pasta' : `${item.size} bytes`}</span>
                  <button
                    onClick={() => onRequestDelete?.(item.name)}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                    title="Excluir item (Ação de alto risco)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* File viewer drawer if clicked */}
        {activeFileContent && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
              <span className="text-white font-semibold">{activeFileContent.filename}</span>
              <button
                onClick={() => setActiveFileContent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Fechar Leitor
              </button>
            </div>
            <pre className="p-2 rounded bg-black/60 text-slate-200 max-h-36 overflow-y-auto whitespace-pre-wrap">
              {activeFileContent.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
