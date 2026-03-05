import { ProProjectData, ProLine } from '../types/karaokeProTypes';

/**
 * Render một frame Pro karaoke ra canvas tại thời điểm timeS (giây).
 * Hàm thuần — không phụ thuộc React state, an toàn gọi trong RAF/MP4 export loop.
 */
export function renderProExportFrame(
  ctx: CanvasRenderingContext2D,
  timeS: number,
  project: ProProjectData,
  bgImage: HTMLImageElement | null
): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const { style, lines } = project;

  // 1. Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  if (bgImage?.complete && bgImage.naturalWidth > 0) {
    ctx.save();
    ctx.filter = `brightness(${style.bgBrightness}%) contrast(${style.bgContrast}%) saturate(${style.bgSaturation}%)`;
    ctx.globalAlpha = 1 - style.bgOverlayOpacity / 100;
    ctx.drawImage(bgImage, 0, 0, W, H);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();
    // Overlay
    ctx.fillStyle = `rgba(0,0,0,${style.bgOverlayOpacity / 100})`;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Default dark gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0d0b1e');
    grad.addColorStop(1, '#0a0f1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Visualizer (time-deterministic)
  if (style.visualizerType !== 'none') {
    const bars = 64;
    const barW = (W / bars) * 0.8;
    const gap = (W / bars) * 0.2;

    for (let i = 0; i < bars; i++) {
      const x = i * (barW + gap) + gap / 2;
      const amp =
        Math.abs(Math.sin(i * 0.3 + timeS * 2.5)) * 0.5 +
        Math.abs(Math.sin(i * 0.7 + timeS * 1.8)) * 0.3 +
        Math.abs(Math.sin(i * 0.15 + timeS * 3.2)) * 0.2;

      if (style.visualizerType === 'prism-spectrum') {
        const barH = amp * H * 0.25;
        const hue = (i / bars) * 360;
        const grad = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.5 - barH);
        grad.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.25)`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.7)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, H * 0.5 - barH, barW, barH);
        ctx.fillRect(x, H * 0.5, barW, barH * 0.4);
      } else if (style.visualizerType === 'ethereal-flow') {
        // Render as stroke lines only for export simplicity
        const y = H * 0.5 + Math.sin(i * 0.15 + timeS * 2) * H * 0.06;
        ctx.fillStyle = `hsla(${(i / bars) * 240 + 180}, 80%, 60%, 0.4)`;
        ctx.fillRect(x, y - 1, barW, 3);
      }
    }
  }

  // 3. VFX (deterministic — seed-based positions từ timeS)
  if (style.vfxType !== 'none') {
    const count = Math.floor(style.vfxDensity * 0.8);
    const s = (n: number, i: number) => Math.abs(Math.sin(i * n));

    for (let i = 0; i < count; i++) {
      const x0 = s(127.1, i) * W;
      const y0 = s(131.3, i) * H;
      const opacity = s(149.7, i) * 0.5 + 0.1;

      ctx.globalAlpha = opacity;

      switch (style.vfxType) {
        case 'stars':
        case 'parallax-stars': {
          const spX = (s(137.9, i) - 0.5) * 30 * style.vfxSpeed;
          const spY = (s(141.1, i) - 0.5) * 30 * style.vfxSpeed;
          const x = (((x0 + spX * timeS) % W) + W) % W;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          const size = s(143.3, i) * 1.8 + 0.4;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'snow': {
          const spY = (s(139.7, i) * 0.8 + 0.4) * 80 * style.vfxSpeed;
          const spX = (s(137.3, i) - 0.5) * 20;
          const x = (((x0 + spX * timeS) % W) + W) % W;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          const size = s(143.1, i) * 3 + 1.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'fireflies': {
          const spX = (s(137.9, i) - 0.5) * 40 * style.vfxSpeed;
          const spY = (s(141.1, i) - 0.5) * 20 * style.vfxSpeed;
          const x = (((x0 + spX * timeS + Math.sin(timeS * 1.5 + i) * 15) % W) + W) % W;
          const y = (((y0 + spY * timeS + Math.cos(timeS * 1.2 + i) * 10) % H) + H) % H;
          const size = s(143.3, i) * 2.5 + 0.8;
          const hue = 40 + s(151.1, i) * 30;
          ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        }
        case 'bubbles': {
          const spY = -(s(141.1, i) * 0.8 + 0.3) * 50 * style.vfxSpeed;
          const x = (((x0 + (s(137.9, i) - 0.5) * 15 * timeS) % W) + W) % W;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          const size = s(143.3, i) * 10 + 3;
          ctx.globalAlpha = opacity * 0.4;
          ctx.strokeStyle = 'rgba(150,200,255,0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'matrix': {
          // Simplified matrix for export — falling green chars
          const col = Math.floor(s(127.1, i) * (W / 14));
          const x = col * 14;
          const spY = (s(139.7, i) * 0.8 + 0.5) * 80 * style.vfxSpeed;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          ctx.fillStyle = `rgba(0, 200, 70, ${opacity})`;
          ctx.font = '12px monospace';
          const chars = '01アイカ二';
          ctx.fillText(chars[Math.floor(s(151.3, i) * chars.length) % chars.length], x, y);
          break;
        }
        case 'nebula': {
          const spX = (s(137.9, i) - 0.5) * 25 * style.vfxSpeed;
          const spY = (s(141.1, i) - 0.5) * 25 * style.vfxSpeed;
          const x = (((x0 + spX * timeS) % W) + W) % W;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          const size = s(143.3, i) * 12 + 3;
          const hue = Math.floor(s(151.1, i) * 360);
          const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
          grad.addColorStop(0, `hsla(${hue}, 90%, 65%, ${opacity * 0.6})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'aurora': {
          // Aurora: sine wave bands — rendered per frame
          if (i < 4) {
            const hue = (i * 90 + timeS * 15) % 360;
            const grad2 = ctx.createLinearGradient(0, 0, W, 0);
            grad2.addColorStop(0, `hsla(${hue}, 100%, 60%, 0)`);
            grad2.addColorStop(0.5, `hsla(${hue}, 100%, 60%, ${opacity * 0.3})`);
            grad2.addColorStop(1, `hsla(${(hue + 80) % 360}, 100%, 60%, 0)`);
            ctx.fillStyle = grad2;
            ctx.beginPath();
            const yBase = H * 0.15 + i * H * 0.1;
            ctx.moveTo(0, yBase);
            for (let xi = 0; xi <= W; xi += 12) {
              const yi = yBase + Math.sin(xi / 100 + timeS * style.vfxSpeed * 0.8 + i) * 40;
              ctx.lineTo(xi, yi);
            }
            ctx.lineTo(W, H);
            ctx.lineTo(0, H);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'glitch-lines': {
          if (i < 6) {
            const seed = Math.sin(timeS * style.vfxSpeed * 8 + i * 127.4) * 10000;
            const y = Math.abs(seed % H);
            const lh = Math.abs(Math.sin(seed * 0.01) * 3 + 1);
            const gw = Math.abs(Math.sin(seed * 0.03) * W * 0.4) + W * 0.1;
            const gx = Math.abs(Math.sin(seed * 0.07) * W * 0.5);
            const hue = Math.abs(seed * 0.1) % 360;
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${opacity * 0.5})`;
            ctx.fillRect(gx, y, gw, lh);
          }
          break;
        }
        case 'geometric-drift': {
          const spX = (s(137.9, i) - 0.5) * 40 * style.vfxSpeed;
          const spY = (s(141.1, i) - 0.5) * 30 * style.vfxSpeed;
          const x = (((x0 + spX * timeS) % W) + W) % W;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          const size = s(143.3, i) * 14 + 5;
          const hue = Math.floor(s(151.1, i) * 360);
          const angle = timeS * style.vfxSpeed * 0.5 + i;
          ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${opacity * 0.3})`;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          const shape = Math.floor(s(153.3, i) * 3);
          if (shape === 0) {
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.87, size * 0.5);
            ctx.lineTo(-size * 0.87, size * 0.5);
            ctx.closePath();
            ctx.fill();
          } else if (shape === 1) {
            ctx.fillRect(-size / 2, -size / 2, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          break;
        }
        case 'fluid-smoke': {
          const spY = -(s(141.1, i) * 0.6 + 0.2) * 40 * style.vfxSpeed;
          const x = (((x0 + (s(137.9, i) - 0.5) * 20 * timeS) % W) + W) % W;
          const y = (((y0 + spY * timeS) % H) + H) % H;
          const size = s(143.3, i) * 18 + 6;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
          grad.addColorStop(0, `rgba(200,200,200,${opacity * 0.2})`);
          grad.addColorStop(1, 'rgba(200,200,200,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        default:
          break;
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  // 4. Lyrics
  _drawProLyrics(ctx, timeS, lines, W, H, style);
}

function _drawProLyrics(
  ctx: CanvasRenderingContext2D,
  timeS: number,
  lines: ProLine[],
  W: number,
  H: number,
  style: ProProjectData['style']
): void {
  // Find current line
  let currentIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.words.length === 0) continue;
    const first = line.words[0].startTime;
    const last = line.words[line.words.length - 1].endTime;
    if (first <= timeS && last >= timeS) {
      currentIdx = i;
      break;
    }
    if (first > timeS && first - timeS <= 1.0) {
      currentIdx = i;
      break;
    }
  }
  if (currentIdx < 0) return;

  const currentLine = lines[currentIdx];
  const nextLine = currentIdx + 1 < lines.length ? lines[currentIdx + 1] : null;

  const fsCurrent = style.fontSize * 3;
  const fsNext = fsCurrent * 0.7;
  const posY = (style.positionY / 100) * H;

  ctx.textBaseline = 'middle';

  const drawLine = (line: ProLine, isNext: boolean) => {
    const fs = isNext ? fsNext : fsCurrent;
    ctx.font = `900 ${fs}px '${style.fontFamily}', sans-serif`;

    const words = line.words;
    const allText = words
      .map((w, i) => {
        const t = style.allCaps ? w.text.toUpperCase() : w.text;
        return i < words.length - 1 ? `${t} ` : t;
      })
      .join('');

    const totalW =
      ctx.measureText(allText).width + style.letterSpacing * (words.length - 1) * (fs / 16);
    const lineGapPx = style.lineGap * (fsCurrent / 60);
    const lineY = posY + (isNext ? lineGapPx : 0);
    let x = Math.max(style.sideMargin * 3, W / 2 - totalW / 2);

    words.forEach((word, idx) => {
      const t =
        (style.allCaps ? word.text.toUpperCase() : word.text) + (idx < words.length - 1 ? ' ' : '');
      const ww = ctx.measureText(t).width;

      const isPast = !isNext && timeS >= word.endTime;
      const isActive = !isNext && timeS >= word.startTime && timeS < word.endTime;

      // Shadow
      if (style.shadowBlur > 0) {
        ctx.shadowBlur = isNext ? 0 : style.shadowBlur * 3;
        ctx.shadowColor = style.shadowColor;
      }

      // Stroke
      if (style.strokeWidth > 0 && !isNext) {
        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth * 3;
        ctx.strokeText(t, x + ww / 2, lineY);
      }

      // Glow for active
      if ((isActive || isPast) && style.glowIntensity > 0 && !isNext) {
        ctx.shadowColor = style.activeColor;
        ctx.shadowBlur = style.glowIntensity * 3;
      }

      ctx.globalAlpha = isNext ? 0.4 : 1;
      ctx.fillStyle = isNext
        ? style.initialColor
        : isActive || isPast
          ? style.activeColor
          : style.initialColor;
      ctx.textAlign = 'left';
      ctx.fillText(t, x, lineY);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      x += ww;
    });
  };

  drawLine(currentLine, false);
  if (nextLine) drawLine(nextLine, true);
}
