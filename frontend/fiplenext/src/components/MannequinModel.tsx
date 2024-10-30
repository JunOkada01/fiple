import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface MannequinModelProps {
  height: number;
  weight: number;
}




const MannequinModel: React.FC<MannequinModelProps> = ({ height, weight }) => {

  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const scale = height / 180;
  const widthScale = weight / 70;

  const loadModel = async () => {
    console.log("debug2")
    try {
      const { scene } = await useGLTF('/models/mannequin.glb');
      setModel(scene);
    } catch(e) {
      console.log(e)
    }
    console.log("debug2-1");
  }

  useEffect(() => {
    loadModel();
  }, [model]);

  return (
    <Canvas style={{ height: '100%', width: '100%' }} camera={{ position: [0, 1, 2] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      {/* モデル読み込み中のFallbackコンポーネント */}
      {model &&
        <Suspense fallback={<div>Loading...</div>}>
          <primitive
            object={model}
            scale={[scale * widthScale, scale, scale * widthScale]}
            position={[0, -1, 0]}
          />
        </Suspense>
      }

      <OrbitControls />
    </Canvas>
  );
};

export default MannequinModel;
