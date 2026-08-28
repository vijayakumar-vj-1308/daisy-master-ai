/**
 * RESECTOR 7 — PROCEDURAL WEB AUDIO SYNTHESIZER
 * Zero external audio files required — fully synthesized via Web Audio API.
 */

class StationAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.alarmInterval = null;
    this.isAlarmPlaying = false;
    this.initAudioContext();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
    }
    if (this.isMuted && this.isAlarmPlaying) {
      this.stopAlarm();
    }
    return !this.isMuted;
  }

  /** Ambient Low Frequency Reactor Hum */
  startAmbientHum() {
    if (!this.ctx || this.ambientGain) return;
    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // Sub drone osc
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(45, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, this.ctx.currentTime);

      osc1.connect(filter);
      filter.connect(this.ambientGain);
      osc1.start();
    } catch (e) {
      console.warn('Audio init delayed until user interaction');
    }
  }

  /** Red Emergency Alarm Siren */
  startAlarm() {
    if (this.isAlarmPlaying || !this.ctx) return;
    this.isAlarmPlaying = true;
    this.playAlarmPulse();
    this.alarmInterval = setInterval(() => {
      if (!this.isMuted && this.isAlarmPlaying) {
        this.playAlarmPulse();
      }
    }, 1400);
  }

  playAlarmPulse() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.6);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  /** Mechanical Terminal Typing Sound */
  playTypeClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 600, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  /** Daisy AI Voice Synthesis Vocaloid Tone */
  playDaisyVoiceBlip(isGlitch = false) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isGlitch ? 'sawtooth' : 'triangle';
      const baseFreq = isGlitch ? (220 + Math.random() * 400) : (440 + Math.sin(now * 10) * 120);
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(isGlitch ? 0.04 : 0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  /** Digital Glitch Noise Burst */
  playGlitchNoise() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.onended = () => {
        try {
          whiteNoise.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      whiteNoise.start(now);
    } catch (e) {}
  }

  /** Deep Bass Impact / Drop for VJ Reveal */
  playSubBassDrop() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 1.8);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 2.0);
    } catch (e) {}
  }

  /** Reboot Harmonic Chime */
  playRebootChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.06, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {}
        };

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.85);
      });
    } catch (e) {}
  }

  /** System Power-down / Offline Tone */
  playSystemOfflineSound() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 2.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      };

      osc.start(now);
      osc.stop(now + 2.2);
    } catch (e) {}
  }
}

// Global Audio Engine Instance
const stationAudio = new StationAudioEngine();

function playRebootChime() {
  if (typeof stationAudio !== 'undefined') {
    stationAudio.playRebootChime();
  }
}

// 2. Sound Toggle Management (ஆடியோ ஆன்/ஆஃப் ஸ்டேட்டைச் சேமிக்க)
let soundEnabled = true;
function toggleAudioSystem() {
  if (typeof stationAudio !== 'undefined') {
    stationAudio.resume();
    soundEnabled = stationAudio.toggleMute();
  } else {
    soundEnabled = !soundEnabled;
  }
  const audioBtn = document.getElementById('audio-toggle-btn') || document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const audioStatusText = document.getElementById('audio-status-text');

  if (audioBtn) {
    if (audioStatusText) {
      audioStatusText.innerText = soundEnabled ? "AUDIO ON" : "MUTED";
    }
    if (audioIcon) {
      audioIcon.innerText = soundEnabled ? "🔊" : "🔇";
    }
    audioBtn.classList.toggle('text-red-400', !soundEnabled);
    audioBtn.classList.toggle('text-cyan-400', soundEnabled);
  }
  if (typeof logAdminAction === 'function') {
    logAdminAction(`Audio system toggled to: ${soundEnabled ? 'ON' : 'MUTED'}`);
  }
}

if (typeof window !== 'undefined') {
  window.stationAudio = stationAudio;
  window.StationAudioEngine = StationAudioEngine;
  window.playRebootChime = playRebootChime;
  window.toggleAudioSystem = toggleAudioSystem;
  window.soundEnabled = soundEnabled;
}
if (typeof global !== 'undefined') {
  global.stationAudio = stationAudio;
  global.StationAudioEngine = StationAudioEngine;
  global.playRebootChime = playRebootChime;
  global.toggleAudioSystem = toggleAudioSystem;
  global.soundEnabled = soundEnabled;
}
