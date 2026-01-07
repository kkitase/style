import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarViewerProps {
    topColor?: string;
    bottomColor?: string;
}

const Mannequin: React.FC<AvatarViewerProps> = ({ topColor = "#CCCCCC", bottomColor = "#333333" }) => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // 少しゆらゆらさせて生きている感を出す
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={group} position={[0, -1, 0]}>
            {/* Head */}
            <mesh position={[0, 1.7, 0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#ECCDB6" roughness={0.3} />
            </mesh>

            {/* Body (Tops) */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.25, 0.2, 0.8, 32]} />
                <meshStandardMaterial color={topColor} roughness={0.5} />
            </mesh>

            {/* Arms (Tops color or Skin) */}
            <mesh position={[-0.35, 1.1, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.08, 0.07, 0.7, 16]} />
                <meshStandardMaterial color={topColor} />
            </mesh>
            <mesh position={[0.35, 1.1, 0]} rotation={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.08, 0.07, 0.7, 16]} />
                <meshStandardMaterial color={topColor} />
            </mesh>

            {/* Legs (Bottoms) */}
            <mesh position={[-0.15, 0.4, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.9, 16]} />
                <meshStandardMaterial color={bottomColor} />
            </mesh>
            <mesh position={[0.15, 0.4, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.9, 16]} />
                <meshStandardMaterial color={bottomColor} />
            </mesh>
        </group>
    );
};

const AvatarViewer: React.FC<AvatarViewerProps> = (props) => {
    return (
        <div className="w-full h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-inner relative">
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                3D Preview
            </div>
            <Canvas shadows>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                    <Mannequin {...props} />

                    {/* <ContactShadows resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#8a6c58" /> */}
                    {/* <Environment preset="city" /> */}
                    <OrbitControls enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default AvatarViewer;
