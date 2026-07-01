import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';

class Zombie3DRenderer {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    model: THREE.Group | null = null;
    mixer: THREE.AnimationMixer | null = null;
    walkAction: THREE.AnimationAction | null = null;
    deadAction: THREE.AnimationAction | null = null;
    isLoaded = false;
    
    size = 256; 
    
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.size, this.size);
        this.renderer.setClearColor(0x000000, 0);
        
        this.scene = new THREE.Scene();
        
        const d = 100;
        this.camera = new THREE.OrthographicCamera(-d, d, d, -d, 1, 1000);
        this.camera.position.set(0, 300, 0);
        this.camera.up.set(0, 0, -1);
        this.camera.lookAt(0, 0, 0);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(100, 200, 100);
        this.scene.add(dirLight);
        
        this.loadModel();
    }
    
    loadModel() {
        const loader = new FBXLoader();
        loader.load('/FBX/M_ZombieMan.fbx', (object) => {
            const tgaLoader = new TGALoader();
            tgaLoader.load('/Textures/T_ZombieMan_D.tga', (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                object.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.material = new THREE.MeshStandardMaterial({
                            map: texture,
                            skinning: true
                        });
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.model = object;
                this.scene.add(object);
                
                if (object.animations && object.animations.length > 0) {
                    const baseClip = object.animations[0];
                    const fps = 30;
                    const walkClip = THREE.AnimationUtils.subclip(baseClip, 'Walk', 10, 55, fps);
                    const deadClip = THREE.AnimationUtils.subclip(baseClip, 'Dead', 185, 205, fps);
                    
                    this.mixer = new THREE.AnimationMixer(object);
                    this.walkAction = this.mixer.clipAction(walkClip);
                    this.deadAction = this.mixer.clipAction(deadClip);
                    
                    this.walkAction.play();
                    this.walkAction.setEffectiveWeight(1);
                    this.deadAction.play();
                    this.deadAction.setEffectiveWeight(0);
                }
                
                this.isLoaded = true;
            });
        });
    }
    
    getFrame(isDead: boolean, animTime: number): HTMLCanvasElement | null {
        if (!this.isLoaded || !this.mixer || !this.model || !this.walkAction || !this.deadAction) return null;
        
        this.walkAction.setEffectiveWeight(isDead ? 0 : 1);
        this.deadAction.setEffectiveWeight(isDead ? 1 : 0);
        
        if (isDead) {
            this.deadAction.time = Math.min(animTime, this.deadAction.getClip().duration);
        } else {
            this.walkAction.time = animTime % this.walkAction.getClip().duration;
        }
        
        this.mixer.update(0);
        
        // We want the 2D sprite to face UP (-Y) when un-rotated, because the green zombie sprite faces UP.
        // In our 3D camera, UP on the screen is -Z.
        // FBX models usually face +Z by default.
        // So we rotate the model by Math.PI.
        this.model.rotation.y = Math.PI; 
        
        this.renderer.render(this.scene, this.camera);
        
        return this.renderer.domElement;
    }
}

export const zombie3D = new Zombie3DRenderer();
