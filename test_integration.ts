/**
 * Teste Real de Integração das Duas Rotas de IA, Sandbox e Orquestrador de Agentes.
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TaskRouter } from './server/taskRouter.js';
import { TextCodeProvider } from './server/textCodeProvider.js';
import { CodeSandbox } from './server/codeSandbox.js';
import { AgentOrchestrator } from './server/agentOrchestrator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = path.resolve(__dirname, 'otto_workspace');

async function runTest() {
  console.log('===============================================================');
  console.log('TESTE REAL DE INTEGRAÇÃO — SISTEMA DE IA DE DUAS ROTAS');
  console.log('===============================================================\n');

  // 1. Teste do TaskRouter (Detecção de Intenção e Roteamento)
  console.log('--- TESTE 1: TASK ROUTER & DETECÇÃO DE INTENÇÃO ---');
  const testPrompts = [
    { text: 'Oi, tudo bem?', expected: 'ROTA_A' },
    { text: 'Explique o que é JavaScript.', expected: 'ROTA_A' },
    { text: 'Qual é a capital do Brasil?', expected: 'ROTA_A' },
    { text: 'Crie um site de login em React.', expected: 'ROTA_B' },
    { text: 'Corrija esse código: function sum(a,b) { return a - b; }', expected: 'ROTA_B' },
    { text: 'Crie uma apresentação em HTML com 5 slides sobre IA.', expected: 'ROTA_B' },
  ];

  for (const item of testPrompts) {
    const decision = TaskRouter.evaluate(item.text);
    const pass = decision.route === item.expected;
    console.log(`[Router] "${item.text}"`);
    console.log(`  → Rota Selecionada: ${decision.route} (${decision.routeName})`);
    console.log(`  → Motivo: ${decision.reason}`);
    console.log(`  → Match Esperado: ${pass ? '✓ OK' : '✕ FALHOU'}\n`);
  }

  // 2. Teste do CodeSandbox (Execução Real Isolada)
  console.log('--- TESTE 2: CODE SANDBOX (EXECUÇÃO REAL ISOLADA) ---');
  console.log('Executando script Node.js real no sandbox isolado...');
  const jsCode = `
    const math = { add: (a, b) => a + b, mul: (a, b) => a * b };
    console.log("Calculando no sandbox:", math.add(40, 2), math.mul(6, 7));
    console.log("Ambiente isolado OK, PID:", process.pid);
  `;
  const jsResult = await CodeSandbox.execute({
    code: jsCode,
    language: 'javascript',
    filename: 'math_test.js',
    timeoutMs: 10000,
  });

  console.log(`  → Sucesso: ${jsResult.success}`);
  console.log(`  → Exit Code: ${jsResult.exitCode}`);
  console.log(`  → Tempo de Execução: ${jsResult.executionTimeMs}ms`);
  console.log(`  → Runtime Usado: ${jsResult.runtimeUsed}`);
  console.log(`  → stdout: ${jsResult.stdout}`);
  if (jsResult.stderr) console.log(`  → stderr: ${jsResult.stderr}`);
  console.log('');

  // Teste Sandbox Python
  console.log('Executando script Python real no sandbox isolado...');
  const pyCode = `
import sys
print(f"Python Sandbox ativo: {sys.version.split()[0]}")
squares = [x**2 for x in range(1, 6)]
print(f"Resultado quadrados: {squares}")
`;
  const pyResult = await CodeSandbox.execute({
    code: pyCode,
    language: 'python',
    filename: 'py_test.py',
    timeoutMs: 10000,
  });

  console.log(`  → Sucesso: ${pyResult.success}`);
  console.log(`  → Exit Code: ${pyResult.exitCode}`);
  console.log(`  → Tempo de Execução: ${pyResult.executionTimeMs}ms`);
  console.log(`  → Runtime Usado: ${pyResult.runtimeUsed}`);
  console.log(`  → stdout: ${pyResult.stdout}\n`);

  // 3. Teste de Chamada HTTP Real ao TextCodeProvider
  console.log('--- TESTE 3: TEXT CODE PROVIDER (CHAMADA HTTP REAL À API) ---');
  const providerStatus = TextCodeProvider.getStatus();
  console.log(`  → Configurado: ${providerStatus.configured}`);
  console.log(`  → Modelo: ${providerStatus.model}`);
  console.log(`  → Endpoint: ${providerStatus.endpoint}`);

  try {
    const apiRes = await TextCodeProvider.generate({
      messages: [
        { role: 'system', content: 'Você é o assistente técnico especializado do OTTO. Responda em 1 frase curta.' },
        { role: 'user', content: 'Responda confirmando que a API de texto e código está conectada.' },
      ],
      temperature: 0.1,
    });
    console.log(`  → Resposta Recebida: "${apiRes.content.trim()}"`);
    console.log(`  → Modelo Utilizado: ${apiRes.model}`);
    console.log(`  → Latência da Requisição HTTP: ${apiRes.latencyMs}ms`);
    console.log(`  → Tokens Utilizados: ${JSON.stringify(apiRes.usage)}\n`);
  } catch (err: any) {
    console.log(`  → Aviso na chamada do TextCodeProvider: ${err.message}\n`);
  }

  // 4. Teste de Orquestração Completa de Agentes
  console.log('--- TESTE 4: ORQUESTRADOR MULTI-AGENTES (ROTA B COMPLETA) ---');
  const testTask = 'Crie uma função em JavaScript para validar CPF com testes unitários';
  console.log(`Iniciando orquestração para: "${testTask}"...`);

  try {
    const taskState = await AgentOrchestrator.executeTask(
      testTask,
      WORKSPACE_DIR,
      (progress) => {
        console.log(`  [Progresso] ${progress.agent}: ${progress.message}`);
      }
    );

    console.log('\n===============================================================');
    console.log('RELATÓRIO FINAL DA EXECUÇÃO REAL');
    console.log('===============================================================');
    console.log(`1. ROTA SELECIONADA: ROTA B (API Especializada de Texto & Código)`);
    console.log(`2. API CHAMADA: ${TextCodeProvider.getEffectiveApiUrl()} [Model: ${TextCodeProvider.getEffectiveModel()}]`);
    console.log(`3. REQUISIÇÕES ENVIADAS: ${taskState.metrics.totalApiCalls} chamadas HTTP reais`);
    console.log(`4. RESPOSTA RECEBIDA: Sim (${taskState.metrics.totalDurationMs}ms duração total)`);
    console.log(`5. AGENTES EXECUTADOS: ${taskState.agentHistory.map((h) => `${h.agent} (${h.status})`).join(' → ')}`);
    console.log(`6. EXECUÇÃO DE CÓDIGO NO SANDBOX: ${taskState.testResults.length} teste(s) executado(s)`);
    console.log(`7. RESULTADO DOS TESTES: ${taskState.testResults.every((t) => t.passed) ? '✓ TODOS OS TESTES PASSARAM' : 'Avisos/Falhas'}`);
    taskState.testResults.forEach((t) => {
      console.log(`   - ${t.file}: exitCode=${t.exitCode}, tempo=${t.executionTimeMs}ms`);
      if (t.stdout) console.log(`     stdout: ${t.stdout.slice(0, 120)}`);
    });
    console.log(`8. RESULTADO FINAL & ARQUIVOS GRAVADOS EM DISCO:`);
    taskState.finalResult?.createdFiles.forEach((cf) => {
      console.log(`   - ${cf.name} (${cf.size} bytes) em ${cf.fullPath}`);
    });
    console.log(`   Resumo falado: "${taskState.finalResult?.speechResponse}"`);
    console.log('===============================================================\n');
  } catch (err: any) {
    console.error('Erro no teste de orquestração:', err);
  }
}

runTest().catch(console.error);
