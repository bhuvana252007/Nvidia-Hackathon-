/**
 * VerifyFirst AI: AI Tutor & Student Assistant
 * Powered by NVIDIA Nemotron on Nebius Token Factory
 * Step-by-step math with KaTeX, Code execution sandbox, speech-to-text,
 * hands-free voice conversation mode, and non-blocking quality verification.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatConversation } from './components/ChatConversation';
import { ChatInput } from './components/ChatInput';
import { DetailsDrawer } from './components/DetailsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { BenchmarkModal } from './components/BenchmarkModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { TestsModal } from './components/TestsModal';
import { Interactive3DStageVisualizer } from './components/Interactive3DStageVisualizer';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import { ThemeToggle } from './components/ThemeToggle';
import {
  ChatMessage,
  ChatSession,
  VerificationResult,
  AttachedFile
} from './types/pipeline';
import {
  Menu,
  GraduationCap,
  BarChart3,
  Sliders,
  CheckSquare,
  Layers,
  Cuboid,
  Radio
} from 'lucide-react';

export default function App() {
  // Chat Sessions & Active State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('verifyfirst_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('verifyfirst_active_session_id') || null;
    } catch {
      return null;
    }
  });

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatusLine, setActiveStatusLine] = useState<string>('');
  const [streamingAnswer, setStreamingAnswer] = useState<string>('');
  const [activeResultForDrawer, setActiveResultForDrawer] = useState<VerificationResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);

  // Modals for Dashboard and Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [is3DVisualizerOpen, setIs3DVisualizerOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('verifyfirst_chat_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem('verifyfirst_active_session_id', activeSessionId);
      } else {
        localStorage.removeItem('verifyfirst_active_session_id');
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeSessionId]);

  // Current session messages
  const currentSession = sessions.find(s => s.id === activeSessionId);
  const messages: ChatMessage[] = currentSession ? currentSession.messages : [];

  // Start a new chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      title: 'New tutoring session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete a chat session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Send message and trigger streaming tutor pipeline
  const handleSendMessage = async (
    text: string,
    mode: 'fast' | 'deep' = 'fast',
    attachedFile?: AttachedFile
  ): Promise<string | void> => {
    if ((!text.trim() && !attachedFile) || isLoading) return;

    const queryText = text.trim() || (attachedFile ? `Solve attached ${attachedFile.name}` : '');
    const userMsgId = `usr-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
      attachedFile,
      mode
    };

    // Ensure session exists
    let sessionId = activeSessionId;
    let targetSession = sessions.find(s => s.id === sessionId);

    if (!targetSession || !sessionId) {
      sessionId = `sess-${Date.now()}`;
      targetSession = {
        id: sessionId,
        title: queryText.slice(0, 32) + (queryText.length > 32 ? '...' : ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [userMessage]
      };
      setSessions(prev => [targetSession!, ...prev]);
      setActiveSessionId(sessionId);
    } else {
      // Append user message
      const updatedMessages = [...targetSession.messages, userMessage];
      const isFirstUserMessage = targetSession.messages.filter(m => m.role === 'user').length === 0;
      const updatedTitle = isFirstUserMessage
        ? queryText.slice(0, 32) + (queryText.length > 32 ? '...' : '')
        : targetSession.title;

      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, title: updatedTitle, updatedAt: new Date().toISOString(), messages: updatedMessages }
            : s
        )
      );
    }

    // Set loading & status line animation
    setIsLoading(true);
    setStreamingAnswer('');
    setActiveStatusLine('Thinking and solving…');

    const timer1 = setTimeout(() => {
      setActiveStatusLine('Checking steps & formulas…');
    }, 400);

    const timer2 = setTimeout(() => {
      setActiveStatusLine('Verifying calculations…');
    }, 900);

    const startTime = Date.now();

    // Prepare previous 20 messages for conversation memory
    const historyPayload = (targetSession ? targetSession.messages : []).slice(-20).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          messages: historyPayload,
          attachedFile,
          mode
        })
      });

      if (!response.ok || !response.body) {
        // Fallback to non-streaming endpoint
        const fallbackRes = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            messages: historyPayload,
            attachedFile,
            mode
          })
        });
        const result: VerificationResult = await fallbackRes.json();
        const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(1));

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: result.releasedAnswer,
          timestamp: new Date().toISOString(),
          verificationResult: result,
          durationSeconds
        };

        setSessions(prev =>
          prev.map(s =>
            s.id === sessionId
              ? { ...s, updatedAt: new Date().toISOString(), messages: [...s.messages, assistantMsg] }
              : s
          )
        );
        return result.releasedAnswer;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let finalResult: VerificationResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(trimmed.slice(6));
              if (eventData.type === 'chunk' && eventData.text) {
                streamedContent += eventData.text;
                setStreamingAnswer(streamedContent);
              } else if (eventData.type === 'done' && eventData.result) {
                finalResult = eventData.result;
              }
            } catch {
              // Ignore partial JSON parsing artifacts
            }
          }
        }
      }

      const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(1));
      const finalAnswer = finalResult?.releasedAnswer || streamedContent;

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: finalAnswer,
        timestamp: new Date().toISOString(),
        verificationResult: finalResult || undefined,
        durationSeconds
      };

      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, updatedAt: new Date().toISOString(), messages: [...s.messages, assistantMsg] }
            : s
        )
      );

      return finalAnswer;
    } catch (err: any) {
      console.error('Tutoring request error:', err);
      const fallbackMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue preparing the response: ${err.message || 'Service timed out'}. Please try asking again.`,
        timestamp: new Date().toISOString()
      };

      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, fallbackMsg] }
            : s
        )
      );
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      setStreamingAnswer('');
      setActiveStatusLine('');
    }
  };

  const handleViewDetails = (result: VerificationResult) => {
    setActiveResultForDrawer(result);
    setIsDrawerOpen(true);
  };

  const handleRegenerate = (query: string) => {
    setIsDrawerOpen(false);
    handleSendMessage(query, 'fast');
  };

  const handleAskSimpler = () => {
    handleSendMessage('Can you explain that again more simply for a beginner with easy examples?', 'fast');
  };

  const handleAskMoreDetail = () => {
    handleSendMessage('Can you explain this in deeper mathematical and scientific detail with equations?', 'fast');
  };

  return (
    <div className="flex h-screen bg-[#0B0F12] text-slate-100 font-sans overflow-hidden">
      {/* COLLAPSIBLE LEFT SIDEBAR */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={id => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenDashboard={() => setIsDashboardMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* MAIN TUTOR CHAT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Navbar */}
        <header className="h-13 border-b border-slate-800/80 px-4 flex items-center justify-between bg-[#0B0F12]/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm tracking-tight text-slate-100">
                VerifyFirst AI Tutor
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#76B900]" />
                <span>NVIDIA Nemotron 70B</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Hands-Free Voice Mode Button */}
            <button
              onClick={() => setIsVoiceModeOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#76B900] bg-[#76B900]/10 hover:bg-[#76B900]/20 border border-[#76B900]/30 transition-colors cursor-pointer"
              title="Open Hands-Free Voice Tutor"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* Benchmarks Link */}
            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Benchmarks</span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Settings & Models"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Conversation Stream (Max-width ~750px) */}
        <ChatConversation
          messages={messages}
          isLoading={isLoading}
          activeStatusLine={activeStatusLine}
          streamingAnswer={streamingAnswer}
          onSelectSample={q => handleSendMessage(q, 'fast')}
          onViewDetails={handleViewDetails}
          onAskSimpler={messages.length > 0 ? handleAskSimpler : undefined}
          onAskMoreDetail={messages.length > 0 ? handleAskMoreDetail : undefined}
        />

        {/* Big Bottom Input Box with Speech-to-Text & Attachments */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
        />
      </main>

      {/* DETAILS SLIDE-OUT DRAWER */}
      <DetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        result={activeResultForDrawer}
        onRegenerate={handleRegenerate}
      />

      {/* HANDS-FREE VOICE CONVERSATION MODAL */}
      <VoiceConversationModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onSendMessage={async text => {
          const res = await handleSendMessage(text, 'fast');
          return typeof res === 'string' ? res : undefined;
        }}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* DASHBOARD MENU MODAL */}
      {isDashboardMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0F1418] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F12]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#76B900]/15 border border-[#76B900]/30 flex items-center justify-center text-[#76B900]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Engineering & Verification Dashboard</h2>
                  <p className="text-[11px] text-slate-400">Deterministic benchmarks, code sandbox, and pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setIsDashboardMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <button
                onClick={() => {
                  setIsDashboardMenuOpen(false);
                  setIsBenchmarkOpen(true);
                }}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#76B900]/50 hover:bg-slate-850 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-[#76B900]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#76B900]/20 text-[#76B900]">
                    100% Acc
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-white">
                  Benchmark Suite
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  7 adversarial trap tests comparing ungated baseline vs VerifyFirst AI.
                </p>
              </button>

              <button
                onClick={() => {
                  setIsDashboardMenuOpen(false);
                  setIsTestsOpen(true);
                }}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#76B900]/50 hover:bg-slate-850 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckSquare className="w-5 h-5 text-[#76B900]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#76B900]/20 text-[#76B900]">
                    8/8 Tests
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-white">
                  Deterministic Unit Tests
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Symbolic arithmetic, claim decomposition, and bounded correction verification.
                </p>
              </button>

              <button
                onClick={() => {
                  setIsDashboardMenuOpen(false);
                  setIsArchitectureOpen(true);
                }}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#76B900]/50 hover:bg-slate-850 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                    8-Stage
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-white">
                  Architecture & Pipeline
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  NVIDIA Nemotron integration, sandbox runner, and gating policies.
                </p>
              </button>

              <button
                onClick={() => {
                  setIsDashboardMenuOpen(false);
                  setIs3DVisualizerOpen(true);
                }}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#76B900]/50 hover:bg-slate-850 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Cuboid className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    WebGL 3D
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-200 group-hover:text-white">
                  3D Stage Visualizer
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Interactive Three.js 3D representation of the 8 pipeline stages.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL BENCHMARK & EVALUATION MODAL */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* TESTS MODAL */}
      <TestsModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      {/* ARCHITECTURE MODAL */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* 3D VISUALIZER MODAL */}
      <Interactive3DStageVisualizer
        isOpen={is3DVisualizerOpen}
        onClose={() => setIs3DVisualizerOpen(false)}
        activeStage="RELEASE_GATE"
      />
    </div>
  );
}
