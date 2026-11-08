import React, { useEffect, useRef } from 'react';

/**
 * High-performance 3D Spatial Canvas Background
 * Renders an interactive 3D perspective cyber-transit grid and floating luminous data nodes.
 * Reacts smoothly to mouse parallax with 60 FPS requestAnimationFrame loop.
 */
export default function Canvas3DBackground({ intensity = 'normal' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for 3D parallax
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // 3D Particles (Data packets moving in z-depth)
    const particleCount = intensity === 'subtle' ? 45 : 75;
    const particles = [];
    const colors = ['#FE8505', '#E52E01', '#ff9c2b', '#00f0ff', '#FFFDE1'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 1,
        prevZ: 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1.8 + 0.8
      });
    }

    // Perspective Grid Settings
    let gridOffset = 0;
    const fov = 350;

    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const tiltX = (mouse.x - width / 2) * 0.0003;
      const tiltY = (mouse.y - height / 2) * 0.0003;

      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric space gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2 + tiltX * 200,
        height * 0.45 + tiltY * 200,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(254, 133, 5, 0.04)');
      bgGrad.addColorStop(0.35, 'rgba(229, 46, 1, 0.025)');
      bgGrad.addColorStop(0.8, 'rgba(8, 12, 20, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- Draw 3D Receding Horizon Grid (Tron / Cyber-Transit Perspective) ---
      const horizonY = height * 0.58 + (mouse.y - height / 2) * 0.05;
      const vpX = width / 2 + (mouse.x - width / 2) * 0.08;

      ctx.save();
      ctx.strokeStyle = 'rgba(254, 133, 5, 0.12)';
      ctx.lineWidth = 1;

      // Perspective Longitudinal Lines (Radiating from Vanishing Point)
      const numLongLines = 22;
      for (let i = -numLongLines / 2; i <= numLongLines / 2; i++) {
        const bottomX = width / 2 + i * (width / 14);
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(bottomX, height + 80);
        ctx.stroke();
      }

      // 3D Transverse Lines (Moving towards the viewer)
      gridOffset = (gridOffset + 0.6) % 36;
      for (let z = 0; z < 14; z++) {
        const lineDist = Math.pow((z + gridOffset / 36) / 14, 2.5);
        const y = horizonY + lineDist * (height - horizonY + 80);
        const alpha = Math.min(0.22, lineDist * 0.3);

        ctx.strokeStyle = `rgba(254, 133, 5, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // --- Draw 3D Floating Data Packets (Flying in Z-depth) ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.prevZ = p.z;
        p.z -= p.speed * 2.5;

        if (p.z <= 0) {
          p.z = 1000;
          p.prevZ = 1000;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = fov / p.z;
        const px = width / 2 + p.x * k + tiltX * 80;
        const py = height / 2 + p.y * k + tiltY * 80;

        const prevK = fov / p.prevZ;
        const prevPx = width / 2 + p.x * prevK + tiltX * 80;
        const prevPy = height / 2 + p.y * prevK + tiltY * 80;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, Math.max(0, 1 - p.z / 1000));
          const size = Math.max(0.8, p.size * k * 0.8);

          // Draw trailing speed warp
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = depthAlpha * 0.6;
          ctx.lineWidth = size * 0.8;
          ctx.stroke();

          // Draw Glowing Core
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = depthAlpha * 0.9;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ willChange: 'transform' }}
    />
  );
}
