/**
 * RESECTOR 7 — PROCEDURAL HOLOGRAPHIC AI CORE AVATAR (DAISY)
 * Generates an interactive harmonic energy core that flickers and glitches
 * when corrupted (20%) and transforms into a pristine crystalline sphere upon reboot.
 */

class DaisyAvatarCore {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.memoryIntegrity = 20; // Starts at 20%
    this.isSpeaking = false;
    this.time = 0;
    this.glitchOffset = { x: 0, y: 0 };
    this.nodes = [];

    this.initNodes();
    this.animate();
  }

  setIntegrity(percent) {
    this.memoryIntegrity = percent;
  }

  setSpeaking(state) {
    this.isSpeaking = state;
  }

  initNodes() {
    this.nodes = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      this.nodes.push({
        baseRadius: 65,
        theta: theta,
        freq: Math.random() * 2 + 1,
        amplitude: Math.random() * 12 + 4
      });
    }
  }

  triggerGlitch() {
    this.glitchOffset.x = (Math.random() - 0.5) * 12;
    this.glitchOffset.y = (Math.random() - 0.5) * 8;
    setTimeout(() => {
      this.glitchOffset.x = 0;
      this.glitchOffset.y = 0;
    }, 120);
  }

  animate() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2 + this.glitchOffset.x;
    const cy = h / 2 + this.glitchOffset.y;

    ctx.clearRect(0, 0, w, h);
    this.time += 0.04;

    const isCorrupted = this.memoryIntegrity < 100;

    // Random glitch jump when corrupted
    if (isCorrupted && Math.random() < 0.05) {
      this.triggerGlitch();
    }

    // Outer Glow Halo
    const haloGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 110);
    if (isCorrupted) {
      haloGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      haloGrad.addColorStop(0.6, 'rgba(255, 30, 64, 0.18)');
      haloGrad.addColorStop(1, 'transparent');
    } else {
      haloGrad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      haloGrad.addColorStop(0.5, 'rgba(0, 255, 136, 0.2)');
      haloGrad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Data Rings
    for (let r = 0; r < 3; r++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.time * (r % 2 === 0 ? 0.5 : -0.7) + (r * Math.PI / 3));

      ctx.beginPath();
      ctx.ellipse(0, 0, 85 + r * 10, (30 + r * 8) * (isCorrupted ? 0.7 : 0.9), 0, 0, Math.PI * 2);
      ctx.strokeStyle = isCorrupted
        ? (r === 1 ? 'rgba(255, 30, 64, 0.5)' : 'rgba(0, 240, 255, 0.4)')
        : 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = isCorrupted ? 1 : 1.5;
      if (isCorrupted && r === 2) {
        ctx.setLineDash([4, 6]);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Dynamic Waveform Sphere Core
    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    this.nodes.forEach((node, i) => {
      const speechMultiplier = this.isSpeaking ? 1.8 : 1.0;
      const noise = isCorrupted ? (Math.sin(this.time * node.freq * 4 + i) * 6) : 0;
      const r = node.baseRadius + (Math.sin(this.time * 2 + node.theta * 3) * node.amplitude * speechMultiplier) + noise;
      const x = Math.cos(node.theta) * r;
      const y = Math.sin(node.theta) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    const coreGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
    if (isCorrupted) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#00f0ff');
      coreGrad.addColorStop(0.7, '#ff1e40');
      coreGrad.addColorStop(1, 'rgba(10, 20, 40, 0.4)');
    } else {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#00f0ff');
      coreGrad.addColorStop(0.8, '#00ff88');
      coreGrad.addColorStop(1, 'rgba(0, 50, 80, 0.4)');
    }
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.strokeStyle = isCorrupted ? 'rgba(255, 255, 255, 0.6)' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Central Glowing Pupil / Iris Node
    ctx.beginPath();
    const pupilR = (this.isSpeaking ? 14 : 9) + Math.sin(this.time * 4) * 2;
    ctx.arc(0, 0, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = isCorrupted ? '#ff1e40' : '#ffffff';
    ctx.shadowColor = isCorrupted ? '#ff1e40' : '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => this.animate());
    }
  }
}

if (typeof window !== 'undefined') {
  window.DaisyAvatarCore = DaisyAvatarCore;
}
if (typeof global !== 'undefined') {
  global.DaisyAvatarCore = DaisyAvatarCore;
}
