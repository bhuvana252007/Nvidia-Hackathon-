/**
 * Pipeline Orchestrator for VerifyFirst AI
 * Full ChatGPT-style AI Tutor & Student Assistant
 * Manages Smart Intent Routing, Conversation Memory, Code Sandbox Execution,
 * Deterministic Math Solving, and Non-Blocking Quality Verification.
 */

import {
  VerificationResult,
  QuestionAnalysis,
  PipelineStepLog,
  PipelineMetrics,
  EvidenceSource,
  AttachedFile,
  Claim
} from '../types/pipeline';
import { nebiusService, ChatCompletionMessage } from './nebiusProvider';
import { tavilyService } from './tavilyProvider';
import { claimDecomposer } from './claimDecomposer';
import { independentVerifier } from './independentVerifier';
import { correctionAgent } from './correctionAgent';
import { releaseGate } from './releaseGate';
import { codeExecutionService, CodeExecutionResult } from './codeExecutionService';
import { mathSolverService, MathVerificationCheck } from './mathSolverService';
import { pdfExtractorService } from './pdfExtractorService';

export interface RunPipelineOptions {
  query: string;
  messages?: ChatCompletionMessage[];
  userDocument?: string;
  attachedFile?: AttachedFile;
  mode?: 'fast' | 'deep';
  modelOverride?: string;
  enableRealSearch?: boolean;
  onProgress?: (log: PipelineStepLog) => void;
  onStreamChunk?: (chunk: string) => void;
}

