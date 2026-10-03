import * as THREE from 'three';
import { APP_STATES } from '../utils/constants.js';
import { gameState } from './GameState.js';
import { SceneManager } from './SceneManager.js';
import { StorageManager } from '../storage/StorageManager.js';

// Hand Tracking Subsystem
import { WebcamManager } from '../handtracking/WebcamManager.js';
import { HandTrackingManager } from '../handtracking/HandTrackingManager.js';
import { GestureManager } from '../handtracking/GestureManager.js';
import { PointerManager } from '../handtracking/PointerManager.js';

// Gameplay Subsystem
import { BinManager } from '../gameplay/BinManager.js';
import { TrashManager } from '../gameplay/TrashManager.js';
import { InteractionManager } from '../gameplay/InteractionManager.js';
import { ScoreManager } from '../gameplay/ScoreManager.js';
import { ComboManager } from '../gameplay/ComboManager.js';
import { HealthManager } from '../gameplay/HealthManager.js';
import { TimerManager } from '../gameplay/TimerManager.js';
import { CleanlinessManager } from '../gameplay/CleanlinessManager.js';
import { MissionManager } from '../gameplay/MissionManager.js';
import { PowerUpManager } from '../gameplay/PowerUpManager.js';

// UI & Narrative Subsystem
import { MainMenu } from '../ui/MainMenu.js';
import { ChapterMap } from '../ui/ChapterMap.js';
import { ComicManager } from '../story/ComicManager.js';
import { MissionBrief } from '../ui/MissionBrief.js';
import { GameplayHUD } from '../ui/GameplayHUD.js';
import { PausePanel } from '../ui/PausePanel.js';
import { ResultPanel } from '../ui/ResultPanel.js';
import { KnowledgeBook } from '../ui/KnowledgeBook.js';

import { logger } from '../utils/logger.js';
import { eventBus } from '../utils/events.js';

export class GameApp {
  constructor() {
    this.canvasContainer = document.getElementById('canvas-container');
    this.uiContainer = document.getElementById('ui-container');
    
    // Core Subsystems
    this.sceneManager = null;
    this.webcamManager = null;
    this.handTrackingManager = null;
    this.gestureManager = null;
    this.pointerManager = null;

    // Gameplay Subsystems
    this.binManager = null;
    this.interactionManager = null;
    this.trashManager = null;
    this.scoreManager = null;
    this.comboManager = null;
    this.healthManager = null;
    this.timerManager = null;
    this.cleanlinessManager = null;
    this.missionManager = null;
    this.powerUpManager = null;

    // UI Panels
    this.mainMenu = null;
    this.chapterMap = null;
    this.comicManager = null;
    this.missionBrief = null;
    this.gameplayHUD = null;
    this.pausePanel = null;
    this.resultPanel = null;
    this.knowledgeBook = null;

    // Track current chapter for restart/pause
    this.currentChapterId = 1;

    this.clock = new THREE.Clock();
    this.pipContainer = null;
  }

