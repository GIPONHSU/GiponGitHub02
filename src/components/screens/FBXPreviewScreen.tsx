import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SoundSystem } from '../../game/systems/SoundSystem';

// For now, we manually list the known FBX files. 
// If more are added, they can be added to this list.
const FBX_FILES = [
  'M_ZombieMan.fbx'
];

interface FBXPreviewScreenProps {
  onBack: () => void;
}

export default function FBXPreviewScreen({ onBack }: FBXPreviewScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [animations, setAnimations] = useState<string[]>([]);
  const [currentAnimIndex, setCurrentAnimIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const reqRef = useRef<number>(0);
  const modelRef = useRef<THREE.Group | null>(null);
  const animsRef = useRef<THREE.AnimationClip[]>([]);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Init Three.js
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 150, 300);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 50, 0);
    controls.update();
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(500, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    const animate = () => {
      reqRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqRef.current);
      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMsg(null);
    setAnimations([]);
    setCurrentAnimIndex(-1);

    const loader = new FBXLoader();
    loader.load(
      `/FBX/${selectedFile}`,
      (object) => {
        setIsLoading(false);
        if (modelRef.current && sceneRef.current) {
          sceneRef.current.remove(modelRef.current);
        }

        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Apply texture specifically for M_ZombieMan.fbx
        if (selectedFile === 'M_ZombieMan.fbx') {
          const tgaLoader = new TGALoader();
          tgaLoader.load('/Textures/T_ZombieMan_D.tga', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(mat => {
                    if ('map' in mat) {
                      (mat as any).map = texture;
                      mat.needsUpdate = true;
                    } else {
                      mesh.material = new THREE.MeshStandardMaterial({
                        map: texture,
                      });
                    }
                  });
                } else {
                  if (mesh.material && 'map' in mesh.material) {
                    (mesh.material as any).map = texture;
                    mesh.material.needsUpdate = true;
                  } else {
                    mesh.material = new THREE.MeshStandardMaterial({
                      map: texture,
                    });
                  }
                }
              }
            });
          });
        }

        // Center and scale a bit if needed
        object.position.set(0, 0, 0);
        modelRef.current = object;
        sceneRef.current?.add(object);

        if (object.animations && object.animations.length > 0) {
          let animationsToUse = object.animations;

          // Splice animation clips for M_ZombieMan.fbx based on frame ranges
          if (selectedFile === 'M_ZombieMan.fbx') {
            const baseClip = object.animations[0];
            const fps = 30; // Assuming 30 fps
            animationsToUse = [
              THREE.AnimationUtils.subclip(baseClip, 'Walk', 10, 55, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Jump_S', 70, 85, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Jump_L', 85, 100, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Jump_E', 100, 115, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Jump', 70, 115, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Dead', 185, 205, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Attack_S', 230, 255, fps),
              THREE.AnimationUtils.subclip(baseClip, 'Attack_E', 255, 265, fps),
            ];
          }

          animsRef.current = animationsToUse;
          setAnimations(animationsToUse.map(a => a.name || 'Unnamed Animation'));
          mixerRef.current = new THREE.AnimationMixer(object);
          setCurrentAnimIndex(0);
        } else {
          animsRef.current = [];
          mixerRef.current = null;
        }
      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        setIsLoading(false);
        setErrorMsg(`Failed to load ${selectedFile}`);
        console.error(error);
      }
    );
  }, [selectedFile]);

  useEffect(() => {
    if (currentAnimIndex >= 0 && animsRef.current.length > currentAnimIndex && mixerRef.current) {
      if (actionRef.current) {
        actionRef.current.stop();
      }
      const clip = animsRef.current[currentAnimIndex];
      const action = mixerRef.current.clipAction(clip);
      action.play();
      actionRef.current = action;
    } else {
      if (actionRef.current) {
        actionRef.current.stop();
        actionRef.current = null;
      }
    }
  }, [currentAnimIndex]);

  return (
    <div className="w-full h-full bg-slate-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col z-10 shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cyan-400">FBX Preview</h2>
          <button 
            onClick={() => {
              SoundSystem.play('Sse_03');
              onBack();
            }}
            className="text-slate-400 hover:text-white transition-colors"
            title="Press T to return"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Model List</h3>
          <div className="space-y-2">
            {FBX_FILES.map(file => (
              <button
                key={file}
                onClick={() => {
                  SoundSystem.play('Sse_03');
                  setSelectedFile(file);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedFile === file 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {file}
              </button>
            ))}
            {FBX_FILES.length === 0 && (
              <p className="text-sm text-slate-500 italic">No FBX files found</p>
            )}
          </div>
        </div>

        {animations.length > 0 && (
          <div className="flex-1 overflow-y-auto pr-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Animations ({animations.length})</h3>
            <div className="space-y-1">
              {animations.map((anim, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    SoundSystem.play('Sse_03');
                    setCurrentAnimIndex(idx);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs truncate transition-colors ${
                    currentAnimIndex === idx
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                  title={anim}
                >
                  {anim}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full outline-none" />
        
        {/* Overlays */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
              <p className="text-cyan-400 font-medium tracking-widest text-sm animate-pulse">LOADING MODEL...</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
            <div className="bg-red-950/80 border border-red-500/50 p-6 rounded-lg text-center max-w-md">
              <p className="text-red-400 font-medium mb-2">{errorMsg}</p>
              <button 
                onClick={() => setErrorMsg(null)}
                className="px-4 py-2 bg-red-900/50 text-red-200 rounded text-sm hover:bg-red-800/50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!selectedFile && !isLoading && !errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <p className="text-slate-500 text-sm tracking-widest uppercase">Select a model from the list</p>
          </div>
        )}

        {/* Controls Hint */}
        {selectedFile && !isLoading && (
          <div className="absolute bottom-4 right-4 pointer-events-none z-10">
            <div className="bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded text-xs text-slate-400 flex flex-col gap-1">
              <div className="flex justify-between gap-4">
                <span>Left Click</span>
                <span className="text-slate-300">Rotate</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Right Click</span>
                <span className="text-slate-300">Pan</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Scroll</span>
                <span className="text-slate-300">Zoom</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
