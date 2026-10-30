import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowDown, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function ComplexVerificationCore({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Mouse parallax tracking
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !coreRef.current || !ring1Ref.current || !ring2Ref.current || !ring3Ref.current || !particlesRef.current) return;

    const time = state.clock.getElapsedTime();

    // Mouse interpolation
    const targetX = mouse.current.x * 0.5;
    const targetY = mouse.current.y * 0.5;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX + scrollProgress.current * Math.PI * 2, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.06);

    // Complex animation of sub-components
    coreRef.current.rotation.x = time * 0.4;
    coreRef.current.rotation.y = time * 0.3;

    ring1Ref.current.rotation.z = time * 0.6;
    ring1Ref.current.rotation.x = time * 0.2;

    ring2Ref.current.rotation.y = -time * 0.5;
    ring2Ref.current.rotation.z = time * 0.3;

    ring3Ref.current.rotation.x = time * 0.4;
    ring3Ref.current.rotation.y = -time * 0.6;

    particlesRef.current.rotation.y = time * 0.1;
  });

  // Particle cloud data
  const [positions, colors] = React.useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color('#10b981');
    const c2 = new THREE.Color('#06b6d4');

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.5 + Math.random() * 2.5;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixed = c1.clone().lerp(c2, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
        {/* Central Complex Core (Octahedron inside Icosahedron) */}
        <mesh ref={coreRef} castShadow receiveShadow>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshPhysicalMaterial
            color="#10b981"
            emissive="#047857"
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            wireframe={false}
          />
        </mesh>

        {/* Inner Glowing Crystal */}
        <mesh>
          <octahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.9}
            wireframe={true}
          />
        </mesh>

        {/* Ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.4, 0.05, 16, 100]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.7} metalness={0.9} />
        </mesh>

        {/* Ring 2 */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[3.0, 0.04, 16, 100]} />
          <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.7} metalness={0.9} />
        </mesh>

        {/* Ring 3 */}
        <mesh ref={ring3Ref}>
          <torusGeometry args={[3.6, 0.03, 16, 80]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" wireframe transparent opacity={0.5} />
        </mesh>

        {/* Orbiting Evidence Particles */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.07}
            vertexColors
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </Float>
    </group>
  );
}

export const AwwwardsHero3D: React.FC = () => {
  const scrollProgress = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        }
      });

      gsap.fromTo(
        heroTextRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power3.out', delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[125vh] bg-slate-950 overflow-hidden">
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 0, 9], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={45} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 10, 6]} intensity={2.5} castShadow />
          <pointLight position={[-6, -6, -6]} intensity={1.5} color="#06b6d4" />
          <pointLight position={[0, 6, -4]} intensity={1.0} color="#10b981" />

          <Suspense fallback={null}>
            <ComplexVerificationCore scrollProgress={scrollProgress} />
            <Environment preset="city" />
            <ContactShadows position={[0, -4, 0]} opacity={0.7} scale={18} blur={3} far={12} />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML / Tailwind Minimalist Text Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-16 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-300">
              VerifyFirst AI · Immersive 3D Experience
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 font-mono text-xs text-slate-400">
            <span>[ WEBGL 3D ACTIVE ]</span>
            <span>GSAP SCROLL TIMELINE</span>
          </div>
        </div>

        <div ref={heroTextRef} className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Award-Winning Creative Tech & Agentic Architecture</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tighter leading-none">
            AI CAN ANSWER. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              CAN IT PROVE IT?
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            An evidence-first intelligence system powered by NVIDIA Nemotron and deterministic code execution. We check claims, validate sources, catch errors, and verify answers before release.
          </p>

          <div className="flex items-center gap-4 pointer-events-auto pt-2">
            <a
              href="#workspace"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 transform hover:scale-105"
            >
              <span>Launch Verification Core</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300 bg-slate-900/80 px-4.5 py-3.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              <span>Zero-Hallucination Gate</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between font-mono text-xs text-slate-500">
          <div>
            <p className="text-slate-300">NVIDIA x NEBIUS HACKATHON</p>
            <p className="text-emerald-400">BEST APPS & AGENTS TRACK</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL-TIME SHADER PIPELINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
