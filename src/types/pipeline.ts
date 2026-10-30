/**
 * VerifyFirst AI - Core Type Definitions
 * Evidence-Gated Agent Pipeline Specification
 */

export type ClaimCategory =
  | 'MATHEMATICAL'
  | 'FACTUAL'
  | 'CITATION_REFERENCE'
  | 'CODE_LOGIC'
  | 'SPECULATIVE_PREDICTION'
  | 'DOCUMENT_BASED';

export type VerificationMethod =
  | 'DETERMINISTIC_MATH'
  | 'EVIDENCE_RETRIEVAL'
  | 'DETERMINISTIC_CODE'
  | 'DOCUMENT_CROSS_CHECK'
  | 'INDEPENDENT_MODEL_CHECK'
  | 'GENERAL_KNOWLEDGE'
  | 'ABSTENTION_POLICY';

export type ClaimStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'LIKELY_CORRECT'
  | 'UNCERTAIN'
  | 'CONTRADICTED'
  | 'CORRECTED'
  // Backward compatibility aliases:
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'UNVERIFIED';

export type ReleaseDecision = 'RELEASE' | 'QUALIFY' | 'ABSTAIN' | 'REPLACE';

export type SourceAuthority =
  | 'PRIMARY_OFFICIAL'    // NASA, Govt, Corporate SEC, standards bodies
  | 'ACADEMIC_PEER'       // arXiv, Nature, IEEE, PubMed
  | 'DOCUMENTATION'       // Official docs, Python.org, MDN, NVIDIA docs
  | 'REPUTABLE_NEWS'      // Reuters, AP, Bloomberg, BBC
  | 'WIKIPEDIA'           // Wikipedia & established encyclopedias
  | 'CODE_CALCULATION'    // Deterministic code execution engine
  | 'INDEPENDENT_MODEL'   // Independent model cross-check
  | 'GENERAL_WEB';        // Reputable general websites

export interface EvidenceSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  fullExcerpt?: string;
  publishedDate?: string;
  retrievedAt: string;
  authority: SourceAuthority;
  relevanceScore: number; // 0.0 to 1.0
}

export interface ClaimCorrection {
  originalText: string;
  correctedText: string;
  reason: string;
  evidenceId?: string;
  iteration: number;
}

export interface Claim {
  id: string;
  text: string;
  category: ClaimCategory;
  verificationMethod: VerificationMethod;
  importance: 'CRITICAL' | 'SUPPORTING' | 'INCIDENTAL';
  status: ClaimStatus;
  releaseDecision: ReleaseDecision;
  explanation: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  deterministicLog?: string;
  corrections: ClaimCorrection[];
  qualificationNote?: string;
}

export interface QuestionAnalysis {
  primaryCategory: 'mathematics' | 'factual' | 'coding' | 'document_based' | 'insufficient_evidence' | 'general_reasoning';
  requiresVerification: boolean;
  sensitiveTopics: string[];
  expectedVerificationPaths: VerificationMethod[];
  abstentionRisk: boolean;
  abstractSummary: string;
}

export interface PipelineStepLog {
  step: 'ANALYSIS' | 'CANDIDATE_GENERATION' | 'CLAIM_DECOMPOSITION' | 'EVIDENCE_RETRIEVAL' | 'INDEPENDENT_VERIFICATION' | 'CORRECTION' | 'RELEASE_GATE' | 'REPORT_GENERATION';
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  durationMs: number;
  message: string;
  timestamp: string;
  dataSnippet?: string;
}

export interface PipelineMetrics {
  totalClaims: number;
  verifiedClaims: number;
  likelyCorrectClaims: number;
  uncertainClaims: number;
  correctedClaims: number;
  contradictedClaims: number;
  trustScore: number; // 0-100 percentage
  // Backward compatibility aliases:
  supportedClaims: number;
  partiallySupportedClaims: number;
  unverifiedClaims: number;
  abstainedClaims: number;
  verificationAttempts: number;
  totalDurationMs: number;
  generationLatencyMs: number;
  verificationLatencyMs: number;
  estimatedTokens: number;
  modelUsed: string;
  provider: string;
}

export interface AttachedFile {
  name: string;
  type: string;
  size?: number;
  dataUrl?: string;
  textContent?: string;
}

export interface TrustScoreBreakdown {
  formula: string;
  verifiedWeight: number;
  likelyWeight: number;
  uncertainWeight: number;
  correctedWeight: number;
  totalClaims: number;
  rawScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedFile?: AttachedFile;
  verificationResult?: VerificationResult;
  isStreaming?: boolean;
  statusLine?: string;
  durationSeconds?: number;
  mode?: 'fast' | 'deep';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface VerificationResult {
  queryId: string;
  query: string;
  timestamp: string;
  analysis: QuestionAnalysis;
  privateCandidateAnswer: string;
  releasedAnswer: string;
  hasAbstained: boolean;
  abstentionReason?: string;
  trustScore: number;
  trustScoreLabel?: 'Highly reliable' | 'Mostly reliable' | 'Check this yourself';
  trustScoreBreakdown?: TrustScoreBreakdown;
  medicalLegalWarning?: string;
  claims: Claim[];
  evidenceSources: EvidenceSource[];
  metrics: PipelineMetrics;
  stepLogs: PipelineStepLog[];
  releasePolicySummary: {
    releasedCount: number;
    verifiedCount: number;
    likelyCorrectCount: number;
    uncertainCount: number;
    correctedCount: number;
    abstainedCount: number;
    unresolvedConflicts: string[];
  };
  codeExecution?: {
    language: 'python' | 'javascript';
    success: boolean;
    stdout: string;
    stderr?: string;
    executionTimeMs: number;
  };
  mathVerification?: {
    isMath: boolean;
    expression?: string;
    expectedResult?: string;
    isCorrect?: boolean;
    stepDetails?: string[];
    explanation?: string;
  };
  contradictionCorrection?: string;
  pdfCitations?: {
    fileName: string;
    totalPages: number;
    citedPages: number[];
  };
}

export interface BenchmarkTestCase {
  id: string;
  title: string;
  category: 'mathematics' | 'factual' | 'conflicting_sources' | 'outdated_info' | 'unknowable_speculation';
  query: string;
  userDocument?: string;
  expectedTrap: string;
  groundTruth: string;
  baselineLikelyFailure: string;
  verifyFirstTargetBehavior: string;
}

export interface BenchmarkRunResult {
  testCaseId: string;
  title: string;
  category: string;
  query: string;
  baseline: {
    answer: string;
    hasFactualError: boolean;
    hasMathError: boolean;
    hallucinatedCitation: boolean;
    failedToAbstain: boolean;
  };
  verifyFirst: {
    answer: string;
    errorsDetectedCount: number;
    errorsCorrectedCount: number;
    correctlyAbstained: boolean;
    claimsVerified: number;
    verificationStatus: 'PASSED' | 'CORRECTED' | 'ABSTAINED_APPROPRIATELY';
  };
  passed: boolean;
  latencyMs: number;
}
