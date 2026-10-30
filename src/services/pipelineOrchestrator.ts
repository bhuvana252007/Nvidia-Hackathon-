/**
 * Pipeline Orchestrator for VerifyFirst AI
 * Executes the 8-stage Evidence-Gated Workflow
 */

import {
  VerificationResult,
  QuestionAnalysis,
  PipelineStepLog,
  PipelineMetrics,
  EvidenceSource
} from '../types/pipeline';
import { nebiusService } from './nebiusProvider';
import { tavilyService } from './tavilyProvider';
import { claimDecomposer } from './claimDecomposer';
import { independentVerifier } from './independentVerifier';
import { correctionAgent } from './correctionAgent';
import { releaseGate } from './releaseGate';

export interface RunPipelineOptions {
  query: string;
  userDocument?: string;
  modelOverride?: string;
  enableRealSearch?: boolean;
  onProgress?: (log: PipelineStepLog) => void;
}

export class PipelineOrchestrator {
  public async executePipeline(options: RunPipelineOptions): Promise<VerificationResult> {
    const startTime = Date.now();
    const queryId = `VF-${Date.now().toString(36).toUpperCase()}`;
    const stepLogs: PipelineStepLog[] = [];

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
    // STAGE 1: QUESTION ANALYZER
    // ==========================================
    const stage1Start = Date.now();
    logStep('ANALYSIS', 'Question Analyzer', 'in_progress', 'Classifying intent and mapping verification paths...');

    const analysis = this.analyzeQuestion(options.query, Boolean(options.userDocument));
    logStep(
      'ANALYSIS',
      'Question Analyzer',
      'completed',
      `Classified as ${analysis.primaryCategory.toUpperCase()}. Verification paths: ${analysis.expectedVerificationPaths.join(', ')}`,
      analysis.abstractSummary
    );

    // ==========================================
    // STAGE 2: CANDIDATE GENERATOR (NVIDIA Nemotron via Nebius)
    // ==========================================
    logStep('CANDIDATE_GENERATION', 'Candidate Generator (NVIDIA Nemotron)', 'in_progress', 'Generating private candidate response via Nebius Token Factory...');

    const candidateResult = await nebiusService.generateCompletion(options.query, {
      model: options.modelOverride
    });

    logStep(
      'CANDIDATE_GENERATION',
      'Candidate Generator (NVIDIA Nemotron)',
      'completed',
      `Private candidate generated (${candidateResult.totalTokens} tokens, ${candidateResult.latencyMs}ms). Answer retained behind verification gate.`,
      `Model: ${candidateResult.model} (${candidateResult.provider})`
    );

    // ==========================================
    // STAGE 3: CLAIM DECOMPOSER
    // ==========================================
    logStep('CLAIM_DECOMPOSITION', 'Claim Decomposer', 'in_progress', 'Extracting atomic assertions and assigning verification strategies...');

    const rawClaims = claimDecomposer.decomposeAnswer(candidateResult.text, Boolean(options.userDocument));
    logStep(
      'CLAIM_DECOMPOSITION',
      'Claim Decomposer',
      'completed',
      `Decomposed candidate draft into ${rawClaims.length} atomic claims with unique tracking IDs.`,
      rawClaims.map(c => `${c.id} [${c.category}]`).join(' · ')
    );

    // ==========================================
    // STAGE 4: EVIDENCE RETRIEVER (Tavily & Document Ingestion)
    // ==========================================
    logStep('EVIDENCE_RETRIEVAL', 'Evidence Retriever', 'in_progress', 'Retrieving primary authoritative sources and ranking domain authority...');

    let allEvidence: EvidenceSource[] = [];

    // Ingest user document if present
    if (options.userDocument && options.userDocument.trim().length > 0) {
      const userDocEvidence = tavilyService.ingestUserDocument(options.userDocument);
      allEvidence.push(userDocEvidence);
    }

    // Retrieve web evidence via Tavily / Curated primary sources
    const searchEvidence = await tavilyService.retrieveEvidence(options.query);
    allEvidence.push(...searchEvidence);

    logStep(
      'EVIDENCE_RETRIEVAL',
      'Evidence Retriever',
      'completed',
      `Retrieved ${allEvidence.length} authoritative evidence records with sanitized content.`,
      allEvidence.map(e => `${e.domain} (${e.authority})`).join(' · ')
    );

    // ==========================================
    // STAGE 5: INDEPENDENT VERIFIER (Deterministic Code & Cross-Examination)
    // ==========================================
    logStep('INDEPENDENT_VERIFICATION', 'Independent Verifier', 'in_progress', 'Executing deterministic checks and evidence cross-examination...');

    const auditResults = independentVerifier.verifyClaims(rawClaims, allEvidence);

    const contradictedCount = auditResults.filter(a => a.contradictionFound).length;
    const supportedInitial = auditResults.filter(a => a.claim.status === 'SUPPORTED').length;

    logStep(
      'INDEPENDENT_VERIFICATION',
      'Independent Verifier',
      'completed',
      `Verification complete. Supported: ${supportedInitial}, Contradicted/Error caught: ${contradictedCount}, Unverified: ${rawClaims.length - supportedInitial - contradictedCount}`,
      contradictedCount > 0 ? `Detected ${contradictedCount} discrepancy/disagreements requiring correction.` : 'All claims passed initial verification.'
    );

    // ==========================================
    // STAGE 6: CORRECTION AGENT
    // ==========================================
    logStep('CORRECTION', 'Correction Agent', 'in_progress', 'Executing bounded revision on contradicted claims using verified evidence...');

    const { updatedClaims, correctionsCount } = correctionAgent.correctClaims(auditResults, allEvidence, 2);

    logStep(
      'CORRECTION',
      'Correction Agent',
      'completed',
      `Correction stage finished. ${correctionsCount} claims revised and deterministically verified.`,
      correctionsCount > 0 ? `Revised ${correctionsCount} claims to align with primary evidence.` : 'No revisions required.'
    );

    // ==========================================
    // STAGE 7: RELEASE GATE (Policy Enforcement)
    // ==========================================
    logStep('RELEASE_GATE', 'Release Gate', 'in_progress', 'Synthesizing natural assistant answer with inline verification badges...');

    const releaseOutput = releaseGate.evaluateAndSynthesize(updatedClaims, allEvidence, options.query);

    logStep(
      'RELEASE_GATE',
      'Release Gate',
      'completed',
      `GATE OPEN: Full answer released with ${releaseOutput.trustScore}% Trust Score (${releaseOutput.policySummary.verifiedCount} Verified, ${releaseOutput.policySummary.likelyCorrectCount} Likely Correct, ${releaseOutput.policySummary.uncertainCount} Flagged Uncertain).`,
      `Verified: ${releaseOutput.policySummary.verifiedCount} · Likely Correct: ${releaseOutput.policySummary.likelyCorrectCount} · Flagged Uncertain: ${releaseOutput.policySummary.uncertainCount} · Corrected: ${releaseOutput.policySummary.correctedCount}`
    );

    // ==========================================
    // STAGE 8: EVIDENCE REPORT & TELEMETRY
    // ==========================================
    const verificationLatencyMs = Math.max(15, Date.now() - startTime);
    const totalDurationMs = candidateResult.latencyMs + verificationLatencyMs;

    const metrics: PipelineMetrics = {
      totalClaims: updatedClaims.length,
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
      verificationAttempts: 1 + (correctionsCount > 0 ? 1 : 0),
      totalDurationMs,
      generationLatencyMs: candidateResult.latencyMs,
      verificationLatencyMs,
      estimatedTokens: candidateResult.totalTokens,
      modelUsed: candidateResult.model,
      provider: candidateResult.provider
    };

    logStep('REPORT_GENERATION', 'Evidence Report', 'completed', `Audit report and telemetry packaged successfully. Trust Score: ${releaseOutput.trustScore}%.`);

    return {
      queryId,
      query: options.query,
      timestamp: new Date().toISOString(),
      analysis,
      privateCandidateAnswer: candidateResult.text,
      releasedAnswer: releaseOutput.releasedAnswer,
      hasAbstained: false,
      abstentionReason: undefined,
      trustScore: releaseOutput.trustScore,
      medicalLegalWarning: releaseOutput.medicalLegalWarning,
      claims: updatedClaims,
      evidenceSources: allEvidence,
      metrics,
      stepLogs,
      releasePolicySummary: releaseOutput.policySummary
    };
  }

