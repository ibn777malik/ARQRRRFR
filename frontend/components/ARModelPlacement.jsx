import { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { XR, useXR, Interactive } from '@react-three/xr';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AR Model Placement Component
 * 
 * This component enables placing 3D models in AR environments using WebXR.
 * It handles hit testing, model positioning, scaling, and rotation.
 */
const ARModelPlacement = ({ 
  modelUrl, 
  initialScale = 1,
  allowScaling = true,
  allowRotation = true,
  onPlaced = () => {},
  onInteraction = () => {}
}) => {
  // State
  const [model, setModel] = useState(null);
  const [placed, setPlaced] = useState(false);
  const [initialHitPose, setInitialHitPose] = useState(null);
  const [scale, setScale] = useState(initialScale);
  
  // Refs
  const modelGroupRef = useRef();
  const fingerDistanceRef = useRef(0);
  const lastTouchRotationRef = useRef(0);

  // XR session and XR state
  const { isPresenting } = useXR();
  const { gl, camera, scene } = useThree();
  
  // Load the model
  useEffect(() => {
    if (!modelUrl) return;
    
    const loader = new THREE.GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        // Create a copy of the scene
        const modelScene = gltf.scene.clone();
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(modelScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate appropriate scale
        const maxDim = Math.max(size.x, size.y, size.z);
        const normalizedScale = 1 / maxDim;
        
        // Center the model
        modelScene.position.set(
          -center.x * normalizedScale,
          -center.y * normalizedScale,
          -center.z * normalizedScale
        );
        
        // Apply initial scale
        modelScene.scale.multiplyScalar(normalizedScale * initialScale);
        
        // Optimize the model for AR
        modelScene.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Improve material quality
            if (node.material) {
              // Enhance material properties for AR
              node.material.envMapIntensity = 1.5;
              node.material.needsUpdate = true;
            }
          }
        });
        
        setModel(modelScene);
      },
      // onProgress
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      // onError
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }, [modelUrl, initialScale]);
  
  // Set up hit testing when XR session starts
  useEffect(() => {
    if (!isPresenting || !model) return;
    
    let hitTestSource = null;
    let hitTestSourceRequested = false;

    // XR session and reference space setup
    const onSessionStart = async () => {
      const session = gl.xr.getSession();
      
      session.addEventListener('select', onSelect);
      
      // Listen for touch events for scaling and rotation
      if (allowScaling || allowRotation) {
        session.addEventListener('touchstart', onTouchStart);
        session.addEventListener('touchmove', onTouchMove);
        session.addEventListener('touchend', onTouchEnd);
      }
      
      // Set up hit testing
      const viewerReferenceSpace = await session.requestReferenceSpace('viewer');
      hitTestSource = await session.requestHitTestSource({ space: viewerReferenceSpace });
      
      hitTestSourceRequested = true;
    };
    
    // Handle placing the model on select event
    const onSelect = (event) => {
      if (placed) {
        // If already placed, log interaction
        onInteraction('interact_with_model');
        return;
      }
      
      if (initialHitPose) {
        setPlaced(true);
        onPlaced(initialHitPose);
        onInteraction('place_model');
      }
    };
    
    // Touch event handlers for multitouch gestures
    const onTouchStart = (event) => {
      const touches = event.touches;
      
      if (touches.length === 2) {
        // Two finger touch - for scaling
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        fingerDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      } else if (touches.length === 1 && placed) {
        // Single finger touch - for rotation
        lastTouchRotationRef.current = touches[0].clientX;
      }
    };
    
    const onTouchMove = (event) => {
      const touches = event.touches;
      
      if (!placed) return;
      
      if (touches.length === 2 && allowScaling) {
        // Handle scaling with two fingers
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const scaleChange = distance / fingerDistanceRef.current;
        const newScale = scale * scaleChange;
        
        // Apply scale limits
        const limitedScale = Math.max(0.2, Math.min(3.0, newScale));
        
        if (modelGroupRef.current) {
          modelGroupRef.current.scale.set(limitedScale, limitedScale, limitedScale);
        }
        
        setScale(limitedScale);
        fingerDistanceRef.current = distance;
        
        onInteraction('scale_model');
      } else if (touches.length === 1 && allowRotation && placed) {
        // Handle rotation with one finger
        const currentX = touches[0].clientX;
        const rotationDelta = (currentX - lastTouchRotationRef.current) * 0.01;
        
        if (modelGroupRef.current) {
          modelGroupRef.current.rotation.y += rotationDelta;
        }
        
        lastTouchRotationRef.current = currentX;
        onInteraction('rotate_model');
      }
    };
    
    const onTouchEnd = () => {
      // Reset references when touch ends
      fingerDistanceRef.current = 0;
      lastTouchRotationRef.current = 0;
    };
    
    // Set up XR session
    if (isPresenting && !hitTestSourceRequested) {
      onSessionStart();
    }
    
    // Cleanup on unmount
    return () => {
      if (hitTestSource) {
        hitTestSource.cancel();
        hitTestSource = null;
      }
      
      if (gl.xr.getSession()) {
        const session = gl.xr.getSession();
        session.removeEventListener('select', onSelect);
        
        if (allowScaling || allowRotation) {
          session.removeEventListener('touchstart', onTouchStart);
          session.removeEventListener('touchmove', onTouchMove);
          session.removeEventListener('touchend', onTouchEnd);
        }
      }
    };
  }, [
    isPresenting, 
    model, 
    gl.xr, 
    placed, 
    initialHitPose, 
    allowScaling, 
    allowRotation, 
    scale, 
    onPlaced, 
    onInteraction
  ]);
  
  // Frame loop for hit testing and model placement
  useFrame((state, delta) => {
    if (!isPresenting || !modelGroupRef.current || !model) return;
    
    const xrFrame = state.gl.xr.getFrame();
    if (!xrFrame) return;
    
    // Get hit test results
    const hitTestResults = xrFrame.getHitTestResults(state.gl.xr.getSession().requestHitTestSource);
    
    if (hitTestResults.length) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(state.gl.xr.getReferenceSpace());
      
      if (pose) {
        if (!placed) {
          // Update position based on hit test if not placed
          modelGroupRef.current.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );
          
          // Save initial hit pose
          if (!initialHitPose) {
            setInitialHitPose(pose);
          }
        }
      }
    }
    
    // Gentle hovering animation when not placed
    if (!placed && modelGroupRef.current) {
      modelGroupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
    }
  });
  
  // No need to render if we're not in XR or don't have a model
  if (!isPresenting || !model) return null;
  
  return (
    <group ref={modelGroupRef}>
      {model && <primitive object={model} />}
      
      {/* Add a simple shadow plane beneath the model */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.001, 0]} 
        receiveShadow
      >
        <planeGeometry args={[0.5, 0.5]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
      {/* Placement indicator when not placed */}
      {!placed && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.2, 32]} />
          <meshBasicMaterial color="#0080ff" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

/**
 * ARExperience wrapper component
 * Sets up the XR environment and handles AR session
 */
export const ARExperience = ({
  modelUrl,
  initialScale = 1,
  allowScaling = true,
  allowRotation = true,
  onPlaced = () => {},
  onInteraction = () => {},
  children
}) => {
  const [arSupported, setARSupported] = useState(false);
  
  // Check if WebXR is supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then((supported) => {
          setARSupported(supported);
        })
        .catch(() => {
          setARSupported(false);
        });
    } else {
      setARSupported(false);
    }
  }, []);
  
  if (!arSupported) {
    return (
      <div className="ar-not-supported">
        <div className="message">
          <p>AR is not supported on your device or browser.</p>
          <p>Please try using a compatible AR device or browser.</p>
        </div>
        {children}
      </div>
    );
  }
  
  return (
    <XR>
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      
      <ARModelPlacement
        modelUrl={modelUrl}
        initialScale={initialScale}
        allowScaling={allowScaling}
        allowRotation={allowRotation}
        onPlaced={onPlaced}
        onInteraction={onInteraction}
      />
      
      {children}
    </XR>
  );
};

export default ARModelPlacement;