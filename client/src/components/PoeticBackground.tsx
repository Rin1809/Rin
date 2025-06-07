import * as THREE from 'three';
import { forwardRef, useState, useEffect, ForwardedRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CubeCamera, Float, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, GodRays, Bloom } from '@react-three/postprocessing';
import { easing } from 'maath';

const POETIC_HIGHLIGHT_COLOR = '#D8BFD8';
const POETIC_BACKGROUND_COLOR = '#0c0e1a';
const POETIC_FLOOR_COLOR = '#1a1a2e';

function Rig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [5 + state.pointer.x, 0 + +state.pointer.y, 18 + Math.atan2(state.pointer.x, state.pointer.y) * 2],
      0.4,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

const Floor = () => (
  <mesh position={[0, -5.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[50, 50]} />
    <MeshReflectorMaterial
      blur={[300, 50]}
      resolution={1024}
      mixBlur={1}
      mixStrength={60}
      roughness={1}
      depthScale={1.2}
      minDepthThreshold={0.4}
      maxDepthThreshold={1.4}
      color={POETIC_FLOOR_COLOR}
      metalness={0.8}
    />
  </mesh>
);

const Emitter = forwardRef<THREE.Mesh>((_props, forwardRef) => {
  const [video] = useState(() =>
    Object.assign(document.createElement('video'), { src: '/10.mp4', crossOrigin: 'Anonymous', loop: true, muted: true })
  );
  useEffect(() => void video.play(), [video]);
  return (
    <mesh ref={forwardRef} position={[0, 0, -16]}>
      <planeGeometry args={[16, 10]} />
      <meshBasicMaterial color={POETIC_HIGHLIGHT_COLOR}>
        <videoTexture attach="map" args={[video]} colorSpace={THREE.SRGBColorSpace} />
      </meshBasicMaterial>
      <mesh scale={[16.05, 10.05, 1]} position={[0, 0, -0.01]}>
        <planeGeometry />
        <meshBasicMaterial color="black" />
      </mesh>
    </mesh>
  );
});

function Screen() {
  const [material, set] = useState<THREE.MeshBasicMaterial | null>(null);
  return (
    <>
      <Emitter ref={set as ForwardedRef<THREE.Mesh>} />
      {material && (
        <EffectComposer disableNormalPass multisampling={8}>
          <GodRays sun={material} exposure={0.25} decay={0.85} blur />
          <Bloom luminanceThreshold={0.1} mipmapBlur luminanceSmoothing={0.0} intensity={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

export function PoeticBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
          camera={{ position: [0, 0, 30], fov: 35, near: 1, far: 60 }}
          gl={{ antialias: false }}
          style={{pointerEvents: 'auto'}}
      >
        <color attach="background" args={[POETIC_BACKGROUND_COLOR]} />
        <ambientLight color={POETIC_HIGHLIGHT_COLOR} intensity={0.15} />

        <Screen />

        <Float rotationIntensity={2.5} floatIntensity={2.5} speed={1}>
          <CubeCamera position={[-3, -1, -5]} resolution={256} frames={Infinity}>
            {(texture) => (
              <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial metalness={1} roughness={0.1} envMap={texture} />
              </mesh>
            )}
          </CubeCamera>
        </Float>

        <Floor />
        <Rig />
      </Canvas>
    </div>
  );
}