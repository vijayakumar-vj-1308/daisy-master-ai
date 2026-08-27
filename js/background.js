/**
 * RESECTOR 7 — DEEP SPACE & STATION ENVIRONMENT CANVAS
 * Renders rotating damaged Earth, stars, sleeping pod bay silhouettes,
 * cooling steam, electrical sparks, and emergency alert sweeps.
 */

class StationBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.sparks = [];
    this.steamParticles = [];
    this.earthRotation = 0;
    this.isEmergency = true;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initCanvas();
    this.initStars();
    this.bindEvents();
    this.animate();
  }

  initCanvas() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvas();
      this.initStars();
    });
  }

  setEmergency(state) {
    this.isEmergency = state;
  }

  initStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 4500);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05
      });
    }
  }

  spawnSpark() {
    if (this.sparks.length > 25) return;
    this.sparks.push({
      x: Math.random() * this.width * 0.4 + this.width * 0.3,
      y: Math.random() * this.height * 0.3 + this.height * 0.1,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 6 + 2,
      life: 1.0,
      decay: Math.random() * 0.04 + 0.02,
      color: Math.random() > 0.4 ? '#ff2a4b' : '#00f0ff'
    });
  }

  spawnSteam() {
    if (this.steamParticles.length > 40) return;
    this.steamParticles.push({
      x: Math.random() * this.width,
      y: this.height + 20,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 1.5 - 0.5,
      radius: Math.random() * 25 + 15,
      alpha: 0.25,
      decay: 0.003
    });
  }

  drawEarth() {
    const ctx = this.ctx;
    const earthRadius = Math.min(this.width, this.height) * 0.38;
    const earthX = this.width * 0.85;
    const earthY = this.height * 0.75;

    ctx.save();
    ctx.translate(earthX, earthY);

    // Atmospheric Glow
    const atmosGrad = ctx.createRadialGradient(0, 0, earthRadius * 0.85, 0, 0, earthRadius * 1.25);
    atmosGrad.addColorStop(0, 'rgba(0, 180, 255, 0.25)');
    atmosGrad.addColorStop(0.5, this.isEmergency ? 'rgba(255, 60, 80, 0.15)' : 'rgba(0, 240, 255, 0.12)');
    atmosGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = atmosGrad;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Doomed Planet Body
    const planetGrad = ctx.createRadialGradient(-earthRadius * 0.3, -earthRadius * 0.3, earthRadius * 0.1, 0, 0, earthRadius);
    planetGrad.addColorStop(0, '#2e1c14'); // Scorched barren land
    planetGrad.addColorStop(0.4, '#1b120c');
    planetGrad.addColorStop(0.85, '#0a0808');
    planetGrad.addColorStop(1, '#020204');

    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius, 0, Math.PI * 2);
    ctx.fill();

    // Damaged continents & toxic cloud banding
    ctx.save();
    ctx.clip();
    this.earthRotation += 0.0008;

    for (let b = 0; b < 6; b++) {
      ctx.beginPath();
      const bandOffset = (this.earthRotation * 100 + b * 70) % (earthRadius * 2) - earthRadius;
      ctx.ellipse(bandOffset, b * 40 - 120, earthRadius * 0.9, 28, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = b % 2 === 0 ? 'rgba(180, 70, 30, 0.08)' : 'rgba(80, 110, 130, 0.06)';
      ctx.fill();
    }
    ctx.restore();

    // Shadow Overlay
    const shadowGrad = ctx.createRadialGradient(earthRadius * 0.5, earthRadius * 0.5, earthRadius * 0.2, 0, 0, earthRadius);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawStationStructures() {
    const ctx = this.ctx;
    // Station interior silhouette (sleeping pod racks along left/bottom)
    ctx.fillStyle = 'rgba(2, 6, 14, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, this.height * 0.65);
    ctx.lineTo(this.width * 0.22, this.height * 0.82);
    ctx.lineTo(this.width * 0.45, this.height);
    ctx.closePath();
    ctx.fill();

    // Glowing Conduit lines
    ctx.strokeStyle = this.isEmergency ? 'rgba(255, 30, 64, 0.3)' : 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.72);
    ctx.lineTo(this.width * 0.2, this.height * 0.86);
    ctx.stroke();

    // Sleeping Pod Indicator Lights
    const podCount = 8;
    for (let p = 0; p < podCount; p++) {
      const px = 20 + p * 32;
      const py = this.height - 40 - (p * 12);
      ctx.fillStyle = this.isEmergency ? 'rgba(255, 140, 0, 0.7)' : 'rgba(0, 255, 136, 0.7)';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Deep space gradient backdrop
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    spaceGrad.addColorStop(0, '#010408');
    spaceGrad.addColorStop(0.5, '#030813');
    spaceGrad.addColorStop(1, '#060d1b');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw Twinkling Stars
    this.stars.forEach(star => {
      star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
      star.alpha = Math.max(0.1, Math.min(0.9, star.alpha));
      ctx.fillStyle = `rgba(200, 230, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Damaged Earth
    this.drawEarth();

    // Draw Station Architecture
    this.drawStationStructures();

    // Crisis Emergency Effects (Sparks & Steam)
    if (this.isEmergency) {
      if (Math.random() < 0.2) this.spawnSpark();
      if (Math.random() < 0.3) this.spawnSteam();

      // Render Steam
      this.steamParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.radius += 0.2;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.steamParticles.splice(idx, 1);
        } else {
          ctx.fillStyle = `rgba(200, 220, 240, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render Sparks
      this.sparks.forEach((sp, idx) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= sp.decay;
        if (sp.life <= 0) {
          this.sparks.splice(idx, 1);
        } else {
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(sp.x - sp.vx * 2, sp.y - sp.vy * 2);
          ctx.stroke();
        }
      });
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => this.animate());
    }
  }
}

if (typeof window !== 'undefined') {
  window.StationBackground = StationBackground;
}
if (typeof global !== 'undefined') {
  global.StationBackground = StationBackground;
}
