import * as soundworks from 'soundworks/client';
import LightRenderer from './LightRenderer';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle">
      <p class="small">light</p>
    </div>
    <div class="section-center flex-center"></div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

class LightExperience extends soundworks.Experience {
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

    this.updateLightFadeTime = this.updateLightFadeTime.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(template, {}, {}, {
      id: this.id,
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0.12,
        '.section-center': 0.85,
        '.section-bottom': 0.03,
      },
    });

    this.show().then(() => {
      this.renderer = new LightRenderer(client.color);
      this.view.addRenderer(this.renderer);
      this.view.setPreRender(function(ctx, dt, canvasWidth, canvasHeight) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      });

      // setup touch listeners
      const surface = new soundworks.TouchSurface(this.view.$el, { normalizeCoordinates: false });
      surface.addListener('touchstart', this.onTouchStart);
      surface.addListener('touchmove', this.onTouchMove);
      surface.addListener('touchend', this.onTouchEnd);
      this.surface = surface;

      this.sharedParams.addParamListener('lightFadeTime', this.updateLightFadeTime);
      this.sharedParams.addParamListener('reload', () => window.location.reload(true));

      this.send('add-light', client.index, client.color);
    });
  }

  moveLight(x, y) {
    const rect = this.view.$el.getBoundingClientRect();
    const squareSize = Math.min(rect.width, rect.height);
    const xCenter = 0.5 * rect.width;
    const yCenter = 0.5 * rect.height;
    const normX = Math.max(-0.5, Math.min(0.5, (x - xCenter) / squareSize));
    const normY = Math.max(-0.5, Math.min(0.5, (y - yCenter) / squareSize));

    this.renderer.moveLight(normX, normY);
    this.send('move-light', client.index, normX, normY);
  }

  stopLight() {
    this.renderer.stopLight();
    this.send('stop-light', client.index);
  }

  onTouchStart(id, x, y) {
    if (this.touchId === null) {
      this.moveLight(x, y);
      this.touchId = id;
    }
  }

  onTouchMove(id, x, y) {
    if (id === this.touchId)
      this.moveLight(x, y);
  }

  onTouchEnd(id, x, y) {
    if (id === this.touchId) {
      this.stopLight();
      this.touchId = null;
    }
  }

  updateLightFadeTime(value) {
    this.renderer.lightFadeTime = value;
  }
}

export default LightExperience;