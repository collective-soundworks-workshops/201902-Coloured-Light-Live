import * as soundworks from 'soundworks/client';
import DisplayRenderer from './DisplayRenderer';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
      <p><%= text %></p>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { text: '' };

class DisplayExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { showDialog: false });
    this.sharedParams = this.require('shared-params');

    this.onStartLight = this.onStartLight.bind(this);
    this.onMoveLight = this.onMoveLight.bind(this);
    this.onStopLight = this.onStopLight.bind(this);
    this.onReloadDisplay = this.onReloadDisplay.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(template, model, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

    this.show().then(() => {
      this.renderer = new DisplayRenderer();
      this.view.addRenderer(this.renderer);
      this.view.setPreRender(function(ctx, dt, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      });

      this.receive('start-light', this.onStartLight);
      this.receive('move-light', this.onMoveLight);
      this.receive('stop-light', this.onStopLight);

      this.sharedParams.addParamListener('reloadDisplay', this.onReloadDisplay);
    });
  }

  onStartLight(playerId, x, y, color) {
    this.renderer.startLight(playerId, x, y, color);
  }

  onMoveLight(playerId, x, y) {
    this.renderer.moveLight(playerId, x, y);
  }

  onStopLight(playerId) {
    this.renderer.stopLight(playerId);
  }

  onReloadDisplay() {
    window.location.reload(true);
  }
}

export default DisplayExperience;