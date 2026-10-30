import React, { useState } from 'react';
import { Copy, Check, Play, Loader2, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { CodeExecutionResult } from '../services/codeExecutionService';

interface CodeBlockProps {
  language: string;
  code: string;
  initialOutput?: CodeExecutionResult;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, initialOutput }) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<CodeExecutionResult | null>(initialOutput || null);
  const [isOutputVisible, setIsOutputVisible] = useState(Boolean(initialOutput));

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data: CodeExecutionResult = await res.json();
      setOutput(data);
      setIsOutputVisible(true);
    } catch (err: any) {
      setOutput({
        language: (language as any) || 'python',
        success: false,
        stdout: '',
        stderr: err?.message || 'Execution request failed',
        executionTimeMs: 0
      });
      setIsOutputVisible(true);
    } finally {
      setIsRunning(false);
    }
  };

  const langLabel = language || 'code';

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-[#0D1216] overflow-hidden shadow-xs">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#12181D] border-b border-slate-800 text-xs">
        <span className="font-mono text-slate-400 lowercase">{langLabel}</span>

        <div className="flex items-center space-x-1.5">
          {/* Run in Sandbox Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#76B900]/15 hover:bg-[#76B900]/25 text-[#76B900] border border-[#76B900]/30 transition-colors cursor-pointer text-[11px] font-medium"
            title="Run code in student sandbox"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>{isRunning ? 'Running…' : 'Run'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer text-[11px]"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#76B900]" />
                <span className="text-[#76B900]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>

      {/* Sandbox Output Console */}
      {output && isOutputVisible && (
        <div className="border-t border-slate-800 bg-[#090D10] p-3 text-xs">
          <div className="flex items-center justify-between mb-1.5 text-slate-400 font-mono text-[11px]">
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#76B900]" />
              <span className="font-semibold text-slate-300">Sandbox Output:</span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({output.executionTimeMs}ms)
              </span>
            </div>
            <button
              onClick={() => setIsOutputVisible(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {output.stdout && (
            <pre className="font-mono text-emerald-400 whitespace-pre-wrap text-[11px] bg-black/40 p-2 rounded-md">
              {output.stdout}
            </pre>
          )}

          {output.stderr && (
            <pre className="font-mono text-rose-400 whitespace-pre-wrap text-[11px] bg-rose-950/20 border border-rose-900/30 p-2 rounded-md mt-1">
              {output.stderr}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
