import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface Interactive3DStageVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  activeStage?: string;
}

export const Interactive3DStageVisualizer: React.FC<Interactive3DStageVisualizerProps> = ({
  isOpen,
  onClose,
  activeStage = 'ALL'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  const subsystems = [
    {
      id: 0,
      title: 'Global Verification Matrix',
      desc: 'All 8 stages operational: candidate generator, claim decomposer, deterministic evaluator, and policy gate.'
    },
    {
      id: 1,
      title: 'Private Candidate Core',
      desc: 'NVIDIA Nemotron-70B model draft retained in private obsidian buffer, sealed from external output.'
    },
    {
      id: 2,
      title: 'Orbital Verification Gimbals',
      desc: 'Dual rotating gimbals executing deterministic AST mathematical analysis and evidence cross-examination.'
    },
    {
      id: 3,
      title: 'Release Shield Gate',
      desc: 'Strict release policy gate authorizing supported claims with citations and intercepting contradictions.'
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x10b981, 2.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.0);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 3D Master Node Assembly
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Subsystem 1: Core Icosahedron (Private Generator)
    const coreGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x047857,
      emissiveIntensity: 0.6,
      wireframe: wireframeMode,
      metalness: 0.85,
      roughness: 0.15
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Inner glowing sphere
    const sphereGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(sphereMesh);

    // Subsystem 2: Torus Gimbal 1
    const torus1Geo = new THREE.TorusGeometry(2.3, 0.05, 16, 100);
    const torus1Mat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      metalness: 0.9,
      roughness: 0.1
    });
    const torus1 = new THREE.Mesh(torus1Geo, torus1Mat);
    mainGroup.add(torus1);

    // Torus Gimbal 2
    const torus2Geo = new THREE.TorusGeometry(2.8, 0.04, 16, 100);
    const torus2Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      metalness: 0.9,
      roughness: 0.1
    });
    const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2.rotation.x = Math.PI / 2;
    mainGroup.add(torus2);

    // Subsystem 3: Exterior Laser Cage (Release Gate)
    const cageGeo = new THREE.OctahedronGeometry(3.6, 2);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    mainGroup.add(cageMesh);

    // Swarm of Orbiting Claim Nodes (6 small spheres with orbits)
    const claimNodes: THREE.Mesh[] = [];
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x10b981 : 0x06b6d4,
        emissive: i % 2 === 0 ? 0x059669 : 0x0891b2,
        emissiveIntensity: 0.8
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      mainGroup.add(nodeMesh);
      claimNodes.push(nodeMesh);
    }

    // Interactive Drag Orbit Controls (Vanilla Three.js)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.005, y: 0.008 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      mainGroup.rotation.y += deltaX * 0.01;
      mainGroup.rotation.x += deltaY * 0.01;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!isDragging) {
        mainGroup.rotation.y += rotationVelocity.y;
        mainGroup.rotation.x += rotationVelocity.x * 0.5;
      }

      torus1.rotation.z += 0.015;
      torus2.rotation.y += 0.018;
      cageMesh.rotation.y -= 0.005;

      // Orbit claim nodes
      claimNodes.forEach((node, idx) => {
        const angle = time * 0.8 + (idx * Math.PI * 2) / nodeCount;
        const radius = 2.4 + Math.sin(time + idx) * 0.3;
        const yOffset = Math.sin(time * 1.5 + idx) * 0.8;
        node.position.set(radius * Math.cos(angle), yOffset, radius * Math.sin(angle));
      });

      // Central pulse
      const pulse = 1.0 + Math.sin(time * 3) * 0.06;
      coreMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);

      coreGeo.dispose();
      coreMat.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      torus1Geo.dispose();
      torus1Mat.dispose();
      torus2Geo.dispose();
      torus2Mat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      claimNodes.forEach(n => {
        n.geometry.dispose();
        (n.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (container && domElement && container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [isOpen, wireframeMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                3D Interactive Verification Matrix
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  WebGL 3D Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400 hidden sm:block">
                Drag to rotate · Explore the 3D Private Candidate Core and Orbital Verification Gimbals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                wireframeMode
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {wireframeMode ? 'Solid Shader' : 'Holo Wireframe'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing bg-radial from-slate-900 via-slate-950 to-slate-950">
          <div ref={containerRef} className="w-full h-full" />

          {/* Floating Instructions Banner */}
          <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-300 backdrop-blur-sm pointer-events-none flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Interactive: Click & drag to rotate 3D assembly in space</span>
          </div>

          {/* Subsystem Navigator Cards (Bottom) */}
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-1 sm:grid-cols-4 gap-2 z-10 pointer-events-auto">
            {subsystems.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubsystem(sub.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedSubsystem === sub.id
                    ? 'bg-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-xs font-bold text-white block mb-0.5">
                  {sub.title}
                </span>
                <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed block">
                  {sub.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
