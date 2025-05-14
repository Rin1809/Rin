// client/src/components/common/MemoizedParticlesComponent.tsx
import React from 'react';
import Particles from "@tsparticles/react";
import type { ISourceOptions, Container } from "@tsparticles/engine";

export interface MemoizedParticlesProps {
    id: string;
    options: ISourceOptions;
    particlesLoaded?: (container?: Container) => Promise<void>;
}

const MemoizedParticlesComponent = React.memo<MemoizedParticlesProps>(({ id, options, particlesLoaded }) => {
    return (
        <Particles
            id={id}
            options={options}
            particlesLoaded={particlesLoaded}
        />
    );
});
MemoizedParticlesComponent.displayName = 'MemoizedParticlesComponent';

export default MemoizedParticlesComponent;