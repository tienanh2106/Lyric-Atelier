import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { NeonConfig, WaveVariant, TextAnimation } from '../../types/neonPulseTypes';

interface NeonVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  config: NeonConfig;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isRecording: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  baseHue: number;
  color: string;
}
interface Firefly {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  vx: number;
  vy: number;
  fadeSpeed: number;
}
interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}
interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
interface StarFieldStar {
  x: number;
  y: number;
  z: number;
  size: number;
}

const NeonVisualizer = forwardRef<HTMLCanvasElement, NeonVisualizerProps>(
  ({ analyser, isPlaying, config, audioRef, isRecording }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const hueRef = useRef<number>(0);
    const lastBurstTimeRef = useRef<number>(0);

    const particlesRef = useRef<Particle[]>([]);
    const firefliesRef = useRef<Firefly[]>([]);
    const shootingStarsRef = useRef<ShootingStar[]>([]);
    const burstParticlesRef = useRef<BurstParticle[]>([]);
    const starsRef = useRef<StarFieldStar[]>([]);

    const bgImageRef = useRef<HTMLImageElement>(new Image());
    const bgVideoRef = useRef<HTMLVideoElement>(document.createElement('video'));
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [bgImageLoaded, setBgImageLoaded] = useState(false);
    const logoImageRef = useRef<HTMLImageElement>(new Image());

    useImperativeHandle(ref, () => canvasRef.current!);

    // Load background assets
    useEffect(() => {
      bgImageRef.current.crossOrigin = 'anonymous';
      bgVideoRef.current.crossOrigin = 'anonymous';
      bgVideoRef.current.loop = true;
      bgVideoRef.current.muted = true;
      bgVideoRef.current.playsInline = true;

      const handleVideoReady = () => setIsVideoReady(true);
      bgVideoRef.current.addEventListener('canplay', handleVideoReady);

      if (config.isBackgroundVideo) {
        bgVideoRef.current.src = config.backgroundImageUrl;
        bgVideoRef.current.load();
        setIsVideoReady(false);
        if (isPlaying) bgVideoRef.current.play().catch(() => {});
      } else if (config.backgroundImageUrl) {
        setBgImageLoaded(false);
        const img = bgImageRef.current;
        img.onload = () => setBgImageLoaded(true);
        img.src = config.backgroundImageUrl;
      }

      return () => {
        bgVideoRef.current.removeEventListener('canplay', handleVideoReady);
        bgVideoRef.current.pause();
      };
    }, [config.backgroundImageUrl, config.isBackgroundVideo]);

    useEffect(() => {
      if (config.logoUrl) {
        logoImageRef.current.crossOrigin = 'anonymous';
        logoImageRef.current.src = config.logoUrl;
      }
    }, [config.logoUrl]);

    useEffect(() => {
      if (config.isBackgroundVideo) {
        if (isPlaying) bgVideoRef.current.play().catch(() => {});
        else bgVideoRef.current.pause();
      }
    }, [isPlaying, config.isBackgroundVideo]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const resizeCanvas = () => {
        if (isRecording) {
          const isPortrait = window.innerHeight > window.innerWidth;
          canvas.width = isPortrait ? 1080 : 1920;
          canvas.height = isPortrait ? 1920 : 1080;
        } else {
          canvas.width = canvas.clientWidth * window.devicePixelRatio;
          canvas.height = canvas.clientHeight * window.devicePixelRatio;
        }
      };
      resizeCanvas();
      if (!isRecording) window.addEventListener('resize', resizeCanvas);

      const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
      const dataArray = new Uint8Array(bufferLength);

      const getColors = () => {
        if (config.useCustomGradient) {
          return { primary: config.visualizerColor1, secondary: config.visualizerColor2 };
        }
        if (config.autoGradient) {
          return {
            primary: `hsl(${hueRef.current}, 100%, 50%)`,
            secondary: `hsl(${(hueRef.current + 180) % 360}, 100%, 50%)`,
          };
        }
        let primary = '#00f2ea',
          secondary = '#ff0099';
        if (config.themeColor.includes('green')) {
          primary = '#00ff00';
          secondary = '#ccff00';
        } else if (config.themeColor.includes('pink')) {
          primary = '#ff0099';
          secondary = '#ff0055';
        } else if (config.themeColor.includes('yellow')) {
          primary = '#ffff00';
          secondary = '#ffaa00';
        } else if (config.themeColor.includes('sunset')) {
          primary = '#ff4d00';
          secondary = '#ff0055';
        } else if (config.themeColor.includes('purple')) {
          primary = '#cc00ff';
          secondary = '#6600ff';
        }
        return { primary, secondary };
      };

      // --- BACKGROUND ---
      const drawBackground = (w: number, h: number, bassEnergy: number, scale: number) => {
        const pulseScale = config.bgPulse ? 1.0 + bassEnergy * config.bgPulseStrength * 0.2 : 1.0;
        const shakeX = config.bgShake ? (Math.random() - 0.5) * bassEnergy * 30 * scale : 0;
        const shakeY = config.bgShake ? (Math.random() - 0.5) * bassEnergy * 30 * scale : 0;

        ctx.save();
        let baseBrightness = config.bgBrightness;
        if (config.bgAutoBrightness) {
          baseBrightness =
            config.bgAutoBrightnessMin +
            (config.bgAutoBrightnessMax - config.bgAutoBrightnessMin) * bassEnergy;
        }
        const dynamicBrightness = config.bgBeatFlash
          ? baseBrightness + bassEnergy * 60
          : baseBrightness;
        const dynamicHue = config.bgHueShift ? bassEnergy * 90 : 0;

        ctx.filter = `brightness(${dynamicBrightness}%) contrast(${config.bgContrast}%) saturate(${config.bgSaturation}%) hue-rotate(${config.bgHueRotate + dynamicHue}deg) blur(${config.bgBlur * scale}px)`;
        ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-w / 2, -h / 2);

        let srcW = 0,
          srcH = 0,
          img: CanvasImageSource | null = null;
        if (config.isBackgroundVideo) {
          if (isVideoReady) {
            img = bgVideoRef.current;
            srcW = bgVideoRef.current.videoWidth;
            srcH = bgVideoRef.current.videoHeight;
          }
        } else {
          if (bgImageRef.current.complete && bgImageRef.current.naturalWidth > 0) {
            img = bgImageRef.current;
            srcW = bgImageRef.current.naturalWidth;
            srcH = bgImageRef.current.naturalHeight;
          }
        }
        if (img && srcW > 0) {
          const ratio = Math.max(w / srcW, h / srcH);
          const sx = (w - srcW * ratio) / 2,
            sy = (h - srcH * ratio) / 2;
          ctx.drawImage(img, 0, 0, srcW, srcH, sx, sy, srcW * ratio, srcH * ratio);
        } else {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);
        }

        if (config.bgTintIntensity > 0) {
          ctx.globalCompositeOperation = config.bgTintBlendMode;
          ctx.fillStyle = config.bgTintColor;
          ctx.globalAlpha = config.bgTintIntensity;
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1.0;
        }
        ctx.restore();

        if (config.bgVignette > 0) {
          const grad = ctx.createRadialGradient(w / 2, h / 2, w / 4, w / 2, h / 2, w);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(1, `rgba(0,0,0,${(config.bgVignette / 100) * 0.8})`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        const bottomGrad = ctx.createLinearGradient(0, h / 2, 0, h);
        bottomGrad.addColorStop(0, 'transparent');
        bottomGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, h / 2, w, h / 2);
      };

      // --- SECONDARY EFFECTS ---
      const drawStarField = (w: number, h: number, scale: number) => {
        if (!config.effectStarField) return;
        if (starsRef.current.length === 0) {
          for (let i = 0; i < 150; i++) {
            starsRef.current.push({
              x: Math.random() * w,
              y: Math.random() * h,
              z: Math.random() * 2 + 0.5,
              size: Math.random() * 1.5 + 0.5,
            });
          }
        }
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'white';
        const speedBase = config.effectStarFieldSpeed * 0.5 * scale;
        for (const s of starsRef.current) {
          s.y += speedBase * s.z;
          if (s.y > h) {
            s.y = 0;
            s.x = Math.random() * w;
          }
          ctx.globalAlpha = Math.min(1, s.z * 0.3) * 0.8;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      };

      const drawFireflies = (w: number, h: number, color: string, scale: number) => {
        if (!config.effectFireflies) return;
        const max = config.effectFirefliesCount;
        if (firefliesRef.current.length > max)
          firefliesRef.current = firefliesRef.current.slice(0, max);
        if (firefliesRef.current.length < max && Math.random() > 0.9) {
          firefliesRef.current.push({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 2 + 0.5,
            opacity: 0,
            vx: (Math.random() - 0.5) * 0.5 * scale,
            vy: (Math.random() - 0.5) * 0.5 * scale,
            fadeSpeed: Math.random() * 0.02 + 0.005,
          });
        }
        ctx.globalCompositeOperation = 'screen';
        for (let i = firefliesRef.current.length - 1; i >= 0; i--) {
          const f = firefliesRef.current[i];
          f.x += f.vx;
          f.y += f.vy;
          f.opacity += f.fadeSpeed;
          if (f.opacity >= 1 || f.opacity <= 0) f.fadeSpeed = -f.fadeSpeed;
          if (f.opacity < 0) {
            firefliesRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * scale, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.max(0, f.opacity) * 0.8;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10 * scale;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      };

      const drawShootingStars = (w: number, h: number, scale: number) => {
        if (!config.effectShootingStars) return;
        const threshold = 1 - config.effectShootingStarsFreq * 0.001;
        if (Math.random() > threshold) {
          shootingStarsRef.current.push({
            x: Math.random() * w,
            y: (Math.random() * h) / 2,
            length: (Math.random() * 100 + 50) * scale,
            speed: (Math.random() * 15 + 10) * scale,
            opacity: 1,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          });
        }
        ctx.globalCompositeOperation = 'screen';
        for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
          const s = shootingStarsRef.current[i];
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.opacity -= 0.02;
          if (s.opacity <= 0 || s.x > w || s.y > h) {
            shootingStarsRef.current.splice(i, 1);
            continue;
          }
          const endX = s.x - Math.cos(s.angle) * s.length,
            endY = s.y - Math.sin(s.angle) * s.length;
          const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
          grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2 * scale;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      };

      const drawRadialBurst = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        color: string,
        bassEnergy: number,
        scale: number
      ) => {
        if (!config.effectRadialBurst) return;
        const now = Date.now();
        if (bassEnergy > 0.35 && now - lastBurstTimeRef.current > 150) {
          lastBurstTimeRef.current = now;
          const count = Math.floor(bassEnergy * 8) + 2;
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 12 + 8 + bassEnergy * 10) * scale;
            burstParticlesRef.current.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              color,
              size: (Math.random() * 3 + 1) * scale,
            });
          }
        }
        ctx.globalCompositeOperation = 'screen';
        for (let i = burstParticlesRef.current.length - 1; i >= 0; i--) {
          const p = burstParticlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.03;
          p.vx *= 0.96;
          p.vy *= 0.96;
          if (p.life <= 0) {
            burstParticlesRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life * config.visualizerOpacity;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      };

      // --- VISUALIZERS ---
      const drawHeartbeat = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        const baseScale = Math.min(w, h) * 0.004 * config.visualizerSize;
        const currentScale = baseScale * (1 + Math.pow(bassEnergy, 2) * 1.0);
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = config.visualizerBlendMode;

        if (bassEnergy > 0.05) {
          const glowRadius = 150 * (1 + bassEnergy * 1.5) * config.visualizerSize * scale;
          const glow = ctx.createRadialGradient(0, 0, 10 * scale, 0, 0, glowRadius);
          glow.addColorStop(0, 'rgba(255,255,255,0.8)');
          glow.addColorStop(0.2, colors.primary);
          glow.addColorStop(0.5, colors.secondary);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.globalAlpha = config.visualizerOpacity * (0.5 + bassEnergy * 0.5);
          ctx.fill();
        }

        const createHeartPath = (sf: number) => {
          ctx.beginPath();
          for (let i = 0; i <= 100; i++) {
            const t = (i / 100) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(
              13 * Math.cos(t) -
              5 * Math.cos(2 * t) -
              2 * Math.cos(3 * t) -
              Math.cos(4 * t)
            );
            ctx.lineTo(x * sf, y * sf);
          }
          ctx.closePath();
        };

        const depth = 8 * currentScale;
        ctx.translate(depth * 0.5, depth * 0.5);
        createHeartPath(currentScale);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = 'black';
        ctx.fill();
        ctx.translate(-depth * 0.5, -depth * 0.5);
        ctx.shadowBlur = 0;

        createHeartPath(currentScale);
        const heartFill = ctx.createRadialGradient(
          -6 * currentScale,
          -6 * currentScale,
          currentScale,
          0,
          0,
          22 * currentScale
        );
        heartFill.addColorStop(0, 'white');
        heartFill.addColorStop(0.15, colors.primary);
        heartFill.addColorStop(0.7, colors.secondary);
        heartFill.addColorStop(1, '#111');
        ctx.fillStyle = heartFill;
        ctx.shadowBlur = (20 + bassEnergy * 40) * config.visualizerSize * scale;
        ctx.shadowColor = colors.primary;
        ctx.globalAlpha = config.visualizerOpacity;
        ctx.fill();
        ctx.lineWidth = 1.5 * config.visualizerSize * scale;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.stroke();

        ctx.translate(-cx, -cy);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      const drawEnergyOrb = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        const baseRadius = 100 * config.visualizerSize * scale;
        const time = Date.now() * 0.002;
        ctx.globalCompositeOperation = config.visualizerBlendMode;
        ctx.translate(cx, cy);

        for (let ring = 0; ring < 3; ring++) {
          ctx.beginPath();
          for (let i = 0; i <= 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            const dataIdx = Math.floor((i / 100) * (bufferLength * 0.5));
            const val = dataArray[dataIdx] / 255;
            const distortion = Math.sin(angle * (4 + ring) + time) * 15 * scale;
            const r =
              baseRadius + val * 100 * scale * (1 + bassEnergy) + distortion + ring * 20 * scale;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.lineWidth = (2 + ring) * scale;
          ctx.strokeStyle = ring === 0 ? 'white' : ring === 1 ? colors.primary : colors.secondary;
          ctx.globalAlpha = config.visualizerOpacity * (1 - ring * 0.2);
          ctx.shadowBlur = 20 * scale;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }

        const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius);
        coreGlow.addColorStop(0, 'rgba(255,255,255,0.8)');
        coreGlow.addColorStop(0.5, colors.primary);
        coreGlow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * (1 + bassEnergy * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.globalAlpha = config.visualizerOpacity * 0.5;
        ctx.fill();

        ctx.translate(-cx, -cy);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      const drawLaserShow = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        const time = Date.now() * 0.002;
        ctx.globalCompositeOperation = config.visualizerBlendMode;
        ctx.translate(cx, cy);
        const numLasers = 12 + Math.floor(bassEnergy * 10);
        const radius = Math.max(w, h) * 0.8;
        for (let i = 0; i < numLasers; i++) {
          const angle = (i / numLasers) * Math.PI * 2 + Math.sin(time * 0.5 + i) * 0.5;
          const dataIdx = Math.floor((i / numLasers) * (bufferLength * 0.5));
          const val = dataArray[dataIdx] / 255;
          const laserLength = radius * (0.5 + val * 0.5 + bassEnergy * 0.5);
          const endX = Math.cos(angle) * laserLength,
            endY = Math.sin(angle) * laserLength;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = (2 + val * 10 + bassEnergy * 20) * scale;
          ctx.strokeStyle = i % 2 === 0 ? colors.primary : colors.secondary;
          ctx.shadowBlur = (20 + bassEnergy * 40) * scale;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.globalAlpha = config.visualizerOpacity * (0.5 + val * 0.5);
          ctx.stroke();
          if (val > 0.5 || bassEnergy > 0.5) {
            ctx.beginPath();
            ctx.arc(endX, endY, (5 + val * 15) * scale, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
          }
        }
        ctx.beginPath();
        ctx.arc(0, 0, (30 + bassEnergy * 50) * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 50 * scale;
        ctx.shadowColor = colors.primary;
        ctx.fill();
        ctx.translate(-cx, -cy);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      const drawSpeakerCone = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        ctx.globalCompositeOperation = config.visualizerBlendMode;
        ctx.translate(cx, cy);
        const baseRadius = 150 * config.visualizerSize * scale;
        const pump = bassEnergy * 80 * scale;
        const currentRadius = baseRadius + pump;
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
          const waveRadius = currentRadius + ((time * 50 + i * 100) % (300 * scale));
          const alpha = Math.max(0, 1 - (waveRadius - currentRadius) / (300 * scale));
          ctx.beginPath();
          ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
          ctx.lineWidth = (5 + bassEnergy * 10) * scale;
          ctx.strokeStyle = colors.primary;
          ctx.globalAlpha = config.visualizerOpacity * alpha * (0.5 + bassEnergy * 0.5);
          ctx.shadowBlur = 20 * scale;
          ctx.shadowColor = colors.primary;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.lineWidth = 15 * scale;
        ctx.strokeStyle = '#333';
        ctx.stroke();
        const innerRadius = currentRadius * 0.7;
        const coneGrad = ctx.createRadialGradient(0, 0, innerRadius * 0.1, 0, 0, innerRadius);
        coneGrad.addColorStop(0, '#222');
        coneGrad.addColorStop(1, '#050505');
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = coneGrad;
        ctx.fill();
        const capRadius = currentRadius * 0.3 + pump * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, capRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = '#444';
        ctx.stroke();
        if (bassEnergy > 0.1) {
          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = colors.secondary;
          ctx.globalAlpha = config.visualizerOpacity * bassEnergy * 0.6;
          ctx.fill();
        }
        ctx.translate(-cx, -cy);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      const drawNeonTunnel = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        const time = Date.now() * 0.001;
        ctx.globalCompositeOperation = config.visualizerBlendMode;
        ctx.translate(cx, cy);
        const sides = 6,
          numShapes = 15,
          speed = 2 + bassEnergy * 5;
        for (let i = 0; i < numShapes; i++) {
          let z = i * 20 - ((time * speed * 20) % 20);
          if (z < 0) z += numShapes * 20;
          const perspective = 300 / (z + 1);
          const radius = 50 * perspective * config.visualizerSize * scale;
          if (radius > Math.max(w, h) || radius < 5) continue;
          ctx.beginPath();
          for (let j = 0; j <= sides; j++) {
            const angle = (j / sides) * Math.PI * 2 + z * 0.01 + bassEnergy * 0.5;
            if (j === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          const colorRatio = z / (numShapes * 20);
          ctx.strokeStyle = colorRatio > 0.5 ? colors.secondary : colors.primary;
          ctx.lineWidth = (1 + perspective * 0.5 + bassEnergy * 5) * scale;
          ctx.globalAlpha =
            config.visualizerOpacity * Math.min(1, perspective * 0.5) * (0.5 + bassEnergy * 0.5);
          ctx.shadowBlur = (10 + bassEnergy * 20) * scale;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }
        ctx.translate(-cx, -cy);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      const drawBouncingImage = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        ctx.globalCompositeOperation = config.visualizerBlendMode;
        const bounceY = -bassEnergy * 100 * scale,
          bounceScale = 1 + bassEnergy * 0.2;
        ctx.translate(cx, cy + bounceY);
        ctx.scale(bounceScale, bounceScale);
        if (
          config.logoUrl &&
          logoImageRef.current.complete &&
          logoImageRef.current.naturalWidth > 0
        ) {
          const img = logoImageRef.current,
            size = 250 * config.visualizerSize * scale;
          const aspect = img.naturalWidth / img.naturalHeight;
          ctx.shadowColor = colors.primary;
          ctx.shadowBlur = (20 + bassEnergy * 50) * scale;
          ctx.drawImage(img, (-size * aspect) / 2, -size / 2, size * aspect, size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 100 * config.visualizerSize * scale, 0, Math.PI * 2);
          ctx.fillStyle = colors.primary;
          ctx.shadowBlur = 30 * scale;
          ctx.shadowColor = colors.secondary;
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = `bold ${20 * scale}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('UPLOAD LOGO', 0, 0);
        }
        ctx.scale(1 / bounceScale, 1 / bounceScale);
        ctx.translate(-cx, -(cy + bounceY));
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      const drawDiscoEqualizer = (
        w: number,
        h: number,
        cx: number,
        cy: number,
        colors: { primary: string; secondary: string },
        bassEnergy: number,
        scale: number
      ) => {
        ctx.globalCompositeOperation = config.visualizerBlendMode;
        const numBars = 40,
          barWidth = 12 * config.visualizerSize * scale,
          gap = 4 * scale;
        const totalWidth = numBars * (barWidth + gap),
          startX = cx - totalWidth / 2;
        const maxBlocks = 16,
          blockHeight = 8 * config.visualizerSize * scale,
          blockGap = 3 * scale;
        const baseY = cy + 100 * config.visualizerSize * scale;
        ctx.shadowBlur = 12 * scale;
        const drawBlocks = (color: string, minRatio: number, maxRatio: number) => {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.beginPath();
          for (let i = 0; i < numBars; i++) {
            const mirrorIndex = Math.abs(i - numBars / 2) / (numBars / 2);
            const dataIdx = Math.floor(mirrorIndex * (bufferLength * 0.5));
            const val = dataArray[dataIdx] / 255;
            const activeBlocks = Math.floor(val * maxBlocks * (1 + bassEnergy * 0.2));
            const x = startX + i * (barWidth + gap);
            for (let b = 0; b < maxBlocks; b++) {
              if (b > activeBlocks) continue;
              const ratio = b / maxBlocks;
              if (ratio > minRatio && ratio <= maxRatio)
                ctx.rect(x, baseY - b * (blockHeight + blockGap), barWidth, blockHeight);
            }
          }
          ctx.globalAlpha = config.visualizerOpacity * 0.85;
          ctx.fill();
          ctx.beginPath();
          for (let i = 0; i < numBars; i++) {
            const mirrorIndex = Math.abs(i - numBars / 2) / (numBars / 2);
            const dataIdx = Math.floor(mirrorIndex * (bufferLength * 0.5));
            const val = dataArray[dataIdx] / 255;
            const activeBlocks = Math.floor(val * maxBlocks * (1 + bassEnergy * 0.2));
            const x = startX + i * (barWidth + gap);
            for (let b = 0; b < maxBlocks; b++) {
              if (b > activeBlocks) continue;
              const ratio = b / maxBlocks;
              if (ratio > minRatio && ratio <= maxRatio)
                ctx.rect(x, baseY + b * (blockHeight + blockGap) + blockGap, barWidth, blockHeight);
            }
          }
          ctx.globalAlpha = config.visualizerOpacity * 0.25;
          ctx.fill();
        };
        drawBlocks(colors.primary, -1, 0.3);
        drawBlocks(colors.secondary, 0.3, 0.7);
        drawBlocks('#ff0055', 0.7, 2);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      // --- UI ELEMENTS ---
      const drawTitleAndSubtitle = (w: number, h: number, bassEnergy: number, scale: number) => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.textAlign = 'center';
        const baseFontSize = 48 * config.titleSize * scale;
        let fontSize = baseFontSize,
          offX = 0,
          offY = 0;

        if (config.textAnimation === TextAnimation.PULSE) {
          fontSize = baseFontSize * (1 + bassEnergy * 0.1);
        } else if (config.textAnimation === TextAnimation.SHAKE && bassEnergy > 0.1) {
          offX = (Math.random() - 0.5) * 10 * bassEnergy * scale;
          offY = (Math.random() - 0.5) * 10 * bassEnergy * scale;
        } else if (config.textAnimation === TextAnimation.GLITCH && bassEnergy > 0.3) {
          if (Math.random() > 0.7) {
            offX = (Math.random() - 0.5) * 15 * scale;
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 3 * scale;
          } else {
            ctx.shadowColor = 'cyan';
            ctx.shadowOffsetX = -3 * scale;
          }
        }

        ctx.font = `900 ${fontSize}px "${config.titleFont}", sans-serif`;
        if (config.textAnimation !== TextAnimation.GLITCH) {
          ctx.shadowColor = config.titleColor;
          ctx.shadowBlur = (config.titleGlow + bassEnergy * 20) * scale;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        ctx.fillStyle = config.titleColor;
        if ('letterSpacing' in ctx)
          (ctx as unknown as { letterSpacing: string }).letterSpacing =
            `${config.titleSpacing * scale}px`;

        const lines = config.songTitle.toUpperCase().split('\n');
        const lineHeight = fontSize * 1.1;
        const titleY = h * (config.titlePositionY / 100) + offY;
        const startY = titleY - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, idx) =>
          ctx.fillText(line.trim(), w / 2 + offX, startY + idx * lineHeight)
        );
        if ('letterSpacing' in ctx)
          (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';

        if (config.subtitle) {
          const subFontSize = 20 * scale;
          ctx.font = `700 ${subFontSize}px "Inter", sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.shadowBlur = 4 * scale;
          ctx.shadowColor = 'black';
          ctx.shadowOffsetX = 0;
          if ('letterSpacing' in ctx)
            (ctx as unknown as { letterSpacing: string }).letterSpacing = `${4 * scale}px`;
          const lastLineY = startY + (lines.length - 1) * lineHeight;
          ctx.fillText(
            config.subtitle.toUpperCase(),
            w / 2,
            lastLineY + baseFontSize * 0.8 + 20 * scale
          );
          if ('letterSpacing' in ctx)
            (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
        }
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
      };

      const drawProgressBar = (w: number, h: number, scale: number) => {
        const barWidth = w * 0.4,
          barHeight = 3 * scale;
        const x = (w - barWidth) / 2,
          y = h * (config.progressBarPositionY / 100) - barHeight / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2 * scale);
        ctx.fill();
        if (audioRef.current && audioRef.current.duration > 0) {
          const progress = audioRef.current.currentTime / audioRef.current.duration;
          ctx.fillStyle = config.progressBarColor;
          ctx.shadowColor = config.progressBarColor;
          ctx.shadowBlur = 10 * scale;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth * progress, barHeight, 2 * scale);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      };

      const drawLogo = (w: number, h: number, scale: number) => {
        if (
          config.logoUrl &&
          logoImageRef.current.complete &&
          logoImageRef.current.naturalWidth > 0
        ) {
          const size = 60 * config.logoSize * scale,
            img = logoImageRef.current;
          const aspect = img.naturalWidth / img.naturalHeight;
          const drawW = size * aspect,
            drawH = size;
          const x = (w - drawW) / 2,
            y = h * (config.logoPositionY / 100) - drawH / 2;
          ctx.save();
          ctx.shadowColor = 'rgba(255,255,255,0.5)';
          ctx.shadowBlur = config.logoGlow * scale;
          ctx.drawImage(img, x, y, drawW, drawH);
          ctx.restore();
        }
      };

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        const w = canvas.width,
          h = canvas.height;
        const isPortrait = h > w;
        const scale = isPortrait ? w / 1080 : h / 1080;
        const cx = w * (config.visualizerCenterX / 100),
          cy = h * (config.visualizerCenterY / 100);

        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, w, h);

        if (config.autoGradient) hueRef.current = (hueRef.current + 1) % 360;
        const colors = getColors();

        if (analyser) analyser.getByteFrequencyData(dataArray);
        else dataArray.fill(0);
        let bassSum = 0;
        for (let i = 0; i < 4; i++) bassSum += dataArray[i] * 1.2;
        for (let i = 4; i < 12; i++) bassSum += dataArray[i] * 0.8;
        const averageRaw = bassSum / (4 * 1.2 + 8 * 0.8);
        const bassEnergy = Math.pow(averageRaw / 255, 1.8) * 1.5;

        drawBackground(w, h, bassEnergy, scale);
        drawStarField(w, h, scale);
        drawFireflies(w, h, colors.secondary, scale);
        drawShootingStars(w, h, scale);
        drawRadialBurst(w, h, cx, cy, colors.primary, bassEnergy, scale);

        if (config.waveVariant === WaveVariant.ENERGY_ORB)
          drawEnergyOrb(w, h, cx, cy, colors, bassEnergy, scale);
        else if (config.waveVariant === WaveVariant.LASER_SHOW)
          drawLaserShow(w, h, cx, cy, colors, bassEnergy, scale);
        else if (config.waveVariant === WaveVariant.SPEAKER_CONE)
          drawSpeakerCone(w, h, cx, cy, colors, bassEnergy, scale);
        else if (config.waveVariant === WaveVariant.NEON_TUNNEL)
          drawNeonTunnel(w, h, cx, cy, colors, bassEnergy, scale);
        else if (config.waveVariant === WaveVariant.BOUNCING_IMAGE)
          drawBouncingImage(w, h, cx, cy, colors, bassEnergy, scale);
        else if (config.waveVariant === WaveVariant.DISCO_EQUALIZER)
          drawDiscoEqualizer(w, h, cx, cy, colors, bassEnergy, scale);
        else drawHeartbeat(w, h, cx, cy, colors, bassEnergy, scale);

        drawTitleAndSubtitle(w, h, bassEnergy, scale);
        drawProgressBar(w, h, scale);
        if (config.waveVariant !== WaveVariant.BOUNCING_IMAGE) drawLogo(w, h, scale);
      };

      draw();

      return () => {
        if (!isRecording) window.removeEventListener('resize', resizeCanvas);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }, [analyser, isPlaying, config, isVideoReady, bgImageLoaded, isRecording]);

    return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
  }
);

NeonVisualizer.displayName = 'NeonVisualizer';
export default NeonVisualizer;
