import { eventBus } from '../utils/events.js';

export class CameraSetupHUD {
  constructor(container, webcamManager, handTrackingManager, gestureManager, pointerManager) {
    this.container = container;
    this.webcamManager = webcamManager;
    this.handTrackingManager = handTrackingManager;
    this.gestureManager = gestureManager;
    this.pointerManager = pointerManager;
    
    this.fps = 0;
    this.confidence = 0;
    this.isHandVisible = false;
    this.isPinching = false;
    this.distance = 1.0;
  }

  mount() {
    this.container.innerHTML = `
      <!-- Top Title / Status Banner -->
      <div style="position: absolute; top: 20px; left: 24px; max-width: 420px;" class="comic-card interactive-ui">
        <div style="padding: 16px 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <h1 style="font-size: 1.3rem; font-weight: 800; color: #2D3748;">
              ✋ FASE 2: Hand Tracking
            </h1>
            <span id="badge-tracking-state" style="padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; background: #FEB2B2; color: #9B2C2C;">
              Kamera Belum Aktif
            </span>
          </div>
          <p style="font-size: 0.8rem; color: #718096; line-height: 1.3; margin-bottom: 12px;">
            Arahkan 1 tangan ke webcam. Gerakkan telunjuk untuk mengarahkan kursor, jepit (pinch) ibu jari dan telunjuk untuk mengambil objek!
          </p>

          <button id="btn-toggle-camera" class="comic-btn" style="width: 100%; font-size: 0.95rem; padding: 10px 16px; margin-bottom: 8px;">
            📷 Aktifkan Kamera & Tracking
          </button>

          <!-- Live Telemetry Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
            <div style="background: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.7rem; color: #A0AEC0; font-weight: bold;">STATUS TANGAN</div>
              <div id="stat-hand" style="font-size: 0.85rem; font-weight: bold; color: #E53E3E;">Tidak Ada</div>
            </div>
            <div style="background: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.7rem; color: #A0AEC0; font-weight: bold;">STATUS PINCH</div>
              <div id="stat-pinch" style="font-size: 0.85rem; font-weight: bold; color: #718096;">Terbuka</div>
            </div>
            <div style="background: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.7rem; color: #A0AEC0; font-weight: bold;">JARAK JARI</div>
              <div id="stat-dist" style="font-size: 0.85rem; font-weight: bold; color: #2B6CB0;">-</div>
            </div>
            <div style="background: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.7rem; color: #A0AEC0; font-weight: bold;">PERFORMA (FPS)</div>
              <div id="stat-fps" style="font-size: 0.85rem; font-weight: bold; color: #38A169;">0 FPS</div>
            </div>
          </div>

          <!-- Dynamic Calibration Sliders -->
          <div style="margin-top: 14px; border-top: 2px dashed #E2E8F0; pt: 10px; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: bold; margin-bottom: 2px;">
              <span>Sensitivitas Pinch:</span>
              <span id="label-pinch-thresh">0.05</span>
            </div>
            <input type="range" id="slider-pinch" min="0.02" max="0.12" step="0.01" value="0.05" style="width: 100%; cursor: pointer;">

            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: bold; margin-top: 8px; margin-bottom: 2px;">
              <span>Kehalusan Kursor (LERP):</span>
              <span id="label-lerp">0.35</span>
            </div>
            <input type="range" id="slider-lerp" min="0.1" max="0.8" step="0.05" value="0.35" style="width: 100%; cursor: pointer;">
          </div>
        </div>
      </div>

      <!-- Mini PIP Webcam Feedback Container in Bottom Right -->
      <div id="camera-pip-container" class="comic-card interactive-ui" style="position: absolute; bottom: 20px; right: 20px; width: 180px; height: 135px; overflow: hidden; display: none; background: #1A202C;">
        <video id="pip-video" autoplay playsinline muted style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
        <canvas id="pip-canvas" width="180" height="135" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;"></canvas>
        <div style="position: absolute; bottom: 4px; left: 8px; font-size: 0.65rem; color: #FFF; background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px; font-weight: bold; z-index: 3;">
          Feed Kamera
        </div>
      </div>
    `;

    this._bindEvents();
    this._listenToTrackingEvents();
  }

