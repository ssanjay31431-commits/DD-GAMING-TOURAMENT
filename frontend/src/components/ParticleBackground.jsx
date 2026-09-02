import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse & Touch Drag State
    const pointer = {
      x: width / 2,
      y: height / 2,
      px: width / 2,
      py: height / 2,
      radius: 200,
      active: false,
      isDragging: false
    };

    const dragSparks = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseDown = (e) => {
      pointer.isDragging = true;
      pointer.active = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.px = e.clientX;
      pointer.py = e.clientY;
    };

    const handleMouseMove = (e) => {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;

      if (pointer.isDragging) {
        const vx = (pointer.x - pointer.px) * 0.5;
        const vy = (pointer.y - pointer.py) * 0.5;
        const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6', '#f59e0b'];

        for (let i = 0; i < 4; i++) {
          dragSparks.push({
            x: pointer.x + (Math.random() - 0.5) * 12,
            y: pointer.y + (Math.random() - 0.5) * 12,
            vx: vx + (Math.random() - 0.5) * 3,
            vy: vy + (Math.random() - 0.5) * 3,
            radius: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
            decay: Math.random() * 0.03 + 0.02
          });
        }
      }
    };

    const handleMouseUp = () => {
      pointer.isDragging = false;
    };

    const handleMouseLeave = () => {
      pointer.active = false;
      pointer.isDragging = false;
    };

    // Touch Support
    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        pointer.isDragging = true;
        pointer.active = true;
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;

        const vx = (pointer.x - pointer.px) * 0.5;
        const vy = (pointer.y - pointer.py) * 0.5;
        const colors = ['#8b5cf6', '#06b6d4', '#ec4899'];

        for (let i = 0; i < 3; i++) {
          dragSparks.push({
            x: pointer.x,
            y: pointer.y,
            vx: vx + (Math.random() - 0.5) * 2.5,
            vy: vy + (Math.random() - 0.5) * 2.5,
            radius: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
            decay: 0.035
          });
        }
      }
    };

    const handleTouchEnd = () => {
      pointer.isDragging = false;
      pointer.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Floating 3D Pool Balls & Gaming Emblem Elements
    const poolBalls = [
      { x: width * 0.12, y: height * 0.2, r: 28, vx: 0.35, vy: 0.25, type: '8ball', angle: 0 },
      { x: width * 0.85, y: height * 0.35, r: 34, vx: -0.25, vy: 0.3, type: 'cue', angle: 0 },
      { x: width * 0.45, y: height * 0.75, r: 24, vx: 0.2, vy: -0.25, type: 'striped', color: '#ec4899', angle: 0 },
      { x: width * 0.75, y: height * 0.8, r: 22, vx: -0.3, vy: -0.2, type: 'solid', color: '#06b6d4', angle: 0 },
      { x: width * 0.25, y: height * 0.65, r: 30, vx: 0.25, vy: 0.2, type: 'gold', color: '#f59e0b', angle: 0 },
      { x: width * 0.65, y: height * 0.18, r: 26, vx: -0.2, vy: 0.2, type: 'icon', symbol: '🎮', color: '#a855f7' },
      { x: width * 0.35, y: height * 0.35, r: 24, vx: 0.3, vy: -0.15, type: 'icon', symbol: '🏆', color: '#eab308' },
      { x: width * 0.55, y: height * 0.88, r: 22, vx: -0.2, vy: -0.2, type: 'icon', symbol: '🎯', color: '#ef4444' }
    ];

    // Ambient Energy Dust Particles
    const dustCount = Math.min(Math.floor(width / 18), 55);
    const dustParticles = [];
    const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6', '#f59e0b', '#10b981'];

    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.7 + 0.2
      });
    }

    let scanBeamY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Perspective Esports Stage Arena Grid (Floor Perspective Lines)
      const horizonY = height * 0.75;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.09)';
      ctx.lineWidth = 1;

      // Vertical perspective fan lines
      const fanCount = 20;
      for (let i = -fanCount; i <= fanCount; i++) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + (i * width) / fanCount, height);
        ctx.lineTo(width / 2 + (i * 22), horizonY);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = horizonY; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Horizontal Laser Scanning Beam
      scanBeamY = (scanBeamY + 0.9) % height;
      const laserGrad = ctx.createLinearGradient(0, scanBeamY, width, scanBeamY);
      laserGrad.addColorStop(0, 'rgba(139, 92, 246, 0)');
      laserGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.18)');
      laserGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = laserGrad;
      ctx.fillRect(0, scanBeamY - 2, width, 4);

      // 2. Draw Dust Particles
      dustParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pointer Attraction
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pullDist = pointer.isDragging ? 220 : 140;

          if (dist < pullDist) {
            const force = (1 - dist / pullDist) * (pointer.isDragging ? 2.5 : 1);
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      // 3. Render 3D Floating 8-Balls & Esports Orbs
      poolBalls.forEach((ball) => {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.angle += 0.005;

        // Bounce boundaries
        if (ball.x < ball.r || ball.x > width - ball.r) ball.vx *= -1;
        if (ball.y < ball.r || ball.y > height - ball.r) ball.vy *= -1;

        ctx.save();
        ctx.translate(ball.x, ball.y);

        if (ball.type === '8ball') {
          // 8-Ball Radial 3D Sphere Shading
          const sphereGrad = ctx.createRadialGradient(-ball.r * 0.3, -ball.r * 0.3, ball.r * 0.1, 0, 0, ball.r);
          sphereGrad.addColorStop(0, '#334155');
          sphereGrad.addColorStop(0.4, '#0f172a');
          sphereGrad.addColorStop(1, '#020617');

          ctx.beginPath();
          ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#8b5cf6';
          ctx.fill();
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // White Number Circle
          ctx.beginPath();
          ctx.arc(0, 0, ball.r * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // 8 Text
          ctx.font = `900 ${Math.round(ball.r * 0.48)}px Orbitron, sans-serif`;
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('8', 0, 1);
        } else if (ball.type === 'cue') {
          // Cue Ball 3D Shading
          const sphereGrad = ctx.createRadialGradient(-ball.r * 0.3, -ball.r * 0.3, ball.r * 0.1, 0, 0, ball.r);
          sphereGrad.addColorStop(0, '#ffffff');
          sphereGrad.addColorStop(0.7, '#e2e8f0');
          sphereGrad.addColorStop(1, '#94a3b8');

          ctx.beginPath();
          ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#06b6d4';
          ctx.fill();

          // Red Dot on Cue Ball
          ctx.beginPath();
          ctx.arc(-ball.r * 0.2, -ball.r * 0.2, ball.r * 0.12, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        } else if (ball.type === 'icon') {
          ctx.font = `${Math.round(ball.r * 1.4)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 20;
          ctx.shadowColor = ball.color;
          ctx.fillText(ball.symbol, 0, 0);
        } else {
          // Colored Glowing Energy Sphere
          const sphereGrad = ctx.createRadialGradient(-ball.r * 0.3, -ball.r * 0.3, ball.r * 0.1, 0, 0, ball.r);
          sphereGrad.addColorStop(0, '#ffffff');
          sphereGrad.addColorStop(0.4, ball.color);
          sphereGrad.addColorStop(1, '#020617');

          ctx.beginPath();
          ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
          ctx.fillStyle = sphereGrad;
          ctx.shadowBlur = 20;
          ctx.shadowColor = ball.color;
          ctx.fill();
        }

        ctx.restore();
      });

      // 4. Render Drag Plasma Sparks
      for (let i = dragSparks.length - 1; i >= 0; i--) {
        const s = dragSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          dragSparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = s.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 8 Ball Esports Arena Canvas */}
      <canvas ref={canvasRef} className="w-full h-full opacity-85" />

      {/* Neon Purple & Electric Blue Ambient Arena Lights */}
      <div className="absolute -top-36 -left-36 w-[32rem] h-[32rem] bg-purple-600/25 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 -right-36 w-[34rem] h-[34rem] bg-cyan-500/25 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-36 left-1/3 w-[36rem] h-[36rem] bg-indigo-600/25 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }} />
    </div>
  );
}