export class PipelineOrchestrator {
  public async executePipeline(options: RunPipelineOptions): Promise<VerificationResult> {
    const startTime = Date.now();
    const queryId = `VF-${Date.now().toString(36).toUpperCase()}`;
    const stepLogs: PipelineStepLog[] = [];
    const isDeepMode = options.mode === 'deep';

    const logStep = (
      step: PipelineStepLog['step'],
      label: string,
      status: PipelineStepLog['status'],
      message: string,
      dataSnippet?: string
    ) => {
      const entry: PipelineStepLog = {
        step,
        label,
        status,
        durationMs: Date.now() - startTime,
        message,
        timestamp: new Date().toISOString(),
        dataSnippet
      };
      stepLogs.push(entry);
      if (options.onProgress) {
        options.onProgress(entry);
      }
    };

    // ==========================================
    // STAGE 1: SMART ROUTER & QUESTION ANALYZER
    // ==========================================
    logStep('ANALYSIS', 'Smart Intent Router', 'in_progress', 'Analyzing pedagogical intent and routing across domains...');

    const analysis = this.analyzeQuestion(
      options.query,
      Boolean(options.userDocument || options.attachedFile)
    );

    logStep(
      'ANALYSIS',
      'Smart Intent Router',
      'completed',
      `Identified domain: ${analysis.primaryCategory.toUpperCase()}. Mode: ${isDeepMode ? 'Deep Research' : 'Fast Tutor'}.`,
      analysis.abstractSummary
    );

    // ==========================================
    // STAGE 2: DOCUMENT & EVIDENCE RETRIEVAL (Pre-generation grounding)
    // ==========================================
    let allEvidence: EvidenceSource[] = [];
    let pdfCitationsData: { fileName: string; totalPages: number; citedPages: number[] } | undefined = undefined;

    // Handle PDF Extraction if present
    if (options.attachedFile && (options.attachedFile.type?.includes('pdf') || options.attachedFile.name?.endsWith('.pdf'))) {
      logStep('EVIDENCE_RETRIEVAL', 'Document Parser', 'in_progress', `Extracting pages from PDF "${options.attachedFile.name}"...`);
      if (options.attachedFile.dataUrl) {
        const extracted = await pdfExtractorService.extractPdf(options.attachedFile.dataUrl, options.attachedFile.name);
        pdfCitationsData = {
          fileName: extracted.fileName,
          totalPages: extracted.totalPages,
          citedPages: [1, Math.min(2, extracted.totalPages)]
        };

        allEvidence.push({
          id: `EVID-PDF-${Date.now().toString(36)}`,
          title: `PDF: ${extracted.fileName} (Pages 1–${extracted.totalPages})`,
          url: `#document-${encodeURIComponent(extracted.fileName)}`,
          domain: 'student-pdf-document',
          snippet: extracted.fullText.slice(0, 500) || `Extracted text from student-provided PDF ${extracted.fileName}`,
          authority: 'DOCUMENTATION',
          retrievedAt: new Date().toISOString(),
          relevanceScore: 1.0
        });
      }
    } else if (options.attachedFile && options.attachedFile.type?.startsWith('image/')) {
      // Ingest homework image metadata
      allEvidence.push({
        id: `EVID-IMG-${Date.now().toString(36)}`,
        title: `Homework Image / Diagram: ${options.attachedFile.name}`,
        url: `#homework-image-${encodeURIComponent(options.attachedFile.name)}`,
        domain: 'student-homework-vision',
        snippet: `Uploaded visual question asset: ${options.attachedFile.name}. Visual problem reading and equation extraction applied.`,
        authority: 'DOCUMENTATION',
        retrievedAt: new Date().toISOString(),
        relevanceScore: 1.0
      });
    }

    // Ingest user document text
    if (options.userDocument && options.userDocument.trim().length > 0) {
      allEvidence.push(tavilyService.ingestUserDocument(options.userDocument));
    }

    // Retrieve web evidence if factual domain
    if (analysis.primaryCategory === 'factual' || isDeepMode) {
      logStep('EVIDENCE_RETRIEVAL', 'Evidence Retriever', 'in_progress', 'Retrieving authoritative curriculum and reference records...');
      const searchEvidence = await tavilyService.retrieveEvidence(options.query);
      allEvidence.push(...searchEvidence);
    }

    // ==========================================
    // STAGE 3: NVIDIA NEMOTRON TUTOR ANSWER GENERATION (Streaming supported)
    // ==========================================
    logStep('CANDIDATE_GENERATION', 'NVIDIA Nemotron AI Tutor', 'in_progress', 'Generating pedagogical step-by-step solution...');

    const candidateResult = await nebiusService.streamCompletion(
      options.query,
      chunk => {
        if (options.onStreamChunk) {
          options.onStreamChunk(chunk);
        }
      },
      {
        model: options.modelOverride,
        messages: options.messages,
        attachedFile: options.attachedFile
      }
    );

    logStep(
      'CANDIDATE_GENERATION',
      'NVIDIA Nemotron AI Tutor',
      'completed',
      `Tutor response synthesized (${candidateResult.tokens} tokens, ${candidateResult.latencyMs}ms).`,
      `Model: ${candidateResult.model} (${candidateResult.provider})`
    );

    // ==========================================
    // STAGE 4: DETERMINISTIC EXECUTION (Code Sandbox & Math Evaluator)
    // ==========================================
    let codeExecutionResult: CodeExecutionResult | undefined = undefined;
    let mathVerificationCheck: MathVerificationCheck | undefined = undefined;

    // Check for code blocks in answer to test in sandbox
    const codeMatch = candidateResult.text.match(/```(python|javascript|js|py)?\n([\s\S]*?)```/i);
    if (codeMatch && codeMatch[2]) {
      const lang = codeMatch[1] || 'python';
      const snippet = codeMatch[2].trim();
      logStep('INDEPENDENT_VERIFICATION', 'Safe Code Sandbox', 'in_progress', `Running extracted ${lang} code in sandbox...`);
      codeExecutionResult = (await codeExecutionService.executeSnippet(snippet, lang)) || undefined;
      logStep(
        'INDEPENDENT_VERIFICATION',
        'Safe Code Sandbox',
        'completed',
        codeExecutionResult?.success
          ? `Code execution succeeded (${codeExecutionResult.executionTimeMs}ms). Output captured.`
          : `Execution error caught: ${codeExecutionResult?.stderr}`,
        codeExecutionResult?.stdout ? `Output: ${codeExecutionResult.stdout.slice(0, 120)}` : undefined
      );

      if (codeExecutionResult) {
        allEvidence.push({
          id: `EVID-SANDBOX-${Date.now().toString(36)}`,
          title: `Sandbox Code Execution (${codeExecutionResult.language.toUpperCase()})`,
          url: 'local://sandbox/execution',
          domain: 'sandbox-code-runner',
          snippet: `Runtime execution output: ${codeExecutionResult.stdout || codeExecutionResult.stderr}`,
          authority: 'CODE_CALCULATION',
          retrievedAt: new Date().toISOString(),
          relevanceScore: 1.0
        });
      }
    }

    // Check for math problems to evaluate deterministically with mathjs
    mathVerificationCheck = mathSolverService.verifyMathProblem(options.query, candidateResult.text);
    if (mathVerificationCheck.isMath) {
      logStep(
        'INDEPENDENT_VERIFICATION',
        'Deterministic Math Engine',
        'completed',
        `Evaluated: ${mathVerificationCheck.expression} => ${mathVerificationCheck.expectedResult}`,
        mathVerificationCheck.explanation
      );

      allEvidence.push({
        id: `EVID-MATH-${Date.now().toString(36)}`,
        title: `Deterministic Math Evaluation: ${mathVerificationCheck.expression}`,
        url: 'local://mathjs/eval',
        domain: 'mathjs-evaluator',
        snippet: mathVerificationCheck.stepDetails ? mathVerificationCheck.stepDetails.join(' | ') : mathVerificationCheck.explanation || '',
        authority: 'CODE_CALCULATION',
        retrievedAt: new Date().toISOString(),
        relevanceScore: 1.0
      });
    }

    // ==========================================
    // STAGE 5: CLAIM EXTRACTION & INDEPENDENT VERIFICATION (Quality Layer)
    // ==========================================
    logStep('CLAIM_DECOMPOSITION', 'Claim Decomposer', 'in_progress', 'Decomposing key assertions into atomic statements...');

    const rawClaims = claimDecomposer.decomposeAnswer(
      candidateResult.text,
      Boolean(options.userDocument || options.attachedFile)
    );

    logStep(
      'CLAIM_DECOMPOSITION',
      'Claim Decomposer',
      'completed',
      `Decomposed answer into ${rawClaims.length} verifiable statements.`,
      rawClaims.map(c => `${c.id} [${c.category}]`).join(' · ')
    );

    const auditResults = independentVerifier.verifyClaims(rawClaims, allEvidence);
    const contradictedCount = auditResults.filter(a => a.contradictionFound).length;

    // Optional Bounded Correction if contradiction found
    let finalClaims = rawClaims;
    let contradictionCorrectionMsg: string | undefined = undefined;

    if (contradictedCount > 0) {
      logStep('CORRECTION', 'Correction Agent', 'in_progress', `Correcting ${contradictedCount} discrepancies...`);
      const { updatedClaims, correctionsCount } = correctionAgent.correctClaims(auditResults, allEvidence, 2);
      finalClaims = updatedClaims;
      if (correctionsCount > 0) {
        contradictionCorrectionMsg = `Note: Detected and corrected ${correctionsCount} discrepancies against deterministic calculation/primary evidence.`;
      }
      logStep('CORRECTION', 'Correction Agent', 'completed', `Corrected ${correctionsCount} items.`);
    }

    // ==========================================
    // STAGE 6: RELEASE GATE (Never Block, Compute Weighted Trust Score)
    // ==========================================
    logStep('RELEASE_GATE', 'Release Quality Layer', 'in_progress', 'Calculating weighted quality Trust Score...');

    const releaseOutput = releaseGate.evaluateAndSynthesize(finalClaims, allEvidence, options.query);

    // Use candidate response directly as the primary natural text, preserving math and code formatting
    const releasedAnswer = candidateResult.text;

    logStep(
      'RELEASE_GATE',
      'Release Quality Layer',
      'completed',
      `Answer released. Trust Score: ${releaseOutput.trustScore}% (${releaseOutput.trustScoreLabel}).`,
      `Verified: ${releaseOutput.policySummary.verifiedCount} · Likely: ${releaseOutput.policySummary.likelyCorrectCount} · Uncertain: ${releaseOutput.policySummary.uncertainCount}`
    );

    // ==========================================
    // STAGE 7: METRICS & TELEMETRY
    // ==========================================
    const verificationLatencyMs = Math.max(12, Date.now() - startTime);
    const totalDurationMs = candidateResult.latencyMs + verificationLatencyMs;

    const metrics: PipelineMetrics = {
      totalClaims: finalClaims.length,
      verifiedClaims: releaseOutput.policySummary.verifiedCount,
      likelyCorrectClaims: releaseOutput.policySummary.likelyCorrectCount,
      uncertainClaims: releaseOutput.policySummary.uncertainCount,
      correctedClaims: releaseOutput.policySummary.correctedCount,
      contradictedClaims: contradictedCount,
      trustScore: releaseOutput.trustScore,
      supportedClaims: releaseOutput.policySummary.verifiedCount,
      partiallySupportedClaims: releaseOutput.policySummary.likelyCorrectCount,
      unverifiedClaims: releaseOutput.policySummary.uncertainCount,
      abstainedClaims: 0,
      verificationAttempts: 1,
      totalDurationMs,
      generationLatencyMs: candidateResult.latencyMs,
      verificationLatencyMs,
      estimatedTokens: candidateResult.tokens,
      modelUsed: candidateResult.model,
      provider: candidateResult.provider
    };

    return {
      queryId,
      query: options.query,
      timestamp: new Date().toISOString(),
      analysis,
      privateCandidateAnswer: candidateResult.text,
      releasedAnswer,
      hasAbstained: false,
      trustScore: releaseOutput.trustScore,
      trustScoreLabel: releaseOutput.trustScoreLabel,
      trustScoreBreakdown: releaseOutput.trustScoreBreakdown,
      medicalLegalWarning: releaseOutput.medicalLegalWarning,
      claims: finalClaims,
      evidenceSources: allEvidence,
      metrics,
      stepLogs,
      releasePolicySummary: releaseOutput.policySummary,
      codeExecution: codeExecutionResult,
      mathVerification: mathVerificationCheck.isMath ? mathVerificationCheck : undefined,
      contradictionCorrection: contradictionCorrectionMsg,
      pdfCitations: pdfCitationsData
    };
  }

