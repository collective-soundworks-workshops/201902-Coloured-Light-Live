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

    this.updateFormRatio = this.updateFormRatio.bind(this);
    this.updateDirectIntensity = this.updateDirectIntensity.bind(this);
    this.updateStrayIntensity = this.updateStrayIntensity.bind(this);
    this.updateScreenDistance = this.updateScreenDistance.bind(this);
    this.updateRehearsalLight = this.updateRehearsalLight.bind(this);
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

      this.receive('add-light', (playerId, color, x, y) => this.renderer.addLight(playerId, color, x, y));
      this.receive('remove-light', (playerId) => this.renderer.removeLight(playerId));
      this.receive('move-light', (playerId, x, y) => this.renderer.moveLight(playerId, x, y));
      this.receive('stop-light', (playerId) => this.renderer.stopLight(playerId));

      this.receive('add-form', (playerId, type, x, y, size, shutterIncl, leftShutter, rightShutter) => this.renderer.addForm(playerId, type, x, y, size, shutterIncl, leftShutter, rightShutter));
      this.receive('remove-form', (playerId) => this.renderer.removeForm(playerId));
      this.receive('move-form', (playerId, x, y) => this.renderer.setPosition(playerId, x, y));
      this.receive('adjust-form', (playerId, size, rotation) => this.renderer.setSizeAndRotation(playerId, size, rotation));
      this.receive('shutter-incl', (playerId, incl) => this.renderer.setShutterIncl(playerId, incl));
      this.receive('left-shutter', (playerId, dist) => this.renderer.setLeftShutter(playerId, dist));
      this.receive('right-shutter', (playerId, dist) => this.renderer.setRightShutter(playerId, dist));

      this.sharedParams.addParamListener('formRatio', this.updateFormRatio);
      this.sharedParams.addParamListener('directIntensity', this.updateDirectIntensity);
      this.sharedParams.addParamListener('strayIntensity', this.updateStrayIntensity);
      this.sharedParams.addParamListener('screenDistance', this.updateScreenDistance);
      this.sharedParams.addParamListener('rehearsalLight', this.updateRehearsalLight);
    });

    this.sharedParams.addParamListener('reload', () => window.location.reload(true));
  }

  updateFormRatio(value) {
    this.renderer.projectionParams.formRatio = value;
  }

  updateDirectIntensity(value) {
    this.renderer.projectionParams.directIntensity = value;
  }

  updateStrayIntensity(value) {
    this.renderer.projectionParams.strayIntensity = value;
  }

  updateScreenDistance(value) {
    this.renderer.projectionParams.screenDistance = value;
  }

  updateRehearsalLight(value) {
    this.renderer.rehearsalLight.intensity = value;
  }
}

export default DisplayExperience;