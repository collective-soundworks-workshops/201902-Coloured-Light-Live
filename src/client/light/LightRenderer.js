import { Canvas2dRenderer } from 'soundworks/client';
import Square from '../shared/Square';
import Light from '../shared/Light';

class LightRenderer extends Canvas2dRenderer {
  constructor(color) {
    super();

    this.square = new Square();
    this.light = new Light(color);

    this.lightFadeTime = 2;
  }

  onResize(canvasWidth, canvasHeight, orientation) {
    super.onResize(canvasWidth, canvasHeight, orientation);
    this.square.resize(canvasWidth, canvasHeight);
  }

  moveLight(x, y) {
    const light = this.light;

    if (light.active || light.intensity === 0) {
      light.x = x;
      light.y = y;

      if (!light.active)
        light.start(this.lightFadeTime);
    }
  }

  stopLight() {
    this.light.stop(this.lightFadeTime);
  }

  update(dt) {
    this.light.update(dt);
  }

  render(ctx) {
    const square = this.square;
    this.light.renderDirect(ctx, square);
  }
}

export default LightRenderer;