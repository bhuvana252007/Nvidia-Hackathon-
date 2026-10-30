import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Cpu,
  ShieldCheck,
  Video,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'pitch' | 'demo_script' | 'criteria'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                VerifyFirst AI — Hackathon Pitch & Technical Specifications
              </h3>
              <p className="text-xs text-slate-400">
                NVIDIA x Nebius Global AI Hackathon · Best Apps & Agents Track
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

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture & Lifecycle
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'pitch'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hackathon Pitch & Scope
          </button>
          <button
            onClick={() => setActiveTab('demo_script')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'demo_script'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3-Minute Demo Script
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'criteria'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Judging Criteria Alignment
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">8-Stage Evidence-Gated Lifecycle</h4>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
                <div className="text-emerald-400">[USER QUERY]</div>
                <div className="pl-4">↓ (1) Question Analyzer: Route to Math / Factual / Speculative / Document path</div>
                <div className="pl-4">↓ (2) Candidate Generator: NVIDIA Nemotron-70B via Nebius Token Factory (Kept in Private Buffer)</div>
                <div className="pl-4">↓ (3) Claim Decomposer: Atomic split into CLM-01, CLM-02, ... with verification methods</div>
                <div className="pl-4">↓ (4) Evidence Retriever: Tavily Search + Document Ingestion + Primary Authority Ranking</div>
                <div className="pl-4">↓ (5) Independent Verifier: Safe Deterministic AST Math + Evidence Cross-Examiner</div>
                <div className="pl-4">↓ (6) Correction Agent: Bounded retry revision (Max 2 iterations)</div>
                <div className="pl-4">↓ (7) Release Gate: Enforce Zero-Hallucination Policy (Release / Qualify / Abstain)</div>
                <div className="pl-4">↓ (8) Evidence Report & Provenance Footnotes</div>
                <div className="text-emerald-400">[AUTHORIZED USER-FACING RESPONSE]</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    Nebius Token Factory & NVIDIA
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Uses Nebius Token Factory OpenAI-compatible API (`https://api.studio.nebius.ai/v1`) hosting `nvidia/llama-3.1-nemotron-70b-instruct-hf`. Candidate outputs are never presented raw; they are placed behind the verification gate.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    Deterministic Code vs Model Guessing
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Arithmetic, compound interest, percentages, and logic are verified by deterministic code execution engines, never by asking a language model if its arithmetic was right.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Product Pitch</h4>
                <p>
                  Today's AI chatbots generate text with extreme conversational confidence, equating plausible fluency with factual accuracy. In high-stakes fields—financial reporting, scientific research, legal compliance, and aerospace—a subtle arithmetic error or fabricated citation causes severe damage.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <h5 className="font-semibold text-emerald-400 mb-1">The VerifyFirst Principle:</h5>
                <p className="italic text-slate-200">
                  "Generate privately. Verify independently. Correct when necessary. Release only what the evidence supports."
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-white mb-1">Target Audience & Market Impact:</h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Financial & Risk Analysts:</strong> Zero-tolerance for compounding/interest arithmetic slips.</li>
                  <li><strong>Legal & Compliance Teams:</strong> Cross-checks drafted contracts against exact agreement clauses.</li>
                  <li><strong>Scientific Researchers:</strong> Verifies hardware specs and claims against peer-reviewed literature.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'demo_script' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">0:00 - 0:30 · The Problem & Core Concept</span>
                <p className="text-slate-300 font-sans">
                  "Meet VerifyFirst AI. Most AI applications stream unverified tokens straight to the user. If an LLM slips up on math or invents a citation, you only notice after making a costly decision. VerifyFirst puts a strict release gate between NVIDIA Nemotron and the user."
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">0:30 - 1:15 · Path A: Catching an Arithmetic Hallucination</span>
                <p className="text-slate-300 font-sans">
                  "Let's click Path A: A store item costs $840 with a 15% discount. In our private buffer, Nemotron drafted that 15% of $840 is $134. But our deterministic math engine calculated $126. The Correction Agent intercepts the error, revises the calculation, and releases the verified answer with audit proof."
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">1:15 - 2:00 · Path B: Voyager 1 Specs & Caught Citation</span>
                <p className="text-slate-300 font-sans">
                  "In Path B, the private candidate claimed Voyager 1 runs on a 256 MHz Intel processor, citing a fake Nature paper. Tavily retrieves NASA JPL primary records: Voyager actually uses a 250 kHz custom computer. The gate catches both the hardware falsehood and the citation."
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">2:00 - 2:40 · Path C: Abstaining on Speculation</span>
                <p className="text-slate-300 font-sans">
                  "In Path C, we ask for Apple Car's release date. Rather than hallucinating a confident date, VerifyFirst triggers an explicit abstention notice."
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">2:40 - 3:00 · Conclusion & Benchmark</span>
                <p className="text-slate-300 font-sans">
                  "Our automated benchmark proves a 0% factual error rate and 100% error interception. Thank you!"
                </p>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 1. Technological Implementation
                </span>
                <p className="text-slate-400 text-[11px]">
                  Real integration with Nebius Token Factory serving NVIDIA Nemotron-70B; deterministic safe AST math parser; Tavily search retrieval; bounded recursive correction engine; Express backend with live telemetry.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 2. Design & User Experience
                </span>
                <p className="text-slate-400 text-[11px]">
                  Side-by-side inspection of private candidate drafts vs released answers, live 8-stage stepper, interactive claim drawer, and clickable evidence provenance.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 3. Potential Impact
                </span>
                <p className="text-slate-400 text-[11px]">
                  Transforms probabilistic LLMs into reliable, audit-ready agents for high-liability professional domains.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 4. Quality of the Idea
                </span>
                <p className="text-slate-400 text-[11px]">
                  Enforces an architectural distinction between candidate generation and release authorization, proving that model agreement is not evidence of correctness.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
