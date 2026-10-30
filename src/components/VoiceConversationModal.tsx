import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Loader2, Sparkles } from 'lucide-react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<string | void>;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
  onSendMessage
}) => {
  const [voiceState, setVoiceState] = useState<'LISTENING' | 'THINKING' | 'SPEAKING' | 'IDLE'>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isRunningRef.current = true;
      startListening();
    } else {
      isRunningRef.current = false;
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      isRunningRef.current = false;
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript('Speech recognition is not supported in this browser. Please use keyboard input.');
      setVoiceState('IDLE');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onend = async () => {
        if (!isRunningRef.current) return;
        if (transcript.trim().length > 0) {
          await handleStudentSpoke(transcript.trim());
        } else {
          // Restart listening if nothing was spoken
          if (isRunningRef.current) {
            setTimeout(startListening, 500);
          }
        }
      };

      recognition.onerror = () => {
        if (isRunningRef.current) {
          setTimeout(startListening, 1000);
        }
      };

      recognition.start();
    } catch {
      setVoiceState('IDLE');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const handleStudentSpoke = async (spokenText: string) => {
    setVoiceState('THINKING');
    try {
      const response = await onSendMessage(spokenText);
      const textToSpeak = typeof response === 'string' ? response : 'I have verified your answer. Please check the screen.';
      setAiResponse(textToSpeak);
      speakResponse(textToSpeak);
    } catch {
      speakResponse('I encountered an error verifying that question.');
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceState('IDLE');
      return;
    }

    setVoiceState('SPEAKING');
    window.speechSynthesis.cancel();

    // Clean text of code blocks and formulas
    const cleanText = text
      .replace(/\$\$[\s\S]*?\$\$/g, ' see the formula on screen. ')
      .replace(/\$[^\$]+?\$/g, ' see the formula on screen. ')
      .replace(/```[\s\S]*?```/g, ' see the code on screen. ')
      .replace(/[*#_~`>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 400));
    utterance.rate = 1.05;

    utterance.onend = () => {
      if (isRunningRef.current) {
        // Hands-free loop: listen again automatically!
        setTranscript('');
        startListening();
      } else {
        setVoiceState('IDLE');
      }
    };

    utterance.onerror = () => {
      if (isRunningRef.current) {
        startListening();
      } else {
        setVoiceState('IDLE');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0F1418] border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
          title="Exit Voice Mode"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Tag */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#76B900]/15 text-[#76B900] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hands-Free Voice Tutor</span>
        </div>

        {/* Pulsing Animated Sphere / Waveform */}
        <div className="relative my-6 flex items-center justify-center">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              voiceState === 'LISTENING'
                ? 'bg-[#76B900]/20 border-2 border-[#76B900] scale-110 shadow-lg shadow-[#76B900]/30 animate-pulse'
                : voiceState === 'THINKING'
                ? 'bg-cyan-500/20 border-2 border-cyan-400 scale-100 shadow-lg shadow-cyan-500/20'
                : voiceState === 'SPEAKING'
                ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            {voiceState === 'LISTENING' && <Mic className="w-12 h-12 text-[#76B900]" />}
            {voiceState === 'THINKING' && <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />}
            {voiceState === 'SPEAKING' && <Volume2 className="w-12 h-12 text-emerald-400" />}
            {voiceState === 'IDLE' && <MicOff className="w-12 h-12 text-slate-400" />}
          </div>
        </div>

        {/* Status Line */}
        <div className="text-sm font-semibold tracking-wide text-slate-200 mb-2">
          {voiceState === 'LISTENING' && 'Listening to you… (Speak naturally)'}
          {voiceState === 'THINKING' && 'Thinking and verifying…'}
          {voiceState === 'SPEAKING' && 'Speaking answer…'}
          {voiceState === 'IDLE' && 'Voice mode idle'}
        </div>

        {/* Live Transcript / Response preview */}
        <div className="w-full min-h-[64px] max-h-36 overflow-y-auto p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed text-left mb-6 font-mono">
          {transcript ? (
            <div>
              <span className="text-[#76B900] font-semibold">You: </span>
              {transcript}
            </div>
          ) : aiResponse && voiceState === 'SPEAKING' ? (
            <div>
              <span className="text-emerald-400 font-semibold">Tutor: </span>
              {aiResponse.slice(0, 150)}…
            </div>
          ) : (
            <span className="text-slate-500 italic">Say any math problem, coding question, or concept...</span>
          )}
        </div>

        {/* Stop Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Exit Voice Mode
        </button>
      </div>
    </div>
  );
};
