import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader.js";

interface ModelData {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  walkAction: THREE.AnimationAction;
  deadAction: THREE.AnimationAction;
  attackAction: THREE.AnimationAction;
  jumpEAction?: THREE.AnimationAction;
  headBone?: THREE.Object3D;
}

class Zombie3DRenderer {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;

  models: {
    man?: ModelData;
    girl?: ModelData;
    bombman?: ModelData;
    mummy?: ModelData;
    dog?: ModelData;
    football?: ModelData;
  } = {};

  get isLoaded() {
    return (
      !!this.models.man &&
      !!this.models.girl &&
      !!this.models.bombman &&
      !!this.models.mummy &&
      !!this.models.dog &&
      !!this.models.football
    );
  }

  size = 512;

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

    this.loadModels();
  }

  loadModels() {
    const fbxLoader = new FBXLoader();
    const tgaLoader = new TGALoader();
    const texLoader = new THREE.TextureLoader();

    // Load Man
    fbxLoader.load("/FBX/M_ZombieMan.fbx", (object) => {
      tgaLoader.load("/Textures/T_ZombieMan_D.tga", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        let headBone: THREE.Object3D | undefined;
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              map: texture,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.includes("Head") && !child.name.includes("Nub")) {
            headBone = child;
          }
        });

        object.visible = false;
        object.scale.set(1.2, 1.2, 1.2);

        this.scene.add(object);

        if (object.animations && object.animations.length > 0) {
          const baseClip = object.animations[0];
          const fps = 30;
          const walkClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Walk",
            10,
            55,
            fps,
          );
          const deadClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Dead",
            185,
            205,
            fps,
          );
          const attackClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Attack_E",
            255,
            265,
            fps,
          );

          const mixer = new THREE.AnimationMixer(object);
          const walkAction = mixer.clipAction(walkClip);
          const deadAction = mixer.clipAction(deadClip);
          const attackAction = mixer.clipAction(attackClip);

          walkAction.play();
          walkAction.setEffectiveWeight(1);
          deadAction.play();
          deadAction.setEffectiveWeight(0);
          attackAction.play();
          attackAction.setEffectiveWeight(0);

          this.models.man = {
            model: object,
            mixer,
            walkAction,
            deadAction,
            attackAction,
            headBone,
          };
        }
      });
    });

    // Load Girl
    fbxLoader.load("/FBX/M_ZombieGirl.fbx", (object) => {
      texLoader.load("/Textures/T_ZombieGirl_Diffuse.png", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        let headBone: THREE.Object3D | undefined;
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              map: texture,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.includes("Head") && !child.name.includes("Nub")) {
            headBone = child;
          }
        });

        object.visible = false;
        object.scale.set(1.2, 1.2, 1.2);

        this.scene.add(object);

        if (object.animations && object.animations.length > 0) {
          const baseClip = object.animations[0];
          const fps = 30;
          const walkClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Walk",
            90,
            130,
            fps,
          );
          const deadClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Dead",
            140,
            161,
            fps,
          );
          const attackClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Attack_E",
            215,
            225,
            fps,
          );

          const mixer = new THREE.AnimationMixer(object);
          const walkAction = mixer.clipAction(walkClip);
          const deadAction = mixer.clipAction(deadClip);
          const attackAction = mixer.clipAction(attackClip);

          walkAction.play();
          walkAction.setEffectiveWeight(1);
          deadAction.play();
          deadAction.setEffectiveWeight(0);
          attackAction.play();
          attackAction.setEffectiveWeight(0);

          this.models.girl = {
            model: object,
            mixer,
            walkAction,
            deadAction,
            attackAction,
            headBone,
          };
        }
      });
    });

    // Load Bombman
    fbxLoader.load("/FBX/BombMan_Skin.fbx", (object) => {
      texLoader.load("/Textures/T_Bombman_Diffuse.png", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        let headBone: THREE.Object3D | undefined;
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              map: texture,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.includes("Head") && !child.name.includes("Nub")) {
            headBone = child;
          }
        });

        object.visible = false;
        object.scale.set(0.48, 0.48, 0.48); // Reduce size by 20%
        this.scene.add(object);

        if (object.animations && object.animations.length > 0) {
          const baseClip = object.animations[0];
          const fps = 30;
          const walkClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Walk",
            10,
            30,
            fps,
          );
          const deadClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Dead02",
            50,
            90,
            fps,
          );
          const attackClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Hurt01",
            100,
            198,
            fps,
          );

          const mixer = new THREE.AnimationMixer(object);
          const walkAction = mixer.clipAction(walkClip);
          const deadAction = mixer.clipAction(deadClip);
          const attackAction = mixer.clipAction(attackClip);

          walkAction.play();
          walkAction.setEffectiveWeight(1);
          deadAction.play();
          deadAction.setEffectiveWeight(0);
          attackAction.play();
          attackAction.setEffectiveWeight(0);

          this.models.bombman = {
            model: object,
            mixer,
            walkAction,
            deadAction,
            attackAction,
            headBone,
          };
        }
      });
    });

    // Load Mummy
    fbxLoader.load("/FBX/Mummy_Ani.fbx", (object) => {
      texLoader.load("/Textures/T_Mummy_Diffuse.png", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        let headBone: THREE.Object3D | undefined;
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              map: texture,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.includes("Head") && !child.name.includes("Nub")) {
            headBone = child;
          }
        });

        object.visible = false;
        object.scale.set(0.36, 0.36, 0.36); // Keep it large in WebGL for high resolution -> increased by 20%
        this.scene.add(object);

        if (object.animations && object.animations.length > 0) {
          const baseClip = object.animations[0];
          const fps = 30;

          const walkClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Walk",
            10,
            124,
            fps,
          );
          const flySClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Fly_S",
            1265,
            1330,
            fps,
          );
          const deadClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Dead",
            779,
            859,
            fps,
          );

          const mixer = new THREE.AnimationMixer(object);
          const walkAction = mixer.clipAction(walkClip);
          const attackAction = mixer.clipAction(flySClip);
          const deadAction = mixer.clipAction(deadClip);

          walkAction.play();
          walkAction.setEffectiveWeight(1);
          deadAction.play();
          deadAction.setEffectiveWeight(0);
          attackAction.play();
          attackAction.setEffectiveWeight(0);

          this.models.mummy = {
            model: object,
            mixer,
            walkAction,
            deadAction,
            attackAction,
            headBone,
          };
        }
      });
    });

    // Load Dog
    fbxLoader.load("/FBX/M_ZombieDog.fbx", (object) => {
      texLoader.load("/Textures/T_ZombieDog_diffuse_A.jpg", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        let headBone: THREE.Object3D | undefined;
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                if ("map" in mat) {
                  (mat as any).map = texture;
                  (mat as any).emissiveMap = texture;
                  (mat as any).emissive = new THREE.Color(0xffffff);
                  (mat as any).emissiveIntensity = 0.5;
                  mat.needsUpdate = true;
                } else {
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    emissiveMap: texture,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.5,
                  });
                }
              });
            } else {
              if ("map" in mesh.material) {
                (mesh.material as any).map = texture;
                (mesh.material as any).emissiveMap = texture;
                (mesh.material as any).emissive = new THREE.Color(0xffffff);
                (mesh.material as any).emissiveIntensity = 0.5;
                mesh.material.needsUpdate = true;
              } else {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  emissiveMap: texture,
                  emissive: 0xffffff,
                  emissiveIntensity: 0.5,
                });
              }
            }
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.includes("Head") && !child.name.includes("Nub")) {
            headBone = child;
          }
        });

        object.visible = false;
        object.scale.set(1.2, 1.2, 1.2); // Setting dog scale to be somewhat large or standard
        this.scene.add(object);

        if (object.animations && object.animations.length > 0) {
          const baseClip = object.animations[0];
          const fps = 30;

          const walkClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Walk",
            10,
            22,
            fps,
          );
          const deadClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Dead",
            30,
            48,
            fps,
          );
          const attackClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Attack_S",
            75,
            100,
            fps,
          );

          const mixer = new THREE.AnimationMixer(object);
          const walkAction = mixer.clipAction(walkClip);
          const deadAction = mixer.clipAction(deadClip);
          const attackAction = mixer.clipAction(attackClip);

          walkAction.play();
          walkAction.setEffectiveWeight(1);
          deadAction.play();
          deadAction.setEffectiveWeight(0);
          attackAction.play();
          attackAction.setEffectiveWeight(0);

          this.models.dog = {
            model: object,
            mixer,
            walkAction,
            deadAction,
            attackAction,
            headBone,
          };
        }
      });
    });

    // Load Football Player
    fbxLoader.load("/FBX/FootballPlayer_Skin.fbx", (object) => {
      texLoader.load("/Textures/T_Football_player_D.png", (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        let headBone: THREE.Object3D | undefined;
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                if ("map" in mat) {
                  (mat as any).map = texture;
                  mat.needsUpdate = true;
                } else {
                  mesh.material = new THREE.MeshStandardMaterial({
                    map: texture,
                  });
                }
              });
            } else {
              if (mesh.material && "map" in mesh.material) {
                (mesh.material as any).map = texture;
                mesh.material.needsUpdate = true;
              } else {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: texture,
                });
              }
            }
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.name.includes("Head") && !child.name.includes("Nub")) {
            headBone = child;
          }
        });

        object.visible = false;
        object.scale.set(1.2, 1.2, 1.2); // Scale to match big zombie size
        this.scene.add(object);

        if (object.animations && object.animations.length > 0) {
          const baseClip = object.animations[0];
          const fps = 30;

          const walkClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Walk",
            220,
            280,
            fps,
          );
          const deadClip = THREE.AnimationUtils.subclip(
            baseClip,
            "Dead",
            407,
            425,
            fps,
          );
          const attackClip = THREE.AnimationUtils.subclip(
            baseClip,
            "HeadAttack",
            380,
            405,
            fps,
          );

          const mixer = new THREE.AnimationMixer(object);
          const walkAction = mixer.clipAction(walkClip);
          const deadAction = mixer.clipAction(deadClip);
          const attackAction = mixer.clipAction(attackClip);

          walkAction.play();
          walkAction.setEffectiveWeight(1);
          deadAction.play();
          deadAction.setEffectiveWeight(0);
          attackAction.play();
          attackAction.setEffectiveWeight(0);

          this.models.football = {
            model: object,
            mixer,
            walkAction,
            deadAction,
            attackAction,
            headBone,
          };
        }
      });
    });
  }

  getFrame(
    isDead: boolean,
    isAttacking: boolean,
    animTime: number,
    attackTime: number,
    modelType:
      "man" | "girl" | "bombman" | "mummy" | "dog" | "football" = "man",
  ): HTMLCanvasElement | null {
    if (!this.isLoaded) return null;

    const data = this.models[modelType];
    if (!data) return null;

    // Hide all models
    if (this.models.man) this.models.man.model.visible = false;
    if (this.models.girl) this.models.girl.model.visible = false;
    if (this.models.bombman) this.models.bombman.model.visible = false;
    if (this.models.mummy) this.models.mummy.model.visible = false;
    if (this.models.dog) this.models.dog.model.visible = false;
    if (this.models.football) this.models.football.model.visible = false;

    // Show and setup active model
    data.model.visible = true;

    // Reset all weights
    data.walkAction.setEffectiveWeight(0);
    data.deadAction.setEffectiveWeight(0);
    data.attackAction.setEffectiveWeight(0);
    if (data.jumpEAction) data.jumpEAction.setEffectiveWeight(0);

    if (isDead) {
      data.deadAction.setEffectiveWeight(1);
      data.deadAction.time = Math.min(
        animTime,
        data.deadAction.getClip().duration,
      );
    } else if (isAttacking) {
      data.attackAction.setEffectiveWeight(1);
      data.attackAction.time = Math.min(
        attackTime,
        data.attackAction.getClip().duration,
      );
    } else {
      data.walkAction.setEffectiveWeight(1);
      data.walkAction.time = animTime % data.walkAction.getClip().duration;
    }

    data.mixer.update(0);

    // We want the 2D sprite to face UP (-Y) when un-rotated, because the green zombie sprite faces UP.
    // In our 3D camera, UP on the screen is -Z.
    // FBX models usually face +Z by default.
    // So we rotate the model by Math.PI.
    data.model.rotation.y = Math.PI;
    data.model.updateMatrixWorld(true);

    let originalHeadQuat: THREE.Quaternion | undefined;
    if (data.headBone) {
      originalHeadQuat = data.headBone.quaternion.clone();

      const qWorld = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        (Math.PI * 45) / 180,
      );
      const parentQuat = new THREE.Quaternion();
      if (data.headBone.parent) {
        data.headBone.parent.getWorldQuaternion(parentQuat);
      }
      const qLocal = parentQuat
        .clone()
        .invert()
        .multiply(qWorld)
        .multiply(parentQuat);
      data.headBone.quaternion.premultiply(qLocal);

      data.headBone.updateMatrixWorld(true);
    }

    this.renderer.render(this.scene, this.camera);

    if (data.headBone && originalHeadQuat) {
      data.headBone.quaternion.copy(originalHeadQuat);
    }

    return this.renderer.domElement;
  }
}

export const zombie3D = new Zombie3DRenderer();
