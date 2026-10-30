/**
 * VerifyFirst AI: An Evidence-Gated AI Agent
 * Built for NVIDIA x Nebius Global AI Hackathon (Best Apps & Agents Track)
 * Fully 3D Animated WebGL Experience
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero3DSection } from './components/Hero3DSection';
import { AwwwardsHero3D } from './components/AwwwardsHero3D';
import { QueryWorkspace } from './components/QueryWorkspace';
import { LivePipelineStepper } from './components/LivePipelineStepper';
import { ComparisonAndAnswerPanel } from './components/ComparisonAndAnswerPanel';
import { EvidenceInspector } from './components/EvidenceInspector';
import { TelemetrySummaryBar } from './components/TelemetrySummaryBar';
import { BenchmarkModal } from './components/BenchmarkModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { TestsModal } from './components/TestsModal';
import { Interactive3DStageVisualizer } from './components/Interactive3DStageVisualizer';
import { FloatingParticles } from './components/FloatingParticles';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { motion, useScroll, useTransform } from 'framer-motion';
import { VerificationResult, PipelineStepLog, Claim } from './types/pipeline';
import { ShieldCheck, Cpu, GitFork, Award } from 'lucide-react';

interface Folding3DCardProps {
  children: React.ReactNode;
  className?: string;
}

const Folding3DCard: React.FC<Folding3DCardProps> = ({ children, className = '' }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  });

  // Dynamic 3D folding effect tied to scroll position:
  // Folds open as it enters, remains upright when centered, folds back as it leaves
  const rotateX = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [16, 0, 0, -14]);
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.95, 1, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.7]);
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [30, 0, 0, -20]);

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        scale,
        opacity,
        y,
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stepLogs, setStepLogs] = useState<PipelineStepLog[]>([]);
  const [presets, setPresets] = useState<any[]>([]);

  const [config, setConfig] = useState({
    nebius: {
      hasLiveKey: false,
      baseUrl: 'https://api.studio.nebius.ai/v1',
      activeModel: 'nvidia/llama-3.1-nemotron-70b-instruct-hf',
      providerType: 'mock_nemotron',
      availableModels: [
        'nvidia/llama-3.1-nemotron-70b-instruct-hf',
        'nvidia/nemotron-4-340b-instruct',
        'mistralai/Mistral-Nemo-Instruct-2407',
        'meta-llama/Meta-Llama-3.1-70B-Instruct'
      ]
    },
    tavily: {
      hasKey: false,
      endpoint: 'https://api.tavily.com/search'
    }
  });

  // Modals
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [is3DVisualizerOpen, setIs3DVisualizerOpen] = useState(false);

  // Load initial configuration and presets
  useEffect(() => {
    fetchConfig();
    fetchPresets();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.warn('Could not fetch config:', err);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
        if (data.length > 0) {
          executePipeline(data[0].query, data[0].userDocument);
        }
      }
    } catch (err) {
      console.warn('Could not fetch presets:', err);
    }
  };

  const executePipeline = async (query: string, userDocument?: string) => {
    setIsLoading(true);
    setStepLogs([]);

    const initialLog: PipelineStepLog = {
      step: 'ANALYSIS',
      label: 'Question Analyzer',
      status: 'in_progress',
      durationMs: 40,
      message: 'Analyzing query intent and mapping deterministic/evidence verification routes...',
      timestamp: new Date().toISOString()
    };
    setStepLogs([initialLog]);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userDocument })
      });

      if (!res.ok) {
        throw new Error(`Pipeline error HTTP ${res.status}`);
      }

      const verificationData: VerificationResult = await res.json();
      setResult(verificationData);
      setStepLogs(verificationData.stepLogs);
    } catch (err: any) {
      console.error('Pipeline execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative">
        {/* 3D Floating Particles Background Canvas */}
        <FloatingParticles />

      {/* Top Navigation */}
      <Navbar
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
        onOpen3DVisualizer={() => setIs3DVisualizerOpen(true)}
        providerStatus={{
          hasLiveKey: config.nebius.hasLiveKey,
          activeModel: config.nebius.activeModel,
          providerType: config.nebius.providerType
        }}
      />

      {/* Main Container with 3D Perspective */}
      <main
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        style={{ perspective: 1400 }}
      >
        {/* Immersive Awwwards-Style 3D Hero Section */}
        <Folding3DCard>
          <AwwwardsHero3D />
        </Folding3DCard>

        {/* 3D Animated Hero Visualizer Section */}
        <Folding3DCard>
          <Hero3DSection
            isLoading={isLoading}
            hasResult={Boolean(result)}
            hasAbstained={result?.hasAbstained ?? false}
            onOpen3DVisualizer={() => setIs3DVisualizerOpen(true)}
          />
        </Folding3DCard>

        {/* Workspace Form & Presets */}
        <Folding3DCard>
          <QueryWorkspace
            presets={presets}
            onExecute={executePipeline}
            isLoading={isLoading}
          />
        </Folding3DCard>

        {/* 8-Stage Live Pipeline Stepper */}
        <Folding3DCard>
          <LivePipelineStepper
            stepLogs={stepLogs}
            isLoading={isLoading}
          />
        </Folding3DCard>

        {/* Telemetry Metrics Bar */}
        {result && (
          <Folding3DCard>
            <TelemetrySummaryBar metrics={result.metrics} />
          </Folding3DCard>
        )}

        {/* Dual Answer Panel: Raw Private Draft vs Authorized Released Answer */}
        <Folding3DCard>
          <ComparisonAndAnswerPanel
            result={result}
            onSelectEvidence={(eid) => {}}
            onSelectClaim={(claim) => {}}
          />
        </Folding3DCard>

        {/* Deep Evidence Inspector & Audit Trail */}
        {result && (
          <Folding3DCard>
            <EvidenceInspector
              claims={result.claims}
              evidenceSources={result.evidenceSources}
            />
          </Folding3DCard>
        )}
      </main>

      {/* Modals */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <TestsModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      {/* Full 3D Interactive Stage Visualizer */}
      <Interactive3DStageVisualizer
        isOpen={is3DVisualizerOpen}
        onClose={() => setIs3DVisualizerOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">VerifyFirst AI</span>
            <span>·</span>
            <span>NVIDIA x Nebius Global AI Hackathon (Best Apps & Agents Track)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by Nebius Token Factory & NVIDIA Nemotron</span>
            <span>·</span>
            <span>3D WebGL Visualization Engine</span>
            <span>·</span>
            <span>Apache 2.0 Open Source</span>
          </div>
        </div>
      </footer>
      </div>
    </SmoothScrollProvider>
  );
}
