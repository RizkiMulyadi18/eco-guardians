import * as THREE from 'three';
import { eventBus } from '../utils/events.js';
import { SortingValidator } from './SortingValidator.js';
import { TRASH_STATES } from './TrashObject.js';

export class InteractionManager {
  constructor(sceneManager, binManager) {
    this.sceneManager = sceneManager;
    this.binManager = binManager;
    
    this.trashItems = [];
    this.hoveredTrash = null;
    this.draggedTrash = null;
    
    this.lastNdcX = 0;
    this.lastNdcY = 0;
    
    // Horizontal drag plane at Y = 1.35 allowing natural forward & backward movement across the room
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.35);
    this.planeIntersection = new THREE.Vector3();
    
    this._setupListeners();
  }

  registerTrashItem(trashObject) {
    this.trashItems.push(trashObject);
  }

  clearTrashItems() {
    this.trashItems.forEach(t => {
      if (t.mesh && t.mesh.parent) {
        t.mesh.parent.remove(t.mesh);
      }
    });
    this.trashItems = [];
    this.hoveredTrash = null;
    this.draggedTrash = null;
  }

  _setupListeners() {
    eventBus.on('pointer:moved', ({ ndcX, ndcY, isPinching }) => {
      this.lastNdcX = ndcX;
      this.lastNdcY = ndcY;
      this.onPointerMove(ndcX, ndcY, isPinching);
    });

    eventBus.on('pinch:start', () => {
      this.onPinchStart();
    });

    eventBus.on('pinch:end', () => {
      this.onPinchEnd();
    });
  }

  onPointerMove(ndcX, ndcY, isPinching) {
    const raycaster = this.sceneManager.raycaster;
    const camera = this.sceneManager.camera;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    if (this.draggedTrash) {
      // 1. Raycast against horizontal plane at Y = 1.35 (Smooth free 3D gliding)
      if (raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersection)) {
        this.draggedTrash.updateDragPosition(this.planeIntersection);
      }

      // 2. Direct 3D Raycast against bin hitboxes
      const binUnderneath = this.binManager.findBinByRaycaster(raycaster);
      this.binManager.setHoveredBin(binUnderneath);

    } else {
      // Find hovered trash item on the desk
      const activeMeshes = this.trashItems
        .filter(t => t.state === TRASH_STATES.IDLE || t.state === TRASH_STATES.HOVERED)
        .map(t => t.mesh);

      const intersects = raycaster.intersectObjects(activeMeshes, true);
      
      let hitTrash = null;
      if (intersects.length > 0) {
        let root = intersects[0].object;
        while (root && !root.userData?.trashInstance) {
          root = root.parent;
        }
        if (root && root.userData?.trashInstance) {
          hitTrash = root.userData.trashInstance;
        }
      }

      if (hitTrash !== this.hoveredTrash) {
        if (this.hoveredTrash) {
          this.hoveredTrash.setHovered(false);
        }
        this.hoveredTrash = hitTrash;
        if (this.hoveredTrash) {
          this.hoveredTrash.setHovered(true);
        }
        eventBus.emit('pointer:hover', !!this.hoveredTrash);
      }
    }
  }

  onPinchStart() {
    if (this.hoveredTrash && !this.draggedTrash) {
      this.draggedTrash = this.hoveredTrash;
      this.hoveredTrash = null;
      this.draggedTrash.startDrag();
      eventBus.emit('trash:picked', this.draggedTrash.data);
    }
  }

  onPinchEnd() {
    if (!this.draggedTrash) return;

    const trash = this.draggedTrash;
    const raycaster = this.sceneManager.raycaster;
    const camera = this.sceneManager.camera;
    raycaster.setFromCamera(new THREE.Vector2(this.lastNdcX, this.lastNdcY), camera);

    this.draggedTrash = null;

    // Direct Raycaster check against bin hitboxes at drop point
    const targetBin = this.binManager.findBinByRaycaster(raycaster);
    this.binManager.setHoveredBin(null);

    if (targetBin) {
      // Validate category
      const result = SortingValidator.validate(trash.data, targetBin.data);
      
      if (result.correct) {
        trash.disposeIntoBin(targetBin.position);
        eventBus.emit('sorting:result', {
          correct: true,
          trash: trash.data,
          bin: targetBin.data,
          ...result
        });
      } else {
        // Wrong bin: bounce back to rest spot
        trash.returnToRest();
        eventBus.emit('sorting:result', {
          correct: false,
          trash: trash.data,
          bin: targetBin.data,
          ...result
        });
      }
    } else {
      // Dropped outside bins: return to desk
      trash.returnToRest();
      eventBus.emit('trash:released_miss', trash.data);
    }
  }

  update(delta) {
    this.trashItems.forEach(t => t.update(delta));
  }
}
