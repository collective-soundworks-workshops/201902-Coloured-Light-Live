import { Canvas2dRenderer } from 'soundworks/client';

const fadeInTime = 1;
const fadeOutTime = 1;

function getTime() {
  return 0.001 * performance.now();
}

/**
 * A simple canvas renderer.
 * The class renders a dot moving over the screen and rebouncing on the edges.
 */
class LightRenderer extends Canvas2dRenderer {
  constructor() {
    super();

    this.x = 0;
    this.y = 0;
    this.color = '#000';
    this.size = 200;
    this.opacity = 0;
    this.active = true;
    this.time = getTime();
  }

  init() {}

  startLight(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.time = getTime() - this.opacity * fadeInTime;
    this.active = true;
  }

  moveLight(x, y) {
    this.x = x;
    this.y = y;
  }

  stopLight() {
    this.time = getTime() - (1 - this.opacity) * fadeOutTime;
    this.active = false;
  }

  update(dt) {
    const delta = getTime() - this.time;

    if (this.active) {
      if (delta < fadeInTime)
        this.opacity = delta / fadeInTime;
      else
        this.opacity = 1;
    } else {
      if (delta < fadeOutTime)
        this.opacity = 1 - delta / fadeOutTime;
      else
        this.opacity = 0;
    }
  }

  render(ctx) {
    if (this.opacity !== 0) {
      const width = this.canvasWidth;
      const height = this.canvasHeight;
      const squareSize = Math.min(width, height);
      const xMin = 0.5 * (width - squareSize);
      const yMin = 0.5 * (height - squareSize);
      const x = xMin + this.x * squareSize;
      const y = yMin + this.y * squareSize;

      ctx.globalAlpha = this.opacity;

      const gradient = ctx.createRadialGradient(x, y, 10, 0.5 * width, 0.5 * height, 0.707 * squareSize);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, '#000');
      ctx.fillStyle = gradient;

      ctx.fillRect(xMin, yMin, squareSize, squareSize);
    }
  }
}

export default LightRenderer;