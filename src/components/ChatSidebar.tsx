import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Sliders,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ChatSession } from '../types/pipeline';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenDashboard,
  onOpenSettings
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#0B0F12] border-r border-slate-800/80 transition-all duration-200 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-3 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 px-2 py-1">
            <div className="w-6 h-6 rounded-md bg-[#76B900]/15 border border-[#76B900]/40 flex items-center justify-center text-[#76B900]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-slate-100 flex items-center space-x-1.5">
                <span>VerifyFirst</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#76B900]/15 text-[#76B900] font-normal">
                  v2.4
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all duration-150 text-sm font-medium shadow-xs group"
          >
            <Plus className="w-4 h-4 text-[#76B900] group-hover:scale-110 transition-transform" />
            <span>New chat</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <div className="px-3 py-1.5 text-[11px] font-medium text-slate-300 uppercase tracking-wider">
            History
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-300">
              No previous chats yet
            </div>
          ) : (
            sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-sm cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800/80 text-white font-medium border border-slate-700/60'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate pr-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-[#76B900]' : 'text-slate-300 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate text-xs">{s.title || 'Untitled chat'}</span>
                  </div>
                  <button
                    onClick={e => onDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 rounded transition-all"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions: Dashboard & Settings */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-[#090D10]">
          <button
            onClick={onOpenDashboard}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-850/80 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-[#76B900]" />
            <span>Dashboard & Benchmark</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-850/80 transition-colors"
          >
            <Sliders className="w-4 h-4 text-slate-300" />
            <span>Settings & Models</span>
          </button>
        </div>
      </aside>
    </>
  );
};
