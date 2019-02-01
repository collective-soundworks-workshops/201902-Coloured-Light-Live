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
    this.lastX = null;
    this.lastY = null;
    this.size = 200;
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

  render(ctx, width, height) {
    const x = this.x * width;
    const y = this.y * height;

    let color = this.color;
    if (color !== null) {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.globalCompositeOperation = 'screen';
    } else {
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = this.opacity;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    ctx.arc(x, y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    this.lastX = this.x;
    this.lastY = this.y;
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
    this.lastX = null;
    this.lastY = null;

    this.opacity = 1;

    this.activeLights = new Map();
    this.inactiveLights = new Set();
  }

  init() {
    // this.canvasWidth
    // this.canvasHeight
  }

  setOpacity(opacity) {
    this.opacity = opacity;
  }

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

  render(ctx) {
    for (let [id, light] of this.activeLights)
      light.render(ctx, this.canvasWidth, this.canvasHeight);

    for (let light of this.inactiveLights)
      light.render(ctx, this.canvasWidth, this.canvasHeight);
  }
}

export default LightRenderer;