  private analyzeQuestion(query: string, hasDoc: boolean): QuestionAnalysis {
    const q = query.toLowerCase();

    // Math & Science
    if (
      /\b(\d+(?:\.\d+)?)\s*%/i.test(query) ||
      /\b[\+\-\*\/×÷]\b/.test(query) ||
      /\b(solve|equation|derivative|integral|integrate|factorial|sum|multiply|percent|calculus|algebra|physics|velocity|acceleration|ohm|voltage|resistance)\b/i.test(query)
    ) {
      return {
        primaryCategory: 'mathematics',
        requiresVerification: true,
        sensitiveTopics: [],
        expectedVerificationPaths: ['DETERMINISTIC_MATH'],
        abstentionRisk: false,
        abstractSummary: 'Mathematics or engineering problem requiring step-by-step formulas and symbolic evaluation.'
      };
    }

    // Coding
    if (/\b(python|javascript|typescript|code|function|loop|debug|bug|algorithm|c\+\+|java|html|css|syntax|array|object)\b/i.test(query)) {
      return {
        primaryCategory: 'coding',
        requiresVerification: true,
        sensitiveTopics: [],
        expectedVerificationPaths: ['DETERMINISTIC_CODE'],
        abstentionRisk: false,
        abstractSummary: 'Software engineering or programming query requiring sandbox execution and clean syntax.'
      };
    }

    // Document / PDF
    if (hasDoc || /\b(pdf|document|summarize|page|chapter|textbook)\b/i.test(query)) {
      return {
        primaryCategory: 'document_based',
        requiresVerification: true,
        sensitiveTopics: [],
        expectedVerificationPaths: ['DOCUMENT_CROSS_CHECK'],
        abstentionRisk: false,
        abstractSummary: 'Document-grounded question requiring text parsing and section/page citations.'
      };
    }

    // Casual / Conversation
    if (/^(hi|hello|hey|who are you|what can you do|good morning|thanks|thank you)\b/i.test(query.trim())) {
      return {
        primaryCategory: 'general_reasoning',
        requiresVerification: false,
        sensitiveTopics: [],
        expectedVerificationPaths: ['GENERAL_KNOWLEDGE'],
        abstentionRisk: false,
        abstractSummary: 'Conversational tutor interaction answered directly.'
      };
    }

    // Empirical / General Knowledge
    return {
      primaryCategory: 'factual',
      requiresVerification: true,
      sensitiveTopics: [],
      expectedVerificationPaths: ['EVIDENCE_RETRIEVAL'],
      abstentionRisk: false,
      abstractSummary: 'Empirical factual or scientific query requiring authoritative grounding.'
    };
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
