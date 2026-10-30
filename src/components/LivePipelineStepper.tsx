import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Search,
  Cpu,
  Layers,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { PipelineStepLog } from '../types/pipeline';

interface LivePipelineStepperProps {
  stepLogs: PipelineStepLog[];
  isLoading: boolean;
}

const STAGE_CONFIG: {
  step: PipelineStepLog['step'];
  label: string;
  shortDesc: string;
  icon: any;
}[] = [
  { step: 'ANALYSIS', label: '1. Analyzer', shortDesc: 'Classify & Route', icon: Search },
  { step: 'CANDIDATE_GENERATION', label: '2. Private Draft', shortDesc: 'NVIDIA Nemotron', icon: Cpu },
  { step: 'CLAIM_DECOMPOSITION', label: '3. Decomposer', shortDesc: 'Atomic Claims', icon: Layers },
  { step: 'EVIDENCE_RETRIEVAL', label: '4. Evidence', shortDesc: 'Tavily & Primary', icon: FileText },
  { step: 'INDEPENDENT_VERIFICATION', label: '5. Verifier', shortDesc: 'Deterministic & Cross-Exam', icon: ShieldCheck },
  { step: 'CORRECTION', label: '6. Correction', shortDesc: 'Bounded Revision', icon: RefreshCw },
  { step: 'RELEASE_GATE', label: '7. Release Gate', shortDesc: 'Policy Authorized', icon: FileCheck2 },
  { step: 'REPORT_GENERATION', label: '8. Report', shortDesc: 'Telemetry & Proof', icon: CheckCircle2 }
];

export const LivePipelineStepper: React.FC<LivePipelineStepperProps> = ({
  stepLogs,
  isLoading
}) => {
  const [expandedLog, setExpandedLog] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            End-to-End Verification Pipeline Lifecycle
          </h3>
        </div>
        <button
          onClick={() => setExpandedLog(!expandedLog)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <span>{expandedLog ? 'Collapse Logs' : 'View Execution Logs'}</span>
          {expandedLog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {STAGE_CONFIG.map((stage, idx) => {
          const log = stepLogs.find(l => l.step === stage.step);
          const isCompleted = log && log.status === 'completed';
          const isInProgress = isLoading && (!log || log.status === 'in_progress');
          const isPending = !log;
          const IconComponent = stage.icon;

          return (
            <div
              key={stage.step}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : isInProgress
                  ? 'bg-blue-950/20 border-blue-500/40 text-blue-300 animate-pulse'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isInProgress
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[11px] font-semibold truncate leading-tight">
                {stage.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {stage.shortDesc}
              </div>
              {log && (
                <div className="text-[9px] font-mono mt-1 text-slate-400">
                  {log.durationMs}ms
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expandable Step Log Details */}
      {expandedLog && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
          {stepLogs.length === 0 ? (
            <p className="text-slate-500 italic">No execution logs recorded yet. Execute a query above.</p>
          ) : (
            stepLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60"
              >
                <span className="text-[10px] text-slate-500 shrink-0 w-12 pt-0.5">
                  +{log.durationMs}ms
                </span>
                <span
                  className={`text-[10px] uppercase font-bold shrink-0 ${
                    log.status === 'completed'
                      ? 'text-emerald-400'
                      : log.status === 'in_progress'
                      ? 'text-blue-400'
                      : 'text-amber-400'
                  }`}
                >
                  [{log.step}]
                </span>
                <div className="flex-1">
                  <p className="text-slate-200">{log.message}</p>
                  {log.dataSnippet && (
                    <p className="text-[11px] text-slate-400 mt-0.5 bg-slate-900/80 p-1 rounded">
                      {log.dataSnippet}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