  async init() {
    logger.info('GameApp', 'Bootstrapping Eco Guardians v2.0 (Fase 5)...');

    // 1. Scene & Graphics
    this.sceneManager = new SceneManager(this.canvasContainer);

    // 2. Hand Tracking Subsystem
    this.webcamManager = new WebcamManager();
    this.handTrackingManager = new HandTrackingManager(this.webcamManager);
    this.gestureManager = new GestureManager();
    this.pointerManager = new PointerManager();

    // 3. Gameplay Logic Subsystems
    this.binManager = new BinManager(this.sceneManager.scene);
    this.interactionManager = new InteractionManager(this.sceneManager, this.binManager);
    this.trashManager = new TrashManager(this.sceneManager.scene, this.interactionManager);
    
    this.scoreManager = new ScoreManager();
    this.comboManager = new ComboManager();
    this.healthManager = new HealthManager(3);
    this.timerManager = new TimerManager();
    this.cleanlinessManager = new CleanlinessManager();

    // Power-Up System (NEW in Fase 5)
    this.powerUpManager = new PowerUpManager({
      timerManager: this.timerManager,
      healthManager: this.healthManager,
      scoreManager: this.scoreManager,
      binManager: this.binManager
    });

    this.missionManager = new MissionManager({
      scoreManager: this.scoreManager,
      comboManager: this.comboManager,
      healthManager: this.healthManager,
      timerManager: this.timerManager,
      cleanlinessManager: this.cleanlinessManager,
      trashManager: this.trashManager,
      powerUpManager: this.powerUpManager
    });

    // 4. UI Managers
    this.mainMenu = new MainMenu(this.uiContainer);
    this.chapterMap = new ChapterMap(this.uiContainer);
    this.comicManager = new ComicManager(this.uiContainer);
    this.missionBrief = new MissionBrief(this.uiContainer);
    this.gameplayHUD = new GameplayHUD(this.uiContainer);
    this.pausePanel = new PausePanel(this.uiContainer);
    this.resultPanel = new ResultPanel(this.uiContainer);
    this.knowledgeBook = new KnowledgeBook(this.uiContainer);

    // 5. Build Mini Camera PIP in DOM
    this._buildPipContainer();

    // 6. Setup Global Event Handlers
    this._setupGlobalEvents();

    // 7. Start Render Loop
    this._startLoop();

    // 8. Show Main Menu
    this._showMainMenu();

    logger.info('GameApp', 'Eco Guardians v2.0 ready!');
  }

  _buildPipContainer() {
    const pip = document.createElement('div');
    pip.id = 'camera-pip-container';
    pip.className = 'comic-card interactive-ui';
    pip.style.cssText = 'position: absolute; bottom: 16px; right: 16px; width: 160px; height: 120px; overflow: hidden; display: none; background: #1A202C; z-index: 25;';
    pip.innerHTML = `
      <video id="pip-video" autoplay playsinline muted style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"></video>
      <canvas id="pip-canvas" width="160" height="120" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;"></canvas>
      <div style="position: absolute; bottom: 3px; left: 6px; font-size: 0.6rem; color: #FFF; background: rgba(0,0,0,0.6); padding: 1px 5px; border-radius: 4px; font-weight: bold; z-index: 3;">
        Kamera
      </div>
    `;
    document.body.appendChild(pip);
    this.pipContainer = pip;
  }

