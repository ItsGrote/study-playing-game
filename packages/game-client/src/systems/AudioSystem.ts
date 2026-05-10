export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastStepAt = 0;
  private volume = 0.7;

  start() {
    if (this.ctx) return;
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) return;

    this.ctx = new AudioContextCtor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.065 * this.volume;
    this.master.connect(this.ctx.destination);

    const pad = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    pad.type = "sine";
    pad.frequency.value = 174;
    padGain.gain.value = 0.18;
    pad.connect(padGain);
    padGain.connect(this.master);
    pad.start();
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.master) {
      this.master.gain.value = 0.065 * this.volume;
    }
  }

  step(time: number) {
    if (!this.ctx || !this.master || time - this.lastStepAt < 260) return;
    this.lastStepAt = time;
    this.blip(92, 0.035, 0.018);
  }

  interact() {
    this.blip(540, 0.07, 0.028);
  }

  positive() {
    this.blip(620, 0.08, 0.03);
    window.setTimeout(() => this.blip(820, 0.07, 0.026), 70);
  }

  private blip(freq: number, duration: number, gainValue: number) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.stop(this.ctx.currentTime + duration);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
