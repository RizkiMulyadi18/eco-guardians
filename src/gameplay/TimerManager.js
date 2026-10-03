import { eventBus } from '../utils/events.js';

export class TimerManager {
  constructor() {
    this.totalDuration = 90;
    this.timeRemaining = 90;
    this.isRunning = false;
    this.isPaused = false;
    this.hasWarned = false;
  }

  start(durationSeconds = 90) {
    this.totalDuration = durationSeconds;
    this.timeRemaining = durationSeconds;
    this.isRunning = true;
    this.isPaused = false;
    this.hasWarned = false;
    this._emitTick();
  }

  pause() {
    this.isPaused = true;
    eventBus.emit('timer:paused');
  }

  resume() {
    this.isPaused = false;
    eventBus.emit('timer:resumed');
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  addTime(seconds = 15) {
    this.timeRemaining += seconds;
    this.totalDuration += seconds;
    this._emitTick();
    eventBus.emit('timer:added', seconds);
  }

  update(delta) {
    if (!this.isRunning || this.isPaused) return;

    this.timeRemaining -= delta;

    if (this.timeRemaining <= 10 && !this.hasWarned && this.timeRemaining > 0) {
      this.hasWarned = true;
      eventBus.emit('timer:warning', Math.ceil(this.timeRemaining));
    }

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.isRunning = false;
      this._emitTick();
      eventBus.emit('timer:end');
    } else {
      this._emitTick();
    }
  }

  getFormattedTime() {
    const totalSecs = Math.max(0, Math.ceil(this.timeRemaining));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  _emitTick() {
    eventBus.emit('timer:tick', {
      timeRemaining: Math.max(0, Math.ceil(this.timeRemaining)),
      totalDuration: this.totalDuration,
      formatted: this.getFormattedTime(),
      percentage: Math.max(0, Math.min(100, (this.timeRemaining / this.totalDuration) * 100)),
      isDanger: this.timeRemaining <= 10
    });
  }
}
