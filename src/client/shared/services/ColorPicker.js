import { Service, serviceManager, SegmentedView, client } from 'soundworks/client';
import please from 'pleasejs';

const SERVICE_ID = 'service:color-picker';

function colorDistance(color1, color2) {
  const r = color1.r - color2.r;
  const g = color1.g - color2.g;
  const b = color1.b - color2.b;

  return Math.sqrt(r * r + g * g + b * b);
}

const template = `
  <div class="section-top flex-middle">
    <p class="small">Choose your color</p>
  </div>
  <div class="section-center flex-center">
    <div class="color-wrapper">
      <% for (var i = 0; i < numColors; i++) { %>
      <div class="circle color"></div>
      <% } %>
      <div class="circle color-change"></div>
    </div>
  </div>
  <div class="section-bottom"></div>
`;

class ColorPickerView extends SegmentedView {
  constructor(template, model, events, options) {
    super(template, model, events, options);

    this._updatePalette = this._updatePalette.bind(this);

    this.installEvents({
      'click .color-change': (e) => {
        e.target.classList.add('active');
        this._updatePalette();
      }
    });
  }

  onRender() {
    super.onRender();

    this.$colorWrapper = this.$el.querySelector('.color-wrapper');
    this.$circles = Array.from(this.$el.querySelectorAll('.circle'));
    this._updatePalette();
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    let size;
    const nbrX = 3;
    const nbrY = 4;

    // const bcr = this.$colorWrapper.getBoundingClientRect();
    // const width = bcr.width;
    // const height = bcr.height;

    size = Math.min(width / nbrX, height / nbrY);

    this.$circles.forEach(($circle) => {
      $circle.style.width = `${size}px`;
      $circle.style.height = `${size}px`;
    });
  }

  _updatePalette() {
    const $circles = this.$circles;
    const numColors = this.model.numColors;
    let hue = 360 * Math.random();
    const step = 360 / numColors;

    for (let i = 0; i < numColors; i++) {
      const $circle = $circles[i];
      const color = `hsl(${hue}, 100%, 50%)`;

      $circle.style.backgroundColor = color;
      $circle.setAttribute('data-color', color);

      hue = (hue + step) % 360;
    }
  }
}

class ColorPicker extends Service {
  constructor() {
    super(SERVICE_ID);

    this._onSelectColor = this._onSelectColor.bind(this);
  }

  start() {
    super.start();

    this.options.viewPriority = 7;

    this.view = new ColorPickerView(template, { numColors: 5 }, {
      'touchstart .color': this._onSelectColor,
      'mousedown .color': this._onSelectColor,
    }, {
      id: 'service-color-picker',
      ratios: {
        '.section-top': 0.12,
        '.section-center': 0.85,
        '.section-bottom': 0.03,
      },
    });

    this.show();
  }

  stop() {
    super.stop();

    this.hide();
  }

  _onSelectColor(e) {
    e.preventDefault();
    e.stopPropagation();

    client.color = e.target.getAttribute('data-color');
    this.ready();
  }
}

serviceManager.register(SERVICE_ID, ColorPicker);

export default ColorPicker;