import * as soundworks from 'soundworks/client';
import LightRenderer from './LightRenderer';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
      <p class="big"><%= title %></p>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { title: `` };

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', {});
    this.checkin = this.require('checkin', { showDialog: false });
    this.colorPicker = this.require('color-picker');
    this.sharedParams = this.require('shared-params');

    this.touchId = null;

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(template, model, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

    this.show().then(() => {
      this.renderer = new LightRenderer();
      this.view.addRenderer(this.renderer);
      this.view.setPreRender(function(ctx, dt, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      });

      // setup touch listeners
      const surface = new soundworks.TouchSurface(this.view.$el, { normalizeCoordinates: false });
      surface.addListener('touchstart', this.onTouchStart);
      surface.addListener('touchmove', this.onTouchMove);
      surface.addListener('touchend', this.onTouchEnd);

      this.surface = surface;
    });
  }

  startLight(x, y) {
    const rect = this.view.$el.getBoundingClientRect();
    const squareSize = Math.min(rect.width, rect.height);
    const xMin = 0.5 * (rect.width - squareSize);
    const yMin = 0.5 * (rect.height - squareSize);
    const normX = Math.max(0, Math.min(1, (x - xMin) / squareSize));
    const normY = Math.max(0, Math.min(1, (y - yMin) / squareSize));

    this.renderer.startLight(normX, normY, client.color);
    this.send('start-light', client.index, normX, normY, client.color);
  }

  moveLight(x, y) {
    const rect = this.view.$el.getBoundingClientRect();
    const squareSize = Math.min(rect.width, rect.height);
    const xMin = 0.5 * (rect.width - squareSize);
    const yMin = 0.5 * (rect.height - squareSize);
    const normX = Math.max(0, Math.min(1, (x - xMin) / squareSize));
    const normY = Math.max(0, Math.min(1, (y - yMin) / squareSize));

    this.renderer.moveLight(normX, normY);
    this.send('move-light', client.index, normX, normY);
  }

  stopLight() {
    this.renderer.stopLight();
    this.send('stop-light', client.index);
  }

  onTouchStart(id, normX, normY) {
    if (this.touchId === null) {
      this.startLight(normX, normY);
      this.touchId = id;
    }
  }

  onTouchMove(id, normX, normY) {
    if (id === this.touchId)
      this.moveLight(normX, normY);
  }

  onTouchEnd(id, normX, normY) {
    if (id === this.touchId) {
      this.stopLight();
      this.touchId = null;
    }
  }
}

export default PlayerExperience;