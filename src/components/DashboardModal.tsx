import React, { useState } from 'react';
import { X, BarChart3, CheckSquare, Layers, Cuboid as Cube } from 'lucide-react';
import { BenchmarkModal } from './BenchmarkModal';
import { TestsModal } from './TestsModal';
import { ArchitectureModal } from './ArchitectureModal';
import { Interactive3DStageVisualizer } from './Interactive3DStageVisualizer';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'tests' | 'architecture' | 'visualizer'>('benchmarks');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0F1418] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F12]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#76B900]/15 border border-[#76B900]/30 flex items-center justify-center text-[#76B900]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Engineering Dashboard & Benchmarks</h2>
              <p className="text-xs text-slate-400">Deterministic verification telemetry, evaluations, and architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0C1014] px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'border-[#76B900] text-[#76B900]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Benchmark Suite (100% Accuracy)</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'tests'
                ? 'border-[#76B900] text-[#76B900]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Unit Tests (8/8 Passed)</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-[#76B900] text-[#76B900]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'visualizer'
                ? 'border-[#76B900] text-[#76B900]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cube className="w-3.5 h-3.5" />
            <span>3D Stage Visualizer</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0B0F12]">
          {activeTab === 'benchmarks' && (
            <div className="relative">
              {/* Render embedded Benchmark Content */}
              <BenchmarkModal isOpen={true} onClose={() => {}} />
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="relative">
              <TestsModal isOpen={true} onClose={() => {}} />
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="relative">
              <ArchitectureModal isOpen={true} onClose={() => {}} />
            </div>
          )}

          {activeTab === 'visualizer' && (
            <div className="relative">
              <Interactive3DStageVisualizer
                isOpen={true}
                onClose={() => {}}
                activeStage="RELEASE_GATE"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
