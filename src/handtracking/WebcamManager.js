import { logger } from '../utils/logger.js';
import { eventBus } from '../utils/events.js';

export class WebcamManager {
  constructor() {
    this.videoElement = null;
    this.stream = null;
    this.isActive = false;
    this.isMirrored = true;
    this.width = 640;
    this.height = 480;
  }

  async start() {
    if (this.isActive && this.stream) {
      return this.videoElement;
    }

    logger.info('WebcamManager', 'Requesting webcam access...');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error('Browser tidak mendukung WebRTC getUserMedia atau koneksi bukan HTTPS / localhost.');
      logger.error('WebcamManager', err.message);
      eventBus.emit('camera:error', { error: err, type: 'NOT_SUPPORTED' });
      throw err;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      const existingPipVideo = document.getElementById('pip-video');
      if (existingPipVideo) {
        this.videoElement = existingPipVideo;
      } else if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.id = 'webcam-feed';
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
        this.videoElement.muted = true;
        this.videoElement.style.position = 'fixed';
        this.videoElement.style.top = '-9999px';
        this.videoElement.style.left = '-9999px';
        this.videoElement.style.opacity = '0';
        this.videoElement.style.pointerEvents = 'none';
        document.body.appendChild(this.videoElement);
      }

      this.videoElement.srcObject = this.stream;

      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          this.width = this.videoElement.videoWidth || 640;
          this.height = this.videoElement.videoHeight || 480;
          this.isActive = true;
          logger.info('WebcamManager', `Camera stream active (${this.width}x${this.height})`);
          eventBus.emit('camera:ready', { width: this.width, height: this.height });
          resolve();
        };
      });

      // Handle accidental stream disconnect
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        logger.warn('WebcamManager', 'Camera stream disconnected');
        this.isActive = false;
        eventBus.emit('camera:disconnected');
      });

      return this.videoElement;
    } catch (error) {
      logger.error('WebcamManager', 'Webcam permission failed:', error);
      let errorType = 'UNKNOWN';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'PERMISSION_DENIED';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorType = 'DEVICE_NOT_FOUND';
      }
      eventBus.emit('camera:error', { error, type: errorType });
      throw error;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isActive = false;
    logger.info('WebcamManager', 'Webcam stopped');
    eventBus.emit('camera:stopped');
  }

  getVideoElement() {
    return this.videoElement;
  }
}
