class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
        this.isMuted = false; 
    }

    toggleMute(muted) {
        this.isMuted = muted;
    }

    init() {
        if (this.isInitialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }

    
    _playSound(freq, type, duration, volume = 0.5) {
        if (!this.isInitialized || this.isMuted) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Плавное затухание для "клика"
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        oscillator.start(this.ctx.currentTime);
        oscillator.stop(this.ctx.currentTime + duration);
    }

    // --- Публичные методы для разных звуков ---

    type() {
        this._playSound(1200, 'square', 0.05, 0.1);
    }
    
    select() {
        this._playSound(800, 'triangle', 0.1, 0.3);
    }

    navigate() {
        this._playSound(400, 'sine', 0.15, 0.4);
    }

    success() {
        this._playSound(600, 'sine', 0.1);
        setTimeout(() => this._playSound(900, 'sine', 0.2), 100);
    }
}

// Создаем единственный экземпляр, который будет использоваться в основном скрипте
const Sound = new AudioEngine();