import * as THREE from 'three';
import { logger } from '../utils/logger.js';
import { BINS } from '../data/bins.js';

export class SceneManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.interactiveObjects = [];
    this.binObjects = [];
    this.demoMesh = null;

    this._init();
  }

  _init() {
    logger.info('SceneManager', 'Initializing Three.js scene...');

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF0F4F8); // Clean stylized comic background tone

    // 2. Camera (Fixed Perspective, slight top-down comic angle)
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(0, 3.5, 6.5);
    this.camera.lookAt(0, 0.8, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights (Cel-shaded comic lighting with soft key & ambient)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    this.scene.add(dirLight);

    // Soft colored ground bounce
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xE2E8F0, 0.5);
    this.scene.add(hemiLight);

    // 5. Build Environment Floor / Desk for sorting
    this._buildClassroomEnvironment();

    // 6. Resize listener
    window.addEventListener('resize', () => this.onWindowResize());
    logger.info('SceneManager', 'Three.js initialized successfully.');
  }

  _buildClassroomEnvironment() {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(16, 12);
    const floorMat = new THREE.MeshToonMaterial({ color: 0xE2E8F0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Sorting Classroom Table / Counter
    const deskGeo = new THREE.BoxGeometry(7, 0.4, 2.5);
    const deskMat = new THREE.MeshToonMaterial({ color: 0xD8B4E2 }); // Stylized desk color
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.8, -0.2);
    desk.receiveShadow = true;
    desk.castShadow = true;
    this.scene.add(desk);

    // Table built, bins will be initialized by BinManager
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update(delta) {
    if (this.demoMesh) {
      this.demoMesh.rotation.y += delta * 1.2;
      this.demoMesh.rotation.x += delta * 0.6;
    }
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