  _bindEvents() {
    const btn = document.getElementById('btn-toggle-camera');
    const badge = document.getElementById('badge-tracking-state');
    const pip = document.getElementById('camera-pip-container');

    btn.addEventListener('click', async () => {
      if (!this.handTrackingManager.isTracking) {
        btn.disabled = true;
        btn.innerText = '⌛ Membuka Kamera...';
        try {
          pip.style.display = 'block';
          await this.handTrackingManager.start();
          btn.disabled = false;
          btn.innerText = '⏹ Hentikan Kamera';
          btn.style.background = '#E53E3E';
          badge.innerText = '● Tracking Aktif';
          badge.style.background = '#C6F6D5';
          badge.style.color = '#22543D';
          this._startPipRenderer();
        } catch (err) {
          btn.disabled = false;
          btn.innerText = '📷 Coba Lagi';
          badge.innerText = 'Izin Ditolak / Gagal';
          badge.style.background = '#FEB2B2';
          badge.style.color = '#9B2C2C';
          pip.style.display = 'none';
          alert('Gagal mengakses webcam: ' + err.message + '\nPastikan izin kamera diizinkan di browser.');
        }
      } else {
        this.handTrackingManager.stop();
        this.webcamManager.stop();
        btn.innerText = '📷 Aktifkan Kamera & Tracking';
        btn.style.background = '#48BB78';
        badge.innerText = 'Kamera Nonaktif';
        badge.style.background = '#FEB2B2';
        badge.style.color = '#9B2C2C';
        pip.style.display = 'none';
      }
    });

    // Slider pinch
    const sliderPinch = document.getElementById('slider-pinch');
    const labelPinch = document.getElementById('label-pinch-thresh');
    sliderPinch.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      labelPinch.innerText = val.toFixed(2);
      this.gestureManager.setThresholds(val, val + 0.05);
    });

    // Slider LERP
    const sliderLerp = document.getElementById('slider-lerp');
    const labelLerp = document.getElementById('label-lerp');
    sliderLerp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      labelLerp.innerText = val.toFixed(2);
      this.pointerManager.lerpFactor = val;
    });
  }

  _listenToTrackingEvents() {
    const statHand = document.getElementById('stat-hand');
    const statPinch = document.getElementById('stat-pinch');
    const statDist = document.getElementById('stat-dist');
    const statFps = document.getElementById('stat-fps');

    eventBus.on('tracking:fps', (fps) => {
      if (statFps) statFps.innerText = `${fps} FPS`;
    });

    eventBus.on('hand:detected', ({ confidence }) => {
      if (statHand) {
        statHand.innerText = `Terdeteksi (${Math.round(confidence * 100)}%)`;
        statHand.style.color = '#38A169';
      }
    });

    eventBus.on('hand:lost', () => {
      if (statHand) {
        statHand.innerText = 'Tidak Ada';
        statHand.style.color = '#E53E3E';
      }
      if (statPinch) {
        statPinch.innerText = 'Terbuka';
        statPinch.style.color = '#718096';
      }
    });

    eventBus.on('gesture:update', ({ isPinching, distance }) => {
      if (statDist) {
        statDist.innerText = distance.toFixed(3);
      }
      if (statPinch) {
        if (isPinching) {
          statPinch.innerText = '🤏 PINCH AKTIF!';
          statPinch.style.color = '#D69E2E';
        } else {
          statPinch.innerText = 'Terbuka';
          statPinch.style.color = '#718096';
        }
      }
    });
  }

  _startPipRenderer() {
    const canvas = document.getElementById('pip-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawPip = () => {
      if (this.handTrackingManager.isTracking) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw landmarks on transparent canvas over native video
        const landmarks = this.handTrackingManager.getLandmarks();
        if (landmarks) {
          ctx.fillStyle = '#48BB78';
          landmarks.forEach(pt => {
            const px = (1 - pt.x) * canvas.width;
            const py = pt.y * canvas.height;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Highlight thumb (4) and index (8)
          ctx.fillStyle = '#ECC94B';
          [landmarks[4], landmarks[8]].forEach(pt => {
            const px = (1 - pt.x) * canvas.width;
            const py = pt.y * canvas.height;
            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
            ctx.fill();
          });
        }

        requestAnimationFrame(drawPip);
      }
    };
    requestAnimationFrame(drawPip);
  }
}
