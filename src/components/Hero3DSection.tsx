import React from 'react';
import { ThreeVerificationGate } from './ThreeVerificationGate';
import {
  ShieldCheck,
  Sparkles,
  Maximize2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Hero3DSectionProps {
  isLoading: boolean;
  hasResult: boolean;
  hasAbstained: boolean;
  onOpen3DVisualizer: () => void;
}

export const Hero3DSection: React.FC<Hero3DSectionProps> = ({
  isLoading,
  hasResult,
  hasAbstained,
  onOpen3DVisualizer
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl p-6 sm:p-8">
      {/* Background Subtle Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Column: Text & 3D Interactive Callout */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>3D Evidence-Gated Autonomous Architecture</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Generate Privately. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Verify Independently.
            </span> <br />
            Release What Evidence Proves.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            A zero-hallucination agentic framework powered by <strong className="text-emerald-400">NVIDIA Nemotron</strong> and deterministic software. Raw candidate drafts are sealed behind the 3D release gate until calculations are proven and claims cross-checked against primary sources.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpen3DVisualizer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs border border-slate-700 hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-500/5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Explore 3D Matrix Visualizer</span>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/80">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>NVIDIA Nemotron-70B</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Zero Keys Required</span>
            </div>
          </div>
        </div>

        {/* Right Column: Embedded Real-Time 3D Canvas */}
        <div className="lg:col-span-5 h-64 sm:h-72 w-full relative rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/80 shadow-inner group">
          <ThreeVerificationGate
            isLoading={isLoading}
            hasResult={hasResult}
            hasAbstained={hasAbstained}
          />

          {/* Overlay Status Badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>Gate: {isLoading ? 'Verifying...' : hasResult ? 'Verified & Open' : 'Ready'}</span>
            </span>
            <span className="text-slate-500 text-[10px]">Real-time WebGL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
