class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  // Soft proximity chime (approaching camera within 800m)
  public playProximityPing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay might be blocked until user interacts
    }
  }

  // Urgent two-tone warning when within 350m
  public playWarningBeep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 880 : 1046.5, now + offset);
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } catch {
      // Ignore audio error
    }
  }

  // High urgency alarm tone when overspeeding
  public playOverspeedAlarm() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.1);
      osc.frequency.linearRampToValueAtTime(750, now + 0.2);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore audio error
    }
  }

  // Speech synthesis announcement
  public speakAlert(text: string) {
    if (this.isMuted || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    // Throttle duplicate phrases to once per 8 seconds
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 8000) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      this.lastSpokenText = text;
      this.lastSpokenTime = now;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech error
    }
  }
}

export const soundManager = new SoundManager();