  _startPipRenderer() {
    const canvas = document.getElementById('pip-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawPip = () => {
      if (this.handTrackingManager.isTracking) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

          ctx.fillStyle = '#ECC94B';
          [landmarks[4], landmarks[8]].forEach(pt => {
            const px = (1 - pt.x) * canvas.width;
            const py = pt.y * canvas.height;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
        requestAnimationFrame(drawPip);
      }
    };
    requestAnimationFrame(drawPip);
  }

  _setupGlobalEvents() {
    // 1. Pause request from HUD
    eventBus.on('ui:pause_clicked', () => {
      this.missionManager.pauseMission();
      this.pausePanel.show({
        onResume: () => this.missionManager.resumeMission(),
        onRestart: () => this._startChapterGameplay(this.currentChapterId),
        onQuit: () => this._showMainMenu()
      });
    });

    // 2. Mission End Handler
    eventBus.on('mission:end', (resultData) => {
      gameState.setScreen(APP_STATES.RESULT);
      const nextChapterId = resultData.chapter.id + 1;
      const hasNext = nextChapterId <= 5;

      this.resultPanel.show(resultData, {
        onRestart: () => this._startChapterGameplay(resultData.chapter.id),
        onNext: () => {
          if (hasNext && resultData.isSuccess) {
            this._startChapterFlow(nextChapterId);
          } else {
            this._showChapterMap();
          }
        },
        onMenu: () => this._showMainMenu()
      });
    });

    // 3. Power-Up Activation Toast (reuse HUD feedback toast)
    eventBus.on('powerup:activated', (data) => {
      this._showPowerUpNotification(data);
    });
  }

  _showPowerUpNotification(data) {
    // Create a temporary toast notification for power-up activation
    let toast = document.getElementById('powerup-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'powerup-toast';
      toast.className = 'comic-card';
      toast.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.5);
        background: #FEFCBF; border-color: #D69E2E; padding: 16px 28px;
        text-align: center; z-index: 100; opacity: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    const iconMap = {
      TIME_BONUS: '⏰',
      HINT: '💡',
      SHIELD: '🛡️'
    };

    toast.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 4px;">${iconMap[data.type] || '⚡'}</div>
      <div style="font-size: 1.1rem; font-weight: 900; color: #744210;">POWER-UP!</div>
      <div style="font-size: 0.9rem; font-weight: 800; color: #975A16;">${data.message}</div>
    `;

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, -50%) scale(1.0)';
    });

    // Animate out after 2 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }, 2000);
  }

  // ===================== NAVIGATION METHODS =====================

  _showMainMenu() {
    gameState.setScreen(APP_STATES.MAIN_MENU);
    if (this.pipContainer) this.pipContainer.style.display = 'none';
    this.trashManager.clearAll();

    this.mainMenu.show({
      onStartGame: (chapterId) => this._startChapterFlow(chapterId),
      onOpenMap: () => this._showChapterMap(),
      onOpenKnowledgeBook: () => this._showKnowledgeBook()
    });
  }

  _showChapterMap() {
    gameState.setScreen(APP_STATES.MAP);
    if (this.pipContainer) this.pipContainer.style.display = 'none';
    this.trashManager.clearAll();

    this.chapterMap.show({
      onSelectChapter: (chapterId) => this._startChapterFlow(chapterId),
      onBack: () => this._showMainMenu()
    });
  }

  _showKnowledgeBook() {
    gameState.setScreen(APP_STATES.KNOWLEDGE_BOOK);

    this.knowledgeBook.show({
      onBack: () => this._showMainMenu()
    });
  }

  async _startChapterFlow(chapterId = 1) {
    this.currentChapterId = chapterId;

    // 1. Activate camera if not active
    if (!this.handTrackingManager.isTracking) {
      try {
        if (this.pipContainer) this.pipContainer.style.display = 'block';
        await this.handTrackingManager.start();
        this._startPipRenderer();
      } catch (err) {
        alert('Izin kamera dibutuhkan untuk memainkan Eco Guardians.\nSilakan izinkan akses webcam Anda.');
        this._showMainMenu();
        return;
      }
    }

    // 2. Show Comic Intro
    gameState.setScreen(APP_STATES.COMIC);
    this.comicManager.showIntro(chapterId, () => {
      // 3. Show Mission Briefing
      gameState.setScreen(APP_STATES.MISSION_BRIEF);
      this.missionBrief.show(chapterId, () => {
        // 4. Start Gameplay
        this._startChapterGameplay(chapterId);
      });
    });
  }

  _startChapterGameplay(chapterId = 1) {
    this.currentChapterId = chapterId;
    gameState.setScreen(APP_STATES.PLAYING);
    if (this.pipContainer) this.pipContainer.style.display = 'block';
    
    // Mount HUD and start chapter
    this.gameplayHUD.mount();
    this.missionManager.startChapter(chapterId);
  }

  _startLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      const delta = this.clock.getDelta();

      // Only advance mission timer & physics during active gameplay
      if (gameState.screen === APP_STATES.PLAYING && this.missionManager.isMissionActive) {
        this.timerManager.update(delta);
        if (this.interactionManager) {
          this.interactionManager.update(delta);
        }
      }

      this.sceneManager.update(delta);
      this.sceneManager.render();
    };
    loop();
  }
}
