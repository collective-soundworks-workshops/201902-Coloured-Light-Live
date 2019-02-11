import { Canvas2dRenderer } from 'soundworks/client';
import Square from '../shared/Square';
import Light from '../shared/Light';
import Form from '../shared/Form';

class DisplayRenderer extends Canvas2dRenderer {
  constructor() {
    super();

    this.x = null;
    this.y = null;

    this.square = new Square();
    this.lights = new Map();
    this.forms = new Map();

    this.rehearsalLight = new Light('#fff', 0, 0);

    this.projectionParams = {
      formRatio: 0.1,
      directIntensity: 0.4,
      strayIntensity: 0.2,
      screenDistance: 0.1,
    };
  }

  onResize(canvasWidth, canvasHeight, orientation) {
    super.onResize(canvasWidth, canvasHeight, orientation);
    this.square.resize(canvasWidth, canvasHeight);
  }

  addLight(id, color, x, y) {
    const light = new Light(color, x, y);
    this.lights.set(id, light);
  }

  removeLight(id) {
    this.lights.delete(id);
  }

  moveLight(id, x, y) {
    const light = this.lights.get(id);

    if (light) {
      light.x = x;
      light.y = y;

      if (!light.active)
        light.start();
    }
  }

  stopLight(id) {
    const light = this.lights.get(id);

    if (light)
      light.stop();
  }

  addForm(id, type, x, y, size, shutterIncl, leftShutter, rightShutter) {
    const form = new Form(type);
    form.x = x;
    form.y = y;
    form.size = size;
    form.shutterIncl = shutterIncl;
    form.leftShutter = leftShutter;
    form.rightShutter = rightShutter;

    this.forms.set(id, form);
  }

  removeForm(id) {
    this.forms.delete(id);
  }

  setPosition(id, x, y) {
    const form = this.forms.get(id);

    if (form)
      form.setPosition(x, y);
  }

  setSizeAndRotation(id, size, rotation) {
    const form = this.forms.get(id);

    if (form)
      form.setSizeAndRotation(size, rotation);
  }

  setShutterIncl(id, incl) {
    const form = this.forms.get(id);

    if (form)
      form.setShutterIncl(incl);
  }

  setLeftShutter(id, dist) {
    const form = this.forms.get(id);

    if (form)
      form.setLeftShutter(dist);
  }

  setRightShutter(id, dist) {
    const form = this.forms.get(id);

    if (form)
      form.setRightShutter(dist);
  }

  update(dt) {
    for (let [id, light] of this.lights)
      light.update(dt);
  }

  render(ctx) {
    const square = this.square;
    const projectionParams = this.projectionParams;
    const formRatio = projectionParams.formRatio;
    const directIntensity = projectionParams.directIntensity;
    const strayIntensity = projectionParams.strayIntensity;
    const screenDistance = projectionParams.screenDistance;

    for (let [id, light] of this.lights) {
      for (let [id, form] of this.forms) {
        light.renderOpening(ctx, square, form, formRatio, directIntensity, strayIntensity, screenDistance);
      }
    }

    const rehearsalLight = this.rehearsalLight;
    if (rehearsalLight.intensity > 0) {
      for (let [id, form] of this.forms) {
        rehearsalLight.renderOpening(ctx, square, form, formRatio, 1, 0, 0);
      }
    }

    square.renderMargins(ctx);
  }
}

export default DisplayRenderer;