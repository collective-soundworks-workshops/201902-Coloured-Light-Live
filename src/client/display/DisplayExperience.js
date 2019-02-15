import * as soundworks from 'soundworks/client';
import DisplayRenderer from './DisplayRenderer';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
      <div class='url'>
        <% if (showURL) { %>
          <p>WLAN: Coloured Light Live</p>
          <p>10.0.0.1/light</p>
          <p>10.0.0.1/form</p>
        <% } %>
      </div>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { showURL: false };

class DisplayExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { showDialog: false });
    this.sharedParams = this.require('shared-params');

    this.updatePlayingMode = this.updatePlayingMode.bind(this);
    this.updateRehearsalLightIntensity = this.updateRehearsalLightIntensity.bind(this);
    this.updateRehearsalFormIntensity = this.updateRehearsalFormIntensity.bind(this);
    this.updateDirectIntensity = this.updateDirectIntensity.bind(this);
    this.updateStrayIntensity = this.updateStrayIntensity.bind(this);
    this.updateFormRatio = this.updateFormRatio.bind(this);
    this.updateScreenDistance = this.updateScreenDistance.bind(this);
    this.updateLightFadeTime = this.updateLightFadeTime.bind(this);
    this.updateShowURL = this.updateShowURL.bind(this);
    this.updateShowFrame = this.updateShowFrame.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(template, model, {}, {
      id: 'display',
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

      this.sharedParams.addParamListener('playingMode', this.updatePlayingMode);
      this.sharedParams.addParamListener('rehearsalLightIntensity', this.updateRehearsalLightIntensity);
      this.sharedParams.addParamListener('rehearsalFormIntensity', this.updateRehearsalFormIntensity);
      this.sharedParams.addParamListener('directIntensity', this.updateDirectIntensity);
      this.sharedParams.addParamListener('strayIntensity', this.updateStrayIntensity);
      this.sharedParams.addParamListener('formRatio', this.updateFormRatio);
      this.sharedParams.addParamListener('screenDistance', this.updateScreenDistance);
      this.sharedParams.addParamListener('lightFadeTime', this.updateLightFadeTime);
      this.sharedParams.addParamListener('showURL', this.updateShowURL);
      this.sharedParams.addParamListener('showFrame', this.updateShowFrame);
      this.sharedParams.addParamListener('reload', () => window.location.reload(true));
    });
  }

  updatePlayingMode(value) {
    this.renderer.playingMode = value;
  }

  updateRehearsalLightIntensity(value) {
    this.renderer.rehearsalLightIntensity = value;
  }

  updateRehearsalFormIntensity(value) {
    this.renderer.rehearsalFormIntensity = value;
  }

  updateDirectIntensity(value) {
    this.renderer.directIntensity = value;
  }

  updateStrayIntensity(value) {
    this.renderer.strayIntensity = value;
  }

  updateFormRatio(value) {
    this.renderer.formRatio = value;
  }

  updateScreenDistance(value) {
    this.renderer.screenDistance = value;
  }

  updateLightFadeTime(value) {
    this.renderer.lightFadeTime = value;
  }

  updateShowURL(value) {
    this.view.model.showURL = value;
    this.view.render('.url');
  }

  updateShowFrame(value) {
    this.renderer.showFrame = value;
  }
}

export default DisplayExperience;