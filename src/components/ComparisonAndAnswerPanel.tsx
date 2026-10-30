import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  SplitSquareVertical,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Calculator,
  FileText,
  Award
} from 'lucide-react';
import { VerificationResult, Claim, EvidenceSource } from '../types/pipeline';

interface ComparisonAndAnswerPanelProps {
  result: VerificationResult | null;
  onSelectEvidence: (evidenceId: string) => void;
  onSelectClaim: (claim: Claim) => void;
}

export const ComparisonAndAnswerPanel: React.FC<ComparisonAndAnswerPanelProps> = ({
  result,
  onSelectEvidence,
  onSelectClaim
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'released_only' | 'draft_only'>('split');
  const [revealPrivateDraft, setRevealPrivateDraft] = useState(true);
  const [isVerificationExpanded, setIsVerificationExpanded] = useState(true);

  if (!result) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-600 stroke-[1.5]" />
        <h4 className="text-sm font-semibold text-slate-400">No Query Executed Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Select a validation prompt above or enter a custom query to observe real-time verification, selective uncertainty qualification, and full released answers.
        </p>
      </div>
    );
  }

  const {
    releasedAnswer,
    privateCandidateAnswer,
    claims,
    evidenceSources,
    metrics,
    trustScore = metrics.trustScore ?? 100,
    medicalLegalWarning
  } = result;

  // Render the final answer in natural language with small styled inline badges
  const renderFormattedAnswer = (rawText: string) => {
    // Split into lines/paragraphs while maintaining clean assistant layout
    const lines = rawText.split('\n');

    return (
      <div className="space-y-3 text-slate-100 text-sm sm:text-base leading-relaxed">
        {lines.map((line, lineIdx) => {
          if (!line.trim()) return null;

          // If line is header like "### Verified Evidence Sources", stop here (we show sources in the collapsible section)
          if (line.startsWith('### Verified Evidence Sources')) return null;
          if (line.startsWith('[^') && line.includes(']: [')) return null;
          if (line.startsWith('> ⚠️ **Professional Advisory:**')) {
            return (
              <div key={lineIdx} className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2 mt-3">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{line.replace('> ⚠️ **Professional Advisory:**', '').replace(/\*/g, '').trim()}</span>
              </div>
            );
          }

          // Replace inline marker tags with stylized pills
          const parts = line.split(/(\[✅ Verified\]|\[🟢 Likely Correct\]|\[🟡 Uncertain: I'm not fully sure about this part\]|\[🔄 Corrected\])/g);

          return (
            <p key={lineIdx} className="leading-relaxed">
              {parts.map((part, partIdx) => {
                if (part === '[✅ Verified]') {
                  return (
                    <span
                      key={partIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full mx-1 align-baseline select-none"
                      title="Confirmed by code execution, web source, uploaded file, or cross-check"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Verified</span>
                    </span>
                  );
                }
                if (part === '[🟢 Likely Correct]') {
                  return (
                    <span
                      key={partIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full mx-1 align-baseline select-none"
                      title="Matches well-established general consensus and knowledge"
                    >
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span>Likely Correct</span>
                    </span>
                  );
                }
                if (part === '[🟡 Uncertain: I\'m not fully sure about this part]') {
                  return (
                    <span
                      key={partIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full mx-1 align-baseline select-none"
                      title="Unconfirmed or forward-looking claim retained with qualification"
                    >
                      <HelpCircle className="w-3 h-3 text-amber-400" />
                      <span>Uncertain: I'm not fully sure about this part</span>
                    </span>
                  );
                }
                if (part === '[🔄 Corrected]') {
                  return (
                    <span
                      key={partIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full mx-1 align-baseline select-none"
                      title="Original baseline error intercepted and fixed using verified evidence"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>Corrected</span>
                    </span>
                  );
                }

                // Render regular text and format footnote links if any
                return <span key={partIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const getClaimStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'VERIFIED':
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED
          </span>
        );
      case 'LIKELY_CORRECT':
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> LIKELY CORRECT
          </span>
        );
      case 'UNCERTAIN':
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <HelpCircle className="w-3 h-3" /> UNCERTAIN
          </span>
        );
      case 'CORRECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            <RefreshCw className="w-3 h-3" /> CORRECTED
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> CONTRADICTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Header & Live Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Display View:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side (Before vs After)
            </button>
            <button
              onClick={() => setViewMode('released_only')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'released_only' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Final Answer Only
            </button>
            <button
              onClick={() => setViewMode('draft_only')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'draft_only' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Candidate Draft
            </button>
          </div>
        </div>

        {/* Live Timer and Trust Badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gen: {metrics.generationLatencyMs}ms · Verify: {metrics.verificationLatencyMs}ms</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs font-mono">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trust Score: {trustScore}%</span>
          </div>
        </div>
      </div>

      {/* Main Panels Grid (Before vs After) */}
      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Panel 1: Private Raw Candidate (Before) */}
        {(viewMode === 'split' || viewMode === 'draft_only') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      Before: Private Candidate Draft
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Raw model output (Draft retained in private buffer before verification)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRevealPrivateDraft(!revealPrivateDraft)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800"
                >
                  {revealPrivateDraft ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{revealPrivateDraft ? 'Conceal' : 'Inspect'}</span>
                </button>
              </div>

              {revealPrivateDraft ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm font-sans text-slate-300 leading-relaxed whitespace-pre-line">
                    {privateCandidateAnswer}
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <p>
                      <strong>Standard Chatbot Risk:</strong> Without an independent verification gate, raw candidate drafts are output directly to users, risking calculation slips, hallucinated hardware, or outdated details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <EyeOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">Draft hidden in compliance with the private generation protocol.</p>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Model: {metrics.modelUsed || 'NVIDIA Nemotron-70B'}</span>
              <span className="font-mono text-amber-400">Intercepted Draft</span>
            </div>
          </div>
        )}

        {/* Panel 2: Authorized Released Answer (After) */}
        {(viewMode === 'split' || viewMode === 'released_only') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      After: Authorized Released Output
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Evidence-gated natural answer with atomic inline badges
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Full Answer Released
                  </span>
                </div>
              </div>

              {/* Top: Final Answer in Natural Language */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/90 shadow-inner">
                {renderFormattedAnswer(releasedAnswer)}
              </div>

              {/* Below: Collapsible "How I verified this" Section */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <button
                  onClick={() => setIsVerificationExpanded(!isVerificationExpanded)}
                  className="w-full px-4 py-3 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      How I verified this
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-1">
                      {trustScore}% Trust Score
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{isVerificationExpanded ? 'Collapse' : 'Expand'}</span>
                    {isVerificationExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isVerificationExpanded && (
                  <div className="p-4 space-y-4 border-t border-slate-800 text-xs">
                    {/* Trust Score Progress Bar & Metric Counters */}
                    <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          Verification Trust Score:
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {trustScore}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${trustScore}%` }}
                        />
                      </div>

                      {/* Stat Counters */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                          <span className="text-emerald-400 font-bold block text-sm">
                            {metrics.verifiedClaims || metrics.supportedClaims || 0}
                          </span>
                          <span className="text-slate-400">Verified</span>
                        </div>
                        <div className="p-2 rounded-lg bg-teal-950/20 border border-teal-500/30">
                          <span className="text-teal-300 font-bold block text-sm">
                            {metrics.likelyCorrectClaims || metrics.partiallySupportedClaims || 0}
                          </span>
                          <span className="text-slate-400">Likely Correct</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30">
                          <span className="text-amber-400 font-bold block text-sm">
                            {metrics.uncertainClaims || metrics.unverifiedClaims || 0}
                          </span>
                          <span className="text-slate-400">Flagged Uncertain</span>
                        </div>
                        <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                          <span className="text-cyan-400 font-bold block text-sm">
                            {metrics.correctedClaims || 0}
                          </span>
                          <span className="text-slate-400">Corrected</span>
                        </div>
                      </div>
                    </div>

                    {/* Claims Table */}
                    <div className="space-y-2">
                      <span className="font-semibold text-slate-300 block">
                        Atomic Claims Breakdown ({claims.length} claims):
                      </span>
                      <div className="overflow-x-auto rounded-lg border border-slate-800">
                        <table className="w-full text-left text-[11px] divide-y divide-slate-800">
                          <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono">
                            <tr>
                              <th className="px-3 py-2">Status</th>
                              <th className="px-3 py-2">Claim Assertion</th>
                              <th className="px-3 py-2">Method</th>
                              <th className="px-3 py-2">Proof / Explanation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 bg-slate-950/50">
                            {claims.map((claim) => (
                              <tr
                                key={claim.id}
                                onClick={() => onSelectClaim(claim)}
                                className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                              >
                                <td className="px-3 py-2 whitespace-nowrap">
                                  {getClaimStatusBadge(claim.status)}
                                </td>
                                <td className="px-3 py-2 text-slate-200 max-w-xs sm:max-w-sm">
                                  <div className="font-medium">{claim.text}</div>
                                  {claim.corrections.length > 0 && (
                                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5 line-through opacity-70">
                                      Draft: {claim.corrections[0].originalText}
                                    </div>
                                  )}
                                  {claim.qualificationNote && claim.status === 'UNCERTAIN' && (
                                    <div className="text-[10px] text-amber-300 font-sans mt-0.5 italic">
                                      {claim.qualificationNote}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                                  {claim.verificationMethod}
                                </td>
                                <td className="px-3 py-2 text-slate-300 text-[11px]">
                                  {claim.explanation}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sources List */}
                    {evidenceSources.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-850">
                        <span className="font-semibold text-slate-300 block">
                          Verified Sources & Knowledge Records ({evidenceSources.length}):
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {evidenceSources.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]"
                            >
                              <div className="space-y-0.5">
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                  <span>{ev.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <p className="text-slate-400 text-[10px] line-clamp-1 italic">
                                  "{ev.snippet}"
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                                  {ev.domain}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  {ev.authority.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-3 mt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Verification Latency: {metrics.verificationLatencyMs}ms</span>
              <span className="text-emerald-400 font-medium">Policy Release: Authorized (Full Answer)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
