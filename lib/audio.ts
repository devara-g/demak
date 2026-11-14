// Advanced Web Audio Engine for Realistic Book Experience

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMusicPlaying = false;
  private isRainPlaying = false;
  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private noteCursor = 0;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying = false;
  private musicListeners: ((playing: boolean) => void)[] = [];

  private melodyNotes = [
    { freq: 523.25, dur: 0.45 }, // C5
    { freq: 659.25, dur: 0.45 }, // E5
    { freq: 587.33, dur: 0.45 }, // D5
    { freq: 523.25, dur: 0.65 }, // C5
    { freq: 440.00, dur: 0.45 }, // A4
    { freq: 523.25, dur: 0.45 }, // C5
    { freq: 659.25, dur: 0.65 }, // E5
    { freq: 587.33, dur: 0.80 }, // D5
    { freq: 493.88, dur: 0.45 }, // B4
    { freq: 523.25, dur: 0.45 }, // C5
    { freq: 698.46, dur: 0.55 }, // F5
    { freq: 659.25, dur: 0.55 }, // E5
    { freq: 587.33, dur: 0.45 }, // D5
    { freq: 523.25, dur: 0.85 }, // C5
  ];

  private ensureAudioContext() {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Celesta / Music Box chime with warm overtones
  public playMusicBoxNote(freq: number, duration = 0.55, volume = 0.055) {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + duration + 0.05);

    // Bell chime harmonic (2.756x)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.756, now);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.exponentialRampToValueAtTime(volume * 0.32, now + 0.008);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.45);

    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + duration * 0.5);
  }

  // Realistic Paper Turning Sound (Air swoosh + paper flutter + gentle landing tap)
  public playPaperTurnSound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // 1. Friction swoosh
    const swooshLen = Math.floor(this.audioCtx.sampleRate * 0.28);
    const swooshBuf = this.audioCtx.createBuffer(1, swooshLen, this.audioCtx.sampleRate);
    const data = swooshBuf.getChannelData(0);
    for (let i = 0; i < swooshLen; i++) {
      const envelope = Math.sin((i / swooshLen) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * envelope * Math.exp(-i / (swooshLen * 0.6));
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = swooshBuf;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + 0.26);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(now);
    noise.stop(now + 0.29);

    // 2. Soft landing tap
    setTimeout(() => {
      if (!this.audioCtx) return;
      const tapNow = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const tapGain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, tapNow);
      osc.frequency.exponentialRampToValueAtTime(40, tapNow + 0.08);

      tapGain.gain.setValueAtTime(0.035, tapNow);
      tapGain.gain.exponentialRampToValueAtTime(0.001, tapNow + 0.08);

      osc.connect(tapGain);
      tapGain.connect(this.audioCtx.destination);
      osc.start(tapNow);
      osc.stop(tapNow + 0.09);
    }, 280);
  }

  // Realistic Graphite Pencil Scribble Sound (for wishlist checkmark)
  public playPencilSound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const len = Math.floor(this.audioCtx.sampleRate * 0.12);
    const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    }
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, now);

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    src.start(now);
    src.stop(now + 0.13);
  }

  // Mechanical Typewriter Key Clack
  public playTypewriterKeySound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Metal key stroke transient
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const randomPitch = 130 + Math.random() * 80;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(randomPitch, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.035);

    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Carriage Return Bell (Ding!)
  public playTypewriterBellSound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    this.playMusicBoxNote(2093.00, 0.85, 0.09); // C7 chime
  }

  // Wax Seal Stamp Impact Sound
  public playWaxSealStampSound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCelebrationChord() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((f, idx) => {
      setTimeout(() => this.playMusicBoxNote(f, 0.85, 0.06), idx * 75);
    });
  }

  public startMusicBox(onTick?: () => void) {
    this.ensureAudioContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (this.musicInterval) clearInterval(this.musicInterval);
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying) return;
      const note = this.melodyNotes[this.noteCursor % this.melodyNotes.length];
      this.playMusicBoxNote(note.freq, note.dur, 0.045);
      this.noteCursor++;
      if (onTick) onTick();
    }, 540);
  }

  private timeListeners: ((current: number, total: number) => void)[] = [];

  public isBGMActive(): boolean {
    return this.isBgmPlaying;
  }

  public onMusicChange(cb: (playing: boolean) => void): () => void {
    this.musicListeners.push(cb);
    return () => {
      this.musicListeners = this.musicListeners.filter((l) => l !== cb);
    };
  }

  public onTimeUpdate(cb: (current: number, total: number) => void): () => void {
    this.timeListeners.push(cb);
    return () => {
      this.timeListeners = this.timeListeners.filter((l) => l !== cb);
    };
  }

  private notifyMusicListeners(playing: boolean) {
    this.musicListeners.forEach((cb) => {
      try {
        cb(playing);
      } catch (e) {
        // ignore
      }
    });
  }

  private notifyTimeListeners(current: number, total: number) {
    this.timeListeners.forEach((cb) => {
      try {
        cb(current, total);
      } catch (e) {
        // ignore
      }
    });
  }

  public getBgmCurrentTime(): number {
    return this.bgmAudio ? (this.bgmAudio.currentTime || 0) : 0;
  }

  public getBgmDuration(): number {
    if (this.bgmAudio && Number.isFinite(this.bgmAudio.duration) && this.bgmAudio.duration > 0) {
      return this.bgmAudio.duration;
    }
    return 208; // 3m 28s default for Adu Rayu
  }

  public seekBGM(seconds: number) {
    if (this.bgmAudio && Number.isFinite(seconds)) {
      this.bgmAudio.currentTime = Math.max(0, Math.min(this.getBgmDuration(), seconds));
    }
  }

  public playBGM(src: string = '/assets/adu_rayu.mp3', volume = 0.55): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(src);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = volume;
      this.bgmAudio.addEventListener('ended', () => {
        this.isBgmPlaying = false;
        this.notifyMusicListeners(false);
      });
      this.bgmAudio.addEventListener('pause', () => {
        this.isBgmPlaying = false;
        this.notifyMusicListeners(false);
      });
      this.bgmAudio.addEventListener('play', () => {
        this.isBgmPlaying = true;
        this.notifyMusicListeners(true);
      });
      this.bgmAudio.addEventListener('timeupdate', () => {
        if (this.bgmAudio) {
          const cur = this.bgmAudio.currentTime || 0;
          const dur = (Number.isFinite(this.bgmAudio.duration) && this.bgmAudio.duration > 0)
            ? this.bgmAudio.duration
            : 208;
          this.notifyTimeListeners(cur, dur);
        }
      });
    }

    if (this.bgmAudio.src !== window.location.origin + src && !this.bgmAudio.src.endsWith(src)) {
      this.bgmAudio.src = src;
    }

    this.bgmAudio.volume = volume;
    return this.bgmAudio.play().then(() => {
      this.isBgmPlaying = true;
      this.notifyMusicListeners(true);
    }).catch((err) => {
      console.warn('Audio autoplay requires user interaction:', err);
    });
  }

  public pauseBGM() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
    this.isBgmPlaying = false;
    this.notifyMusicListeners(false);
  }

  public toggleBGM(src: string = '/assets/adu_rayu.mp3', volume = 0.55): boolean {
    if (this.isBgmPlaying) {
      this.pauseBGM();
      return false;
    } else {
      this.playBGM(src, volume);
      return true;
    }
  }

  public stopMusicBox() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMusicBox(onStateChange?: (playing: boolean) => void) {
    // If BGM is used, toggle BGM instead
    if (this.bgmAudio || typeof window !== 'undefined') {
      const active = this.toggleBGM('/assets/adu_rayu.mp3');
      if (onStateChange) onStateChange(active);
      return active;
    }

    if (this.isMusicPlaying) {
      this.stopMusicBox();
    } else {
      this.startMusicBox();
    }
    if (onStateChange) onStateChange(this.isMusicPlaying);
    return this.isMusicPlaying;
  }

  public toggleRain(onStateChange?: (playing: boolean) => void) {
    this.ensureAudioContext();
    if (!this.audioCtx) return false;

    if (this.isRainPlaying) {
      if (this.rainNoiseNode) {
        this.rainNoiseNode.stop();
        this.rainNoiseNode.disconnect();
        this.rainNoiseNode = null;
      }
      this.isRainPlaying = false;
    } else {
      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      this.rainNoiseNode = this.audioCtx.createBufferSource();
      this.rainNoiseNode.buffer = buffer;
      this.rainNoiseNode.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.028, this.audioCtx.currentTime);

      this.rainNoiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      this.rainNoiseNode.start();

      this.isRainPlaying = true;
    }

    if (onStateChange) onStateChange(this.isRainPlaying);
    return this.isRainPlaying;
  }

  // Woodstock Cheerful Little Chirp (Cute bird sound)
  public playChirpSound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.exponentialRampToValueAtTime(2640, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.14);

    // Second little chirp
    setTimeout(() => {
      if (!this.audioCtx) return;
      const now2 = this.audioCtx.currentTime;
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2200, now2);
      osc2.frequency.exponentialRampToValueAtTime(3135, now2 + 0.06);

      gain2.gain.setValueAtTime(0.001, now2);
      gain2.gain.linearRampToValueAtTime(0.055, now2 + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.11);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now2);
      osc2.stop(now2 + 0.12);
    }, 120);
  }

  // Heartbeat pulse sound (lub-dub) for romantic moments
  public playHeartbeatSound() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Lub
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(75, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Dub
    setTimeout(() => {
      if (!this.audioCtx) return;
      const now2 = this.audioCtx.currentTime;
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(65, now2);
      osc2.frequency.exponentialRampToValueAtTime(30, now2 + 0.14);
      gain2.gain.setValueAtTime(0.09, now2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.15);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now2);
      osc2.stop(now2 + 0.16);
    }, 180);
  }
}

export const sound = new SoundEngine();
