import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeVerificationGateProps {
  isLoading: boolean;
  hasResult: boolean;
  hasAbstained: boolean;
  interactive?: boolean;
}

export const ThreeVerificationGate: React.FC<ThreeVerificationGateProps> = ({
  isLoading,
  hasResult,
  hasAbstained,
  interactive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x10b981, 3, 20); // emerald
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 3, 20); // cyan
    pointLight2.position.set(-4, -4, 4);
    scene.add(pointLight2);

    // 3. Central 3D Verification Gate (Hierarchical THREE.Group)
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    // Central Core: Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.6,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gateGroup.add(coreMesh);

    // Inner Solid Sphere (Private Buffer Core)
    const innerGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x022c22,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.85
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    gateGroup.add(innerMesh);

    // Ring 1: Equatorial Verification Gimbal
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.04, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    gateGroup.add(ring1);

    // Ring 2: Polar Orbital Gimbal
    const ring2Geo = new THREE.TorusGeometry(2.6, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2;
    gateGroup.add(ring2);

    // Ring 3: Oblique Shield Gate
    const ring3Geo = new THREE.TorusGeometry(3.0, 0.02, 16, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 4;
    ring3.rotation.y = Math.PI / 4;
    gateGroup.add(ring3);

    // 4. Floating Evidence & Claim Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      // Default palette: emerald and cyan
      if (Math.random() > 0.3) {
        colors[i * 3] = 0.06; // R
        colors[i * 3 + 1] = 0.72; // G (emerald)
        colors[i * 3 + 2] = 0.51; // B
      } else {
        colors[i * 3] = 0.02; // R
        colors[i * 3 + 1] = 0.71; // G (cyan)
        colors[i * 3 + 2] = 0.83; // B
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Mouse Interaction Parallax
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotationY = x * 0.8;
      targetRotationX = -y * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic rotation speed based on state
      const speedMultiplier = isLoading ? 2.8 : 1.0;

      gateGroup.rotation.y += 0.008 * speedMultiplier;
      gateGroup.rotation.x += 0.004 * speedMultiplier;

      ring1.rotation.z += 0.015 * speedMultiplier;
      ring2.rotation.y += 0.012 * speedMultiplier;
      ring3.rotation.z -= 0.008 * speedMultiplier;

      // Core pulse
      const pulse = Math.sin(elapsedTime * 2.5 * speedMultiplier) * 0.08 + 1.0;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Particle system gentle rotation
      particleSystem.rotation.y += 0.002 * speedMultiplier;
      particleSystem.rotation.x += 0.001 * speedMultiplier;

      // Color shifts based on verification state
      if (hasAbstained) {
        coreMat.color.setHex(0xf43f5e); // rose
        coreMat.emissive.setHex(0xbe123c);
        pointLight1.color.setHex(0xf43f5e);
      } else if (hasResult) {
        coreMat.color.setHex(0x10b981); // emerald
        coreMat.emissive.setHex(0x059669);
        pointLight1.color.setHex(0x10b981);
      } else if (isLoading) {
        coreMat.color.setHex(0x06b6d4); // cyan
        coreMat.emissive.setHex(0x0891b2);
        pointLight1.color.setHex(0x06b6d4);
      }

      // Smooth camera damping with mouse
      gateGroup.rotation.y += (targetRotationY - gateGroup.rotation.y) * 0.05;
      gateGroup.rotation.x += (targetRotationX - gateGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isLoading, hasResult, hasAbstained]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden pointer-events-none select-none"
    />
  );
};