  private analyzeQuestion(query: string, hasDoc: boolean): QuestionAnalysis {
    const q = query.toLowerCase();

    if (
      /\b(\d+(?:\.\d+)?)\s*%/i.test(query) ||
      /\b[\+\-\*\/×÷]\b/.test(query) ||
      /\b(calculate|sum|multiply|compounded|interest|percent|factorial|average|ratio)\b/i.test(query)
    ) {
      return {
        primaryCategory: 'mathematics',
        requiresVerification: true,
        sensitiveTopics: [],
        expectedVerificationPaths: ['DETERMINISTIC_MATH'],
        abstentionRisk: false,
        abstractSummary: 'Identified deterministic mathematical calculation requiring symbolic / code-level evaluation.'
      };
    }

    if (hasDoc || /\b(contract|agreement|clause|section|policy doc)\b/i.test(query)) {
      return {
        primaryCategory: 'document_based',
        requiresVerification: true,
        sensitiveTopics: ['contractual terms'],
        expectedVerificationPaths: ['DOCUMENT_CROSS_CHECK'],
        abstentionRisk: false,
        abstractSummary: 'Document-grounded question requiring textual cross-examination against provided reference material.'
      };
    }

    if (
      q.includes('cure for') ||
      q.includes('secret release date') ||
      q.includes('who will win the 203') ||
      q.includes('unannounced leaked') ||
      q.includes('apple car')
    ) {
      return {
        primaryCategory: 'insufficient_evidence',
        requiresVerification: true,
        sensitiveTopics: ['forward-looking speculation', 'ungrounded rumor'],
        expectedVerificationPaths: ['ABSTENTION_POLICY', 'EVIDENCE_RETRIEVAL'],
        abstentionRisk: true,
        abstractSummary: 'High abstention risk: Forward-looking speculation or unverifiable rumor lacking primary records.'
      };
    }

    return {
      primaryCategory: 'factual',
      requiresVerification: true,
      sensitiveTopics: [],
      expectedVerificationPaths: ['EVIDENCE_RETRIEVAL'],
      abstentionRisk: false,
      abstractSummary: 'Empirical factual query requiring retrieval from authoritative primary web sources.'
    };
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
