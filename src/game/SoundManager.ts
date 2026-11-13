export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private bgmNoteIndex: number = 0;
  private customGiggleBuffer: AudioBuffer | null = null;
  private hasUnlockedAudio: boolean = false;

  private constructor() {
    this.initAudio();
    this.attachAutoUnlock();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudio() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
      this.loadCustomGiggle();
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  private attachAutoUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'running') {
        this.hasUnlockedAudio = true;
        window.removeEventListener('click', unlock);
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private async loadCustomGiggle() {
    if (!this.ctx) return;
    try {
      // Load synthesized crystal-clear baby laugh WAV
      const res = await fetch('/assets/audio/arabi-giggle.wav');
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        this.customGiggleBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      }
    } catch {
      // Procedural synthesis is automatic fallback
    }
  }

  public ensureContext() {
    if (!this.ctx) {
      this.initAudio();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      this.ensureContext();
      this.startBGM();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Spoken Voice Dialogues using Web Speech API + Baby Sound
  public speakDialogue(character: 'anam' | 'araf' | 'adiba' | 'arabi', text: string) {
    if (this.isMuted) return;
    this.ensureContext();

    if (character === 'arabi') {
      // Arabi baby always giggles happily when talking!
      this.playGiggle();
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();

      // Remove emojis from speech string
      const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.volume = 1.0; // Clear, loud voice

      // Match Bengali voice if browser supports it
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.startsWith('bn'));
      if (bnVoice) {
        utterance.voice = bnVoice;
        utterance.lang = bnVoice.lang;
      } else {
        utterance.lang = 'bn-BD';
      }

      if (character === 'arabi') {
        utterance.pitch = 1.9;
        utterance.rate = 1.15;
      } else if (character === 'araf') {
        // 5yo energetic brother
        utterance.pitch = 1.5;
        utterance.rate = 1.12;
      } else if (character === 'adiba') {
        // 9yo lively sister
        utterance.pitch = 1.35;
        utterance.rate = 1.10;
      } else {
        // 13yo older brother
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis silent fallback
    }
  }

  // 1. Arabi's Real Baby Giggle
  public playGiggle() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    if (this.customGiggleBuffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.customGiggleBuffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.95, this.ctx.currentTime); // Loud, joyful baby giggle
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
      return;
    }

    // Procedural Musical Baby Giggle
    const now = this.ctx.currentTime;
    const bursts = [
      { time: 0.00, freq: 620, dur: 0.09 },
      { time: 0.12, freq: 760, dur: 0.10 },
      { time: 0.25, freq: 690, dur: 0.09 },
      { time: 0.38, freq: 920, dur: 0.14 },
      { time: 0.54, freq: 820, dur: 0.10 },
      { time: 0.68, freq: 980, dur: 0.16 },
    ];

    bursts.forEach(({ time, freq, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + time + dur);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(24, now + time);
      lfoGain.gain.setValueAtTime(40, now + time);
      lfo.connect(osc.frequency);
      lfo.start(now + time);
      lfo.stop(now + time + dur);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  // 2. Walker Jump (Bouncy boing / spring)
  public playJump() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // 3. Collectible Item (Sparkly musical chime)
  public playCollect() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.24);
    });
  }

  // 4. Obstacle Bump / Bounce
  public playHit() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 5. Rocket Turbo Boost (Supersonic roaring fire)
  public playTurbo() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.45);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.45);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // 6. Chocolate Munch ("আম-আম-আম!" chewing sound)
  public playMunch() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0.0, 0.18, 0.36].forEach((delay) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now + delay);
      osc.frequency.exponentialRampToValueAtTime(260, now + delay + 0.12);

      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.14);
    });
  }

  // 7. Kitchen Danger Zone Siren Warning
  public playSiren() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0.0, 0.22, 0.44].forEach((delay, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 660, now + delay);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });
  }

  // 8. Smash Obstacle in Turbo
  public playSmash() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 9. Fanfare / Escape Bonus
  public playFanfare() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fanNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    fanNotes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.3, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.38);
    });
  }

  // 10. Game Over / Caught
  public playCatch() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 392, 349.2, 293.6];

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + i * 0.12 + 0.15);

      gain.gain.setValueAtTime(0.28, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.22);
    });
  }

  // 11. Cheerful Nursery Marimba BGM
  public startBGM() {
    if (this.bgmInterval || this.isMuted) return;
    this.ensureContext();

    const melody = [
      523.25, 659.25, 783.99, 1046.5, 783.99, 659.25,
      587.33, 698.46, 880.00, 783.99, 659.25, 523.25,
      659.25, 783.99, 880.00, 1046.5, 1174.66, 1046.5,
      880.00, 783.99, 659.25, 587.33, 523.25, 523.25
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const freq = melody[this.bgmNoteIndex % melody.length];
      this.bgmNoteIndex++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.018, now); // Quiet, sweet background tune so voices are loud & clear
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }, 280);
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}
