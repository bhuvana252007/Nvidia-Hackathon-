import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  ArrowUp,
  Zap,
  Microscope,
  X,
  FileText,
  Mic,
  MicOff,
  Radio,
  Image as ImageIcon
} from 'lucide-react';
import { AttachedFile } from '../types/pipeline';

interface ChatInputProps {
  onSendMessage: (text: string, mode: 'fast' | 'deep', attachedFile?: AttachedFile) => void;
  isLoading: boolean;
  onOpenVoiceMode?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onOpenVoiceMode
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'fast' | 'deep'>('fast');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input, interimTranscript]);

  // Speech-to-Text via Web Speech API with server fallback
  const toggleSpeechToText = () => {
    if (isListening) {
      stopSpeechRecognition();
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: trigger voice mode or prompt
      if (onOpenVoiceMode) {
        onOpenVoiceMode();
      } else {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr) {
          setInput(prev => (prev ? `${prev} ${finalStr}` : finalStr));
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimStr);
        }
      };

      recognition.onerror = () => {
        stopSpeechRecognition();
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isListening) {
      stopSpeechRecognition();
    }
    const fullText = (input + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if ((!fullText && !attachedFile) || isLoading) return;

    onSendMessage(fullText, mode, attachedFile || undefined);
    setInput('');
    setInterimTranscript('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    if (isImage) {
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          dataUrl: reader.result as string,
          textContent: file.type?.includes('pdf') ? undefined : (reader.result as string)
        });
      };
      // Read as Data URL so both PDF buffers and text can be forwarded to backend
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto px-4 pb-4">
      {/* Attached file preview chip */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 p-2 px-3 bg-slate-900 border border-slate-800 rounded-xl max-w-fit shadow-xs">
          {attachedFile.dataUrl && attachedFile.type?.startsWith('image/') ? (
            <img
              src={attachedFile.dataUrl}
              alt={attachedFile.name}
              className="w-8 h-8 rounded object-cover border border-slate-700"
            />
          ) : (
            <FileText className="w-5 h-5 text-[#76B900]" />
          )}
          <div className="text-xs">
            <span className="font-medium text-slate-200 block truncate max-w-[200px]">
              {attachedFile.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {attachedFile.type || 'File'} · {attachedFile.size ? `${Math.round(attachedFile.size / 1024)} KB` : ''}
            </span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="ml-2 p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Big Input Box */}
      <div className={`relative rounded-2xl bg-[#141A1F] border ${
        isListening ? 'border-[#76B900] ring-1 ring-[#76B900]/40' : 'border-slate-800 focus-within:border-[#76B900]/70'
      } shadow-lg shadow-black/40 transition-all duration-150`}>
        {/* Live Listening Waveform Bar */}
        {isListening && (
          <div className="flex items-center space-x-2 px-4 pt-2.5 text-xs text-[#76B900] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76B900] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#76B900]"></span>
            </span>
            <span>Listening to speech…</span>
            {interimTranscript && (
              <span className="text-slate-300 italic truncate max-w-[400px]">"{interimTranscript}"</span>
            )}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input + (interimTranscript ? ' ' + interimTranscript : '')}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Speaking now…' : 'Ask any student question, math problem, code, or attach homework...'}
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 px-4 pt-3.5 pb-12 resize-none outline-none text-[15px] leading-relaxed max-h-[180px]"
        />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.txt,.md,.json,.csv"
          className="hidden"
        />

        {/* Bottom Toolbar inside Input Box */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-1.5 pointer-events-auto">
            {/* Attach Button (📎) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Attach homework photo, diagram, or PDF (📎)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mic Button (🎤) for Speech-to-Text */}
            <button
              type="button"
              onClick={toggleSpeechToText}
              disabled={isLoading}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-[#76B900] text-black shadow-md shadow-[#76B900]/30 animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question (Speech-to-Text)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Hands-Free Voice Mode Trigger */}
            {onOpenVoiceMode && (
              <button
                type="button"
                onClick={onOpenVoiceMode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#76B900] hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Open Hands-Free Voice Conversation Mode"
              >
                <Radio className="w-4 h-4" />
              </button>
            )}

            {/* Mode Switch (⚡ Fast / 🔬 Deep Research) */}
            <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-xs ml-1">
              <button
                type="button"
                onClick={() => setMode('fast')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  mode === 'fast'
                    ? 'bg-[#1C252C] text-[#76B900] font-medium shadow-2xs'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('deep')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  mode === 'deep'
                    ? 'bg-[#1C252C] text-[#76B900] font-medium shadow-2xs'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Microscope className="w-3 h-3" />
                <span>Deep Research</span>
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!input.trim() && !interimTranscript && !attachedFile) || isLoading}
            className={`p-2 rounded-xl transition-all cursor-pointer pointer-events-auto flex items-center justify-center ${
              (input.trim() || interimTranscript || attachedFile) && !isLoading
                ? 'bg-[#76B900] text-black hover:bg-[#86d100] shadow-md shadow-[#76B900]/20'
                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
