import React, { useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  Loader2,
  GraduationCap,
  Lightbulb,
  BookOpen,
  Terminal,
  Calculator
} from 'lucide-react';
import { ChatMessage, VerificationResult } from '../types/pipeline';
import { MathRenderer } from './MathRenderer';
import { CodeBlock } from './CodeBlock';
import { AudioControls } from './AudioControls';

interface ChatConversationProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeStatusLine?: string;
  streamingAnswer?: string;
  onSelectSample: (query: string) => void;
  onViewDetails: (result: VerificationResult) => void;
  onAskSimpler?: () => void;
  onAskMoreDetail?: () => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  messages,
  isLoading,
  activeStatusLine,
  streamingAnswer,
  onSelectSample,
  onViewDetails,
  onAskSimpler,
  onAskMoreDetail
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeStatusLine, streamingAnswer]);

  const studentExampleChips = [
    { label: 'Solve: 2x + 5 = 17', tag: 'Algebra', query: 'Solve 2x + 5 = 17' },
    { label: 'Explain photosynthesis to a 7-year-old', tag: 'Primary', query: 'Explain photosynthesis to a 7-year-old' },
    { label: 'Why does my Python loop never stop?', tag: 'Coding', query: 'Why does my Python loop never stop?' },
    { label: 'Find the derivative of x² sin x', tag: 'Calculus', query: 'Find the derivative of x² sin x' },
    { label: 'Explain Ohm\'s law with an example', tag: 'Physics', query: 'Explain Ohm\'s law with an example' },
    { label: 'Summarize this PDF', tag: 'Document', query: 'Summarize this PDF' }
  ];

  const getTrustBadge = (score: number, label?: string) => {
    if (score >= 80) {
      return {
        dotClass: 'bg-[#76B900]',
        bgClass: 'bg-[#76B900]/10 border-[#76B900]/30 text-[#76B900]',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900]" />,
        text: `Trust ${score}% · ${label || 'Highly reliable'}`
      };
    }
    if (score >= 50) {
      return {
        dotClass: 'bg-yellow-400',
        bgClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
        text: `Trust ${score}% · ${label || 'Mostly reliable'}`
      };
    }
    return {
      dotClass: 'bg-rose-400',
      bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
      text: `Trust ${score}% · ${label || 'Check this yourself'}`
    };
  };

  /**
   * Parses markdown sections into code blocks, math expressions, lists, and paragraphs
   */
  const renderMessageContent = (text: string, vResult?: VerificationResult) => {
    // Split by code blocks ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText) {
        parts.push(renderTextAndMath(precedingText, `text-${lastIndex}`));
      }

      const lang = match[1] || 'python';
      const code = match[2];
      parts.push(
        <CodeBlock
          key={`code-${match.index}`}
          language={lang}
          code={code}
          initialOutput={vResult?.codeExecution}
        />
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      parts.push(renderTextAndMath(remaining, `text-end-${lastIndex}`));
    }

    return <div className="space-y-3">{parts}</div>;
  };

  const renderTextAndMath = (text: string, keyPrefix: string) => {
    const paragraphs = text.split(/\n\n+/);

    return (
      <div key={keyPrefix} className="space-y-3 leading-relaxed text-[15px] sm:text-base text-slate-200">
        {paragraphs.map((p, pIdx) => {
          if (!p.trim()) return null;

          // Headers: ### Title
          if (p.startsWith('### ')) {
            return (
              <h3 key={pIdx} className="text-base sm:text-lg font-semibold text-slate-100 mt-4 mb-2">
                <MathRenderer content={p.replace(/^###\s+/, '')} />
              </h3>
            );
          }
          if (p.startsWith('## ')) {
            return (
              <h2 key={pIdx} className="text-lg sm:text-xl font-bold text-slate-100 mt-4 mb-2">
                <MathRenderer content={p.replace(/^##\s+/, '')} />
              </h2>
            );
          }

          // Bullet / Ordered lists
          if (p.startsWith('- ') || p.startsWith('* ') || /^\d+\.\s/.test(p)) {
            const lines = p.split('\n').filter(Boolean);
            return (
              <ul key={pIdx} className="space-y-1.5 pl-5 list-disc marker:text-[#76B900]">
                {lines.map((l, lIdx) => {
                  const cleaned = l.replace(/^[-*]|\d+\.\s*/, '').trim();
                  return (
                    <li key={lIdx}>
                      <MathRenderer content={formatBoldTokens(cleaned)} />
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Standard paragraph with KaTeX Math rendering
          return (
            <p key={pIdx}>
              <MathRenderer content={formatBoldTokens(p)} />
            </p>
          );
        })}
      </div>
    );
  };

  const formatBoldTokens = (str: string): string => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-[750px] mx-auto w-full">
        {/* EMPTY STATE */}
        {messages.length === 0 && (
          <div className="pt-12 pb-6 text-center flex flex-col items-center">
            {/* Student Tutor Logo Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#76B900]/10 border border-[#76B900]/30 flex items-center justify-center text-[#76B900] mb-5 shadow-lg shadow-[#76B900]/10">
              <GraduationCap className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 mb-2">
              VerifyFirst AI Tutor
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
              Ask anything. I'll solve, explain step by step, and verify before I answer.
            </p>

            {/* 6 Example Student Question Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left">
              {studentExampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSample(chip.query)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#141A1F] hover:bg-[#1A2229] border border-slate-800 hover:border-[#76B900]/50 transition-all duration-150 text-slate-200 text-sm group cursor-pointer shadow-xs"
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#76B900] block mb-0.5">
                      {chip.tag}
                    </span>
                    <span className="truncate block font-medium text-xs sm:text-sm">
                      {chip.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#76B900] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHAT MESSAGES */}
        <div className="space-y-8">
          {messages.map(msg => (
            <div key={msg.id} className="space-y-3">
              {msg.role === 'user' ? (
                /* USER MESSAGE: Right-aligned clean bubble */
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#1A2229] border border-slate-800/80 rounded-2xl px-4 py-3 text-slate-100 text-[15px] shadow-xs">
                    {msg.attachedFile && (
                      <div className="mb-2 p-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center space-x-2">
                        {msg.attachedFile.dataUrl && msg.attachedFile.type?.startsWith('image/') ? (
                          <img
                            src={msg.attachedFile.dataUrl}
                            alt={msg.attachedFile.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-[#76B900]" />
                        )}
                        <span className="text-xs text-slate-300 font-mono truncate max-w-[180px]">
                          {msg.attachedFile.name}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ) : (
                /* ASSISTANT MESSAGE: Left-aligned clean natural prose */
                <div className="space-y-4">
                  {/* Avatar / Title */}
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-md bg-[#76B900]/15 border border-[#76B900]/40 flex items-center justify-center text-[#76B900]">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-slate-300">
                      VerifyFirst Tutor
                    </span>
                  </div>

                  {/* Rendered Answer Content */}
                  <div className="pl-7">
                    {renderMessageContent(msg.content, msg.verificationResult)}

                    {/* Contradiction / Discrepancy Correction Note */}
                    {msg.verificationResult?.contradictionCorrection && (
                      <div className="mt-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                        <span>{msg.verificationResult.contradictionCorrection}</span>
                      </div>
                    )}

                    {/* Follow-up Quick Action Chips: "Simpler explanation" & "Explain in more detail" */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 text-xs">
                      {onAskSimpler && (
                        <button
                          onClick={onAskSimpler}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>Simpler explanation</span>
                        </button>
                      )}

                      {onAskMoreDetail && (
                        <button
                          onClick={onAskMoreDetail}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Explain in more detail</span>
                        </button>
                      )}

                      {/* Text-To-Speech Audio Controls */}
                      <AudioControls textToRead={msg.content} />
                    </div>

                    {/* Compact Bottom Row: Trust Score + Time + View Details */}
                    {msg.verificationResult && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {(() => {
                          const badge = getTrustBadge(
                            msg.verificationResult.trustScore,
                            msg.verificationResult.trustScoreLabel
                          );
                          const seconds =
                            msg.durationSeconds ??
                            (msg.verificationResult.metrics.totalDurationMs
                              ? (msg.verificationResult.metrics.totalDurationMs / 1000).toFixed(1)
                              : '0.8');

                          return (
                            <>
                              <div className="flex items-center space-x-3">
                                {/* Trust Badge */}
                                <div
                                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${badge.bgClass}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                  <span>{badge.text}</span>
                                </div>

                                {/* Verification Time */}
                                <div className="flex items-center space-x-1 text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>Verified in {seconds}s</span>
                                </div>
                              </div>

                              {/* View Details Button */}
                              <button
                                onClick={() => onViewDetails(msg.verificationResult!)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80 transition-colors font-medium cursor-pointer"
                              >
                                <span>View details</span>
                                <ArrowRight className="w-3 h-3 text-[#76B900]" />
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* STREAMING IN-PROGRESS ANSWER */}
          {isLoading && streamingAnswer && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-md bg-[#76B900]/15 border border-[#76B900]/40 flex items-center justify-center text-[#76B900]">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-300">
                  VerifyFirst Tutor (Streaming)
                </span>
              </div>
              <div className="pl-7">
                {renderMessageContent(streamingAnswer)}
              </div>
            </div>
          )}

          {/* ACTIVE STATUS LINE (Thinking… → Checking facts… → Verifying…) */}
          {isLoading && !streamingAnswer && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-md bg-[#76B900]/15 border border-[#76B900]/40 flex items-center justify-center text-[#76B900]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-300">
                  VerifyFirst Tutor
                </span>
              </div>
              <div className="pl-7 flex items-center space-x-2 text-sm text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-[#76B900] animate-pulse" />
                <span className="font-mono text-xs text-slate-300">
                  {activeStatusLine || 'Thinking and solving…'}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
