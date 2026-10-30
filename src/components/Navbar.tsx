import React from 'react';
import {
  ShieldCheck,
  Cpu,
  BarChart3,
  Terminal,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenBenchmark: () => void;
  onOpenArchitecture?: () => void;
  onOpenTests: () => void;
  onOpen3DVisualizer: () => void;
  providerStatus: {
    hasLiveKey: boolean;
    activeModel: string;
    providerType: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBenchmark,
  onOpenTests,
  onOpen3DVisualizer,
  providerStatus
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                VerifyFirst<span className="text-emerald-400">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Evidence-Gated Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              NVIDIA Nemotron Architecture · Autonomous 3D Verification Gate
            </p>
          </div>
        </div>

        {/* Center / Model Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Model:</span>
          <span className="font-mono text-slate-200">
            NVIDIA Nemotron-70B
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            3D WebGL Active
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpen3DVisualizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer"
            title="Open Interactive 3D Verification Matrix"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">3D Matrix</span>
          </button>

          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="Benchmark evaluation vs Baseline"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Benchmark</span>
          </button>

          <button
            onClick={onOpenTests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="Run backend automated tests"
          >
            <Terminal className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Unit Tests</span>
          </button>
        </div>
      </div>
    </header>
  );
};
