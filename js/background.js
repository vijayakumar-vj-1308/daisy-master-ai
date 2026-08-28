/**
 * RESECTOR 7 — DEEP SPACE & STATION ENVIRONMENT CANVAS
 * Features:
 * - Rich multi-layered twinkling & diamond-glinting starfield
 * - Periodic shooting stars / meteors ("erikkal") with glowing tails
 * - Detailed distant orbital satellite with dual solar arrays & blinking navigation beacons
 * - Rotating damaged Earth with atmospheric glow
 * - Station pod silhouettes with emergency conduits
 * - Clean, non-intrusive cinematic deep space aesthetic (zero steam/bubble clutter)
 */

class StationBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.brightStars = [];
    this.meteors = [];
    this.sparks = [];
    this.earthRotation = 0;
    this.isEmergency = true;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isAnimating = true;
    this.animFrameId = null;

    // Shooting star (erikkal) spawn timer (first meteor streaks within 1.2s)
    this.lastMeteorTime = Date.now() - 3000;
    this.nextMeteorDelay = 1200; // First meteor immediately

    // Distant Satellite State (starts already in sky on initial load)
    this.satellite = this.createSatellite(true);

    this.cachedGradients = {};
    this.initCanvas();
    this.initStars();
    this.bindEvents();
    this.animate();
  }

  initCanvas() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.initGradients();
  }

  initGradients() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const earthRadius = Math.min(this.width, this.height) * 0.38;

    // Space backdrop gradient
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    spaceGrad.addColorStop(0, '#010307');
    spaceGrad.addColorStop(0.5, '#020712');
    spaceGrad.addColorStop(1, '#050c18');

    // Planet Body
    const planetGrad = ctx.createRadialGradient(-earthRadius * 0.3, -earthRadius * 0.3, earthRadius * 0.1, 0, 0, earthRadius);
    planetGrad.addColorStop(0, '#2e1c14');
    planetGrad.addColorStop(0.4, '#1b120c');
    planetGrad.addColorStop(0.85, '#0a0808');
    planetGrad.addColorStop(1, '#020204');

    // Shadow Overlay
    const shadowGrad = ctx.createRadialGradient(earthRadius * 0.5, earthRadius * 0.5, earthRadius * 0.2, 0, 0, earthRadius);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    shadowGrad.addColorStop(1, 'transparent');

    this.cachedGradients = {
      spaceGrad,
      planetGrad,
      shadowGrad,
      earthRadius
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvas();
      this.initStars();
      if (this.satellite.x > this.width || this.satellite.x < 0) {
        this.satellite = this.createSatellite(true);
      }
    });

    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isAnimating = false;
          if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
        } else {
          if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
          }
        }
      });
    }
  }

  setEmergency(state) {
    this.isEmergency = state;
    this.initGradients();
  }

  createSatellite(initial = false) {
    const fromLeft = Math.random() > 0.3;
    const startY = Math.random() * (this.height * 0.35) + 30;
    const speed = (Math.random() * 0.35 + 0.3) * (fromLeft ? 1 : -1);
    const angle = (Math.random() - 0.5) * 0.12; // Gentle tilt

    return {
      x: initial ? (this.width * 0.35) : (fromLeft ? -60 : this.width + 60),
      y: startY,
      vx: speed,
      vy: speed * Math.tan(angle),
      angle: angle + (fromLeft ? 0 : Math.PI),
      scale: Math.random() * 0.25 + 0.85, // Crisp, clean scale
      beaconTimer: 0,
      beaconState: true
    };
  }

  initStars() {
    this.stars = [];
    this.brightStars = [];

    // 1. Regular background starfield (200 - 320 stars)
    const starCount = Math.floor((this.width * this.height) / 3800);
    const starPalettes = [
      'rgba(219, 234, 254, ', // ice blue
      'rgba(165, 243, 252, ', // soft cyan
      'rgba(255, 255, 255, ', // pure white
      'rgba(254, 240, 138, ', // subtle warm star
      'rgba(199, 210, 254, '  // deep lavender starlight
    ];

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.65 + 0.2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.0012 + 0.0004, /* Slow, relaxing, gentle twinkling */
        colorPrefix: starPalettes[Math.floor(Math.random() * starPalettes.length)]
      });
    }

    // 2. High-magnitude sparkling diamond glint stars (18 - 26 stars)
    const glintCount = Math.floor(this.width / 80);
    for (let j = 0; j < glintCount; j++) {
      this.brightStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.85),
        radius: Math.random() * 1.5 + 1.2,
        glintSize: Math.random() * 6 + 4,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.0015 + 0.0006, /* Slow, smooth glistening */
        color: Math.random() > 0.5 ? '#00f0ff' : '#ffffff'
      });
    }
  }

  spawnMeteor() {
    // Shooting star ("erikkal") spawning at random angle and speed
    const startX = Math.random() * (this.width * 0.8) + (this.width * 0.1);
    const startY = Math.random() * (this.height * 0.35) + 10;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35; // ~35° to 55° downward angle
    const speed = Math.random() * 9 + 11; // Fast, elegant streak
    const length = Math.random() * 70 + 90;

    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: length,
      alpha: 1.0,
      decay: Math.random() * 0.018 + 0.012,
      thickness: Math.random() * 1.2 + 1.2,
      color: Math.random() > 0.3 ? '#00f0ff' : '#ffffff'
    });
  }

  spawnSpark() {
    if (this.sparks.length > 15) return;
    this.sparks.push({
      x: Math.random() * this.width * 0.3 + this.width * 0.1,
      y: Math.random() * this.height * 0.3 + this.height * 0.6,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 1,
      life: 1.0,
      decay: Math.random() * 0.05 + 0.03,
      color: Math.random() > 0.4 ? '#ff2a4b' : '#00f0ff'
    });
  }

  drawStarfield() {
    const ctx = this.ctx;
    const now = Date.now();

    // 1. Draw Standard Starfield
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      const alpha = star.baseAlpha + Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.35;
      const clampedAlpha = Math.max(0.1, Math.min(1.0, alpha));

      ctx.fillStyle = `${star.colorPrefix}${clampedAlpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Sparkling Diamond Glint Stars (with 4-point cross flare)
    for (let j = 0; j < this.brightStars.length; j++) {
      const bStar = this.brightStars[j];
      const flare = Math.max(0.1, Math.sin(now * bStar.twinkleSpeed + bStar.twinklePhase));
      const currentGlint = bStar.glintSize * (0.4 + flare * 0.6);

      // Core point
      ctx.fillStyle = bStar.color;
      ctx.globalAlpha = 0.6 + flare * 0.4;
      ctx.beginPath();
      ctx.arc(bStar.x, bStar.y, bStar.radius, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal & Vertical glint rays
      ctx.strokeStyle = bStar.color;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(bStar.x - currentGlint, bStar.y);
      ctx.lineTo(bStar.x + currentGlint, bStar.y);
      ctx.moveTo(bStar.x, bStar.y - currentGlint);
      ctx.lineTo(bStar.x, bStar.y + currentGlint);
      ctx.stroke();

      ctx.globalAlpha = 1.0;
    }
  }

  drawMeteors() {
    const ctx = this.ctx;
    const now = Date.now();

    // Check if time to spawn a new shooting star / meteor
    if (now - this.lastMeteorTime > this.nextMeteorDelay) {
      this.spawnMeteor();
      this.lastMeteorTime = now;
      this.nextMeteorDelay = 4000 + Math.random() * 5500;
    }

    // Update & draw active meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.alpha -= m.decay;

      if (m.alpha <= 0 || m.x > this.width + 100 || m.y > this.height + 100) {
        this.meteors.splice(i, 1);
        continue;
      }

      // Tail vector
      const tailAngle = Math.atan2(m.vy, m.vx);
      const tailX = m.x - Math.cos(tailAngle) * m.length;
      const tailY = m.y - Math.sin(tailAngle) * m.length;

      // Gradient glowing tail
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, m.color === '#00f0ff' ? `rgba(0, 240, 255, ${m.alpha})` : `rgba(255, 255, 255, ${m.alpha})`);
      grad.addColorStop(0.3, `rgba(56, 189, 248, ${m.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Glowing bright head
      const headGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
      headGlow.addColorStop(0.5, `rgba(0, 240, 255, ${m.alpha * 0.8})`);
      headGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawSatellite() {
    const ctx = this.ctx;
    const s = this.satellite;

    // Update satellite position
    s.x += s.vx;
    s.y += s.vy;
    s.beaconTimer += 0.05;
    s.beaconState = Math.sin(s.beaconTimer) > 0.3;

    // If drifted off-screen, reset with a new orbital path
    if (s.vx > 0 && s.x > this.width + 120) {
      this.satellite = this.createSatellite();
      return;
    } else if (s.vx < 0 && s.x < -120) {
      this.satellite = this.createSatellite();
      return;
    }

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.scale(s.scale, s.scale);

    // 1. Central Satellite Core Chassis
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.fillRect(-10, -6, 20, 12);
    ctx.strokeRect(-10, -6, 20, 12);

    // Inner Metallic Core Details
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, -4, 12, 8);

    // 2. Solar Panel Arms (Left & Right)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-18, 0);
    ctx.moveTo(10, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();

    // 3. Solar Panel Wings (Grid textured deep blue cells)
    const panelWidth = 24;
    const panelHeight = 10;

    // Left Solar Panel
    ctx.fillStyle = 'rgba(14, 116, 144, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 0.8;
    ctx.fillRect(-18 - panelWidth, -panelHeight / 2, panelWidth, panelHeight);
    ctx.strokeRect(-18 - panelWidth, -panelHeight / 2, panelWidth, panelHeight);

    // Solar Panel Grid Lines (Left)
    ctx.beginPath();
    ctx.moveTo(-18 - panelWidth / 2, -panelHeight / 2);
    ctx.lineTo(-18 - panelWidth / 2, panelHeight / 2);
    ctx.stroke();

    // Right Solar Panel
    ctx.fillRect(18, -panelHeight / 2, panelWidth, panelHeight);
    ctx.strokeRect(18, -panelHeight / 2, panelWidth, panelHeight);

    // Solar Panel Grid Lines (Right)
    ctx.beginPath();
    ctx.moveTo(18 + panelWidth / 2, -panelHeight / 2);
    ctx.lineTo(18 + panelWidth / 2, panelHeight / 2);
    ctx.stroke();

    // 4. Communication Dish Antenna / Probe Sensor
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -13);
    ctx.stroke();

    // Dish arc
    ctx.beginPath();
    ctx.arc(0, -13, 4, Math.PI, 0);
    ctx.stroke();

    // 5. Navigation Beacon Strobes (Port Red, Starboard Cyan)
    if (s.beaconState) {
      // Left Port Beacon (Red Strobe)
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-18 - panelWidth, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Right Starboard Beacon (Cyan Strobe)
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(18 + panelWidth, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawEarth() {
    const ctx = this.ctx;
    const g = this.cachedGradients;
    const earthRadius = (g && g.earthRadius) || Math.min(this.width, this.height) * 0.38;
    const earthX = this.width * 0.85;
    const earthY = this.height * 0.75;

    ctx.save();
    ctx.translate(earthX, earthY);

    // Atmospheric Glow
    if (!this.cachedGradients.atmosGrad || this.cachedGradients.lastEmergency !== this.isEmergency) {
      const atmosGrad = ctx.createRadialGradient(0, 0, earthRadius * 0.85, 0, 0, earthRadius * 1.25);
      atmosGrad.addColorStop(0, 'rgba(0, 180, 255, 0.22)');
      atmosGrad.addColorStop(0.5, this.isEmergency ? 'rgba(255, 60, 80, 0.12)' : 'rgba(0, 240, 255, 0.10)');
      atmosGrad.addColorStop(1, 'transparent');
      this.cachedGradients.atmosGrad = atmosGrad;
      this.cachedGradients.lastEmergency = this.isEmergency;
    }

    ctx.fillStyle = this.cachedGradients.atmosGrad;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Doomed Planet Body (using cached gradient)
    ctx.fillStyle = g.planetGrad || '#0a0808';
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
    ctx.fillStyle = g.shadowGrad || 'rgba(0,0,0,0.6)';
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
    if (!this.isAnimating) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Deep space gradient backdrop
    ctx.fillStyle = (this.cachedGradients && this.cachedGradients.spaceGrad) || '#020712';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Twinkling Starfield (Shining / Sparkling Stars)
    this.drawStarfield();

    // 3. Draw Shooting Stars / Meteors ("Erikkal")
    this.drawMeteors();

    // 4. Draw Orbiting Sci-Fi Satellite
    this.drawSatellite();

    // 5. Draw Damaged Earth
    this.drawEarth();

    // 6. Draw Station Architecture & Silhouette
    this.drawStationStructures();

    // 7. Emergency Electrical Sparks (Minimal & Crisp, Zero Steam/Bubbles)
    if (this.isEmergency) {
      if (Math.random() < 0.15) this.spawnSpark();

      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const sp = this.sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= sp.decay;

        if (sp.life <= 0) {
          this.sparks.splice(i, 1);
        } else {
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(sp.x - sp.vx * 2, sp.y - sp.vy * 2);
          ctx.stroke();
        }
      }
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      this.animFrameId = requestAnimationFrame(() => this.animate());
    }
  }
}

if (typeof window !== 'undefined') {
  window.StationBackground = StationBackground;
}
if (typeof global !== 'undefined') {
  global.StationBackground = StationBackground;
}
