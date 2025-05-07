import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// This component handles the AR view of a 3D model
export default function ARView({ modelUrl, scale = 0.5, position = [0, 0, -0.5] }) {
  const modelRef = useRef();
  const { camera } = useThree();
  
  // Load the GLTF model
  const { scene } = useGLTF(modelUrl);
  
  useEffect(() => {
    if (scene) {
      // Clone the scene to avoid modification of the cached original
      const clonedScene = scene.clone();
      
      // Center the model
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());
      
      clonedScene.position.x = -center.x;
      clonedScene.position.y = -center.y;
      clonedScene.position.z = -center.z;
      
      // Set the model to the ref
      modelRef.current.add(clonedScene);
    }
    
    // Clean up on unmount
    return () => {
      if (modelRef.current) {
        while (modelRef.current.children.length) {
          const object = modelRef.current.children[0];
          modelRef.current.remove(object);
        }
      }
    };
  }, [scene]);
  
  // Gentle rotation animation
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });
  
  // Place the model in front of the camera initially
  useEffect(() => {
    const placementPosition = new THREE.Vector3(0, 0, -1).applyMatrix4(camera.matrixWorld);
    modelRef.current.position.copy(placementPosition);
  }, [camera]);
  
  return (
    <group
      ref={modelRef}
      position={position}
      scale={[scale, scale, scale]}
      dispose={null}
    />
  );
}