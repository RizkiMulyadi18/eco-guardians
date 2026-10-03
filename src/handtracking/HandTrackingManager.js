import * as mpHands from '@mediapipe/hands';
import * as mpCamera from '@mediapipe/camera_utils';
import { logger } from '../utils/logger.js';
import { eventBus } from '../utils/events.js';

// Support both ES Module default and standard namespace
const Hands = mpHands.Hands || mpHands.default?.Hands || window.Hands;
const Camera = mpCamera.Camera || mpCamera.default?.Camera || window.Camera;

export class HandTrackingManager {
  constructor(webcamManager) {
    this.webcamManager = webcamManager;
    this.hands = null;
    this.cameraInstance = null;
    this.isTracking = false;
    this.currentLandmarks = null;
    this.confidence = 0;
    
    // FPS tracking
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fps = 0;
    this.fpsTimer = performance.now();
  }

  async init() {
    logger.info('HandTrackingManager', 'Initializing MediaPipe Hands...');

    if (!Hands) {
      throw new Error('MediaPipe Hands library not loaded');
    }

    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    // Configure MediaPipe for stable single hand tracking
    this.hands.setOptions({
      maxNumHands: 1, // Single hand as per skripsi boundary
      modelComplexity: 1, // Balanced performance and accuracy
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65
    });

    this.hands.onResults((results) => this._onResults(results));
    logger.info('HandTrackingManager', 'MediaPipe Hands initialized.');
  }

  async start() {
    if (this.isTracking) return;

    const video = await this.webcamManager.start();
    if (!this.hands) {
      await this.init();
    }

    logger.info('HandTrackingManager', 'Starting video camera tracking loop...');

    this.cameraInstance = new Camera(video, {
      onFrame: async () => {
        if (!this.isTracking) return;
        await this.hands.send({ image: video });
      },
      width: 640,
      height: 480
    });

    this.isTracking = true;
    await this.cameraInstance.start();
    logger.info('HandTrackingManager', 'Camera tracking loop active');
    eventBus.emit('tracking:started');
  }

  stop() {
    this.isTracking = false;
    if (this.cameraInstance) {
      this.cameraInstance.stop();
      this.cameraInstance = null;
    }
    this.currentLandmarks = null;
    eventBus.emit('tracking:stopped');
  }

  _onResults(results) {
    // Calculate FPS
    const now = performance.now();
    this.frameCount++;
    if (now - this.fpsTimer >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
      this.frameCount = 0;
      this.fpsTimer = now;
      eventBus.emit('tracking:fps', this.fps);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // One hand dominant
      this.currentLandmarks = results.multiHandLandmarks[0];
      
      // Calculate confidence if available from multiHandedness
      if (results.multiHandedness && results.multiHandedness.length > 0) {
        this.confidence = results.multiHandedness[0].score || 0.85;
      } else {
        this.confidence = 0.85;
      }

      eventBus.emit('hand:detected', {
        landmarks: this.currentLandmarks,
        confidence: this.confidence,
        rawResults: results
      });
    } else {
      if (this.currentLandmarks !== null) {
        this.currentLandmarks = null;
        this.confidence = 0;
        eventBus.emit('hand:lost');
      }
    }
  }

  getLandmarks() {
    return this.currentLandmarks;
  }

  getConfidence() {
    return this.confidence;
  }
}
