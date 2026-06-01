"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "./ThemeProvider";

const PARTICLE_COUNT = 1200;

function Particles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.5;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.02;
      ref.current.rotation.x += dt * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GoldenRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.05;
      ref.current.rotation.z += dt * 0.03;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <torusGeometry args={[3.2, 0.012, 16, 256]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

export default function AmbientScene() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const particleColor = isDark ? "#c9a84c" : "#5a7c3a";
  const ringColor = isDark ? "#8b0000" : "#b8960c";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <Particles color={particleColor} />
        <GoldenRing color={ringColor} />
      </Canvas>
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.9) 100%)"
            : "radial-gradient(ellipse at center, rgba(250,248,240,0) 30%, rgba(250,248,240,0.5) 80%, rgba(250,248,240,0.9) 100%)",
        }}
      />
    </div>
  );
}
