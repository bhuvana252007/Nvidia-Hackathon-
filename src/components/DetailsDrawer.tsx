import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RotateCw,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Calculator,
  Search,
  BookOpen
} from 'lucide-react';
import { VerificationResult, Claim } from '../types/pipeline';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
  onRegenerate?: (query: string) => void;
}

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  isOpen,
  onClose,
  result,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'diff' | 'sources' | 'formula'>('claims');

  if (!isOpen || !result) return null;

  const handleCopy = () => {
    // Strip HTML tags for clipboard
    const cleanText = result.releasedAnswer.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'VERIFIED':
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'CORRECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <RotateCw className="w-3 h-3" />
            <span>Corrected</span>
          </span>
        );
      case 'LIKELY_CORRECT':
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" />
            <span>Likely Correct</span>
          </span>
        );
      case 'UNCERTAIN':
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Uncertain</span>
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>Contradicted</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
            <span>{status}</span>
          </span>
        );
    }
  };

  const getMethodIcon = (method: Claim['verificationMethod']) => {
    switch (method) {
      case 'DETERMINISTIC_MATH':
      case 'DETERMINISTIC_CODE':
        return <Calculator className="w-3 h-3 text-[#76B900]" />;
      case 'EVIDENCE_RETRIEVAL':
        return <Search className="w-3 h-3 text-cyan-400" />;
      case 'DOCUMENT_CROSS_CHECK':
        return <BookOpen className="w-3 h-3 text-purple-400" />;
      default:
        return <Cpu className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#0F1418] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* TOP DRAWER HEADER */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0B0F12]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#76B900]/15 border border-[#76B900]/30 flex items-center justify-center text-[#76B900]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Verification Details</h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {result.queryId} · {result.metrics.modelUsed}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Action Buttons: Copy, Regenerate, Export PDF, Close */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Copy answer"
              >
                {copied ? <Check className="w-4 h-4 text-[#76B900]" /> : <Copy className="w-4 h-4" />}
              </button>

              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(result.query)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                  title="Regenerate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleExportPDF}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Export PDF / Print Report"
              >
                <FileDown className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-1"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TRUST SCORE SUMMARY HERO */}
          <div className="p-4 bg-gradient-to-b from-[#141A1F] to-[#0F1418] border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Trust Score
                </div>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl font-bold font-mono text-slate-100">
                    {result.trustScore}%
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      result.trustScore >= 80
                        ? 'bg-[#76B900]/20 text-[#76B900]'
                        : result.trustScore >= 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {result.trustScoreLabel || (result.trustScore >= 80 ? 'Highly reliable' : 'Mostly reliable')}
                  </span>
                </div>
              </div>

              {/* Claims Counts Mini-Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="font-mono font-semibold text-[#76B900]">
                    {result.releasePolicySummary.verifiedCount + result.releasePolicySummary.correctedCount}
                  </div>
                  <div className="text-[10px] text-slate-400">Verified</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="font-mono font-semibold text-emerald-400">
                    {result.releasePolicySummary.likelyCorrectCount}
                  </div>
                  <div className="text-[10px] text-slate-400">Likely</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="font-mono font-semibold text-yellow-400">
                    {result.releasePolicySummary.uncertainCount}
                  </div>
                  <div className="text-[10px] text-slate-400">Uncertain</div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex border-b border-slate-800/80 bg-[#0C1014] px-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('claims')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'claims'
                  ? 'border-[#76B900] text-[#76B900]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Claims ({result.claims.length})
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'diff'
                  ? 'border-[#76B900] text-[#76B900]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              What Changed
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'sources'
                  ? 'border-[#76B900] text-[#76B900]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sources ({result.evidenceSources.length})
            </button>
            <button
              onClick={() => setActiveTab('formula')}
              className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'formula'
                  ? 'border-[#76B900] text-[#76B900]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Formula
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: CLAIMS & DETERMINISTIC ENGINES */}
            {activeTab === 'claims' && (
              <div className="space-y-3">
                {/* Math Solver Card if available */}
                {result.mathVerification && (
                  <div className="p-3.5 rounded-xl bg-[#76B900]/10 border border-[#76B900]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#76B900]">
                      <div className="flex items-center space-x-1.5">
                        <Calculator className="w-4 h-4" />
                        <span>Deterministic Math Check</span>
                      </div>
                      <span className="font-mono text-[11px] bg-[#76B900]/20 px-2 py-0.5 rounded">
                        {result.mathVerification.isCorrect ? 'PASS' : 'FLAGGED'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-mono">
                      {result.mathVerification.expression} =&gt; {result.mathVerification.expectedResult}
                    </div>
                    {result.mathVerification.stepDetails && (
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4 font-mono">
                        {result.mathVerification.stepDetails.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Code Sandbox Card if available */}
                {result.codeExecution && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                      <div className="flex items-center space-x-1.5">
                        <Cpu className="w-4 h-4" />
                        <span>Sandbox Code Execution ({result.codeExecution.language.toUpperCase()})</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {result.codeExecution.executionTimeMs}ms
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300 bg-black/40 p-2 rounded max-h-32 overflow-y-auto">
                      {result.codeExecution.stdout || '(No output returned)'}
                    </pre>
                  </div>
                )}

                {/* PDF Document Citation Card if available */}
                {result.pdfCitations && (
                  <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-1 text-xs">
                    <div className="font-semibold text-purple-400 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>PDF Document Ingested ({result.pdfCitations.fileName})</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Verified across {result.pdfCitations.totalPages} pages. Key assertions cited from Pages {result.pdfCitations.citedPages.join(', ')}.
                    </p>
                  </div>
                )}
                {result.claims.map((claim, idx) => (
                  <div
                    key={claim.id || idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] text-slate-500">#{idx + 1}</span>
                        {getStatusBadge(claim.status)}
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                        {getMethodIcon(claim.verificationMethod)}
                        <span>{claim.verificationMethod.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="text-sm text-slate-200 leading-snug font-medium">
                      {claim.text}
                    </div>

                    {claim.explanation && (
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/50">
                        {claim.explanation}
                      </div>
                    )}

                    {claim.qualificationNote && (
                      <div className="text-xs text-yellow-400/90 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">
                        Note: {claim.qualificationNote}
                      </div>
                    )}

                    {claim.deterministicLog && (
                      <div className="font-mono text-[11px] bg-black/40 border border-slate-800 px-2 py-1 rounded text-[#76B900]">
                        {claim.deterministicLog}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: WHAT CHANGED (Before vs After) */}
            {activeTab === 'diff' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-300">
                    <span>1. Private Candidate Draft (Raw LLM)</span>
                    <span className="text-[10px] font-mono text-slate-500">Unverified Draft</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-lg text-slate-400 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {result.privateCandidateAnswer}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 border border-[#76B900]/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between font-semibold text-[#76B900]">
                    <span>2. Released Verified Answer</span>
                    <span className="text-[10px] font-mono text-[#76B900]">Evidence-Gated</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-lg text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {result.releasedAnswer.replace(/<[^>]*>/g, '')}
                  </div>
                </div>

                {result.releasePolicySummary.correctedCount > 0 ? (
                  <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl space-y-1.5">
                    <div className="font-semibold text-cyan-400">Corrections Applied:</div>
                    <p className="text-slate-300 leading-relaxed">
                      Detected {result.releasePolicySummary.correctedCount} discrepancies in the raw draft.
                      The Correction Agent recalculated or realigned assertions using primary evidence before release.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1.5">
                    <div className="font-semibold text-emerald-400">No Factual Discrepancies:</div>
                    <p className="text-slate-300 leading-relaxed">
                      The candidate draft aligned with verified calculations and retrieved sources.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SOURCES */}
            {activeTab === 'sources' && (
              <div className="space-y-3">
                {result.evidenceSources.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No external sources required (verified deterministically or via code)
                  </div>
                ) : (
                  result.evidenceSources.map(source => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-[#76B900] transition-colors flex items-center space-x-1">
                          <span className="truncate max-w-[260px]">{source.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 ml-1 opacity-60 group-hover:opacity-100" />
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {source.authority.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{source.domain}</div>
                      <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {source.snippet}
                      </div>
                    </a>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: HOW TRUST SCORE IS CALCULATED */}
            {activeTab === 'formula' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-200">Trust Score Weighting Formula</div>
                  <div className="p-2.5 bg-black/40 rounded-lg font-mono text-[11px] text-[#76B900]">
                    Score = (Verified × 100% + Corrected × 100% + Likely × 70% + Uncertain × 30% + Contradicted × 0%) / Total Claims
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Every atomic assertion is weighted according to its verification certainty:
                  </p>
                  <ul className="space-y-1 text-slate-300 text-[11px] list-disc pl-4">
                    <li><strong className="text-[#76B900]">Verified by Source/Code</strong>: 100% weight</li>
                    <li><strong className="text-cyan-400">Corrected & Verified</strong>: 100% weight (after automated fix)</li>
                    <li><strong className="text-emerald-400">Likely Correct (General Knowledge)</strong>: 70% weight</li>
                    <li><strong className="text-yellow-400">Uncertain (Could not confirm)</strong>: 30% weight</li>
                    <li><strong className="text-rose-400">Contradicted & Uncorrected</strong>: 0% weight</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-200">Confidence Thresholds</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-[#76B900]/10 border border-[#76B900]/20 text-[#76B900]">
                      <span className="font-semibold">80% – 100%</span>
                      <span>Highly reliable</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                      <span className="font-semibold">50% – 79%</span>
                      <span>Mostly reliable</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <span className="font-semibold">Below 50%</span>
                      <span>Check this yourself</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
