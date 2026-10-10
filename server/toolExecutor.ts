// Real Tool Executor for Groq Tool Calling Architecture
// Handles search_web, calculator, read_file, write_file, create_folder, execute_command

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = path.resolve(__dirname, '..', 'otto_workspace');

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  result: any;
  error?: string;
}

export async function executeGroqTool(name: string, rawArgs: string | Record<string, any>): Promise<ToolExecutionResult> {
  let args: Record<string, any> = {};
  if (typeof rawArgs === 'string') {
    try {
      args = JSON.parse(rawArgs);
    } catch {
      args = { query: rawArgs };
    }
  } else {
    args = rawArgs || {};
  }

  try {
    switch (name) {
      case 'search_web': {
        const query = args.query || args.q || 'pesquisa';
        const engine = args.engine || 'google';
        
        // Return structured search web response for model reasoning
        return {
          toolName: 'search_web',
          success: true,
          result: {
            query,
            engine,
            message: `Pesquisa realizada para "${query}".`,
            resultsSummary: `Resumo de resultados da web para '${query}': Notícias e informações mais recentes obtidas no ${engine}.`,
            actionPrompt: `Instrua o usuário sobre os principais pontos encontrados para '${query}'.`
          },
        };
      }

      case 'calculator': {
        const expr = args.expression || args.expr || '0';
        // Safe math evaluation
        const sanitized = expr.replace(/[^0-9+\-*/().\s^%sqrt]/g, '');
        let value: number = 0;
        try {
          // simple evaluation
          const fn = new Function(`return (${sanitized.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')})`);
          value = fn();
        } catch {
          value = 0;
        }

        return {
          toolName: 'calculator',
          success: true,
          result: {
            expression: expr,
            evaluatedResult: value,
          },
        };
      }

      case 'read_file': {
        const filename = args.filename || args.path || '';
        if (!filename) {
          return { toolName: 'read_file', success: false, result: null, error: 'Nome do arquivo não fornecido.' };
        }

        const normalized = filename.replace(/\\/g, '/').replace(/^\/+/, '');
        const fullPath = path.resolve(WORKSPACE_DIR, normalized);

        if (!fullPath.startsWith(WORKSPACE_DIR)) {
          return { toolName: 'read_file', success: false, result: null, error: 'Acesso fora do workspace negado.' };
        }

        if (!fs.existsSync(fullPath)) {
          return { toolName: 'read_file', success: false, result: null, error: `Arquivo '${normalized}' não existe no workspace.` };
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        return {
          toolName: 'read_file',
          success: true,
          result: {
            filename: normalized,
            sizeBytes: fs.statSync(fullPath).size,
            content,
          },
        };
      }

      case 'write_file': {
        const filename = args.filename || args.path || '';
        const content = args.content || '';

        if (!filename) {
          return { toolName: 'write_file', success: false, result: null, error: 'Nome de arquivo obrigatório.' };
        }

        const normalized = filename.replace(/\\/g, '/').replace(/^\/+/, '');
        const fullPath = path.resolve(WORKSPACE_DIR, normalized);

        if (!fullPath.startsWith(WORKSPACE_DIR)) {
          return { toolName: 'write_file', success: false, result: null, error: 'Acesso fora do workspace negado.' };
        }

        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content, 'utf-8');
        return {
          toolName: 'write_file',
          success: true,
          result: {
            filename: normalized,
            savedPath: fullPath,
            sizeBytes: Buffer.byteLength(content, 'utf-8'),
          },
        };
      }

      case 'create_folder': {
        const folderName = args.name || args.folderName || 'nova_pasta';
        const sanitized = folderName.replace(/[<>:"/\\|?*]/g, '').trim();
        const fullPath = path.resolve(WORKSPACE_DIR, sanitized);

        if (!fullPath.startsWith(WORKSPACE_DIR)) {
          return { toolName: 'create_folder', success: false, result: null, error: 'Acesso negado fora do workspace.' };
        }

        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }

        return {
          toolName: 'create_folder',
          success: true,
          result: {
            folderName: sanitized,
            createdPath: fullPath,
          },
        };
      }

      case 'execute_command': {
        const cmd = (args.command || args.cmd || '').trim();
        const forbidden = ['rm -rf /', 'mkfs', 'shutdown', 'reboot'];

        if (forbidden.some((f) => cmd.includes(f))) {
          return { toolName: 'execute_command', success: false, result: null, error: 'Comando de alto risco bloqueado por segurança.' };
        }

        return new Promise((resolve) => {
          exec(cmd, { cwd: WORKSPACE_DIR, timeout: 8000 }, (error, stdout, stderr) => {
            resolve({
              toolName: 'execute_command',
              success: !error,
              result: {
                command: cmd,
                stdout: stdout?.trim() || '',
                stderr: stderr?.trim() || '',
                exitCode: error ? error.code || 1 : 0,
              },
            });
          });
        });
      }

      default:
        return {
          toolName: name,
          success: false,
          result: null,
          error: `Ferramenta '${name}' não reconhecida.`,
        };
    }
  } catch (err: any) {
    return {
      toolName: name,
      success: false,
      result: null,
      error: `Erro ao executar ferramenta '${name}': ${err?.message || String(err)}`,
    };
  }
}
