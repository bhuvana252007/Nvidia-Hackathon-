import React, { useState, useEffect } from 'react';
import {
  X,
  Terminal,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { FullTestSuiteSummary } from '../services/unitTests';

interface TestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestsModal: React.FC<TestsModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSuite, setTestSuite] = useState<FullTestSuiteSummary | null>(null);

  useEffect(() => {
    if (isOpen && !testSuite) {
      runTests();
    }
  }, [isOpen]);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/run-tests');
      const data = await res.json();
      setTestSuite(data);
    } catch (err) {
      console.error('Failed to run tests:', err);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Automated Verification Unit & Integration Tests
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic math parser, contradiction detection, security sanitization & release policy.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 font-mono text-xs">
          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              {testSuite && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-bold">
                    {testSuite.passed} Passed
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-rose-400 font-bold">
                    {testSuite.failed} Failed
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    {testSuite.durationMs}ms
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Running...' : 'Re-run Tests'}</span>
            </button>
          </div>

          {/* Test Results List */}
          {testSuite ? (
            <div className="space-y-2">
              {testSuite.results.map(test => (
                <div
                  key={test.id}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                    test.passed
                      ? 'bg-emerald-950/15 border-emerald-500/30 text-slate-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold text-white">{test.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {test.suite}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-6">
                      Expected: <span className="text-slate-300">{test.expected}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-6">
                      Actual: <span className="text-emerald-300">{test.actual}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {test.durationMs}ms
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-slate-400" />
              <span>Running automated test suite...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
