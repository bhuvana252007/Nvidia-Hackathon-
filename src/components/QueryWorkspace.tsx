import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  Compass,
  FileText,
  AlertOctagon,
  Scale,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
  ShieldAlert
} from 'lucide-react';

interface Preset {
  id: string;
  title: string;
  badge: string;
  query: string;
  userDocument?: string;
  description: string;
  path: string;
}

interface QueryWorkspaceProps {
  presets: Preset[];
  onExecute: (query: string, userDocument?: string) => void;
  isLoading: boolean;
}

export const QueryWorkspace: React.FC<QueryWorkspaceProps> = ({
  presets,
  onExecute,
  isLoading
}) => {
  const [query, setQuery] = useState(
    'A store item costs $840 with a 15% discount. What is the discount amount and the final total price?'
  );
  const [userDocument, setUserDocument] = useState('');
  const [showDocInput, setShowDocInput] = useState(false);
  const [activePresetId, setActivePresetId] = useState('path-a-math');

  const handleSelectPreset = (preset: Preset) => {
    setActivePresetId(preset.id);
    setQuery(preset.query);
    if (preset.userDocument) {
      setUserDocument(preset.userDocument);
      setShowDocInput(true);
    } else {
      setUserDocument('');
      setShowDocInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onExecute(query, userDocument.trim() || undefined);
  };

  const getPathIcon = (path: string) => {
    switch (path) {
      case 'MATHEMATICS':
        return <Calculator className="w-3.5 h-3.5 text-emerald-400" />;
      case 'FACTUAL':
        return <Compass className="w-3.5 h-3.5 text-blue-400" />;
      case 'ABSTENTION':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
      case 'DOCUMENT':
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case 'CONFLICT':
        return <Scale className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Principle Banner */}
      <div className="mb-5 pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            Evidence-Gated Inquiry Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="text-emerald-400 font-medium">Core Principle:</span> Generate privately · Verify independently · Correct when necessary · Release only what evidence supports.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80 self-start sm:self-auto font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Raw candidate retained behind gate</span>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {presets.map(p => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    {getPathIcon(p.path)}
                    <span className="truncate">{p.badge}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Verification Test Prompts */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pt-1">
        <span className="text-[11px] font-semibold text-slate-400">Target Benchmark Tests:</span>
        {[
          'What is 18% of 250?',
          'Why is the sky blue?',
          'Who won the 2018 FIFA World Cup?',
          'Explain how vaccines work.'
        ].map(testQ => (
          <button
            key={testQ}
            type="button"
            onClick={() => {
              setQuery(testQ);
              setUserDocument('');
              setShowDocInput(false);
              onExecute(testQ);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>{testQ}</span>
            <ArrowRight className="w-3 h-3 text-emerald-400 opacity-70" />
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="query-input" className="text-xs font-medium text-slate-300">
              Prompt / Question:
            </label>
            <button
              type="button"
              onClick={() => setShowDocInput(!showDocInput)}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showDocInput ? 'Hide Reference Document' : 'Attach Reference Document'}</span>
              {showDocInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="relative">
            <textarea
              id="query-input"
              rows={3}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter a mathematical problem, factual inquiry, or claim requiring verification..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all font-sans"
              required
            />
          </div>
        </div>

        {/* Collapsible Document Input */}
        {showDocInput && (
          <div className="bg-slate-950/70 border border-purple-500/20 rounded-xl p-3.5 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                User-Provided Document / Context (Untrusted Data Input):
              </span>
              <span className="text-[11px] text-slate-400">
                Ground-truth claims will be cross-checked against this text
              </span>
            </div>
            <textarea
              rows={3}
              value={userDocument}
              onChange={e => setUserDocument(e.target.value)}
              placeholder="Paste contract sections, meeting notes, research papers, or specification text..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
            />
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>Target Model: NVIDIA Nemotron-70B via Nebius</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <span>Verify & Authorize Release</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
