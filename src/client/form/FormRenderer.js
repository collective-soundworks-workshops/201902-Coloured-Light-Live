import { Canvas2dRenderer } from 'soundworks/client';
import Square from '../shared/Square';
import Form from '../shared/Form';

class FormRenderer extends Canvas2dRenderer {
  constructor(type) {
    super();

    this.square = new Square();
    this.form = new Form(type);

    this.projectionParams = {
      formRatio: 0.1,
      directIntensity: 0.4,
      strayIntensity: 0.2,
      screenDistance: 0.1,
    };

    this.mode = null;
  }

  onResize(canvasWidth, canvasHeight, orientation) {
    super.onResize(canvasWidth, canvasHeight, orientation);
    this.square.resize(canvasWidth, canvasHeight);
  }

  initForm(x, y, size, shutterIncl, leftShutter, rightShutter) {
    const form = this.form;

    form.x = x;
    form.y = y;
    form.size = size;
    form.shutterIncl = shutterIncl;
    form.leftShutter = leftShutter;
    form.rightShutter = rightShutter;
  }

  setPosition(x, y) {
    const form = this.form;
    form.x = x;
    form.y = y;
  }

  setSizeAndRotation(size, rotation) {
    this.form.setSizeAndRotation(size, rotation);
  }

  setShutterIncl(incl) {
    this.form.setShutterIncl(incl);
  }

  setLeftShutter(dist) {
    this.form.setLeftShutter(dist);
  }

  setRightShutter(dist) {
    this.form.setRightShutter(dist);
  }

  update(dt) {}

  render(ctx) {
    const square = this.square;
    const form = this.form;
    const formRatio = this.projectionParams.formRatio;

    form.renderInterface(ctx, square, 1/3, this.mode);
    form.renderBorder(ctx, square, formRatio, '#888', 0.8);
    form.renderResult(ctx, square, formRatio, '#fff', 0.8);
  }
}

export default FormRenderer;