const fadeInTime = 1;
const fadeOutTime = 1;

class Light {
  constructor(color, x = 0, y = 0) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.intensity = 0;
    this.active = false;
    this.slope = 0;
  }

  update(dt) {
    const delta = dt * this.slope;
    let intensity = this.intensity + delta;

    if (this.active && intensity > 1) {
      intensity = 1;
      this.slope = 0;
    } else if (!this.active && intensity < 0) {
      intensity = 0;
      this.slope = 0;      
    }

    this.intensity = intensity;
  }

  start() {
    this.active = true;
    this.slope = 1 / fadeInTime;
  }

  stop() {
    this.active = false;
    this.slope = -1 / fadeOutTime;
  }

  renderDirect(ctx, square) {
    if (this.intensity > 0) {
      const squareSize = square.size;
      const x = square.getX(this.x);
      const y = square.getY(this.y);

      ctx.globalAlpha = this.intensity;

      const gradient = ctx.createRadialGradient(x, y, 10, square.xCenter, square.yCenter, 0.707 * squareSize);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, '#000');
      ctx.fillStyle = gradient;

      ctx.fillRect(square.xMargin, square.yMargin, squareSize, squareSize);
    }
  }

  renderOpening(ctx, square, form, formRatio, directIntensity, strayIntensity, screenDistance) {
    if (this.intensity > 0) {
      const squareSize = square.size;
      const distX = (this.x - form.x);
      const distY = (this.y - form.y);
      const normOffsetX = screenDistance * distX;
      const normOffsetY = screenDistance * distY;
      const xForm = square.getX(form.x - normOffsetX);
      const yForm = square.getY(form.y - normOffsetY);
      const xBlur = square.getX(form.x - 2 * normOffsetX);
      const yBlur = square.getY(form.y - 2 * normOffsetY);
      const size = form.size * formRatio * squareSize;

      // render stray light
      const gradient = ctx.createRadialGradient(xForm, yForm, 1, xBlur, yBlur, squareSize);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, '#000');

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = strayIntensity * this.intensity * 0.5 * (form.leftShutter + form.rightShutter);
      ctx.fillStyle = gradient;
      ctx.fillRect(square.xMargin, square.yMargin, squareSize, squareSize);

      // render form
      form.renderResultAtPosition(ctx, square, xForm, yForm, formRatio, this.color, directIntensity * this.intensity, true);
    }
  }

  renderShadow(ctx, square) {
    const squareSize = square.size;
    const x = square.getX(this.x);
    const y = square.getY(this.y);

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.2 * this.intensity;

    const gradient = ctx.createRadialGradient(x, y, 10, square.xCenter, square.yCenter, 0.707 * squareSize);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;

    ctx.fillRect(square.xMargin, square.yMargin, squareSize, squareSize);
  }
}

export default Light;