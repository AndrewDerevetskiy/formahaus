import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Environment, ContactShadows, SoftShadows } from "@react-three/drei";

type Pro3DEffectsProps = {
  warm?: boolean;
  intensity?: number;
  contactShadows?: boolean;
  background?: string;
};

export default function Pro3DEffects({
  warm = true,
  intensity = 1,
  contactShadows = true,
  background = "#ece7df",
}: Pro3DEffectsProps) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;

    scene.background = new THREE.Color(background);

    camera.position.set(4.4, 3.2, 5.2);
    camera.lookAt(0, 0.6, 0);
    camera.updateProjectionMatrix();
  }, [gl, scene, camera, background]);

  return (
    <>
      <SoftShadows size={20} samples={12} focus={0.55} />

      <ambientLight
        intensity={warm ? 0.55 * intensity : 0.48 * intensity}
        color={warm ? "#fff4e8" : "#ffffff"}
      />

      <directionalLight
        castShadow
        position={[5.5, 7.5, 4.2]}
        intensity={1.65 * intensity}
        color={warm ? "#fff2df" : "#ffffff"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.00018}
      />

      <directionalLight
        position={[-4.5, 4.2, -5.5]}
        intensity={0.42 * intensity}
        color={warm ? "#f6e4d2" : "#eaf1ff"}
      />

      <directionalLight
        position={[0, 4.5, -6]}
        intensity={0.35 * intensity}
        color={warm ? "#ead6c4" : "#ffffff"}
      />

      <rectAreaLight
        position={[0.9, 2.7, -3.25]}
        width={2.2}
        height={1.2}
        intensity={1.35 * intensity}
        color={warm ? "#fff7ed" : "#ffffff"}
      />

      <Environment preset="apartment" />

      {contactShadows && (
        <ContactShadows
          position={[0, 0.012, 0]}
          opacity={0.34}
          scale={8}
          blur={2.8}
          far={4.5}
          resolution={1024}
        />
      )}
    </>
  );
}
