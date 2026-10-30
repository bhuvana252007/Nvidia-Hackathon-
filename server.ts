/**
 * VerifyFirst AI Full-Stack Server
 * Express backend with mounted Vite middlewares in development
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipelineOrchestrator } from './src/services/pipelineOrchestrator';
import { nebiusService } from './src/services/nebiusProvider';
import { tavilyService } from './src/services/tavilyProvider';
import { evaluationRunner, BENCHMARK_TEST_CASES } from './src/services/evaluationSuite';
import { runAllUnitTests } from './src/services/unitTests';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// ==========================================
// API ROUTES
// ==========================================

// Config & Provider Status
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    nebius: nebiusService.getStatus(),
    tavily: tavilyService.getStatus(),
    environment: {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  });
});

// Update runtime config (e.g. from user Settings modal)
app.post('/api/config', (req: Request, res: Response) => {
  const { nebiusKey, nebiusBaseUrl, nvidiaModel, tavilyKey } = req.body || {};
  if (nebiusKey !== undefined) {
    nebiusService.updateConfig(nebiusKey, nebiusBaseUrl, nvidiaModel);
  }
  if (tavilyKey !== undefined) {
    tavilyService.updateKey(tavilyKey);
  }
  res.json({
    success: true,
    nebius: nebiusService.getStatus(),
    tavily: tavilyService.getStatus()
  });
});

// Presets for Hackathon Demonstration Paths
app.get('/api/presets', (req: Request, res: Response) => {
  res.json([
    {
      id: 'path-a-math',
      title: 'Path A: Deterministic Math Verification',
      badge: 'Deterministic Math',
      query: 'A store item costs $840 with a 15% discount. What is the discount amount and the final total price?',
      description: 'Intercepts common LLM arithmetic slip (15% of $840 = $134 error). Deterministic code recalculates $126 and $714, replaces candidate draft, and logs math audit.',
      path: 'MATHEMATICS'
    },
    {
      id: 'path-b-factual',
      title: 'Path B: Factual & Citation Verification',
      badge: 'Factual & Citations',
      query: 'What processor does NASA\'s Voyager 1 run on and when did it cross the heliopause into interstellar space?',
      description: 'Catches hardware hallucination ("256 MHz Intel processor") and hallucinated Nature citation. Verifies against NASA JPL primary records and corrects to 250 kHz custom JPL CCS.',
      path: 'FACTUAL'
    },
    {
      id: 'path-c-speculation',
      title: 'Path C: Selective Flagging (Never Withhold)',
      badge: 'Selective Flagging',
      query: 'What is the official release date and confirmed retail price of Apple\'s autonomous electric car?',
      description: 'Demonstrates selective flagging instead of withholding: outputs a full, helpful answer regarding Project Titan while selectively marking unconfirmed rumors as UNCERTAIN.',
      path: 'SPECULATION'
    },
    {
      id: 'path-d-contract',
      title: 'Path D: Document-Grounded Cross-Check',
      badge: 'Document Cross-Check',
      query: 'Under the Master Services Agreement, what is the contractor termination notice period and maximum liability cap?',
      userDocument: 'Master Professional Services Agreement Section 9.2: Either party may terminate upon sixty (60) days prior written notice. Section 14.1: Total aggregate liability shall not exceed the aggregate fees actually paid by Client in the preceding six (6) months.',
      description: 'Cross-examines drafted response against user-provided contract clauses, overriding generic LLM boilerplate with verified contract terms.',
      path: 'DOCUMENT'
    },
    {
      id: 'path-e-conflict',
      title: 'Path E: Conflicting Sources & Caveat Qualification',
      badge: 'Source Conflict',
      query: 'Did Google\'s Sycamore quantum processor achieve quantum supremacy over classical supercomputers in 2019?',
      description: 'Balances Google Nature 2019 claim against IBM Summit supercomputer counter-simulation; qualifies answer with verified citations.',
      path: 'CONFLICT'
    }
  ]);
});

// Main Pipeline Verification Endpoint
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { query, userDocument, modelOverride } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const result = await pipelineOrchestrator.executePipeline({
      query: query.trim(),
      userDocument: typeof userDocument === 'string' ? userDocument.trim() : undefined,
      modelOverride
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/verify:', error);
    res.status(500).json({
      error: 'Pipeline execution failed',
      details: error?.message || 'Unknown error'
    });
  }
});

// Evaluation Benchmark
app.get('/api/eval', (req: Request, res: Response) => {
  res.json({ testCases: BENCHMARK_TEST_CASES });
});

app.post('/api/eval', async (req: Request, res: Response) => {
  try {
    const results = await evaluationRunner.runBenchmark();
    res.json(results);
  } catch (error: any) {
    console.error('Error in /api/eval:', error);
    res.status(500).json({ error: 'Benchmark execution failed', details: error?.message });
  }
});

// Automated Unit & Integration Tests
app.get('/api/run-tests', (req: Request, res: Response) => {
  try {
    const testSuiteResult = runAllUnitTests();
    res.json(testSuiteResult);
  } catch (error: any) {
    console.error('Error in /api/run-tests:', error);
    res.status(500).json({ error: 'Tests execution failed', details: error?.message });
  }
});

// ==========================================
// STATIC FILES & VITE DEV SERVER
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VerifyFirst AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
