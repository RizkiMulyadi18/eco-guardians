import * as THREE from 'three';
import { TRASH_ITEMS } from '../data/trashItems.js';
import { TrashObject, TRASH_STATES } from './TrashObject.js';
import { eventBus } from '../utils/events.js';

export class TrashManager {
  constructor(scene, interactionManager) {
    this.scene = scene;
    this.interactionManager = interactionManager;
    this.activeObjects = [];
    this.queue = [];
    this.totalTarget = 12;
    this.disposedCount = 0;
    
    // Spawn slots along the desk
    this.spawnSlots = [
      new THREE.Vector3(-1.4, 1.2, -0.2),
      new THREE.Vector3(0.0, 1.2, -0.2),
      new THREE.Vector3(1.4, 1.2, -0.2)
    ];

    this._setupListeners();
  }

  _setupListeners() {
    eventBus.on('sorting:result', ({ correct, trash }) => {
      if (correct) {
        setTimeout(() => {
          this._removeDisposedItem(trash.id);
          this.disposedCount++;
          
          eventBus.emit('mission:progress', {
            current: this.disposedCount,
            total: this.totalTarget
          });

          if (this.disposedCount >= this.totalTarget) {
            eventBus.emit('mission:all_objects_done');
          } else if (this.queue.length > 0) {
            this._spawnNextQueuedItem();
          }
        }, 1000);
      }
    });
  }

  /**
   * Set up queue specific to a chapter (e.g. Chapter 1: 12 objects, Organic & Inorganic only)
   */
  setupChapterQueue(chapterConfig) {
    this.clearAll();
    this.totalTarget = chapterConfig.targetObjects || 12;
    this.disposedCount = 0;

    this.queue = [];

    // Support for phased chapters (e.g. Chapter 5: 12 Organik -> 12 Anorganik -> 12 B3)
    if (chapterConfig.phases && chapterConfig.phases.length > 0) {
      for (const phase of chapterConfig.phases) {
        const phaseItems = TRASH_ITEMS.filter(item => phase.categories.includes(item.category));
        let phaseCount = 0;
        while (phaseCount < phase.count) {
          const pool = [...phaseItems].sort(() => Math.random() - 0.5);
          for (const item of pool) {
            if (phaseCount < phase.count) {
              this.queue.push(item);
              phaseCount++;
            }
          }
        }
      }
    } else {
      // Filter available catalog by allowed categories
      const allowedItems = TRASH_ITEMS.filter(item => 
        chapterConfig.categories.includes(item.category)
      );

      // Build balanced randomized queue
      while (this.queue.length < this.totalTarget) {
        // Shuffle copy of allowed items
        const pool = [...allowedItems].sort(() => Math.random() - 0.5);
        for (const item of pool) {
          if (this.queue.length < this.totalTarget) {
            this.queue.push(item);
          }
        }
      }
    }

    // Spawn initial items onto desk (up to 3 slots)
    const initialBatch = Math.min(this.spawnSlots.length, this.queue.length);
    for (let i = 0; i < initialBatch; i++) {
      const itemData = this.queue.shift();
      this._createTrashInstance(itemData, this.spawnSlots[i]);
    }

    eventBus.emit('mission:progress', {
      current: this.disposedCount,
      total: this.totalTarget
    });
  }

  _createTrashInstance(itemData, position) {
    const trashObj = new TrashObject(itemData, position);
    this.scene.add(trashObj.mesh);
    this.activeObjects.push(trashObj);
    this.interactionManager.registerTrashItem(trashObj);
    return trashObj;
  }

  _removeDisposedItem(itemId) {
    const idx = this.activeObjects.findIndex(o => o.data.id === itemId && o.state === TRASH_STATES.DISPOSED);
    if (idx !== -1) {
      const obj = this.activeObjects[idx];
      this.scene.remove(obj.mesh);
      this.activeObjects.splice(idx, 1);
    }
  }

  _spawnNextQueuedItem() {
    if (this.queue.length === 0) return;

    // Find unoccupied slot
    for (const slot of this.spawnSlots) {
      const isOccupied = this.activeObjects.some(o => 
        o.state !== TRASH_STATES.DISPOSED && o.restPosition.distanceTo(slot) < 0.2
      );

      if (!isOccupied) {
        const itemData = this.queue.shift();
        this._createTrashInstance(itemData, slot);
        break;
      }
    }
  }

  clearAll() {
    this.activeObjects.forEach(obj => {
      if (obj.mesh && obj.mesh.parent) {
        obj.mesh.parent.remove(obj.mesh);
      }
    });
    this.activeObjects = [];
    this.queue = [];
    this.disposedCount = 0;
    this.interactionManager.clearTrashItems();
  }
}
