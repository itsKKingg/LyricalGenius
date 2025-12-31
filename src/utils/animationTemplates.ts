import type { AnimationTemplate, AnimationStyle } from '../types';

export const animationTemplates: AnimationTemplate[] = [
  {
    id: 'karaoke-highlight',
    name: 'Karaoke Highlight',
    description: 'Horizontal bar sweeps left-to-right with color fill',
  },
  {
    id: 'bottom-third-static',
    name: 'Bottom Third Static',
    description: 'Bold text appears at bottom with white outline',
  },
  {
    id: 'center-pop-in',
    name: 'Center Pop-In',
    description: 'Text scales from 0 to 1 with bouncy easing',
  },
  {
    id: 'word-bounce',
    name: 'Word-by-Word Bounce',
    description: 'Each word animates with vertical bounce',
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Text with neon color and pulsing shadow',
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Letters appear one-by-one sequentially',
  },
  {
    id: 'gradient-sweep',
    name: 'Gradient Sweep',
    description: 'Color gradient animates across text',
  },
  {
    id: 'blur-fade',
    name: 'Blur Fade In',
    description: 'Text appears with blur then sharpens',
  },
  {
    id: 'scale-pulse',
    name: 'Scale Pulse',
    description: 'Text grows and shrinks rhythmically',
  },
  {
    id: 'flip-3d',
    name: 'Flip 3D',
    description: 'Text flips in 3D perspective',
  },
  {
    id: 'slide-in-left',
    name: 'Slide In Left',
    description: 'Text slides from left edge',
  },
  {
    id: 'slide-in-right',
    name: 'Slide In Right',
    description: 'Text slides from right edge',
  },
  {
    id: 'explode-particles',
    name: 'Explode Particles',
    description: 'Text shatters/explodes on entry (advanced)',
  },
  {
    id: 'rainbow-cycle',
    name: 'Rainbow Cycle',
    description: 'Text color cycles through rainbow',
  },
  {
    id: 'bold-entrance',
    name: 'Bold Entrance',
    description: 'Quick scale + opacity from 0 to 1',
  },
  {
    id: 'jitter-shake',
    name: 'Jitter Shake',
    description: 'Text shakes briefly on appearance',
  },
  {
    id: 'outline-stroke',
    name: 'Outline Stroke',
    description: 'SVG-like outline draws on text',
  },
  {
    id: 'underline-wipe',
    name: 'Underline Wipe',
    description: 'Underline draws beneath text',
  },
  {
    id: 'fade-blur',
    name: 'Fade + Blur Out',
    description: 'Opacity + blur-out transition',
  },
  {
    id: 'skew-perspective',
    name: 'Skew Perspective',
    description: 'Text skews in from angle',
  },
  {
    id: 'bounce-scale',
    name: 'Bounce Scale',
    description: 'Text bounces with scale oscillation',
  },
  {
    id: 'none',
    name: 'No Animation',
    description: 'Simple fade in/out',
  },
];

export function getAnimationCSS(style: AnimationStyle, progress: number): React.CSSProperties {
  const styles: React.CSSProperties = {};

  switch (style) {
    case 'karaoke-highlight':
      styles.background = `linear-gradient(to right, #fbbf24 ${progress * 100}%, #ffffff ${progress * 100}%)`;
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.backgroundClip = 'text';
      break;

    case 'center-pop-in':
      if (progress < 0.3) {
        styles.transform = `scale(${progress / 0.3})`;
        styles.opacity = progress / 0.3;
      }
      break;

    case 'word-bounce': {
      const bounceProgress = Math.sin(progress * Math.PI);
      styles.transform = `translateY(${-20 * bounceProgress}px)`;
      break;
    }

    case 'neon-glow': {
      const glowIntensity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5;
      styles.textShadow = `0 0 ${20 * glowIntensity}px #00ffff, 0 0 ${40 * glowIntensity}px #00ffff`;
      break;
    }

    case 'typewriter':
      styles.clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;
      break;

    case 'blur-fade': {
      if (progress < 0.5) {
        styles.filter = `blur(${10 * (1 - progress / 0.5)}px)`;
        styles.opacity = progress / 0.5;
      }
      break;
    }

    case 'scale-pulse': {
      const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
      styles.transform = `scale(${pulse})`;
      break;
    }

    case 'flip-3d':
      if (progress < 0.5) {
        styles.transform = `perspective(1000px) rotateX(${90 * (1 - progress / 0.5)}deg)`;
      }
      break;

    case 'slide-in-left':
      if (progress < 0.4) {
        styles.transform = `translateX(${-100 * (1 - progress / 0.4)}%)`;
      }
      break;

    case 'slide-in-right':
      if (progress < 0.4) {
        styles.transform = `translateX(${100 * (1 - progress / 0.4)}%)`;
      }
      break;

    case 'rainbow-cycle': {
      const hue = (progress * 360) % 360;
      styles.color = `hsl(${hue}, 100%, 50%)`;
      break;
    }

    case 'bold-entrance':
      if (progress < 0.3) {
        styles.transform = `scale(${0.5 + (progress / 0.3) * 0.5})`;
        styles.opacity = progress / 0.3;
      }
      break;

    case 'jitter-shake': {
      if (progress < 0.2) {
        const shake = Math.sin(progress * 100) * 5 * (1 - progress / 0.2);
        styles.transform = `translate(${shake}px, ${shake}px)`;
      }
      break;
    }

    case 'underline-wipe':
      styles.position = 'relative';
      break;

    case 'fade-blur':
      if (progress > 0.8) {
        const fadeProgress = (progress - 0.8) / 0.2;
        styles.filter = `blur(${10 * fadeProgress}px)`;
        styles.opacity = 1 - fadeProgress;
      }
      break;

    case 'skew-perspective':
      if (progress < 0.4) {
        styles.transform = `skewX(${30 * (1 - progress / 0.4)}deg)`;
        styles.opacity = progress / 0.4;
      }
      break;

    case 'bounce-scale': {
      const bounce = Math.abs(Math.sin(progress * Math.PI * 2));
      styles.transform = `scale(${1 + bounce * 0.2})`;
      break;
    }

    case 'gradient-sweep': {
      const gradientPos = progress * 200 - 100;
      styles.background = `linear-gradient(90deg, #ffffff ${gradientPos}%, #fbbf24 ${gradientPos + 50}%, #ffffff ${gradientPos + 100}%)`;
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.backgroundClip = 'text';
      break;
    }

    case 'bottom-third-static':
    case 'none':
    default:
      if (progress < 0.2) {
        styles.opacity = progress / 0.2;
      } else if (progress > 0.8) {
        styles.opacity = 1 - ((progress - 0.8) / 0.2);
      }
      break;
  }

  return styles;
}

export function getDefaultCaptionStyle(): import('../types').CaptionStyle {
  return {
    fontFamily: 'Arial, sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    animationStyle: 'karaoke-highlight',
    outlineColor: '#000000',
    outlineWidth: 2,
    shadowColor: '#000000',
    shadowBlur: 4,
    alignment: 'center',
    positionX: 50,
    positionY: 80,
  };
}
