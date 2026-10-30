import React, { useState, useEffect } from 'react';
import { X, Sliders, Shield, Key, Cpu, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [nebiusKey, setNebiusKey] = useState('');
  const [nebiusBaseUrl, setNebiusBaseUrl] = useState('https://api.studio.nebius.ai/v1');
  const [primaryModel, setPrimaryModel] = useState('nvidia/llama-3.1-nemotron-70b-instruct-hf');
  const [fastModel, setFastModel] = useState('mistralai/Mistral-Nemo-Instruct-2407');
  const [tavilyKey, setTavilyKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.nebius?.baseUrl) setNebiusBaseUrl(data.nebius.baseUrl);
        if (data.nebius?.primaryModel) setPrimaryModel(data.nebius.primaryModel);
        if (data.nebius?.fastModel) setFastModel(data.nebius.fastModel);
      })
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nebiusKey: nebiusKey.trim(),
          nebiusBaseUrl: nebiusBaseUrl.trim(),
          primaryModel: primaryModel.trim(),
          fastModel: fastModel.trim(),
          tavilyKey: tavilyKey.trim()
        })
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#0F1418] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F12]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#76B900]/15 border border-[#76B900]/30 flex items-center justify-center text-[#76B900]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Settings & Provider Config</h2>
              <p className="text-[11px] text-slate-400">Zero-API-Key Autonomous Mode is Active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#76B900]/10 border border-[#76B900]/20 text-[#76B900] flex items-start space-x-2.5">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold block text-slate-200">Zero-Key Out-of-the-Box Mode</span>
              VerifyFirst AI runs fully autonomously without requiring third-party API keys.
              You can optionally connect live Nebius Token Factory or Tavily credentials below.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Primary NVIDIA Nemotron Model (Tutoring & Solutions)</label>
            <select
              value={primaryModel}
              onChange={e => setPrimaryModel(e.target.value)}
              className="w-full bg-[#141A1F] border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:border-[#76B900] outline-none"
            >
              <option value="nvidia/llama-3.1-nemotron-70b-instruct-hf">
                nvidia/llama-3.1-nemotron-70b-instruct-hf (Smartest / 70B Parameter)
              </option>
              <option value="nvidia/nemotron-4-340b-instruct">
                nvidia/nemotron-4-340b-instruct (Ultra High Capacity 340B)
              </option>
              <option value="meta-llama/Meta-Llama-3.1-70B-Instruct">
                meta-llama/Meta-Llama-3.1-70B-Instruct
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Fast Model (Claim Extraction & Verification)</label>
            <select
              value={fastModel}
              onChange={e => setFastModel(e.target.value)}
              className="w-full bg-[#141A1F] border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:border-[#76B900] outline-none"
            >
              <option value="mistralai/Mistral-Nemo-Instruct-2407">
                mistralai/Mistral-Nemo-Instruct-2407 (Fast Lightweight Model)
              </option>
              <option value="nvidia/llama-3.1-nemotron-70b-instruct-hf">
                nvidia/llama-3.1-nemotron-70b-instruct-hf
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Nebius Token Factory API Key (Optional)</label>
            <input
              type="password"
              placeholder="nebius-live-sk-..."
              value={nebiusKey}
              onChange={e => setNebiusKey(e.target.value)}
              className="w-full bg-[#141A1F] border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono text-xs focus:border-[#76B900] outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Tavily Web Search API Key (Optional)</label>
            <input
              type="password"
              placeholder="tvly-..."
              value={tavilyKey}
              onChange={e => setTavilyKey(e.target.value)}
              className="w-full bg-[#141A1F] border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono text-xs focus:border-[#76B900] outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end space-x-2 bg-[#0B0F12]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#76B900] text-black hover:bg-[#86d100] transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
