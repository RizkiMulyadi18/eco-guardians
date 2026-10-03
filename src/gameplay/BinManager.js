import * as THREE from 'three';
import { BINS } from '../data/bins.js';

export class BinManager {
  constructor(scene) {
    this.scene = scene;
    this.bins = [];
    this.hitboxMeshes = [];
    this.hoveredBin = null;
    this._initBins();
  }

  _initBins() {
    const binPositions = [
      new THREE.Vector3(-2.0, 0.6, 1.2), // Organik (Kiri)
      new THREE.Vector3(0.0, 0.6, 1.2),  // Anorganik (Tengah)
      new THREE.Vector3(2.0, 0.6, 1.2)   // B3 (Kanan)
    ];

    BINS.forEach((binData, index) => {
      const group = new THREE.Group();
      group.userData = {
        isBin: true,
        category: binData.category,
        id: binData.id,
        name: binData.name,
        binInstance: this
      };

      // 1. Visible Bin Body Cylinder
      const bodyGeo = new THREE.CylinderGeometry(0.55, 0.44, 1.1, 24);
      const bodyMat = new THREE.MeshToonMaterial({
        color: binData.colorHex,
        roughness: 0.35
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // 2. Thick Comic Rim
      const rimGeo = new THREE.TorusGeometry(0.55, 0.05, 12, 32);
      const rimMat = new THREE.MeshToonMaterial({ color: 0x2D3748 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.55;
      group.add(rim);

      // 3. Drop Zone Indicator Ring (at top of bin)
      const ringGeo = new THREE.RingGeometry(0.2, 0.48, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1A202C,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.56;
      group.add(ring);

      group.position.copy(binPositions[index]);
      this.scene.add(group);

      // 4. Invisible Generous Raycast Hitbox for reliable drop detection
      const hitboxGeo = new THREE.CylinderGeometry(0.75, 0.60, 1.4, 16);
      const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitboxMesh = new THREE.Mesh(hitboxGeo, hitboxMat);
      hitboxMesh.position.copy(binPositions[index]);
      this.scene.add(hitboxMesh);

      const binRecord = {
        data: binData,
        group: group,
        position: binPositions[index],
        hitboxMesh: hitboxMesh
      };

      hitboxMesh.userData = { binRecord };
      this.hitboxMeshes.push(hitboxMesh);
      this.bins.push(binRecord);
    });
  }

  /**
   * Find bin hit by Three.js Raycaster (Zero false positives on desk!)
   * @param {THREE.Raycaster} raycaster
   * @returns {Object|null} bin record if hit
   */
  findBinByRaycaster(raycaster) {
    if (!raycaster || this.hitboxMeshes.length === 0) return null;

    const intersects = raycaster.intersectObjects(this.hitboxMeshes, false);
    if (intersects.length > 0) {
      return intersects[0].object.userData.binRecord || null;
    }
    return null;
  }

  setHoveredBin(bin) {
    if (this.hoveredBin === bin) return;

    if (this.hoveredBin) {
      this.hoveredBin.group.scale.set(1.0, 1.0, 1.0);
    }

    this.hoveredBin = bin;

    if (this.hoveredBin) {
      // Scale up when dragged trash is hovering over it
      this.hoveredBin.group.scale.set(1.15, 1.15, 1.15);
    }
  }

  getBins() {
    return this.bins;
  }
}
