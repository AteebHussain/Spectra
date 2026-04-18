import { AUDIO_CONFIG } from './constants';
import { useAudioStore } from '../store/audioStore';

class AudioAnalyzer {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;

  public initialize(audioElement: HTMLAudioElement) {
    if (!this.ctx) {
      this.ctx = new window.AudioContext();
    }
    
    // Ensure context is running (handles autoplay policies if called via user interaction)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = AUDIO_CONFIG.DEFAULT_FFT_SIZE;
      this.analyser.smoothingTimeConstant = AUDIO_CONFIG.SMOOTHING_TIME_CONSTANT;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    if (!this.source) {
      this.source = this.ctx.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
  }

  public startLoop() {
    if (!this.analyser || !this.dataArray || !this.ctx) return;

    const loop = () => {
      this.analyser!.getByteFrequencyData(this.dataArray!);
      
      const bass = this.getAverage(AUDIO_CONFIG.BANDS.BASS.MIN, AUDIO_CONFIG.BANDS.BASS.MAX);
      const mid = this.getAverage(AUDIO_CONFIG.BANDS.MID.MIN, AUDIO_CONFIG.BANDS.MID.MAX);
      const treble = this.getAverage(AUDIO_CONFIG.BANDS.TREBLE.MIN, AUDIO_CONFIG.BANDS.TREBLE.MAX);
      
      useAudioStore.getState().setBands({ bass, mid, treble });

      this.animationFrameId = requestAnimationFrame(loop);
    };

    // Ensure only one loop runs
    this.stopLoop();
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public cleanup() {
    this.stopLoop();
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.analyser = null;
  }

  private getAverage(minFreq: number, maxFreq: number): number {
    if (!this.analyser || !this.dataArray || !this.ctx) return 0;
    
    const sampleRate = this.ctx.sampleRate;
    const binCount = this.analyser.frequencyBinCount;
    
    const minBin = Math.floor((minFreq / (sampleRate / 2)) * binCount);
    const maxBin = Math.ceil((maxFreq / (sampleRate / 2)) * binCount);
    
    let sum = 0;
    let count = 0;
    
    // Ensure we don't go out of bounds
    for (let i = minBin; i <= maxBin && i < binCount; i++) {
      sum += this.dataArray[i];
      count++;
    }
    
    return count === 0 ? 0 : sum / count;
  }
}

export const audioAnalyzer = new AudioAnalyzer();
