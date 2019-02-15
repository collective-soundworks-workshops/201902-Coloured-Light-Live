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

    const rehearsalLight = new Light('#fff', 0, 0);
    rehearsalLight.intensity = 1;
    this.rehearsalLight = rehearsalLight;


    this.playingMode = false;
    this.directIntensity = 0.4;
    this.strayIntensity = 0.2;
    this.rehearsalLightIntensity = 0.1;
    this.rehearsalFormIntensity = 0.1;
    this.formRatio = 0.1;
    this.screenDistance = 0.1;
    this.lightFadeTime = 2;
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

    if (light && (light.active || light.intensity === 0)) {
      light.x = x;
      light.y = y;

      if (!light.active)
        light.start(this.lightFadeTime);
    }
  }

  stopLight(id) {
    const light = this.lights.get(id);

    if (light)
      light.stop(this.lightFadeTime);
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

    switch (this.playingMode) {
      case 'off':
        break;

      case 'rehearsal':
        if (this.rehearsalLightIntensity) {
          for (let [id, light] of this.lights)
            light.renderDirect(ctx, square, this.rehearsalLightIntensity, 0, 0.5);
        }

        if (this.rehearsalFormIntensity > 0) {
          const rehearsalLight = this.rehearsalLight;
          for (let [id, form] of this.forms)
            rehearsalLight.renderOpening(ctx, square, form, this.formRatio, this.rehearsalFormIntensity, 0, 0, false);
        }
        break;

      case 'performance':
        for (let [id, light] of this.lights) {
          for (let [id, form] of this.forms) {
            light.renderOpening(ctx, square, form, this.formRatio, this.directIntensity, this.strayIntensity, this.screenDistance, true);
          }
        }
        break;
    }

    const marginColor = this.showFrame ? '#f00' : '#000';
    square.renderMargins(ctx, marginColor);

    if (this.showFrame)
      square.renderFrame(ctx, '#0f0');
  }
}

export default DisplayRenderer;