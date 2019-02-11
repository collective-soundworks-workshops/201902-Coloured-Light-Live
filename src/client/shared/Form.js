function renderCircle(ctx, size) {
  const radius = 0.5 * size;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
}

function renderSquare(ctx, size) {
  const width = size * 0.886226925452758; // 0.5 * sqrt(PI)
  const offset = -0.5 * width;
  ctx.beginPath();
  ctx.rect(offset, offset, width, width);
}

function renderTriangle(ctx, size) {
  const radius = 0.5 * size;
  const xBottom = 0.43301270189221935 * size;
  const yBottom = 0.25 * size;
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.lineTo(-xBottom, yBottom);
  ctx.lineTo(xBottom, yBottom);
  ctx.closePath();
}

function renderRightangle(ctx, size) {
  const radius = 0.5 * size;
  const xTop = -0.22360679774997894 * size;
  const yTop = -0.44721359549995804 * size;
  ctx.beginPath();
  ctx.moveTo(xTop, yTop);
  ctx.lineTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.closePath();
}

function renderCross(ctx, size) {
  const radius = 0.5 * size;
  const corner = 0.125 * size;
  ctx.beginPath();
  ctx.moveTo(-corner, -radius);
  ctx.lineTo(-corner, -corner);
  ctx.lineTo(-radius, -corner);
  ctx.lineTo(-radius, corner);
  ctx.lineTo(-radius, corner);
  ctx.lineTo(-corner, corner);
  ctx.lineTo(-corner, radius);
  ctx.lineTo(corner, radius);
  ctx.lineTo(corner, corner);
  ctx.lineTo(radius, corner);
  ctx.lineTo(radius, -corner);
  ctx.lineTo(corner, -corner);
  ctx.lineTo(corner, -radius);
  ctx.closePath();
}

class Form {
  constructor(type) {
    this.type = type;

    this.x = 0;
    this.y = 0;
    this.size = 1;
    this.rotation = 0;
    this.shutterIncl = 0;
    this.leftShutter = 0;
    this.rightShutter = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setSizeAndRotation(size, rotation) {
    this.size = size;
    this.rotation = rotation;
  }

  setShutterIncl(incl) {
    this.shutterIncl = incl;
  }

  setLeftShutter(dist) {
    this.leftShutter = dist;
  }

  setRightShutter(dist) {
    this.rightShutter = dist;
  }

  renderCore(ctx, scale, fill) {
    switch (this.type) {
      case 'circle':
        renderCircle(ctx, scale * this.size);
        break;
      case 'square':
        renderSquare(ctx, scale * this.size);
        break;
      case 'triangle':
        renderTriangle(ctx, scale * this.size);
        break;
      case 'rightangle':
        renderRightangle(ctx, scale * this.size);
        break;
      case 'cross':
        renderCross(ctx, scale * this.size);
        break;
    }

    if (fill)
      ctx.fill();
    else
      ctx.stroke();
  }

  renderShutter(ctx, scale, side) {
    const xTop = 0.5 * Math.tan(this.shutterIncl);
    const opening = (side === 'left') ? -this.leftShutter : this.rightShutter;
    const angle = Math.atan(this.shutterIncl);
    const shift = 0.5 * scale * this.size * opening / Math.cos(angle);

    ctx.beginPath();
    ctx.moveTo(shift + xTop, -0.5);
    ctx.lineTo(shift - xTop, 0.5);

    if (side === 'left') {
      ctx.lineTo(shift - 0.5, 0.5);
      ctx.lineTo(shift - 0.5, -0.5);
    } else {
      ctx.lineTo(shift + 0.5, 0.5);
      ctx.lineTo(shift + 0.5, -0.5);
    }

    ctx.closePath();
    ctx.fill();
  }

  renderShutterLine(ctx) {
    const xTop = 0.5 * Math.tan(this.shutterIncl);

    ctx.beginPath();
    ctx.moveTo(xTop, -0.5);
    ctx.lineTo(-xTop, 0.5);
    ctx.stroke();
  }

  renderInterface(ctx, square, scale, mode) {
    ctx.save();

    ctx.translate(square.xCenter, square.yCenter);
    ctx.scale(square.size, square.size);
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = (mode === 'resize') ? '#fff' : '#aaa';
    ctx.globalAlpha = 0.5;
    ctx.rotate(this.rotation);
    this.renderCore(ctx, scale, true);
    ctx.rotate(-this.rotation);

    ctx.fillStyle = (mode === 'left-shutter') ? '#444' : '#222';
    ctx.globalAlpha = 0.8;
    this.renderShutter(ctx, scale, 'left');

    ctx.fillStyle = (mode === 'right-shutter') ? '#444' : '#222';
    this.renderShutter(ctx, scale, 'right');

    ctx.strokeStyle = (mode === 'shutter-incl') ? '#fff' : '#aaa';
    ctx.lineWidth = ((mode === 'shutter-incl') ? 5 : 3) / square.size;
    ctx.globalAlpha = 0.5;
    this.renderShutterLine(ctx);

    ctx.restore();
  }

  renderResultAtPosition(ctx, square, x, y, scale, color, opacity) {
    ctx.save();

    ctx.globalCompositeOperation = 'screen';

    ctx.translate(x, y);
    ctx.scale(square.size, square.size);

    const shutterAngle = Math.atan(this.shutterIncl);
    ctx.rotate(shutterAngle);

    const adapt = 0.5 * scale * this.size;
    const left = -adapt * this.leftShutter;
    const width = adapt * (this.leftShutter + this.rightShutter);

    ctx.beginPath();
    ctx.rect(left, -0.5, width, 1);
    ctx.clip();

    ctx.rotate(this.rotation - shutterAngle);

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    this.renderCore(ctx, scale, true);

    ctx.restore();
  }

  renderResult(ctx, square, scale, color, opacity) {
    const x = square.getX(this.x);
    const y = square.getY(this.y);

    this.renderResultAtPosition(ctx, square, x, y, scale, color, opacity);
  }

  renderBorder(ctx, square, scale, color, opacity) {
    const x = square.getX(this.x);
    const y = square.getY(this.y);

    ctx.save();

    ctx.globalCompositeOperation = 'screen';

    ctx.translate(x, y);
    ctx.scale(square.size, square.size);
    ctx.rotate(this.rotation);

    ctx.lineWidth = 1 / square.size;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    this.renderCore(ctx, scale, false);

    ctx.restore();
  }
}

export default Form;