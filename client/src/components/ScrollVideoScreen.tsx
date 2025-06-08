// client/src/components/ScrollVideoScreen.tsx
import * as THREE from 'three';
import React, { useState, useEffect, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { easing } from 'maath';

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
  uniform float u_opacity;

  void main() {
    vec4 videoColor = texture2D(u_videoTexture, vUv);
    float alphaX = smoothstep(0.0, u_fadeWidth, vUv.x) * (1.0 - smoothstep(1.0 - u_fadeWidth, 1.0, vUv.x));
    float alphaY = smoothstep(0.0, u_fadeWidth, vUv.y) * (1.0 - smoothstep(1.0 - u_fadeWidth, 1.0, vUv.y));
    float finalAlpha = alphaX * alphaY;
    gl_FragColor = vec4(videoColor.rgb, videoColor.a * finalAlpha * u_opacity);
  }
`;

const ScrollVideoMaterial = shaderMaterial(
  { u_videoTexture: new THREE.Texture(), u_fadeWidth: 0.3, u_opacity: 1.0 },
  vertexShader,
  fragmentShader
);
extend({ ScrollVideoMaterial });

interface VideoMeshProps {
  videoSrc: string;
  isActive: boolean;
  onFadeOutComplete: () => void;
}

const VideoMesh: React.FC<VideoMeshProps> = ({ videoSrc, isActive, onFadeOutComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

    useEffect(() => {
        let isMounted = true;
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'Anonymous';
        video.loop = false;
        video.muted = true;
        video.playsInline = true;
        
        video.play().catch(e => console.warn(`Video play prevented for ${videoSrc}:`, e));
        
        const texture = new THREE.VideoTexture(video);
        if (isMounted) {
            setVideoTexture(texture);
        }

        return () => {
            isMounted = false;
            texture.dispose();
            video.pause();
            video.srcObject = null;
            video.removeAttribute('src');
            video.load();
        };
    }, [videoSrc]);

    useFrame((_, delta) => {
        if (meshRef.current?.material) {
            // @ts-ignore
            const currentOpacity = meshRef.current.material.u_opacity;
            const targetOpacity = isActive ? 1 : 0;
            
            if (Math.abs(currentOpacity - targetOpacity) < 0.001) {
                if (targetOpacity === 0 && currentOpacity < 0.001) {
                    onFadeOutComplete();
                }
                return;
            }

            // @ts-ignore
            easing.damp(meshRef.current.material, 'u_opacity', targetOpacity, 0.6, delta);
        }
    });

    if (!videoTexture) return null;

    return (
        <mesh ref={meshRef} position={[0, 0, -10]}>
            <planeGeometry args={[16, 9]} />
            {/* @ts-ignore */}
            <scrollVideoMaterial
                u_videoTexture={videoTexture}
                u_fadeWidth={0.35}
                u_opacity={0}
                transparent={true}
            />
        </mesh>
    );
};

interface ScrollVideoScreenProps {
  videoSrc: string | null;
  isActive: boolean;
}

export const ScrollVideoScreen: React.FC<ScrollVideoScreenProps> = ({ videoSrc, isActive }) => {
  const [currentRenderedVideo, setCurrentRenderedVideo] = useState<string | null>(videoSrc);

  useEffect(() => {
    if (isActive && videoSrc) {
      setCurrentRenderedVideo(videoSrc);
    }
  }, [isActive, videoSrc]);

  const handleFadeOutComplete = () => {
    if (currentRenderedVideo !== videoSrc) {
        setCurrentRenderedVideo(null);
    }
  };
  
  if (!currentRenderedVideo) return null;

  return (
    <VideoMesh 
      videoSrc={currentRenderedVideo}
      isActive={isActive && currentRenderedVideo === videoSrc}
      onFadeOutComplete={handleFadeOutComplete}
    />
  );
};