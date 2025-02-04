import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface MannequinModelProps {
  height: number;
  weight: number;
}

// 3Dモデルを表示するコンポーネント
function Model({ height, weight }: MannequinModelProps) {
  const { scene } = useGLTF('/models/mannequin.glb');
  const scale = height / 180;
  const widthScale = weight / 70;

  return (
    <primitive
      object={scene}
      scale={[scale * widthScale, scale, scale * widthScale]}
      position={[0, -1, 0]}
    />
  );
}

const MannequinModel: React.FC<MannequinModelProps> = ({ height, weight }) => {
  return (
    <Canvas style={{ height: '100%', width: '100%', }} camera={{ position: [0, 1, 2] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model height={height} weight={weight} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
};

// モデルのプリロード
useGLTF.preload('/models/mannequin.glb');

export default MannequinModel;