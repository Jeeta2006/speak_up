import React, { useEffect, useRef } from 'react';

interface SplashScreenProps {
  onLaunch: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onLaunch }) => {
  const splashRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      isRed: boolean;
    }> = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        isRed: Math.random() < 0.25,
      });
    }

    const MESH_ROWS = 10;
    const MESH_COLS = 16;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;

      for (let i = 0; i < MESH_ROWS; i++) {
        ctx.beginPath();
        for (let j = 0; j < MESH_COLS; j++) {
          const x = (j / (MESH_COLS - 1)) * width;
          const baseY = (i / (MESH_ROWS - 1)) * height;
          const wave = Math.sin(time + j * 0.5 + i * 0.5) * 30;
          const y = baseY + wave;

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.isRed) {
          ctx.fillStyle = 'rgba(255, 60, 60, 0.8)';
          ctx.shadowColor = 'rgba(255, 60, 60, 0.5)';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleLaunch = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple-wave');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    btn.appendChild(ripple);

    if (splashRef.current) {
      splashRef.current.classList.add('fade-out');
    }

    setTimeout(() => {
      onLaunch();
    }, 800);
  };

  return (
    <div id="splash-screen" ref={splashRef}>
      <canvas id="splash-canvas" ref={canvasRef} />
      <div className="splash-glow"></div>

      <div className="float-icon" style={{ fontSize: '24px' }}>⚠️</div>
      <div className="float-icon" style={{ fontSize: '32px' }}>📍</div>
      <div className="float-icon" style={{ fontSize: '28px' }}>💬</div>
      <div className="float-icon" style={{ fontSize: '20px' }}>🔊</div>
      <div className="float-icon" style={{ fontSize: '36px' }}>📢</div>

      <div className="splash-content">
        <div className="waveform-bar-wrap" id="waveform">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="waveform-bar"
              style={{ animationDelay: `${i * 0.08}s` }}
            ></div>
          ))}
        </div>
        <h1 className="splash-title">SPEAKUP</h1>
        <p className="splash-tagline">
          Raise Your Voice. <span>Drive Change.</span>
        </p>
        <button id="splash-cta" onClick={handleLaunch}>
          Get Started &rarr;
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
