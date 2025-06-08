import * as THREE from 'three';
import { forwardRef, useState, ForwardedRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Stars, Float, Icosahedron, shaderMaterial } from '@react-three/drei';
import { EffectComposer, GodRays, Bloom, Vignette } from '@react-three/postprocessing';
import { easing } from 'maath';

const POETIC_HIGHLIGHT_COLOR = new THREE.Color('#D8BFD8');
const POETIC_SECONDARY_COLOR = new THREE.Color('#ffaaaa');
const POETIC_BACKGROUND_COLOR = '#0c0e1a';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_videoTexture;
  uniform float u_fadeWidth;

  void main() {
    vec4 videoColor = texture2D(u_videoTexture, vUv);

    // tinh alpha theo chieu x
    float alphaX = smoothstep(0.0, u_fadeWidth, vUv.x) * (1.0 - smoothstep(1.0 - u_fadeWidth, 1.0, vUv.x));
    // tinh alpha theo chieu y
    float alphaY = smoothstep(0.0, u_fadeWidth, vUv.y) * (1.0 - smoothstep(1.0 - u_fadeWidth, 1.0, vUv.y));
    
    // ket hop alpha
    float finalAlpha = alphaX * alphaY;

    gl_FragColor = vec4(videoColor.rgb, videoColor.a * finalAlpha);
  }
`;

const BorderlessVideoMaterial = shaderMaterial(
  { u_videoTexture: new THREE.Texture(), u_fadeWidth: 0.3 },
  vertexShader,
  fragmentShader
);

extend({ BorderlessVideoMaterial });

// dieu khien cam
function Rig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [Math.sin(-state.pointer.x) * 4, state.pointer.y * 2.5, 15 + Math.cos(state.pointer.x) * 4],
      0.2,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// man hinh video ko vien
const BorderlessScreen = forwardRef<THREE.Mesh>((_props, forwardRef) => {
  const [videoTexture] = useState(() => {
    const video = document.createElement('video');
    video.src = '/10.mp4';
    video.crossOrigin = 'Anonymous';
    video.loop = true;
    video.muted = true;
    video.play();
    return new THREE.VideoTexture(video);
  });

  return (
    <mesh ref={forwardRef} position={[0, 0, -4]}>
      <planeGeometry args={[12, 7.5]} />
      {/* @ts-ignore */}
      <borderlessVideoMaterial u_videoTexture={videoTexture} transparent={true} />
    </mesh>
  );
});

// cac khoi tinh the
function FloatingCrystals() {
  return (
    <>
      <Float rotationIntensity={1.5} floatIntensity={2} speed={1.2}>
        <Icosahedron args={[0.8, 4]} position={[3, 2.5, -1]}>
          <meshPhongMaterial color={POETIC_HIGHLIGHT_COLOR} shininess={100} specular={0x888888} />
        </Icosahedron>
      </Float>
       <Float rotationIntensity={2} floatIntensity={3} speed={1.5}>
          <Icosahedron args={[0.5, 4]} position={[-3, -1.5, 0]}>
            <meshPhongMaterial color={POETIC_SECONDARY_COLOR} shininess={100} specular={0x888888} />
          </Icosahedron>
      </Float>
      <Float rotationIntensity={1} floatIntensity={2.5} speed={0.8}>
          <Icosahedron args={[0.3, 4]} position={[1.5, -0.5, -2.5]}>
             <meshPhongMaterial color={POETIC_HIGHLIGHT_COLOR} shininess={100} specular={0x888888} />
          </Icosahedron>
      </Float>
    </>
  );
}

// ket hop hieu ung
function ScreenAndEffects() {
  const [emitterMesh, setEmitterMesh] = useState<THREE.Mesh | null>(null);

  return (
    <>
      <BorderlessScreen ref={setEmitterMesh as ForwardedRef<THREE.Mesh>} />
      
      <EffectComposer disableNormalPass multisampling={0}>
        {emitterMesh ? <GodRays sun={emitterMesh} exposure={0.28} decay={0.82} blur /> : null}
        <Bloom
          mipmapBlur
          luminanceThreshold={0.1}
          luminanceSmoothing={0}
          intensity={0.75}
          kernelSize={5}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </>
  );
}


export function PoeticBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
          camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 1000 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          style={{pointerEvents: 'auto'}}
      >
        <color attach="background" args={[POETIC_BACKGROUND_COLOR]} />
        <ambientLight intensity={Math.PI / 18} color={POETIC_HIGHLIGHT_COLOR} />
        <pointLight color={POETIC_HIGHLIGHT_COLOR} intensity={50} distance={100} position={[0, 0, 5]} />
        
        <Stars radius={150} depth={50} count={5000} factor={4} saturation={0.8} fade speed={1.2} />
        
        <FloatingCrystals />
        
        <ScreenAndEffects />
        
        <Rig />
      </Canvas>
    </div>
  );
}