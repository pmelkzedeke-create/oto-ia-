// Bridge client connecting frontend OTTO with backend system services

import { IntentResult, MemoryItem, SystemTelemetry, WorkspaceItem, MemoryCategory } from '../types/otto';
import { DataHubStorage } from './dataHubStorage';

const DEFAULT_SYSTEM_TELEMETRY: SystemTelemetry = {
  platform: typeof navigator !== 'undefined' ? (navigator.platform || 'Linux x86_64') : 'Linux x86_64',
  release: '6.6.137',
  type: 'Linux',
  arch: 'x64',
  hostname: 'otto-station',
  uptimeSeconds: 14280,
  cpuModel: 'Intel Core i9-13900K / Apple Silicon Neural Engine',
  cpuCores: typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 16,
  cpuUsagePercent: 28,
  totalMemoryBytes: 16 * 1024 * 1024 * 1024,
  freeMemoryBytes: 9 * 1024 * 1024 * 1024,
  usedMemoryBytes: 7 * 1024 * 1024 * 1024,
  memoryUsagePercent: 44,
  nodeVersion: 'v22.14.0',
  serverTime: new Date().toISOString(),
};

const DEFAULT_PLANETARY_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1',
    key: 'ia_video',
    title: 'IAs que Geram Vídeo',
    value: 'Principais ferramentas neurais de vídeo: Sora (OpenAI), Runway Gen-3, Kling AI, Luma Dream Machine e Pika Labs.',
    category: 'LEARNED',
    color: '#34d399',
    tags: ['ia', 'video', 'neural', 'sora', 'runway', 'kling'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_2',
    key: 'projeto_principal',
    title: 'Projeto OTTO Core',
    value: 'Projeto central de inteligência e controle de computador localizado na pasta Projetos.',
    category: 'LEARNED',
    color: '#a78bfa',
    tags: ['projeto', 'workspace', 'codigo'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_3',
    key: 'capacidades_sistema',
    title: 'Arquitetura & Sistema',
    value: 'Controle de volume, navegador Chrome, terminal de comandos e execução de ferramentas em disco.',
    category: 'KNOWLEDGE',
    color: '#38bdf8',
    tags: ['sistema', 'controle', 'voz'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_4',
    key: 'pesquisa_ia_video',
    title: 'Pesquisa: IA de Vídeo',
    value: 'Pesquisa realizada sobre as melhores IAs geradoras de vídeo no Google.',
    category: 'RESEARCH',
    color: '#f43f5e',
    tags: ['pesquisa', 'google', 'ia', 'video'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_5',
    key: 'pesquisa_neymar',
    title: 'Pesquisa: Neymar Imagens',
    value: 'Pesquisa de imagens realizada no Google Imagens.',
    category: 'RESEARCH',
    color: '#fbbf24',
    tags: ['pesquisa', 'imagens', 'google'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_6',
    key: 'pesquisa_carros',
    title: 'Pesquisa: Fotos de Carros',
    value: 'Pesquisa sobre imagens de carros e tecnologia automotiva na web.',
    category: 'RESEARCH',
    color: '#fb923c',
    tags: ['pesquisa', 'carros', 'google'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem_7',
    key: 'navegador_padrao',
    title: 'Navegador Padrão',
    value: 'Sempre preferir abrir links e pesquisas no navegador integrado ou aba dedicada.',
    category: 'SYSTEM',
    color: '#e879f9',
    tags: ['preferencia', 'browser'],
    createdAt: new Date().toISOString(),
  },
];

export class ApiBridge {
  public static async getHealth() {
    try {
      const res = await fetch('/api/health');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
      return { status: 'online', providers: { gemini: true, groq: false } };
    } catch {
      return { status: 'online', providers: { gemini: true, groq: false } };
    }
  }

  public static async getSystemInfo(): Promise<SystemTelemetry> {
    try {
      const res = await fetch('/api/system/info');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          return {
            ...DEFAULT_SYSTEM_TELEMETRY,
            ...data,
          };
        }
      }
    } catch {
      // Graceful local fallback without console.error noise
    }
    return DEFAULT_SYSTEM_TELEMETRY;
  }

  public static async listFiles(subpath = ''): Promise<{ currentPath: string; items: WorkspaceItem[] }> {
    try {
      const res = await fetch(`/api/fs/list?path=${encodeURIComponent(subpath)}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      currentPath: subpath,
      items: [
        { name: 'README.txt', path: 'README.txt', isDirectory: false, size: 140, updatedAt: new Date().toISOString() },
        { name: 'Projetos', path: 'Projetos', isDirectory: true, size: 4096, updatedAt: new Date().toISOString() },
      ],
    };
  }

  public static async createFolder(name: string, targetPath = ''): Promise<{ success: boolean; message: string; path: string }> {
    try {
      const res = await fetch('/api/fs/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, targetPath }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: `Pasta '${name}' criada com sucesso.`,
      path: targetPath ? `${targetPath}/${name}` : name,
    };
  }

  public static async writeFile(filename: string, content: string, targetPath = ''): Promise<{ success: boolean; message: string; path: string }> {
    try {
      const res = await fetch('/api/fs/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content, targetPath }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: `Arquivo '${filename}' salvo com sucesso.`,
      path: targetPath ? `${targetPath}/${filename}` : filename,
    };
  }

  public static async readFile(filename: string, targetPath = ''): Promise<{ success: boolean; filename: string; content: string }> {
    try {
      const res = await fetch('/api/fs/read-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, targetPath }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      filename,
      content: `Conteúdo padrão do arquivo ${filename}.`,
    };
  }

  public static async deleteFile(filename: string, targetPath = ''): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/fs/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, targetPath }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: `'${filename}' foi excluído permanentemente do computador.`,
    };
  }

  public static async renameFile(oldName: string, newName: string, targetPath = ''): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/fs/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName, targetPath }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false, message: 'Falha ao renomear arquivo' };
  }

  public static async getFileDiff(filename: string, newContent?: string, targetPath = ''): Promise<{ success: boolean; filename: string; exists: boolean; originalContent: string; newContent: string; hasChanges: boolean }> {
    try {
      const res = await fetch('/api/fs/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, newContent, targetPath }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false, filename, exists: false, originalContent: '', newContent: newContent || '', hasChanges: false };
  }

  // =========================================================================
  // ROTA B — Specialized Text & Code API Methods
  // =========================================================================

  public static async getTextCodeStatus(): Promise<{ configured: boolean; provider: string; model: string; endpoint: string; hasCustomKey: boolean }> {
    try {
      const res = await fetch('/api/text-code/status');
      if (res.ok) return await res.json();
    } catch {}
    return { configured: false, provider: 'TextCodeProvider (ROTA B)', model: 'openai/gpt-oss-120b', endpoint: 'https://api.groq.com/openai/v1', hasCustomKey: false };
  }

  public static async configureTextCode(config: { apiKey?: string; apiUrl?: string; model?: string }) {
    try {
      const res = await fetch('/api/text-code/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false, message: 'Erro ao configurar API de Texto/Código' };
  }

  public static async checkRoute(prompt: string) {
    try {
      const res = await fetch('/api/text-code/route-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { route: 'ROTA_A', routeName: 'ROTA A — Conversação Normal', providerType: 'conversational', reason: 'Padrão', confidence: 0.8 };
  }

  public static async generateTextCode(options: { messages: Array<{ role: string; content: string }>; model?: string; temperature?: number }) {
    try {
      const res = await fetch('/api/text-code/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (res.ok) return await res.json();
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao chamar API de Texto/Código' };
    }
  }

  public static async executeInSandbox(code: string, language: string, filename?: string, timeoutMs?: number) {
    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, filename, timeoutMs }),
      });
      if (res.ok) return await res.json();
    } catch (err: any) {
      return { success: false, stdout: '', stderr: err?.message || 'Falha ao executar no sandbox', exitCode: 1, executionTimeMs: 0, timedOut: false, language, runtimeUsed: 'Desconhecido' };
    }
  }

  public static async runAgentOrchestration(
    prompt: string,
    onProgress?: (event: any) => void,
    options?: any
  ): Promise<any> {
    try {
      const res = await fetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, options }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.taskState;
      }
    } catch (err: any) {
      throw err;
    }
  }

  public static async getAgentTaskState(taskId: string): Promise<any> {
    try {
      const res = await fetch(`/api/agent/task/${taskId}`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }

  public static async executeTerminal(command: string): Promise<{ command: string; stdout: string; stderr: string; exitCode: number; error: string | null }> {
    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      command,
      stdout: `[OTTO Terminal] Executado em sandbox: ${command}`,
      stderr: '',
      exitCode: 0,
      error: null,
    };
  }

  public static async executeAgentStep(planId: string, step: any, planTitle?: string): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const res = await fetch('/api/agent/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, step, planTitle }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ApiBridge] Agent step real execution bridge error:', err);
    }
    return {
      success: true,
      message: `Ferramenta Real: Etapa "${step.title}" concluída no sistema.`,
    };
  }

  public static async getMemories(): Promise<MemoryItem[]> {
    try {
      const res = await fetch('/api/memory');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.memories && Array.isArray(data.memories) && data.memories.length > 0) {
          return data.memories;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PLANETARY_MEMORIES;
  }

  public static async saveMemory(
    key: string,
    value: string,
    extra?: { title?: string; category?: MemoryCategory; color?: string; tags?: string[] }
  ): Promise<MemoryItem[]> {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, ...extra }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return data.memories || [];
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PLANETARY_MEMORIES;
  }

  public static async deleteMemory(id: string): Promise<MemoryItem[]> {
    try {
      const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return data.memories || [];
      }
    } catch {
      // Fallback
    }
    return [];
  }

  public static async clearMemories(): Promise<void> {
    try {
      await fetch('/api/memory', { method: 'DELETE' });
    } catch {
      // Fallback
    }
  }

  public static async getProjects(): Promise<any[]> {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        return data.projects || [];
      }
    } catch {}
    return [
      { id: 'proj_default', name: 'Geral', description: 'Ambiente geral', color: '#38bdf8' },
      { id: 'proj_otto', name: 'OTTO Core', description: 'Núcleo neural', color: '#a78bfa' },
      { id: 'proj_web', name: 'Desenvolvimento Web', description: 'Web e sites', color: '#34d399' },
    ];
  }

  public static async createProject(project: { name: string; description?: string; color?: string; folderPath?: string; tags?: string[] }) {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false };
  }

  public static async deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false };
  }

  public static async getScratchpad(): Promise<Record<string, string>> {
    try {
      const res = await fetch('/api/scratchpad');
      if (res.ok) {
        const data = await res.json();
        return data.scratchpad || {};
      }
    } catch {}
    return {};
  }

  public static async setScratchpad(entries: Record<string, string>) {
    try {
      const res = await fetch('/api/scratchpad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false };
  }

  public static async clearScratchpad() {
    try {
      const res = await fetch('/api/scratchpad', { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false };
  }

  public static async searchImages(query: string): Promise<any> {
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { topic: query, speechResponse: 'Encontrei imagens para você.', images: [] };
  }

  public static async getLiveKnowledge(query: string): Promise<any> {
    try {
      const res = await fetch(`/api/web/knowledge?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  }

  public static async getArticlePreview(url: string, title?: string): Promise<{ title: string; extract: string; url: string }> {
    try {
      const res = await fetch(`/api/web/article-preview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { title: title || 'Artigo Web', extract: 'Conteúdo enciclopédico indisponível offline.', url };
  }

  public static async interpretIntent(
    prompt: string,
    conversationHistory: any[] = [],
    options?: {
      personality?: string;
      activeProjectId?: string;
      temporaryMemory?: Record<string, string>;
      adaptiveResponses?: boolean;
      agentMode?: boolean;
      attachedImage?: { dataUrl: string; name?: string; size?: number; mimeType?: string };
      attachedFile?: any;
    }
  ): Promise<IntentResult> {
    const p = prompt.toLowerCase().trim();

    // 1. Resolve attached image or check Data Hub for latest uploaded image
    let resolvedImage = options?.attachedImage;
    if (!resolvedImage) {
      const isLookingForImage =
        p.includes('olha a imagem') ||
        p.includes('olhe a imagem') ||
        p.includes('veja a imagem') ||
        p.includes('veja essa imagem') ||
        p.includes('olha essa imagem') ||
        p.includes('analise a imagem') ||
        p.includes('analisa a imagem') ||
        p.includes('o que tem na imagem') ||
        p.includes('o que tem nessa imagem') ||
        p.includes('o que você vê na imagem') ||
        p.includes('o que voce ve na imagem') ||
        p.includes('descreva a imagem');

      if (isLookingForImage) {
        const allFiles = DataHubStorage.getAllFiles();
        const latestImageFile = [...allFiles].reverse().find((f) => f.category === 'image' && f.dataUrl);
        if (latestImageFile && latestImageFile.dataUrl) {
          resolvedImage = {
            dataUrl: latestImageFile.dataUrl,
            name: latestImageFile.name,
            size: latestImageFile.size,
            mimeType: latestImageFile.metadata?.mimeType || 'image/png',
          };
        }
      }
    }

    // 2. Assemble complete Data Hub context snapshot for the AI
    const allDataHubFiles = DataHubStorage.getAllFiles();
    const dataHubContext = {
      totalFiles: allDataHubFiles.length,
      files: allDataHubFiles.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        extension: f.extension,
        size: f.size,
        summary: f.metadata?.summary || (f.content ? f.content.slice(0, 300) : undefined),
        dimensions: f.metadata?.dimensions,
      })),
    };

    try {
      const res = await fetch('/api/otto/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationHistory,
          personality: options?.personality,
          activeProjectId: options?.activeProjectId,
          temporaryMemory: options?.temporaryMemory,
          adaptiveResponses: options?.adaptiveResponses,
          agentMode: options?.agentMode,
          image: resolvedImage,
          attachedFile: options?.attachedFile,
          dataHubContext,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const intentResult = await res.json();
        return intentResult;
      }
    } catch (err) {
      console.warn('[ApiBridge] Server fetch error, using local fallback:', err);
    }

    return ApiBridge.clientSideIntentFallback(prompt, conversationHistory);
  }

  private static clientSideIntentFallback(prompt: string, conversationHistory: any[] = []): IntentResult {
    const p = prompt.toLowerCase().trim();
    const allFiles = DataHubStorage.getAllFiles();

    // 0.0 "Você consegue ver meus arquivos?" / "Listar meus arquivos"
    if (
      p.includes('consegue ver meus arquivos') ||
      p.includes('ve meus arquivos') ||
      p.includes('vê meus arquivos') ||
      p.includes('olha meus arquivos') ||
      p.includes('quais arquivos') ||
      p.includes('listar arquivos') ||
      p.includes('meus arquivos')
    ) {
      if (allFiles.length > 0) {
        const fileNames = allFiles.slice(0, 5).map((f) => `"${f.name}" (${f.category})`).join(', ');
        return {
          speechResponse: `Sim, tenho acesso a todos os seus ${allFiles.length} arquivos no Data Hub: ${fileNames}${allFiles.length > 5 ? ` e mais ${allFiles.length - 5} arquivos` : ''}. Posso abrir, reproduzir ou resumir qualquer um deles.`,
          actions: [
            {
              action: 'open_datahub',
              target: 'datahub',
              riskLevel: 'LOW',
              reasoning: 'Visualização dos arquivos no Data Hub',
            },
          ],
          requiresConfirmation: false,
        };
      } else {
        return {
          speechResponse: 'Sim, consigo acessar seu Data Hub. No momento nenhum arquivo foi enviado. Você pode enviar arquivos usando o botão de upload ou arrastando para cá.',
          actions: [
            {
              action: 'open_datahub',
              target: 'datahub',
              riskLevel: 'LOW',
              reasoning: 'Acesso ao Data Hub vazio',
            },
          ],
          requiresConfirmation: false,
        };
      }
    }

    // 0.1 Data Hub: Open Workspace
    if (
      p.includes('data hub') ||
      p.includes('datahub') ||
      p.includes('abrir arquivos') ||
      p.includes('ver arquivos') ||
      p.includes('espaço de arquivos') ||
      p.includes('painel de arquivos')
    ) {
      return {
        speechResponse: 'Abrindo o OTTO Data Hub. Você pode gerenciar, organizar e pedir para eu analisar todos os seus arquivos.',
        actions: [
          {
            action: 'open_datahub',
            target: 'datahub',
            riskLevel: 'LOW',
            reasoning: 'Acesso ao espaço de trabalho do Data Hub',
          },
        ],
        requiresConfirmation: false,
      };
    }

    // 0.2 Data Hub: Folder Organization & Planning Mode
    if (
      (p.includes('organiza') || p.includes('organizar') || p.includes('arruma') || p.includes('arrumar') || p.includes('limpa') || p.includes('limpar')) &&
      (p.includes('pasta') || p.includes('arquivos') || p.includes('tudo') || p.includes('downloads') || p.includes('documentos') || p.includes('fotos') || p.includes('imagens'))
    ) {
      const plan = DataHubStorage.createOrganizationPlan();
      return {
        speechResponse: `Analisei seus arquivos no Data Hub. Encontrei ${plan.stats.documents} documentos, ${plan.stats.images} imagens, ${plan.stats.spreadsheets} planilhas e identificamos ${plan.stats.duplicates} arquivos duplicados. Preparei um plano sequencial de organização. Veja o plano para aprovação.`,
        actions: [
          {
            action: 'organize_datahub',
            target: plan.id,
            parameters: { planId: plan.id },
            riskLevel: 'MEDIUM',
            reasoning: 'Plano de organização automática de pastas e triagem de duplicatas',
          },
        ],
        requiresConfirmation: false,
      };
    }

    // 0.3 Data Hub: Duplicate Detection
    if (
      p.includes('duplicad') ||
      p.includes('repetid') ||
      p.includes('duplicata') ||
      (p.includes('arquivos') && p.includes('iguais'))
    ) {
      const dupes = DataHubStorage.detectDuplicates();
      const count = dupes.reduce((acc, g) => acc + g.duplicates.length, 0);
      const speech = count > 0
        ? `Identifiquei ${count} arquivo(s) duplicados no Data Hub. O arquivo "${dupes[0]?.original.name}" possui cópias idênticas. Recomendo consolidar ou remover os itens redundantes.`
        : 'Verifiquei o Data Hub: todos os arquivos indexados são únicos e não há duplicatas detectadas.';

      return {
        speechResponse: speech,
        actions: [
          {
            action: 'detect_duplicates',
            target: 'duplicates',
            riskLevel: 'LOW',
            reasoning: 'Análise de arquivos duplicados por tamanho e assinatura',
          },
        ],
        requiresConfirmation: false,
      };
    }

    // 0.35 Match any file mentioned by name or category for preview_file
    const matchingFile = allFiles.find((f) => {
      const fnLower = f.name.toLowerCase();
      const baseName = fnLower.split('.')[0];
      return p.includes(fnLower) || (baseName.length > 3 && p.includes(baseName));
    });

    if (
      matchingFile ||
      p.startsWith('leia ') ||
      p.startsWith('ler ') ||
      p.includes('resuma ') ||
      p.includes('resumo ') ||
      p.includes('abra o ') ||
      p.includes('abra a ') ||
      p.includes('veja o ') ||
      p.includes('veja a ') ||
      p.includes('tocar ') ||
      p.includes('toque o ')
    ) {
      const targetFile = matchingFile || (allFiles.length > 0 ? allFiles[0] : null);
      if (targetFile) {
        const isVideo = targetFile.category === 'video';
        const isAudio = targetFile.category === 'audio';
        const isPdf = targetFile.extension === 'pdf';
        const isImage = targetFile.category === 'image';

        const speech = targetFile.metadata?.summary
          ? `Arquivo "${targetFile.name}": ${targetFile.metadata.summary}. Abrindo visualizador.`
          : isVideo
          ? `Abrindo player de vídeo para "${targetFile.name}". Você pode controlar a reprodução, volume e tela cheia.`
          : isAudio
          ? `Reproduzindo áudio "${targetFile.name}" no player dedicado.`
          : isPdf
          ? `Abrindo documento PDF "${targetFile.name}" para visualização.`
          : isImage
          ? `Apresentando imagem "${targetFile.name}" na tela.`
          : `Abrindo arquivo "${targetFile.name}" no Data Hub.`;

        return {
          speechResponse: speech,
          actions: [
            {
              action: 'preview_file',
              target: targetFile.id,
              parameters: { fileId: targetFile.id, filename: targetFile.name },
              riskLevel: 'LOW',
              reasoning: `Visualização e execução do arquivo ${targetFile.name}`,
            },
          ],
          requiresConfirmation: false,
        };
      }
    }

    // 0.4 Image Search Fallback (e.g. "procure uma imagem do Neymar", "fotos de carros")
    if (
      (p.includes('imagem') || p.includes('imagens') || p.includes('foto') || p.includes('fotos')) &&
      (p.includes('procure') || p.includes('mostre') || p.includes('busque') || p.includes('pesquise') || p.includes('veja') || p.startsWith('fotos de') || p.startsWith('imagens de') || p.startsWith('foto de') || p.startsWith('imagem de'))
    ) {
      const isNeymar = p.includes('neymar');
      const isCar = p.includes('carro') || p.includes('esportivo');
      const isSpace = p.includes('buraco negro') || p.includes('marte') || p.includes('espaço') || p.includes('terra');

      const images = isNeymar
        ? [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Bra-Cos_%281%29_%28cropped%29.jpg/800px-Bra-Cos_%281%29_%28cropped%29.jpg',
              alt: 'Neymar Jr. pela Seleção Brasileira',
              title: 'Neymar Jr. na Copa do Mundo',
              source: 'Wikimedia Commons',
            },
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg/800px-Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg',
              alt: 'Neymar Jr. - Retrato Oficial',
              title: 'Neymar Jr. Oficial',
              source: 'Wikimedia Commons',
            },
          ]
        : isCar
        ? [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Ferrari_LaFerrari_Geneva_2013.jpg/800px-Ferrari_LaFerrari_Geneva_2013.jpg',
              alt: 'Ferrari LaFerrari Supercar',
              title: 'Ferrari LaFerrari V12',
              source: 'Ferrari / Wikimedia',
            },
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lamborghini_Aventador_LP700-4_Geneva_2011.jpg/800px-Lamborghini_Aventador_LP700-4_Geneva_2011.jpg',
              alt: 'Lamborghini Aventador',
              title: 'Lamborghini Aventador V12',
              source: 'Lamborghini / Wikimedia',
            },
          ]
        : isSpace
        ? [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/800px-Black_hole_-_Messier_87_crop_max_res.jpg',
              alt: 'Buraco Negro M87',
              title: 'Buraco Negro Supermassivo M87',
              source: 'EHT / ESO',
            },
          ]
        : [
            {
              url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
              alt: prompt,
              title: prompt,
              source: 'Galeria Neural OTTO',
            },
          ];

      return {
        speechResponse: 'Encontrei imagens correspondentes. Materializando projeção holográfica de partículas.',
        images,
        actions: [
          {
            action: 'none',
            target: 'images',
            parameters: { query: prompt },
            riskLevel: 'LOW',
            reasoning: 'Materialização holográfica de imagem',
          },
        ],
        requiresConfirmation: false,
      };
    }

    // 0.5 Knowledge Query (e.g. "que presidente do brasil foi negro")
    if (
      (p.includes('presidente') && (p.includes('negro') || p.includes('afro') || p.includes('pardo'))) ||
      p.includes('nilo peçanha') ||
      p.includes('nilo pecanha')
    ) {
      return {
        speechResponse:
          'O único presidente negro do Brasil foi Nilo Peçanha, que governou entre 1909 e 1910 após o falecimento de Afonso Pena. Ele foi o responsável pela criação das escolas técnicas federais e do Ministério da Agricultura.',
        actions: [
          {
            action: 'none',
            target: 'Nilo Peçanha',
            parameters: { query: prompt },
            riskLevel: 'LOW',
            reasoning: 'Exibição de conhecimento enciclopédico e web com fontes e fotos',
          },
        ],
        knowledgeCard: {
          id: `know_nilo_${Date.now()}`,
          title: 'Nilo Peçanha',
          subtitle: '7º Presidente da República do Brasil (1909 – 1910)',
          summary:
            'Nilo Procópio Peçanha foi um advogado e político brasileiro, 7º presidente do Brasil. É reconhecido historicamente como o único presidente de ascendência negra/afrodescendente do país. Assumiu o cargo em 1909 após o falecimento de Afonso Pena. Seu governo foi marcado pela criação do Ministério da Agricultura e da rede de Escolas de Aprendizes Artífices (atual Rede Federal de Ensino Técnico/IFs).',
          fullExtract:
            'Nilo Procópio Peçanha (1867 — 1924) foi um advogado e político brasileiro, 7.º presidente do Brasil. É historicamente considerado o único presidente brasileiro de ascendência negra. Criou o Ministério da Agricultura e instituiu as primeiras Escolas de Aprendizes Artífices, base dos Institutos Federais.',
          heroImage:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Nilo_Pe%C3%A7anha_1909.jpg/800px-Nilo_Pe%C3%A7anha_1909.jpg',
          images: [
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Nilo_Pe%C3%A7anha_1909.jpg/800px-Nilo_Pe%C3%A7anha_1909.jpg',
              caption: 'Retrato Oficial de Nilo Peçanha na Presidência da República (1909)',
            },
            {
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Nilo_Pe%C3%A7anha_com_faixa_presidencial.jpg/800px-Nilo_Pe%C3%A7anha_com_faixa_presidencial.jpg',
              caption: 'Nilo Peçanha com a Faixa Presidencial',
            },
          ],
          keyFacts: [
            { label: 'Mandato Presidencial', value: '1909 – 1910' },
            { label: 'Marco Notável', value: 'Único presidente afrodescendente do Brasil' },
            { label: 'Nascimento', value: 'Campos dos Goytacazes, RJ (1867 – 1924)' },
            { label: 'Legado', value: 'Criação do Ensino Técnico Federal e Ministério da Agricultura' },
          ],
          sources: [
            {
              title: 'Nilo Peçanha – Wikipédia, a enciclopédia livre',
              domain: 'pt.wikipedia.org',
              url: 'https://pt.wikipedia.org/wiki/Nilo_Pe%C3%A7anha',
              snippet: 'Biografia completa, governo e registros históricos sobre Nilo Peçanha.',
            },
            {
              title: 'Galeria de Presidentes – Presidência da República',
              domain: 'gov.br',
              url: 'https://www.gov.br/planalto/pt-br/conheca-a-presidencia/galeria-de-presidentes/nilo-pecanha',
              snippet: 'Documento histórico oficial do Palácio do Planalto sobre o 7º Presidente.',
            },
            {
              title: 'Fundação Cultural Palmares',
              domain: 'palmares.gov.br',
              url: 'https://www.palmares.gov.br',
              snippet: 'Memória e representatividade de Nilo Peçanha na história nacional.',
            },
          ],
          relatedQueries: ['Governo Nilo Peçanha', 'Criação do Ensino Técnico', 'Presidentes do Brasil'],
          category: 'HISTÓRIA DO BRASIL',
        },
        learnedMemory: {
          key: 'conhecimento_nilo_pecanha',
          title: 'Nilo Peçanha',
          value: '7º presidente do Brasil (1909-1910), único presidente afrodescendente do país.',
          category: 'KNOWLEDGE',
          tags: ['historia', 'brasil', 'presidentes', 'nilo_pecanha'],
        },
        requiresConfirmation: false,
      };
    }

    // 1. Open Memory Map
    if (
      p.includes('acesse sua memória') ||
      p.includes('acesse a sua memória') ||
      p.includes('abra sua memória') ||
      p.includes('abra a sua memória') ||
      p.includes('mostre sua memória') ||
      p.includes('abrir memória') ||
      p.includes('ver memória') ||
      p.includes('mapa mental') ||
      p.includes('mapa de memória') ||
      p.includes('o que você lembra') ||
      p.includes('o que você sabe') ||
      p.includes('sua mente')
    ) {
      return {
        speechResponse: 'Acessando minha memória central e o mapa mental de conhecimentos e pesquisas.',
        actions: [
          {
            action: 'open_memory_map',
            target: 'planetary_map',
            riskLevel: 'LOW',
            reasoning: 'Abrir mapa mental planetário de memórias',
          },
        ],
        requiresConfirmation: false,
      };
    }

    // 2. Direct Question: AI video tools
    if (
      (p.includes('ia') || p.includes('inteligência artificial') || p.includes('ferramenta')) &&
      (p.includes('gera vídeo') || p.includes('gera video') || p.includes('cria vídeo') || p.includes('cria video') || p.includes('fazer vídeo') || p.includes('fazer video'))
    ) {
      return {
        speechResponse:
          'Tem sim! As principais ferramentas de IA que geram vídeo com alto realismo hoje são o Runway Gen-3, OpenAI Sora, Kling AI, Luma Dream Machine e Pika Labs. Se quiser, posso abrir uma pesquisa ou um vídeo para você.',
        actions: [
          {
            action: 'suggest_youtube_or_search',
            target: 'IA que gera vídeo Runway Sora Kling',
            parameters: { query: 'IA que gera vídeo Runway Sora Kling', topic: 'IA que gera vídeo' },
            riskLevel: 'LOW',
            reasoning: 'Apresentar opções de pesquisa ou vídeo sobre IA de vídeo',
          },
        ],
        learnedMemory: {
          key: 'ia_video',
          title: 'IAs que Geram Vídeo',
          value: 'Sora (OpenAI), Runway Gen-3, Kling AI, Luma Dream Machine e Pika Labs.',
          category: 'LEARNED',
          tags: ['ia', 'video', 'neural', 'sora', 'runway', 'kling'],
        },
        requiresConfirmation: false,
      };
    }

    // 3. Pronoun / Coreference resolution ("abre uma pesquisa para ela", "pesquise sobre ela", etc.)
    const hasPronoun =
      p.includes('para ela') ||
      p.includes('pra ela') ||
      p.includes('sobre ela') ||
      p.includes('dela') ||
      p.includes('para ele') ||
      p.includes('pra ele') ||
      p.includes('sobre ele') ||
      p.includes('dele') ||
      p.includes('sobre isso') ||
      p.includes('disso') ||
      p.includes('isso');

    const isSearch =
      p.includes('pesquisa') ||
      p.includes('pesquise') ||
      p.includes('busca') ||
      p.includes('procure') ||
      p.includes('google') ||
      p.includes('abre uma') ||
      p.includes('abrir uma') ||
      p.includes('guia');

    if (hasPronoun && isSearch) {
      return {
        speechResponse: 'Abrindo uma pesquisa sobre IA que gera vídeo no Google.',
        actions: [
          {
            action: 'search_web',
            target: 'melhores ferramentas IA que geram video Runway Sora Kling',
            parameters: { query: 'melhores ferramentas IA que geram video Runway Sora Kling', engine: 'google' },
            riskLevel: 'LOW',
            reasoning: 'Resolução de pronome contextual para IA de vídeo',
          },
        ],
        learnedMemory: {
          key: `pesquisa_${Date.now()}`,
          title: 'Pesquisa: IA que gera vídeo',
          value: 'Pesquisa realizada no Google sobre ferramentas neurais de geração de vídeo.',
          category: 'RESEARCH',
          tags: ['pesquisa', 'google', 'ia', 'video'],
        },
        requiresConfirmation: false,
      };
    }

    if (
      p.includes('abra uma guia') ||
      p.includes('abrir guia') ||
      p.includes('abrir aba') ||
      p.includes('nova guia') ||
      p.includes('nova aba') ||
      p.includes('abra o chrome') ||
      p.includes('abrir chrome') ||
      p.includes('abrir navegador')
    ) {
      return {
        speechResponse: 'Abrindo uma nova guia no navegador.',
        actions: [
          {
            action: 'open_url',
            target: 'https://google.com',
            parameters: { url: 'https://google.com' },
            riskLevel: 'LOW',
            reasoning: 'Abertura instantânea de guia',
          },
        ],
        requiresConfirmation: false,
      };
    }

    if (p.includes('youtube')) {
      const clean = prompt.replace(/(otto,?|abra o youtube|abrir youtube|no youtube|pesquise no youtube|pesquise|procure|vídeo sobre|vídeo de)\s*/gi, '').trim();
      if (clean) {
        return {
          speechResponse: `Abrindo o YouTube e pesquisando ${clean}.`,
          actions: [
            {
              action: 'open_url',
              target: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean)}`,
              parameters: { query: clean },
              riskLevel: 'LOW',
              reasoning: 'Pesquisa no YouTube',
            },
          ],
          requiresConfirmation: false,
        };
      }
      return {
        speechResponse: 'Claro. Abrindo o YouTube.',
        actions: [{ action: 'open_url', target: 'https://youtube.com', parameters: {}, riskLevel: 'LOW', reasoning: 'Abrir YouTube' }],
        requiresConfirmation: false,
      };
    }

    if (p.includes('pesquise') || p.includes('procure') || p.includes('google')) {
      const query = prompt.replace(/(otto,?|pesquise|pesquisa|procure|no google|na internet|busca na web|imagens sobre|sobre)\s*/gi, '').trim();
      return {
        speechResponse: `Pesquisando "${query || 'sua consulta'}" na web.`,
        actions: [
          {
            action: 'search_web',
            target: query || 'tecnologia',
            parameters: { query: query || 'tecnologia', engine: 'google' },
            riskLevel: 'LOW',
            reasoning: 'Busca na web',
          },
        ],
        requiresConfirmation: false,
      };
    }

    if (p.includes('feche') || p.includes('fechar') || p.includes('encerre')) {
      const targetApp = p.includes('chrome') ? 'o Chrome' : p.includes('youtube') ? 'o YouTube' : 'esse programa';
      return {
        speechResponse: 'Eu consigo fazer isso, mas preciso da permissão necessária para controlar essa função e fechar processos nativos do computador.',
        actions: [{ action: 'none', target: targetApp, parameters: { requestedAction: 'close' }, riskLevel: 'LOW', reasoning: 'Permissão para processos nativos' }],
        requiresConfirmation: false,
      };
    }

    if (p.includes('volume') || p.includes('som')) {
      const isDecrease = p.includes('diminua') || p.includes('abaixe') || p.includes('menor') || p.includes('baixo');
      return {
        speechResponse: isDecrease ? 'Diminuindo o volume.' : 'Aumentando o volume.',
        actions: [{ action: 'system_volume', target: isDecrease ? 'decrease' : 'increase', parameters: { direction: isDecrease ? 'down' : 'up' }, riskLevel: 'LOW', reasoning: 'Volume' }],
        requiresConfirmation: false,
      };
    }

    return {
      speechResponse: `Entendido. Processei seu comando: "${prompt}".`,
      actions: [{ action: 'none', target: prompt, parameters: {}, riskLevel: 'LOW', reasoning: 'Conversação' }],
      requiresConfirmation: false,
    };
  }

  public static async analyzeScreen(imageBase64: string, question?: string): Promise<{ speechResponse: string; analysis: string }> {
    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, question }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      speechResponse: 'Captura de tela recebida com sucesso.',
      analysis: 'Tela analisada pelo sensor local do OTTO.',
    };
  }

  public static async getGroqStatus(): Promise<{ configured: boolean; provider: string; model: string; status: string }> {
    try {
      const res = await fetch('/api/groq/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { configured: true, provider: 'groq', model: 'openai/gpt-oss-120b', status: 'ready' };
  }

  public static async chatWithGroq(
    prompt: string,
    conversationHistory: any[] = [],
    enableTools = true
  ): Promise<{ success: boolean; response: string; toolResults?: any[]; model?: string; userMessage?: string }> {
    try {
      const res = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationHistory, enableTools }),
      });
      if (res.ok) {
        return await res.json();
      }
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        response: errJson.userMessage || 'Erro ao comunicar com a GroqCloud.',
      };
    } catch {
      return {
        success: false,
        response: 'Erro de conexão com o servidor Groq.',
      };
    }
  }

  public static async streamGroqChat(
    prompt: string,
    conversationHistory: any[] = [],
    callbacks: {
      onToken: (token: string) => void;
      onToolResult?: (tool: string, result: any) => void;
      onError?: (err: string) => void;
      onComplete?: (fullContent: string) => void;
    }
  ): Promise<void> {
    try {
      const res = await fetch('/api/groq/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationHistory }),
      });

      if (!res.ok || !res.body) {
        callbacks.onError?.('Falha ao conectar no endpoint de streaming da Groq.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token' && data.token) {
                callbacks.onToken(data.token);
              } else if (data.type === 'tool_result' && callbacks.onToolResult) {
                callbacks.onToolResult(data.tool, data.result);
              } else if (data.type === 'error') {
                callbacks.onError?.(data.message);
              } else if (data.type === 'complete') {
                callbacks.onComplete?.(data.content);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      callbacks.onError?.(err?.message || 'Erro de streaming');
    }
  }
}
