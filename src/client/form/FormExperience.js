import * as soundworks from 'soundworks/client';
import FormRenderer from './FormRenderer';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const deg7_5 = Math.PI / 24;
const deg45 = Math.PI / 4;
const deg360 = 2 * Math.PI;

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

class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  distance(other) {
    const distX = this.x - other.x;
    const distY = this.y - other.y;
    return Math.sqrt(distX * distX + distY * distY);
  }

  angle(other) {
    const distX = this.x - other.x;
    const distY = this.y - other.y;
    return Math.atan2(distY, distX);
  }

  randomize() {
    this.x = Math.random() - 0.5;
    this.y = Math.random() - 0.5;
  }
}

class TouchPoint {
  constructor(id = null) {
    this.id = id;
    this.coords = new Point();
  }
}

class FormExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', {});
    this.checkin = this.require('checkin', { showDialog: false });
    this.colorPicker = this.require('form-picker');
    this.sharedParams = this.require('shared-params');

    this.touch1 = new TouchPoint();
    this.touch1Angle = 0;
    this.touch2 = new TouchPoint();
    this.touch2Dist = 0;
    this.touch2Angle = 0;
    this.coords = null;
    this.size = 1;
    this.rotation = 0;
    this.shutterIncl = Math.PI / 6;
    this.leftShutter = 0;
    this.rightShutter = 0;

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.updateFormRatio = this.updateFormRatio.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(template, model, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

    this.show().then(() => {
      this.renderer = new FormRenderer(client.form);
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

      const coords = new Point();
      coords.randomize();
      this.renderer.initForm(coords.x, coords.y, this.size, this.shutterIncl, this.leftShutter, this.rightShutter);
      this.send('add-form', client.index, client.form, coords.x, coords.y, this.size, this.shutterIncl, this.leftShutter, this.rightShutter);
      this.coords = coords;
    });

    this.sharedParams.addParamListener('reload', () => window.location.reload(true));
  }

  normCoords(absX, absY) {
    const rect = this.view.$el.getBoundingClientRect();
    const squareSize = Math.min(rect.width, rect.height);
    const xCenter = 0.5 * rect.width;
    const yCenter = 0.5 * rect.height;
    const normX = (absX - xCenter) / squareSize;
    const normY = (absY - yCenter) / squareSize;
    const x = Math.max(-0.5, Math.min(0.5, normX));
    const y = Math.max(-0.5, Math.min(0.5, normY));

    return new Point(x, y);
  }

  normX(absX) {
    const rect = this.view.$el.getBoundingClientRect();
    const squareSize = Math.min(rect.width, rect.height);
    const xCenter = 0.5 * rect.width;
    const normX = (absX - xCenter) / squareSize;

    return Math.max(-0.5, Math.min(0.5, normX));
  }

  setPosition(x, y, end) {
    const start = this.touch1.coords;
    const coords = this.normCoords(x, y);
    const normX = Math.max(-0.5, Math.min(0.5, this.coords.x + coords.x - start.x));
    const normY = Math.max(-0.5, Math.min(0.5, this.coords.y + coords.y - start.y));

    this.renderer.setPosition(normX, normY);
    this.send('move-form', client.index, normX, normY);

    if (end) {
      this.coords.x = normX;
      this.coords.y = normY;
    }
  }

  setSizeAndRotation(x, y, firstTouch, end) {
    const coords = this.normCoords(x, y);
    const touch = (firstTouch) ? this.touch1 : this.touch2;

    touch.coords = coords;

    const dist = this.touch1.coords.distance(this.touch2.coords);
    const size = Math.max(0.5, Math.min(2, this.size + 3 * (dist - this.touch2Dist)));

    const angle = this.touch1.coords.angle(this.touch2.coords);
    const rotation = deg7_5 * Math.floor((this.rotation + angle - this.touch2Angle) / deg7_5 + 0.5);

    this.renderer.setSizeAndRotation(size, rotation);
    this.send('adjust-form', client.index, size, rotation);

    if (end) {
      this.size = size;
      this.rotation = rotation;
    }
  }

  setShutterIncl(x, y, end) {
    const start = this.touch1.coords;
    const coords = this.normCoords(x, y);
    let incl;

    if (start.y < 0) {
      const normY = Math.min(-0.125, coords.y);
      const angle = Math.atan2(normY, coords.x);
      incl = this.shutterIncl + angle - this.touch1Angle;
    } else {
      const normY = Math.max(0.125, coords.y);
      const angle = Math.atan2(normY, coords.x);
      incl = deg7_5 * Math.floor((this.shutterIncl + angle - this.touch1Angle) / deg7_5 + 0.5);
    }

    incl = Math.max(-deg45, Math.min(deg45, incl));

    this.renderer.setShutterIncl(incl);
    this.send('shutter-incl', client.index, incl);

    if (end)
      this.shutterIncl = incl;
  }

  setLeftShutter(x, end) {
    const start = this.touch1.coords.x;
    const normX = this.normX(x);
    const dist = Math.max(0, Math.min(1.333, this.leftShutter - 6 * (normX - start) / this.size));

    this.renderer.setLeftShutter(dist);
    this.send('left-shutter', client.index, dist);

    if (end)
      this.leftShutter = dist;
  }

  setRightShutter(x, end) {
    const start = this.touch1.coords.x;
    const normX = this.normX(x);
    const dist = Math.max(0, Math.min(1.333, this.rightShutter + 6 * (normX - start) / this.size));

    this.renderer.setRightShutter(dist);
    this.send('right-shutter', client.index, dist);

    if (end)
      this.rightShutter = dist;
  }

  onTouchStart(id, x, y) {
    const coords = this.normCoords(x, y);

    if (this.touch1.id === null) {
      const dist = this.coords.distance(coords);
      const shutterLineDistance = coords.x + coords.y * Math.tan(this.shutterIncl);
      const inShutterArea = (coords.y > -0.5 && coords.y < 0.5);
      let mode = null;

      if (dist < 0.1 * this.size) {
        mode = 'move';
      } else if (inShutterArea) {
        if (Math.abs(shutterLineDistance) < 0.07) {
          mode = 'shutter-incl';
        } else if (shutterLineDistance < 0) {
          mode = 'left-shutter';
        } else {
          mode = 'right-shutter';
        }
      }

      this.renderer.mode = mode;

      this.touch1.id = id;
      this.touch1.coords = coords;
      this.touch1Angle = Math.atan2(coords.y, coords.x);
    } else if (this.touch2.id === null) {
      this.renderer.mode = 'resize';

      this.touch2.id = id;
      this.touch2.coords = coords;
      this.touch2Dist = this.touch1.coords.distance(coords);
      this.touch2Angle = this.touch1.coords.angle(coords);
    }
  }

  onTouchMove(id, x, y) {
    if (id === this.touch1.id || id === this.touch2.id) {
      switch (this.renderer.mode) {
        case 'move':
          this.setPosition(x, y, false);
          break;
        case 'resize':
          const firstTouch = (id === this.touch1.id);
          this.setSizeAndRotation(x, y, firstTouch, false);
          break;
        case 'shutter-incl':
          this.setShutterIncl(x, y, false);
          break;
        case 'left-shutter':
          this.setLeftShutter(x, false);
          break;
        case 'right-shutter':
          this.setRightShutter(x, false);
          break;
      }
    }
  }

  onTouchEnd(id, x, y) {
    if (id === this.touch1.id || id === this.touch2.id) {
      switch (this.renderer.mode) {
        case 'move':
          this.setPosition(x, y, true);
          break;
        case 'resize':
          const firstTouch = (id === this.touch1.id);
          this.setSizeAndRotation(x, y, firstTouch, true);
          break;
        case 'shutter-incl':
          this.setShutterIncl(x, y, true);
          break;
        case 'left-shutter':
          this.setLeftShutter(x, true);
          break;
        case 'right-shutter':
          this.setRightShutter(x, true);
          break;
      }

      this.renderer.showShutterLine = false;

      this.touch1.id = null;
      this.touch2.id = null;
      this.renderer.mode = null;
    }
  }

  updateFormRatio(value) {
    this.renderer.projectionParams.formRatio = value;
  }
}

export default FormExperience;