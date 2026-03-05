import React, { useEffect, useRef, useMemo } from 'react';
import { ProProjectData, ProLine, ProAnimationType } from '../../types/karaokeProTypes';

interface KaraokeProRendererProps {
  currentTime: number;
  project: ProProjectData;
  exportMode?: boolean;
  exportCanvasRef?: React.RefObject<HTMLCanvasElement>;
}

// ─── VFX Particle ──────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  angle?: number;
  shape?: string;
  layer?: number;
  phase?: number;
}

function initParticles(type: string, density: number, w: number, h: number): Particle[] {
  const count = Math.floor(density);
  const particles: Particle[] = [];
  const neonColors = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899'];

  for (let i = 0; i < count; i++) {
    const base: Particle = {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      vy: 0,
      size: 2,
      opacity: 0.8,
      color: '#ffffff',
      life: Math.random() * 100,
      maxLife: 100,
    };

    switch (type) {
      case 'stars':
        particles.push({
          ...base,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
        break;
      case 'snow':
        particles.push({
          ...base,
          size: Math.random() * 4 + 2,
          vy: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          y: Math.random() * h,
        });
        break;
      case 'fireflies':
        particles.push({
          ...base,
          color: `hsl(${50 + Math.random() * 40}, 100%, 70%)`,
          size: Math.random() * 3 + 1,
          phase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.3,
        });
        break;
      case 'bubbles':
        particles.push({
          ...base,
          size: Math.random() * 12 + 4,
          vy: -(Math.random() * 1.5 + 0.5),
          vx: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.3 + 0.1,
          color: `hsla(${200 + Math.random() * 60}, 80%, 80%, 0.3)`,
        });
        break;
      case 'nebula':
        particles.push({
          ...base,
          color: neonColors[Math.floor(Math.random() * neonColors.length)],
          size: Math.random() * 5 + 1,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.1,
          life: Math.random() * 200,
          maxLife: 200,
        });
        break;
      case 'parallax-stars':
        {
          const layer = Math.floor(i % 3);
          particles.push({
            ...base,
            size: (layer + 1) * 0.8,
            vx: -(layer + 1) * 0.2,
            vy: 0,
            opacity: (layer + 1) * 0.25,
            layer,
          });
        }
        break;
      case 'geometric-drift':
        {
          const shapes = ['triangle', 'square', 'circle'];
          particles.push({
            ...base,
            shape: shapes[Math.floor(Math.random() * 3)],
            size: Math.random() * 16 + 6,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.3,
            angle: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.25 + 0.05,
            color: neonColors[Math.floor(Math.random() * neonColors.length)],
          });
        }
        break;
      case 'fluid-smoke':
        particles.push({
          ...base,
          size: Math.random() * 20 + 8,
          vy: -(Math.random() * 0.8 + 0.3),
          vx: (Math.random() - 0.5) * 0.6,
          opacity: 0,
          life: 0,
          maxLife: 180 + Math.random() * 60,
          color: `hsla(0, 0%, ${80 + Math.random() * 20}%, 0.3)`,
        });
        break;
    }
  }
  return particles;
}

function updateParticles(
  particles: Particle[],
  type: string,
  speed: number,
  w: number,
  h: number,
  dt: number
): Particle[] {
  return particles.map((p) => {
    let nx = p.x + p.vx * speed * dt;
    let ny = p.y + p.vy * speed * dt;
    let nlife = p.life + dt * 0.5;
    let nopacity = p.opacity;
    let nangle = (p.angle ?? 0) + 0.005 * speed * dt;

    // Wrap around
    if (nx < -20) nx = w + 20;
    if (nx > w + 20) nx = -20;

    switch (type) {
      case 'snow':
        if (ny > h + 20) {
          ny = -20;
          nx = Math.random() * w;
        }
        break;
      case 'bubbles':
        if (ny < -20) {
          ny = h + 20;
          nx = Math.random() * w;
        }
        break;
      case 'fluid-smoke':
        if (nlife < p.maxLife * 0.1) nopacity = (nlife / (p.maxLife * 0.1)) * 0.25;
        else if (nlife > p.maxLife * 0.7)
          nopacity = (1 - (nlife - p.maxLife * 0.7) / (p.maxLife * 0.3)) * 0.25;
        else nopacity = 0.25;
        if (nlife >= p.maxLife) {
          nlife = 0;
          nx = Math.random() * w;
          ny = h + 20;
        }
        if (ny < -p.size) {
          nlife = 0;
          nx = Math.random() * w;
          ny = h + 20;
        }
        break;
      case 'nebula':
        nlife++;
        if (nlife > p.maxLife) nlife = 0;
        nopacity = Math.sin((nlife / p.maxLife) * Math.PI) * 0.5;
        break;
      default:
        if (ny > h + 20) ny = -20;
        if (ny < -20) ny = h + 20;
    }

    return { ...p, x: nx, y: ny, life: nlife, opacity: nopacity, angle: nangle };
  });
}

function drawVFX(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  type: string,
  w: number,
  h: number,
  time: number,
  speed: number,
  density: number
) {
  ctx.clearRect(0, 0, w, h);

  if (type === 'aurora') {
    const bands = 4;
    for (let b = 0; b < bands; b++) {
      const hue = (b * 60 + time * speed * 15) % 360;
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0)`);
      gradient.addColorStop(0.3, `hsla(${hue}, 100%, 60%, 0.15)`);
      gradient.addColorStop(0.7, `hsla(${(hue + 40) % 360}, 100%, 70%, 0.1)`);
      gradient.addColorStop(1, `hsla(${(hue + 80) % 360}, 100%, 60%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const yBase = h * 0.2 + b * h * 0.12;
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= w; x += 10) {
        const y =
          yBase +
          Math.sin(x / 120 + time * speed * 0.8 + b * 1.2) * 50 +
          Math.sin(x / 60 + time * speed * 0.4) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (type === 'glitch-lines') {
    const numLines = Math.floor(Math.sin(time * speed * 3.7) * 4 + 5);
    for (let i = 0; i < numLines; i++) {
      const seed = Math.sin(time * speed * 10 + i * 127.4) * 10000;
      const y = Math.abs(seed % h);
      const lineH = Math.abs(Math.sin(seed * 0.01) * 3 + 1);
      const glitchW = Math.abs(Math.sin(seed * 0.03) * w * 0.5) + w * 0.1;
      const glitchX = Math.abs(Math.sin(seed * 0.07) * w * 0.6);
      const hue = Math.abs(seed * 0.1) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.15 + Math.abs(Math.sin(seed * 0.02)) * 0.2})`;
      ctx.fillRect(glitchX, y, glitchW, lineH);
    }
    return;
  }

  if (type === 'matrix') {
    const colW = Math.max(12, Math.floor(w / (density * 0.5)));
    const numCols = Math.floor(w / colW);
    const charH = 14;
    const chars = '01アイウエオカキクケコ二ナニヌネノ'.split('');
    ctx.font = `${charH}px monospace`;

    for (let i = 0; i < numCols; i++) {
      const x = i * colW;
      const colSpeedMod = (Math.sin(i * 2.4) * 0.5 + 1.0) * speed;
      const colOffset = Math.sin(i * 1.618) * h;
      const headY = ((time * colSpeedMod * 60 + colOffset + h * 2) % (h * 1.5)) - h * 0.3;

      for (let j = 20; j >= 0; j--) {
        const charY = headY - j * charH;
        if (charY < -charH || charY > h + charH) continue;
        const alpha = Math.max(0, (20 - j) / 20);
        if (j === 0) ctx.fillStyle = `rgba(180, 255, 180, ${alpha})`;
        else ctx.fillStyle = `rgba(0, 200, 70, ${alpha * 0.7})`;
        const charIdx =
          Math.floor(Math.abs(Math.sin(i * 100 + j * 7.3 + time * colSpeedMod)) * chars.length) %
          chars.length;
        ctx.fillText(chars[charIdx], x, charY);
      }
    }
    return;
  }

  // Particle-based VFX
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

    switch (type) {
      case 'stars': {
        const twinkle = 0.5 + 0.5 * Math.sin(p.life * 0.1 + p.x * 0.05);
        ctx.globalAlpha = p.opacity * twinkle;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.size > 1.5) {
          ctx.shadowColor = '#fffacd';
          ctx.shadowBlur = 4;
          ctx.fill();
        }
        break;
      }
      case 'snow': {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'fireflies': {
        const glow = Math.abs(Math.sin((p.life + (p.phase ?? 0)) * 0.05));
        ctx.globalAlpha = p.opacity * glow;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(
          p.x + Math.sin(p.life * 0.03 + (p.phase ?? 0)) * 20,
          p.y + Math.cos(p.life * 0.02 + (p.phase ?? 0)) * 15,
          p.size,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }
      case 'bubbles': {
        ctx.strokeStyle = `rgba(150, 200, 255, ${p.opacity * 2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(150, 200, 255, ${p.opacity * 0.5})`;
        ctx.fill();
        break;
      }
      case 'nebula': {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'parallax-stars': {
        const twinkle = 0.5 + 0.5 * Math.sin(p.life * 0.08 + p.x);
        ctx.globalAlpha = p.opacity * twinkle;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'geometric-drift': {
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle ?? 0);
        if (p.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.866, p.size * 0.5);
          ctx.lineTo(-p.size * 0.866, p.size * 0.5);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'fluid-smoke': {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(200, 200, 200, ${p.opacity})`);
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }
}

function drawVisualizer(
  ctx: CanvasRenderingContext2D,
  type: string,
  w: number,
  h: number,
  time: number
) {
  ctx.clearRect(0, 0, w, h);
  if (type === 'none') return;

  if (type === 'ethereal-flow') {
    const lines = 3;
    for (let l = 0; l < lines; l++) {
      const hue = (l * 120 + time * 30) % 360;
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.4 - l * 0.1})`;
      ctx.lineWidth = 2 - l * 0.5;
      const yBase = h * 0.5;
      for (let x = 0; x <= w; x += 4) {
        const amp = h * 0.08 * (1 - l * 0.2);
        const y =
          yBase +
          Math.sin(x / 60 + time * 2 + l * 1.2) * amp +
          Math.sin(x / 30 + time * 3.7 + l * 0.8) * amp * 0.4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return;
  }

  if (type === 'prism-spectrum') {
    const bars = 64;
    const barW = (w / bars) * 0.8;
    const gap = (w / bars) * 0.2;
    for (let i = 0; i < bars; i++) {
      const x = i * (barW + gap) + gap / 2;
      const amp =
        Math.abs(Math.sin(i * 0.3 + time * 2.5)) * 0.5 +
        Math.abs(Math.sin(i * 0.7 + time * 1.8)) * 0.3 +
        Math.abs(Math.sin(i * 0.15 + time * 3.2)) * 0.2;
      const barH = amp * h * 0.35;
      const hue = (i / bars) * 360;
      const gradient = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.5 - barH);
      gradient.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.3)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.8)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, h * 0.5 - barH, barW, barH);
      ctx.fillRect(x, h * 0.5, barW, barH * 0.4); // mirror
    }
  }
}

// ─── Word highlight helpers ─────────────────────────────────────────────────
function getWordStyle(
  word: { startTime: number; endTime: number },
  isActive: boolean,
  isPast: boolean,
  isFuture: boolean,
  animation: ProAnimationType,
  style: ProProjectData['style'],
  adjustedTime: number
): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    letterSpacing: style.letterSpacing,
    color: isFuture ? style.initialColor : style.activeColor,
    display: 'inline-block',
    transition: 'color 0.15s, transform 0.15s, text-shadow 0.15s',
    textShadow: style.shadowBlur > 0 ? `0 0 ${style.shadowBlur}px ${style.shadowColor}` : undefined,
    WebkitTextStroke:
      style.strokeWidth > 0 ? `${style.strokeWidth}px ${style.strokeColor}` : undefined,
    position: 'relative',
  };

  if (isActive || isPast) {
    if (style.glowIntensity > 0) {
      base.textShadow = `0 0 ${style.glowIntensity * 2}px ${style.activeColor}, 0 0 ${style.glowIntensity}px ${style.activeColor}`;
    }
  }

  switch (animation) {
    case 'rhythmic-pulse':
      if (isActive) base.transform = 'scale(1.25)';
      break;
    case 'zoom':
      if (isActive) base.transform = 'scale(1.35)';
      if (isPast) base.transform = 'scale(1.1)';
      break;
    case 'bounce':
      if (isActive) base.animation = 'pro-bounce 0.4s ease infinite alternate';
      break;
    case 'neon-glow':
      if (isActive || isPast) {
        base.textShadow = `0 0 10px ${style.activeColor}, 0 0 20px ${style.activeColor}, 0 0 40px ${style.activeColor}`;
      }
      break;
    case 'smooth':
      base.transition = 'color 0.3s ease, text-shadow 0.3s ease';
      break;
    case 'rainbow':
      if (isActive) {
        base.animation = 'pro-rainbow 1s linear infinite';
      }
      break;
    default:
      break;
  }

  return base;
}

function getFillProgress(
  word: { startTime: number; endTime: number },
  adjustedTime: number
): number {
  if (adjustedTime < word.startTime) return 0;
  if (adjustedTime >= word.endTime) return 1;
  return (adjustedTime - word.startTime) / (word.endTime - word.startTime);
}

// ─── Component ───────────────────────────────────────────────────────────────
const KaraokeProRenderer: React.FC<KaraokeProRendererProps> = ({
  currentTime,
  project,
  exportMode,
  exportCanvasRef,
}) => {
  const vfxCanvasRef = useRef<HTMLCanvasElement>(null);
  const vizCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const bgVidRef = useRef<HTMLVideoElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastVfxTypeRef = useRef<string>('');
  const animTimeRef = useRef(0);
  const lastRafTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const { style, lines, backgroundUrl, backgroundType } = project;
  const adjustedTime = currentTime;

  // Init/reinit particles when VFX type changes
  useEffect(() => {
    const canvas = vfxCanvasRef.current;
    if (!canvas) return;
    if (style.vfxType !== lastVfxTypeRef.current) {
      lastVfxTypeRef.current = style.vfxType;
      if (!['none', 'aurora', 'glitch-lines', 'matrix'].includes(style.vfxType)) {
        particlesRef.current = initParticles(
          style.vfxType,
          style.vfxDensity,
          canvas.width,
          canvas.height
        );
      } else {
        particlesRef.current = [];
      }
    }
  }, [style.vfxType, style.vfxDensity]);

  // Main animation loop
  useEffect(() => {
    const vfxCanvas = vfxCanvasRef.current;
    const vizCanvas = vizCanvasRef.current;
    if (!vfxCanvas || !vizCanvas) return;
    const vfxCtx = vfxCanvas.getContext('2d');
    const vizCtx = vizCanvas.getContext('2d');
    if (!vfxCtx || !vizCtx) return;

    const animate = (timestamp: number) => {
      const dt = Math.min((timestamp - lastRafTimeRef.current) / 16, 3);
      lastRafTimeRef.current = timestamp;
      animTimeRef.current += dt * 0.016;

      const w = vfxCanvas.width;
      const h = vfxCanvas.height;

      // Update + draw particles
      if (!['none', 'aurora', 'glitch-lines', 'matrix'].includes(style.vfxType)) {
        particlesRef.current = updateParticles(
          particlesRef.current,
          style.vfxType,
          style.vfxSpeed,
          w,
          h,
          dt
        );
      }
      drawVFX(
        vfxCtx,
        particlesRef.current,
        style.vfxType,
        w,
        h,
        animTimeRef.current,
        style.vfxSpeed,
        style.vfxDensity
      );

      // Visualizer
      drawVisualizer(vizCtx, style.visualizerType, w, h, animTimeRef.current);

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [style.vfxType, style.vfxSpeed, style.vfxDensity, style.visualizerType]);

  // Export composite
  useEffect(() => {
    if (!exportMode || !exportCanvasRef?.current) return;
    const expCtx = exportCanvasRef.current.getContext('2d');
    if (!expCtx) return;
    const ew = exportCanvasRef.current.width;
    const eh = exportCanvasRef.current.height;
    expCtx.clearRect(0, 0, ew, eh);
    expCtx.fillStyle = '#000';
    expCtx.fillRect(0, 0, ew, eh);
    if (backgroundType === 'image' && bgImgRef.current)
      expCtx.drawImage(bgImgRef.current, 0, 0, ew, eh);
    if (backgroundType === 'video' && bgVidRef.current)
      expCtx.drawImage(bgVidRef.current, 0, 0, ew, eh);
    if (vizCanvasRef.current) expCtx.drawImage(vizCanvasRef.current, 0, 0, ew, eh);
    if (vfxCanvasRef.current) expCtx.drawImage(vfxCanvasRef.current, 0, 0, ew, eh);
  }, [currentTime, exportMode, exportCanvasRef, backgroundType]);

  // ─── Find current & next lines ───────────────────────────────────────────
  const { currentLineIdx, nextLineIdx } = useMemo(() => {
    let cIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.words.length === 0) continue;
      const first = line.words[0].startTime;
      const last = line.words[line.words.length - 1].endTime;
      if (first <= adjustedTime && last >= adjustedTime) {
        cIdx = i;
        break;
      }
      // Show upcoming line 1s before it starts
      if (first > adjustedTime && first - adjustedTime <= 1.0) {
        cIdx = i;
        break;
      }
    }
    return {
      currentLineIdx: cIdx,
      nextLineIdx: cIdx >= 0 && cIdx + 1 < lines.length ? cIdx + 1 : -1,
    };
  }, [lines, adjustedTime]);

  const currentLine: ProLine | null = currentLineIdx >= 0 ? lines[currentLineIdx] : null;
  const nextLine: ProLine | null = nextLineIdx >= 0 ? lines[nextLineIdx] : null;

  const bgFilter = `brightness(${style.bgBrightness}%) contrast(${style.bgContrast}%) saturate(${style.bgSaturation}%) blur(${style.bgBlur}px)`;

  return (
    <>
      <style>{`
        @keyframes pro-bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        @keyframes pro-rainbow { 0%{color:hsl(0,100%,60%)} 16%{color:hsl(60,100%,60%)} 33%{color:hsl(120,100%,60%)} 50%{color:hsl(180,100%,60%)} 66%{color:hsl(240,100%,60%)} 83%{color:hsl(300,100%,60%)} 100%{color:hsl(360,100%,60%)} }
        @keyframes pro-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        .pro-word-fill { position: relative; display: inline-block; }
        .pro-word-fill::after { content: attr(data-text); position: absolute; left: 0; top: 0; overflow: hidden; width: var(--fill, 0%); color: var(--active-color); white-space: nowrap; }
      `}</style>
      <div className="relative h-full w-full select-none overflow-hidden bg-black">
        {/* Background */}
        {backgroundUrl && backgroundType === 'image' && (
          <img
            ref={bgImgRef}
            src={backgroundUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: bgFilter }}
          />
        )}
        {backgroundUrl && backgroundType === 'video' && (
          <video
            ref={bgVidRef}
            src={backgroundUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: bgFilter }}
          />
        )}
        {!backgroundUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a0a1a] to-slate-800" />
        )}

        {/* BG Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${style.bgOverlayOpacity / 100})` }}
        />

        {/* Visualizer canvas */}
        <canvas
          ref={vizCanvasRef}
          className="absolute inset-0 h-full w-full"
          width={1920}
          height={1080}
          style={{ opacity: 0.7 }}
        />

        {/* VFX canvas */}
        <canvas
          ref={vfxCanvasRef}
          className="absolute inset-0 h-full w-full"
          width={1920}
          height={1080}
          style={{ opacity: 0.85 }}
        />

        {/* Lyrics overlay */}
        <div
          className="absolute left-0 right-0 flex flex-col items-center gap-3"
          style={{
            bottom: `${100 - style.positionY}%`,
            paddingLeft: style.sideMargin,
            paddingRight: style.sideMargin,
          }}
        >
          {/* Current line */}
          {currentLine && (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              {currentLine.words.map((word, i) => {
                const isPast = word.endTime <= adjustedTime;
                const isActive = word.startTime <= adjustedTime && word.endTime > adjustedTime;
                const isFuture = word.startTime > adjustedTime;
                const displayText = style.allCaps ? word.text.toUpperCase() : word.text;
                const ws = getWordStyle(
                  word,
                  isActive,
                  isPast,
                  isFuture,
                  style.wordAnimation,
                  style,
                  adjustedTime
                );

                if (style.wordAnimation === 'fill-step') {
                  const fillPct = getFillProgress(word, adjustedTime) * 100;
                  return (
                    <span
                      key={i}
                      className="pro-word-fill"
                      data-text={displayText}
                      style={
                        {
                          ...ws,
                          color: style.initialColor,
                          '--fill': `${fillPct}%`,
                          '--active-color': style.activeColor,
                        } as React.CSSProperties
                      }
                    >
                      {displayText}
                    </span>
                  );
                }

                return (
                  <span key={i} style={ws}>
                    {displayText}
                  </span>
                );
              })}
            </div>
          )}

          {/* Next line preview */}
          {nextLine && (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 opacity-35">
              {nextLine.words.map((word, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize * 0.75,
                    letterSpacing: style.letterSpacing,
                    color: style.initialColor,
                  }}
                >
                  {style.allCaps ? word.text.toUpperCase() : word.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KaraokeProRenderer;
