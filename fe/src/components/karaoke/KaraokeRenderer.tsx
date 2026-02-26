import React, { useMemo, useEffect, useRef, useState } from 'react';
import { KaraokeSegment, ProjectData } from '../../types/karaoke';

interface Props {
  currentTime: number;
  project: ProjectData;
  containerRef?: React.RefObject<HTMLDivElement>;
  isMaximized?: boolean;
}

export const KaraokeRenderer: React.FC<Props> = ({
  currentTime,
  project,
  containerRef,
  isMaximized,
}) => {
  const { style, segments } = project;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vfxCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Visualizer + Background Pulse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 80;
    const barValues = new Array(bars).fill(0);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bars;
      const centerY = canvas.height / 2;
      const centerX = canvas.width / 2;
      let totalIntensity = 0;

      for (let i = 0; i < bars; i++) {
        const freq = 0.005 + i * 0.0002;
        const target =
          (Math.sin(Date.now() * freq + i * 0.15) * 35 + 55) * (Math.random() * 0.4 + 0.8);
        barValues[i] += (target - barValues[i]) * 0.22;
        totalIntensity += barValues[i];

        if (style.visualizerType !== 'none') {
          const h = barValues[i] * (isMaximized ? 3.2 : 1.6);
          ctx.shadowBlur = 10;
          ctx.shadowColor = style.activeColor;
          ctx.strokeStyle = style.activeColor;
          ctx.fillStyle = style.activeColor;

          switch (style.visualizerType) {
            case 'bars':
              ctx.fillRect(i * barWidth + 3, canvas.height - h, barWidth - 6, h);
              break;
            case 'mirror':
              ctx.fillRect(i * barWidth + 2, centerY - h / 2, barWidth - 4, h);
              break;
            case 'radial': {
              const radius = 180 * (isMaximized ? 2.2 : 1.1);
              const angle = (i / bars) * Math.PI * 2;
              const x2 = centerX + Math.cos(angle) * (radius + h * 0.8);
              const y2 = centerY + Math.sin(angle) * (radius + h * 0.8);
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              break;
            }
            case 'circle':
              ctx.beginPath();
              ctx.arc(centerX, centerY, 150 + h, 0, Math.PI * 2);
              ctx.lineWidth = 2;
              ctx.stroke();
              break;
          }
        }
      }

      if (backgroundRef.current) {
        const avgIntensity = totalIntensity / bars;
        const relativeIntensity = Math.max(0, avgIntensity - 50);
        const zoomPower = style.bgPulseIntensity / 150;
        const pulseScale = 1 + (relativeIntensity / 100) * zoomPower;
        backgroundRef.current.style.transform = `scale(${pulseScale})`;
      }

      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [style.visualizerType, style.activeColor, style.bgPulseIntensity, isMaximized]);

  // VFX Particles
  useEffect(() => {
    const canvas = vfxCanvasRef.current;
    if (!canvas || style.vfxType === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }[] = [];
    const count = Math.floor(style.vfxIntensity * (isMaximized ? 3 : 1.5));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.5 * style.vfxSpeed,
        speedY:
          style.vfxType === 'snow' || style.vfxType === 'rain'
            ? (Math.random() * 3 + 1) * style.vfxSpeed
            : (Math.random() - 0.5) * 1.5 * style.vfxSpeed,
        opacity: Math.random() * 0.6 + 0.2,
        color: style.vfxColor,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) p.y = 0;
      });
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [style.vfxType, style.vfxIntensity, style.vfxSpeed, style.vfxColor, isMaximized]);

  const prevIdxRef = useRef(-2);
  const [animKey, setAnimKey] = useState(0);

  const activeIdx = useMemo(() => {
    if (!segments.length) return -1;

    // 1. Exact range match
    const exact = segments.findIndex((s) => currentTime >= s.startTime && currentTime <= s.endTime);
    if (exact !== -1) return exact;

    // 2. In a gap between segments — keep showing the last segment that started
    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i].startTime <= currentTime) {
        const nextStart = segments[i + 1]?.startTime ?? Infinity;
        if (currentTime < nextStart) return i;
        break;
      }
    }

    // 3. Before the song starts — show first upcoming segment (within 5s pre-roll)
    const first = segments[0];
    if (first && first.startTime > currentTime && first.startTime - currentTime <= 5) return 0;

    return -1;
  }, [segments, currentTime]);

  useEffect(() => {
    if (prevIdxRef.current !== activeIdx) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimKey((k) => k + 1);
      prevIdxRef.current = activeIdx;
    }
  }, [activeIdx]);

  const currentSeg = activeIdx >= 0 ? segments[activeIdx] : null;
  const nextSeg =
    activeIdx >= 0 && activeIdx + 1 < segments.length ? segments[activeIdx + 1] : null;

  const renderWords = (seg: KaraokeSegment, isPreview = false) => {
    const scale = isMaximized ? 2.5 : 1;
    const activeFontSize = isMaximized ? style.fontSize * 1.5 : style.fontSize;
    const textBaseStyle: React.CSSProperties = {
      fontFamily: style.fontFamily,
      letterSpacing: `${style.letterSpacing * scale * (isPreview ? 0.8 : 1)}px`,
      WebkitTextStroke: isPreview ? 'none' : `${style.strokeWidth * scale}px ${style.strokeColor}`,
      fontSize: isPreview ? `${activeFontSize * 0.68}px` : `${activeFontSize}px`,
      fontWeight: '900',
      whiteSpace: 'pre',
      filter: isPreview
        ? 'none'
        : `drop-shadow(${style.shadowOffsetX * scale}px ${style.shadowOffsetY * scale}px ${style.shadowBlur * scale}px ${style.shadowColor})`,
    };

    const wordsArray = seg.words?.length ? seg.words : null;

    // Fallback: no word-level data — render full line as one span
    if (!wordsArray) {
      const text = style.allCaps ? seg.text.toUpperCase() : seg.text;
      return [
        <span
          key="fallback"
          style={{ ...textBaseStyle, color: isPreview ? style.initialColor : style.activeColor }}
        >
          {text}
        </span>,
      ];
    }

    if (isPreview) {
      return wordsArray.map((word, idx) => {
        const wordText = style.allCaps ? word.text.toUpperCase() : word.text;
        const wordTextWithSpace = idx < wordsArray.length - 1 ? `${wordText} ` : wordText;
        return (
          <span key={idx} style={{ ...textBaseStyle, color: style.initialColor }}>
            {wordTextWithSpace}
          </span>
        );
      });
    }

    return wordsArray.map((word, idx) => {
      const isActive = currentTime >= word.startTime && currentTime < word.endTime;
      const isPast = currentTime >= word.endTime;
      const wordText = style.allCaps ? word.text.toUpperCase() : word.text;
      const wordTextWithSpace = idx < wordsArray.length - 1 ? `${wordText} ` : wordText;

      if (style.textAnimation === 'basic-ktv') {
        const wordDuration = word.endTime - word.startTime;
        const progress =
          wordDuration > 0
            ? Math.min(100, Math.max(0, ((currentTime - word.startTime) / wordDuration) * 100))
            : isPast
              ? 100
              : 0;

        const activeFillStyle: React.CSSProperties = {
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${progress}%`,
          overflow: 'hidden',
          whiteSpace: 'pre',
          WebkitTextStroke: '0px transparent',
        };

        return (
          <span
            key={idx}
            style={{
              ...textBaseStyle,
              color: isPast
                ? style.ktvFillType === 'rainbow'
                  ? 'transparent'
                  : style.activeColor
                : style.initialColor,
              position: 'relative',
              overflow: 'hidden',
              display: 'inline-block',
            }}
          >
            <span style={{ color: style.initialColor }}>{wordTextWithSpace}</span>
            <span
              className={style.ktvFillType === 'rainbow' ? 'rainbow-animate' : ''}
              style={activeFillStyle}
            >
              {wordTextWithSpace}
            </span>
            {isPast && style.ktvFillType === 'rainbow' && (
              <span className="rainbow-animate" style={{ ...activeFillStyle, width: '100%' }}>
                {wordTextWithSpace}
              </span>
            )}
          </span>
        );
      }

      const wordDuration = word.endTime - word.startTime;
      const wordProgress =
        wordDuration > 0
          ? Math.min(1, Math.max(0, (currentTime - word.startTime) / wordDuration))
          : isPast ? 1 : 0;

      const textColor = isActive || isPast ? style.activeColor : style.initialColor;
      const baseFilter = (textBaseStyle.filter as string) ?? '';

      switch (style.textAnimation) {
        case 'neon-pulse': {
          const glow = isActive ? 14 * (1 - wordProgress * 0.6) : isPast ? 5 : 0;
          return (
            <span key={idx} style={{
              ...textBaseStyle,
              color: textColor,
              filter: glow > 0 ? `${baseFilter} drop-shadow(0 0 ${glow}px ${style.activeColor})` : baseFilter,
              transition: 'all 0.15s ease-out',
            }}>{wordTextWithSpace}</span>
          );
        }
        case 'float-up': {
          const lift = isActive ? -6 * (1 - wordProgress) : 0;
          return (
            <span key={idx} style={{
              ...textBaseStyle, color: textColor, display: 'inline-block',
              transform: `translateY(${lift}px)`,
              transition: 'transform 0.2s ease-out, color 0.15s ease-out',
            }}>{wordTextWithSpace}</span>
          );
        }
        case 'glitch': {
          const g = isActive && wordProgress < 0.3 ? (1 - wordProgress / 0.3) : 0;
          return (
            <span key={idx} style={{
              ...textBaseStyle, color: textColor,
              textShadow: g > 0 ? `${Math.round(3 * g)}px 0 #ff0044, ${-Math.round(3 * g)}px 0 #00ddff` : 'none',
              transition: 'color 0.1s',
            }}>{wordTextWithSpace}</span>
          );
        }
        case 'wave-distort': {
          const skew = isActive && wordProgress < 0.4 ? Math.sin((wordProgress / 0.4) * Math.PI * 2) * 8 : 0;
          return (
            <span key={idx} style={{
              ...textBaseStyle, color: textColor, display: 'inline-block',
              transform: `skewX(${skew}deg)`, transition: 'color 0.15s',
            }}>{wordTextWithSpace}</span>
          );
        }
        case 'fire-glow': {
          const ff = isActive
            ? `${baseFilter} drop-shadow(0 -3px ${8 + wordProgress * 6}px #ff6600) drop-shadow(0 0 ${16 - wordProgress * 8}px ${style.activeColor})`
            : isPast ? `${baseFilter} drop-shadow(0 0 4px ${style.activeColor})` : baseFilter;
          return (
            <span key={idx} style={{ ...textBaseStyle, color: textColor, filter: ff, transition: 'color 0.2s ease-out' }}>{wordTextWithSpace}</span>
          );
        }
        case 'smoke-rise': {
          const drift = isActive ? -4 * wordProgress : isPast ? -4 : 0;
          return (
            <span key={idx} style={{
              ...textBaseStyle, color: textColor, display: 'inline-block',
              transform: `translateY(${drift}px)`, opacity: isPast ? 0.65 : 1,
              transition: 'all 0.35s ease-out',
            }}>{wordTextWithSpace}</span>
          );
        }
        case 'rainbow-sweep':
          return (
            <span key={idx}
              className={isActive || isPast ? 'rainbow-animate' : ''}
              style={{
                ...textBaseStyle,
                color: isActive || isPast ? 'transparent' : style.initialColor,
                WebkitTextStroke: isActive || isPast ? '0px transparent' : textBaseStyle.WebkitTextStroke,
                filter: isActive || isPast ? 'none' : baseFilter,
              }}
            >{wordTextWithSpace}</span>
          );
        case 'blur-reveal': {
          const blurPx = isActive ? Math.max(0, 5 * (1 - wordProgress * 1.5)) : isPast ? 0 : 5;
          return (
            <span key={idx} style={{
              ...textBaseStyle, color: textColor, display: 'inline-block',
              filter: blurPx > 0.2 ? `blur(${blurPx.toFixed(1)}px)` : baseFilter,
              transition: 'color 0.1s',
            }}>{wordTextWithSpace}</span>
          );
        }
        case 'zoom-bounce': {
          const scale = isActive && wordProgress < 0.3
            ? 1 + 0.18 * Math.sin((wordProgress / 0.3) * Math.PI) : 1;
          return (
            <span key={idx} style={{
              ...textBaseStyle, color: textColor, display: 'inline-block',
              transform: `scale(${scale.toFixed(3)})`,
              transition: 'color 0.15s ease-out, transform 0.08s ease-out',
            }}>{wordTextWithSpace}</span>
          );
        }
        default: // 'classic'
          return (
            <span key={idx} style={{ ...textBaseStyle, color: textColor, transition: 'color 0.15s ease-out' }}>
              {wordTextWithSpace}
            </span>
          );
      }
    });
  };

  const renderDecorativeIcon = () => {
    if (style.iconType === 'none') return null;
    const size = isMaximized ? style.iconSize * 1.4 : style.iconSize;
    const commonStyles: React.CSSProperties = {
      position: 'absolute',
      left: `${style.iconPosX}%`,
      top: `${style.iconPosY}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: style.iconOpacity,
      zIndex: 60,
      color: style.activeColor,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (style.iconType) {
      case 'equalizer':
        return (
          <div
            style={{
              ...commonStyles,
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            className="flex items-end gap-1.5 p-2.5"
          >
            {[0.4, 0.7, 1.0, 0.6, 0.8, 0.5].map((speed, i) => (
              <div
                key={i}
                className="w-full rounded-full bg-current"
                style={{
                  height: '20%',
                  animation: `k-eq-bar ${0.4 / speed}s infinite alternate ease-in-out`,
                }}
              />
            ))}
          </div>
        );
      case 'vinyl':
        return (
          <div
            style={{
              ...commonStyles,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #222 0%, #000 70%, #111 100%)',
              boxShadow: '0 0 30px rgba(0,0,0,0.5)',
              animation: 'k-vinyl-rotate 4s linear infinite',
            }}
          >
            <div className="h-1/4 w-1/4 rounded-full border-2 border-black bg-amber-500" />
          </div>
        );
      case 'heart':
        return (
          <div
            style={{
              ...commonStyles,
              fontSize: `${size}px`,
              animation: 'k-heart-beat 1.5s infinite ease-in-out',
            }}
          >
            ❤
          </div>
        );
      case 'star':
        return (
          <div
            style={{
              ...commonStyles,
              fontSize: `${size}px`,
              animation: 'k-vinyl-rotate 10s linear infinite',
            }}
          >
            ★
          </div>
        );
      case 'note':
        return (
          <div
            style={{
              ...commonStyles,
              fontSize: `${size}px`,
              animation: 'k-heart-beat 2s infinite ease-in-out',
            }}
          >
            ♪
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="shadow-3xl relative h-full w-full overflow-hidden bg-black">
      <div
        ref={backgroundRef}
        className="absolute inset-0 h-full w-full"
        style={{ transformOrigin: 'center center' }}
      >
        {project.backgroundUrl ? (
          project.backgroundType === 'video' ? (
            <video
              src={project.backgroundUrl}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={project.backgroundUrl}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              alt="bg"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#080910] via-[#0f172a] to-[#080910] opacity-90" />
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
      />
      <canvas
        ref={vfxCanvasRef}
        width={1000}
        height={600}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      {renderDecorativeIcon()}

      {currentTime < 4 && (
        <div className="animate-fadeIn absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 px-10 text-center backdrop-blur-md">
          <h2
            className="mb-4 font-black uppercase italic leading-none text-white"
            style={{
              fontSize: isMaximized ? '120px' : '60px',
              fontFamily: style.fontFamily,
            }}
          >
            {style.introTitle}
          </h2>
          <p className="text-[16px] font-black uppercase tracking-[0.6em] text-amber-400">
            Ca sĩ: {style.introArtist}
          </p>
        </div>
      )}

      <div
        className="pointer-events-none absolute z-50 flex w-full flex-col items-center gap-4 px-8"
        style={{ top: `${style.positionY}%`, transform: 'translateY(-50%)' }}
      >
        {currentSeg && (
          <div
            key={`cur-${animKey}`}
            className="k-lyric-line flex max-w-[95%] flex-wrap justify-center"
          >
            {renderWords(currentSeg)}
          </div>
        )}
        {nextSeg && (
          <div
            key={`nxt-${animKey}`}
            className="k-lyric-line-next flex max-w-[95%] flex-wrap justify-center"
          >
            {renderWords(nextSeg, true)}
          </div>
        )}
      </div>
    </div>
  );
};
