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
    <div class="section-top flex-middle">
      <p class="small">form</p>
    </div>
    <div class="section-center flex-center"></div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

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

    this.touchX = 0;
    this.touchY = 0;
    this.touch1 = new TouchPoint();
    this.touch1Angle = 0;
    this.touch1Shutter = null;
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
    this.updatePlayingMode = this.updatePlayingMode.bind(this);
    this.updateFormRatio = this.updateFormRatio.bind(this);
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

      this.sharedParams.addParamListener('playingMode', this.updatePlayingMode);
      this.sharedParams.addParamListener('formRatio', this.updateFormRatio);
      this.sharedParams.addParamListener('reload', () => window.location.reload(true));

      const coords = new Point();
      coords.randomize();
      this.renderer.initForm(coords.x, coords.y, this.size, this.shutterIncl, this.leftShutter, this.rightShutter);
      this.send('add-form', client.index, client.form, coords.x, coords.y, this.size, this.shutterIncl, this.leftShutter, this.rightShutter);
      this.coords = coords;
    });
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

  setSizeAndRotation(x, y, isTouch1, end) {
    const coords = this.normCoords(x, y);
    const touch = (isTouch1) ? this.touch1 : this.touch2;

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

  setLeftShutter(x, touch, end) {
    const start = touch.coords.x;
    const normX = this.normX(x);
    const dist = Math.max(0, Math.min(1.41, this.leftShutter - 6 * (normX - start) / this.size));

    this.renderer.setLeftShutter(dist);
    this.send('left-shutter', client.index, dist);

    if (end)
      this.leftShutter = dist;
  }

  setRightShutter(x, touch, end) {
    const start = touch.coords.x;
    const normX = this.normX(x);
    const dist = Math.max(0, Math.min(1.41, this.rightShutter + 6 * (normX - start) / this.size));

    this.renderer.setRightShutter(dist);
    this.send('right-shutter', client.index, dist);

    if (end)
      this.rightShutter = dist;
  }

  resetTouch(id, x, y, mode, isTouch1) {
    switch (mode) {
      case 'move':
        this.setPosition(x, y, true);
        break;
      case 'resize':
        this.setSizeAndRotation(x, y, isTouch1, true);
        break;
      case 'shutter-incl':
        this.setShutterIncl(x, y, true);
        break;
      case 'left-shutter':
        this.setLeftShutter(x, this.touch1, true);
        break;
      case 'right-shutter':
        this.setRightShutter(x, this.touch1, true);
        break;
      case 'left-right-shutter':
        if (isTouch1 && this.touch1Shutter === 'left-shutter') {
          this.setLeftShutter(x, this.touch1, true);
        } else if (!isTouch1 && this.touch1Shutter === 'right-shutter') {
          this.setLeftShutter(x, this.touch2, true);
        } else if (isTouch1 && this.touch1Shutter === 'right-shutter') {
          this.setRightShutter(x, this.touch1, true);
        } else if (!isTouch1 && this.touch1Shutter === 'left-shutter') {
          this.setRightShutter(x, this.touch2, true);
        }
        break;
    }
  }

  onTouchStart(id, x, y) {
    const playingMode = this.renderer.playingMode;
    const coords = this.normCoords(x, y);

    if (playingMode !== 'off') {
      const shutterLineDistance = coords.x + coords.y * Math.tan(this.shutterIncl);
      let mode = this.renderer.interactionMode;

      if (this.touch1.id === null) {
        const dist = this.coords.distance(coords);

        if (playingMode === 'rehearsal' && dist < 0.1) {
          mode = 'move';
        } else if (playingMode === 'performance') {
          if (Math.abs(shutterLineDistance) < 0.07) {
            mode = 'shutter-incl';
          } else if (shutterLineDistance < 0) {
            mode = this.touch1Shutter = 'left-shutter';
          } else {
            mode = this.touch1Shutter = 'right-shutter';
          }
        }

        this.touch1.id = id;
        this.touch1.coords = coords;
        this.touch1Angle = Math.atan2(coords.y, coords.x);

        this.renderer.interactionMode = mode;
      } else if (this.touch2.id === null) {
        if (playingMode === 'rehearsal') {
          this.resetTouch(id, this.touchX, this.touchY, mode, true);
          mode = 'resize';
        } else if (playingMode === 'performance') {
          if ((mode === 'left-shutter' && shutterLineDistance >= 0) ||
            (mode === 'right-shutter' && shutterLineDistance < 0)) {
            mode = 'left-right-shutter';
          }
        }

        if (mode !== this.renderer.interactionMode) {
          this.touch2.id = id;
          this.touch2.coords = coords;
          this.touch2Dist = this.touch1.coords.distance(coords);
          this.touch2Angle = this.touch1.coords.angle(coords);

          this.renderer.interactionMode = mode;
        }
      }
    }

    this.touchX = x;
    this.touchY = y;
  }

  onTouchMove(id, x, y) {
    if (id === this.touch1.id || id === this.touch2.id) {
      const isTouch1 = (id === this.touch1.id);

      switch (this.renderer.interactionMode) {
        case 'move':
          this.setPosition(x, y, false);
          break;
        case 'resize':
          this.setSizeAndRotation(x, y, isTouch1, false);
          break;
        case 'shutter-incl':
          this.setShutterIncl(x, y, false);
          break;
        case 'left-shutter':
          this.setLeftShutter(x, this.touch1, false);
          break;
        case 'right-shutter':
          this.setRightShutter(x, this.touch1, false);
          break;
        case 'left-right-shutter':
          if (isTouch1 && this.touch1Shutter === 'left-shutter') {
            this.setLeftShutter(x, this.touch1, false);
          } else if (!isTouch1 && this.touch1Shutter === 'right-shutter') {
            this.setLeftShutter(x, this.touch2, false);
          } else if (isTouch1 && this.touch1Shutter === 'right-shutter') {
            this.setRightShutter(x, this.touch1, false);
          } else if (!isTouch1 && this.touch1Shutter === 'left-shutter') {
            this.setRightShutter(x, this.touch2, false);
          }
          break;
      }
    }

    this.touchX = x;
    this.touchY = y;
  }

  onTouchEnd(id, x, y) {
    if (id === this.touch1.id || id === this.touch2.id) {
      const isTouch1 = (id === this.touch1.id);
      let mode = this.renderer.interactionMode;

      this.resetTouch(id, x, y, mode, isTouch1);

      if (mode !== 'left-right-shutter') {
        this.touch1.id = null;
        this.touch2.id = null;
        mode = null;
      } else if (isTouch1) {
        const touch2 = this.touch1;
        touch2.id = null;

        this.touch1 = this.touch2;
        this.touch2 = touch2;

        if (this.touch1Shutter === 'left-shutter') {
          mode = this.touch1Shutter = 'right-shutter';
        } else {
          mode = this.touch1Shutter = 'left-shutter';
        }
      } else {
        this.touch2.id = null;

        if (this.touch1Shutter === 'left-shutter') {
          mode = 'left-shutter';
        } else {
          mode = 'right-shutter';
        }
      }

      this.renderer.interactionMode = mode;
    }
  }

  updatePlayingMode(value) {
    this.renderer.playingMode = value;
  }

  updateFormRatio(value) {
    this.renderer.formRatio = value;
  }
}

export default FormExperience;