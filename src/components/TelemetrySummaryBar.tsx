import React from 'react';
import {
  Clock,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
  AlertOctagon,
  Zap
} from 'lucide-react';
import { PipelineMetrics } from '../types/pipeline';

interface TelemetrySummaryBarProps {
  metrics: PipelineMetrics | null;
}

export const TelemetrySummaryBar: React.FC<TelemetrySummaryBarProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Pipeline Telemetry & Verification Gate Metrics
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>{metrics.modelUsed.split('/').pop()}</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">Local Sandbox (Zero Keys Required)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Claims */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Claims Evaluated</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.totalClaims}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Atomic assertions</div>
        </div>

        {/* Verified Claims */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.verifiedClaims ?? metrics.supportedClaims ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Code & evidence proven</div>
        </div>

        {/* Errors Caught & Corrected */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Errors Corrected</span>
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {metrics.correctedClaims}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Discrepancies fixed</div>
        </div>

        {/* Flagged Uncertain */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Flagged Uncertain</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {metrics.uncertainClaims ?? metrics.unverifiedClaims ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Qualified in output</div>
        </div>

        {/* Total Latency */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Latency</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-200">
            {metrics.totalDurationMs}ms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Gen: {metrics.generationLatencyMs}ms · Verif: {metrics.verificationLatencyMs}ms
          </div>
        </div>

        {/* Tokens & Cost */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Est. Tokens</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {metrics.estimatedTokens}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Nebius Token Factory</div>
        </div>
      </div>
    </div>
  );
};
