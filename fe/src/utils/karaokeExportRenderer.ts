import { ProjectData, KaraokeSegment } from '../types/karaoke';

/**
 * Render một frame karaoke ra canvas tại thời điểm timeS (giây).
 * Hàm thuần — không phụ thuộc React state, an toàn gọi trong RAF export loop.
 */
export function renderExportFrame(
  ctx: CanvasRenderingContext2D,
  timeS: number,
  project: ProjectData,
  bgImage: HTMLImageElement | null
): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const { style, segments } = project;

  // 1. Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  if (bgImage?.complete) {
    ctx.globalAlpha = 0.6;
    ctx.drawImage(bgImage, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // 2. Visualizer (time-deterministic — dùng timeS thay Date.now())
  if (style.visualizerType !== 'none') {
    const bars = 80;
    const timeMs = timeS * 1000;
    ctx.shadowBlur = 10;
    ctx.shadowColor = style.activeColor;
    ctx.strokeStyle = style.activeColor;
    ctx.fillStyle = style.activeColor;
    const barWidth = W / bars;
    const cx = W / 2;
    const cy = H / 2;

    for (let i = 0; i < bars; i++) {
      const freq = 0.005 + i * 0.0002;
      const h = Math.max(0, (Math.sin(timeMs * freq + i * 0.15) * 35 + 55) * 3.2);
      switch (style.visualizerType) {
        case 'bars':
          ctx.fillRect(i * barWidth + 3, H - h, barWidth - 6, h);
          break;
        case 'mirror':
          ctx.fillRect(i * barWidth + 2, cy - h / 2, barWidth - 4, h);
          break;
        case 'radial': {
          const r = 396;
          const a = (i / bars) * Math.PI * 2;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.lineTo(cx + Math.cos(a) * (r + h * 0.8), cy + Math.sin(a) * (r + h * 0.8));
          ctx.stroke();
          break;
        }
        case 'circle':
          ctx.beginPath();
          ctx.arc(cx, cy, 150 + h, 0, Math.PI * 2);
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
      }
    }
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  // 3. VFX Particles (deterministic — seed = index, vị trí tính từ timeS)
  if (style.vfxType !== 'none') {
    const count = Math.floor(style.vfxIntensity * 3);
    ctx.fillStyle = style.vfxColor;
    for (let i = 0; i < count; i++) {
      const s = (n: number) => Math.abs(Math.sin(i * n));
      const x0 = s(127) * W;
      const y0 = s(131) * H;
      const spX = (s(137) - 0.5) * 90 * style.vfxSpeed;
      const spY =
        style.vfxType === 'snow' || style.vfxType === 'rain'
          ? (s(139) * 0.8 + 0.2) * 120 * style.vfxSpeed
          : (s(141) - 0.5) * 90 * style.vfxSpeed;
      const size = s(143) * 2 + 1;
      const opacity = s(149) * 0.6 + 0.2;
      const x = (((x0 + spX * timeS) % W) + W) % W;
      const y = (((y0 + spY * timeS) % H) + H) % H;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 4. Intro card (4 giây đầu)
  if (timeS < 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.font = `900 120px '${style.fontFamily}', sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(style.introTitle.toUpperCase(), W / 2, H / 2 - 40);
    ctx.font = '900 36px sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`CA SĨ: ${style.introArtist.toUpperCase()}`, W / 2, H / 2 + 80);
    ctx.shadowBlur = 0;
    return;
  }

  // 5. Tìm segment đang active
  const activeIdx = (() => {
    const exact = segments.findIndex((s) => timeS >= s.startTime && timeS <= s.endTime);
    if (exact !== -1) return exact;
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i].startTime <= timeS) return i;
    }
    return -1;
  })();

  if (activeIdx < 0) return;

  const curSeg = segments[activeIdx];
  const nxtSeg = activeIdx + 1 < segments.length ? segments[activeIdx + 1] : null;

  // 6. Vẽ lời karaoke
  const drawLine = (seg: KaraokeSegment, isNext: boolean) => {
    const fs = style.fontSize * (isNext ? 2.5 : 3);
    ctx.font = `900 ${fs}px '${style.fontFamily}', sans-serif`;
    ctx.textBaseline = 'middle';
    const posY = (style.positionY / 100) * H + (isNext ? fs * 2.2 : 0);

    const words = seg.words?.length
      ? seg.words
      : [{ text: seg.text, startTime: seg.startTime, endTime: seg.endTime }];

    // Tính tổng chiều rộng để căn giữa
    const allText = words
      .map((w, i) => {
        const t = style.allCaps ? w.text.toUpperCase() : w.text;
        return i < words.length - 1 ? `${t} ` : t;
      })
      .join('');
    const totalW = ctx.measureText(allText).width;
    let x = W / 2 - totalW / 2;

    words.forEach((word, idx) => {
      const t =
        (style.allCaps ? word.text.toUpperCase() : word.text) + (idx < words.length - 1 ? ' ' : '');
      const ww = ctx.measureText(t).width;
      const isActive = !isNext && timeS >= word.startTime && timeS < word.endTime;
      const isPast = !isNext && timeS >= word.endTime;

      ctx.shadowBlur = isNext ? 0 : style.shadowBlur * 3;
      ctx.shadowColor = style.shadowColor;
      ctx.shadowOffsetX = style.shadowOffsetX * 3;
      ctx.shadowOffsetY = style.shadowOffsetY * 3;

      if (!isNext && style.strokeWidth > 0) {
        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth * 3;
        ctx.textAlign = 'center';
        ctx.strokeText(t, x + ww / 2, posY);
      }

      ctx.globalAlpha = isNext ? 0.5 : 1;
      ctx.fillStyle = isNext
        ? style.initialColor
        : isActive || isPast
          ? style.activeColor
          : style.initialColor;
      ctx.textAlign = 'center';
      ctx.fillText(t, x + ww / 2, posY);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      x += ww;
    });
  };

  drawLine(curSeg, false);
  if (nxtSeg) drawLine(nxtSeg, true);
}
