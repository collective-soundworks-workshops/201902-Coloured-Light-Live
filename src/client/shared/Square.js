class Square {
  constructor(width = 0, height = 0) {
    this.width = 0;
    this.height = 0;
    this.size = 0;
    this.xCenter = 0;
    this.yCenter = 0;
    this.xMargin = 0;
    this.yMargin = 0;

    if (width * height > 0)
      this.resize(width, height);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    const squareSize = Math.min(width, height);
    this.size = squareSize;
    this.xCenter = 0.5 * width;
    this.yCenter = 0.5 * height;
    this.xMargin = 0.5 * (width - squareSize);
    this.yMargin = 0.5 * (height - squareSize);
  }

  getX(normX) {
    return this.xCenter + normX * this.size;
  }

  getY(normY) {
    return this.yCenter + normY * this.size;
  }

  renderFrame(ctx, color = '#000000') {
    const lineRadius = 5;
    const width = this.width - 2 * (this.xMargin + lineRadius);
    const height = this.height - 2 * (this.yMargin + lineRadius);

    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeRect(this.xMargin + lineRadius, this.yMargin + lineRadius, width, height);
  }

  renderMargins(ctx, color = '#000000') {
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    const xMargin = this.xMargin;
    const yMargin = this.yMargin;

    if (xMargin > 0) {
      ctx.fillRect(0, 0, xMargin, this.height);
      ctx.fillRect(this.width - xMargin, 0, xMargin, this.height);
    }

    if (yMargin > 0) {
      ctx.fillRect(0, 0, this.width, yMargin);
      ctx.fillRect(0, this.height - yMargin, this.width, yMargin);
    }
  }
}

export default Square;