"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function SnowParticles() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const positions = ref.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < 1500; i++) {
      positions[i * 3 + 1] -= delta * 1.5;

      positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002;

      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 10; // Back to top
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

export default function WorldBackground({ isSnowing }: { isSnowing: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {isSnowing && (
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <fog attach="fog" args={["black", 5, 15]} />
          <SnowParticles />
        </Canvas>
      )}
    </div>
  );
}
