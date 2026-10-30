import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, Settings2 } from 'lucide-react';

interface AudioControlsProps {
  textToRead: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ textToRead }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (available.length > 0 && !selectedVoice) {
        // Prefer natural English or Hindi voice
        const preferred =
          available.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) ||
          available.find(v => v.lang.startsWith('en')) ||
          available[0];
        if (preferred) setSelectedVoice(preferred.name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Format text for speech synthesis:
  // Skip reading raw code blocks and LaTeX aloud (say "see the formula on screen" / "see code on screen")
  const prepareSpeechText = (raw: string): string => {
    let clean = raw;
    // Replace block math $$...$$
    clean = clean.replace(/\$\$[\s\S]*?\$\$/g, ' see the formula on screen. ');
    // Replace inline math $...$
    clean = clean.replace(/\$[^\$]+?\$/g, ' see the formula on screen. ');
    // Replace code blocks ```...```
    clean = clean.replace(/```[\s\S]*?```/g, ' see the code on screen. ');
    // Replace markdown tags and symbols
    clean = clean.replace(/[*#_~`>]/g, ' ');
    clean = clean.replace(/\[\^?\d+\]/g, ' ');
    return clean.replace(/\s+/g, ' ').trim();
  };

  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const spokenText = prepareSpeechText(textToRead);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utteranceRef.current = utterance;

    utterance.rate = rate;

    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="inline-flex items-center space-x-1.5 relative text-xs">
      {/* Play / Pause / Resume Button */}
      {!isPlaying && !isPaused ? (
        <button
          onClick={handlePlay}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Read answer aloud"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#76B900]" />
          <span>Read aloud</span>
        </button>
      ) : isPlaying ? (
        <div className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={handlePause}
            className="p-1 text-slate-200 hover:text-white rounded hover:bg-slate-800"
            title="Pause"
          >
            <Pause className="w-3.5 h-3.5 text-yellow-400" />
          </button>
          <button
            onClick={handleStop}
            className="p-1 text-slate-200 hover:text-white rounded hover:bg-slate-800"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
          </button>
          <span className="text-[10px] text-[#76B900] px-1 font-mono animate-pulse">
            Speaking…
          </span>
        </div>
      ) : (
        <div className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={handlePlay}
            className="p-1 text-slate-200 hover:text-white rounded hover:bg-slate-800"
            title="Resume"
          >
            <Play className="w-3.5 h-3.5 text-[#76B900]" />
          </button>
          <button
            onClick={handleStop}
            className="p-1 text-slate-200 hover:text-white rounded hover:bg-slate-800"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
          </button>
          <span className="text-[10px] text-slate-400 px-1 font-mono">
            Paused
          </span>
        </div>
      )}

      {/* Voice Settings Trigger */}
      <button
        onClick={() => setShowSettings(prev => !prev)}
        className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
        title="Voice & Speed Settings"
      >
        <Settings2 className="w-3 h-3" />
      </button>

      {/* Settings Popover */}
      {showSettings && (
        <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#12181D] border border-slate-800 rounded-xl shadow-xl z-30 w-64 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">
            Audio Settings
          </div>

          {/* Speed Selector */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Reading Speed</label>
            <div className="grid grid-cols-4 gap-1 text-center">
              {[0.75, 1.0, 1.25, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => setRate(s)}
                  className={`py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                    rate === s
                      ? 'bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector */}
          {voices.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Voice Language</label>
              <select
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                className="w-full bg-[#182026] border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs focus:border-[#76B900] outline-none"
              >
                {voices.slice(0, 15).map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
