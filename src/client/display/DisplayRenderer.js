import { Canvas2dRenderer } from 'soundworks/client';

const fadeInTime = 1;
const fadeOutTime = 1;

function getTime() {
  return 0.001 * performance.now();
}

class Light {
  constructor(id, x, y, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = color;
    this.opacity = 0;
    this.active = true;
    this.time = getTime();
  }

  update(time) {
    const delta = time - this.time;

    if (this.active) {
      if (delta < fadeInTime)
        this.opacity = delta / fadeInTime;
      else
        this.opacity = 1;
    } else {
      if (delta < fadeOutTime)
        this.opacity = 1 - delta / fadeOutTime;
      else
        return false;
    }

    return true;
  }

  start(time) {
    this.time = time;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  stop(time) {
    this.time = time - (fadeOutTime - this.opacity * fadeOutTime);
    this.active = false;
  }
}

class Form {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = 1;
  }
}

/**
 * A simple canvas renderer.
 * The class renders a dot moving over the screen and rebouncing on the edges.
 */
class LightRenderer extends Canvas2dRenderer {
  constructor() {
    super();

    this.x = null;
    this.y = null;

    this.activeLights = new Map();
    this.inactiveLights = new Set();

    this.activeForms = new Map();

    const form0 = new Form(0, 0.2, 0.2);
    const form1 = new Form(1, 0.7, 0.5);
    this.activeForms.set(0, form0);
    this.activeForms.set(1, form1);
  }

  init() {}

  getLightById(id) {
    let light = this.activeLights.get(id);

    return light;
  }

  startLight(id, x, y, color) {
    const light = new Light(id, x, y, color);

    const time = getTime();
    light.start(time);

    this.activeLights.set(id, light);
  }

  moveLight(id, x, y) {
    const light = this.getLightById(id);

    if (light)
      light.move(x, y);
  }

  stopLight(id) {
    const light = this.getLightById(id);

    if (light) {
      const time = getTime();
      light.stop(time);

      this.activeLights.delete(id);
      this.inactiveLights.add(light);
    }
  }

  update(dt) {
    const time = getTime();

    for (let [id, light] of this.activeLights)
      light.update(time);

    for (let light of this.inactiveLights) {
      const cont = light.update(time);

      if (!cont)
        this.inactiveLights.delete(light);
    }
  }

  renderLightThroughForm(ctx, light, form) {
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    const squareSize = Math.min(width, height);
    const xMin = 0.5 * (width - squareSize);
    const yMin = 0.5 * (height - squareSize);
    const normX = form.x - 0.2 * (light.x - form.x);
    const normY = form.y - 0.2 * (light.y - form.y);
    const x = xMin + normX * squareSize;
    const y = yMin + normY * squareSize;

    ctx.fillStyle = light.color;
    ctx.globalAlpha = 0.25 * light.opacity;
    ctx.globalCompositeOperation = 'screen';

    ctx.beginPath();
    ctx.arc(x, y, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  renderScatteredLight(ctx, light) {
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    const squareSize = Math.min(width, height);
    const xMin = 0.5 * (width - squareSize);
    const yMin = 0.5 * (height - squareSize);
    const x = xMin + light.x * squareSize;
    const y = yMin + light.y * squareSize;

    ctx.globalAlpha = 0.2 * light.opacity;

    const gradient = ctx.createRadialGradient(x, y, 10, 0.5 * width, 0.5 * height, 0.707 * squareSize);
    gradient.addColorStop(0, light.color);
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;

    ctx.fillRect(xMin, yMin, squareSize, squareSize);
  }

  render(ctx) {
    for (let [id, light] of this.activeLights) {
      this.renderScatteredLight(ctx, light);

      for (let [id, form] of this.activeForms) {
        this.renderLightThroughForm(ctx, light, form);
      }
    }

    for (let light of this.inactiveLights) {
      this.renderScatteredLight(ctx, light);

      for (let [id, form] of this.activeForms) {
        this.renderLightThroughForm(ctx, light, form);
      }
    }
  }
}

export default LightRenderer;