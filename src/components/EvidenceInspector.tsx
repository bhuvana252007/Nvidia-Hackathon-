import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText,
  Calculator,
  ChevronRight,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { Claim, EvidenceSource, SourceAuthority } from '../types/pipeline';

interface EvidenceInspectorProps {
  claims: Claim[];
  evidenceSources: EvidenceSource[];
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  claims,
  evidenceSources
}) => {
  const [filter, setFilter] = useState<'all' | 'verified' | 'likely_correct' | 'uncertain' | 'corrected'>('all');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);

  const filteredClaims = claims.filter(c => {
    if (filter === 'verified') return c.status === 'VERIFIED' || c.status === 'SUPPORTED';
    if (filter === 'likely_correct') return c.status === 'LIKELY_CORRECT' || c.status === 'PARTIALLY_SUPPORTED';
    if (filter === 'uncertain') return c.status === 'UNCERTAIN' || c.status === 'UNVERIFIED';
    if (filter === 'corrected') return c.status === 'CORRECTED';
    return true;
  });

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'VERIFIED':
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        );
      case 'LIKELY_CORRECT':
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Likely Correct
          </span>
        );
      case 'UNCERTAIN':
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <HelpCircle className="w-3 h-3" /> Flagged Uncertain
          </span>
        );
      case 'CORRECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            <RefreshCw className="w-3 h-3" /> Caught & Corrected
          </span>
        );
      case 'CONTRADICTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Contradicted
          </span>
        );
    }
  };

  const getAuthorityBadge = (authority: SourceAuthority) => {
    switch (authority) {
      case 'PRIMARY_OFFICIAL':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Primary Official
          </span>
        );
      case 'ACADEMIC_PEER':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
            Peer-Reviewed Academic
          </span>
        );
      case 'DOCUMENTATION':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
            Technical Documentation
          </span>
        );
      case 'WIKIPEDIA':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            Wikipedia / Encyclopedia
          </span>
        );
      case 'CODE_CALCULATION':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Code Calculation
          </span>
        );
      case 'REPUTABLE_NEWS':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
            Reputable News Wire
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            General Web
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Independent Evidence Inspector & Audit Trail
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Atomic verification breakdown, deterministic calculation logs, contradiction diffs, and provenance.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({claims.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'verified' ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilter('likely_correct')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'likely_correct' ? 'bg-slate-800 text-teal-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Likely Correct
          </button>
          <button
            onClick={() => setFilter('uncertain')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'uncertain' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Uncertain
          </button>
          <button
            onClick={() => setFilter('corrected')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'corrected' ? 'bg-slate-800 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Corrected
          </button>
        </div>
      </div>

      {/* Main Grid: Left Claim List, Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Claims List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredClaims.map(claim => {
            const isSelected = selectedClaim?.id === claim.id;
            return (
              <div
                key={claim.id}
                onClick={() => setSelectedClaimId(claim.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {claim.id}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {claim.category}
                    </span>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
                  {claim.text}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850 text-[10px] text-slate-400">
                  <span>Method: {claim.verificationMethod}</span>
                  <span className="text-emerald-400 font-medium">Click to inspect →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Claim Inspector & Evidence Sources (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          {selectedClaim ? (
            <>
              {/* Header Info */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {selectedClaim.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Category: <span className="text-slate-200">{selectedClaim.category}</span>
                    </span>
                  </div>
                  {getStatusBadge(selectedClaim.status)}
                </div>
                <p className="text-sm text-slate-100 font-medium leading-relaxed mt-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  "{selectedClaim.text}"
                </p>
              </div>

              {/* Correction History Diff (If corrected) */}
              {selectedClaim.corrections.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Correction History (Caught before reaching user):</span>
                  </div>
                  {selectedClaim.corrections.map((corr, idx) => (
                    <div key={idx} className="text-xs space-y-1 font-mono">
                      <div className="text-rose-400 line-through bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                        - Original Draft: {corr.originalText}
                      </div>
                      <div className="text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-900/40">
                        + Evidence Verified: {corr.correctedText}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-1">
                        <strong>Reason:</strong> {corr.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Deterministic Calculation Log (If mathematical) */}
              {selectedClaim.deterministicLog && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deterministic Code Execution Audit:</span>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {selectedClaim.deterministicLog}
                  </pre>
                </div>
              )}

              {/* Explanation & Policy Verdict */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block">
                  Verifier Explanation & Reasoning:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                  {selectedClaim.explanation}
                </p>
              </div>

              {/* Linked Supporting Sources */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Linked Evidence Sources ({selectedClaim.supportingEvidenceIds.length}):
                </span>
                {selectedClaim.supportingEvidenceIds.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900/50 p-2.5 rounded-lg">
                    No external sources directly substantiated this assertion (evaluated via deterministic policy).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedClaim.supportingEvidenceIds.map(eid => {
                      const ev = evidenceSources.find(e => e.id === eid);
                      if (!ev) return null;
                      return (
                        <div
                          key={ev.id}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={ev.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-emerald-400 hover:underline flex items-center gap-1 truncate"
                            >
                              <span>{ev.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                            {getAuthorityBadge(ev.authority)}
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-950/60 p-2 rounded border border-slate-850">
                            "{ev.snippet}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>Domain: {ev.domain}</span>
                            <span>Retrieved: {ev.retrievedAt.split('T')[0]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">Select a claim to view its audit record.</p>
          )}
        </div>
      </div>
    </div>
  );
};
