import { Service, serviceManager, SegmentedView, client } from 'soundworks/client';
import please from 'pleasejs';

const SERVICE_ID = 'service:form-picker';

const formNames = ['circle', 'square', 'triangle', 'rightangle', 'cross'];

const template = `
  <div class="section-top flex-middle">
    <p class="small">Choose your form</p>
  </div>
  <div class="section-center flex-center">
    <div class="form-wrapper">
      <% for (var i = 0; i < numForms; i++) { %>
      <div class="form"></div>
      <% } %>
    </div>
  </div>
  <div class="section-bottom"></div>
`;

class FormPickerView extends SegmentedView {
  constructor(template, model, events, options) {
    super(template, model, events, options);
  }

  onRender() {
    super.onRender();

    this.$formWrapper = this.$el.querySelector('.form-wrapper');
    this.$forms = Array.from(this.$el.querySelectorAll('.form'));

    const $forms = this.$forms;

    for (let i = 0; i < formNames.length; i++) {
      const $form = $forms[i];
      const name = formNames[i];

      $form.innerHTML = name;
      $form.setAttribute('data-form', name);
    }
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    const numX = 2;
    const numY = 3;
    const size = Math.min((width - 20) / numX, (height - 20) / numY);

    this.$forms.forEach(($form) => {
      $form.style.width = `${size}px`;
      $form.style.height = `${size}px`;
    });
  }
}

class FormPicker extends Service {
  constructor() {
    super(SERVICE_ID);

    this._onSelectForm = this._onSelectForm.bind(this);
  }

  start() {
    super.start();

    this.options.viewPriority = 7;

    this.view = new FormPickerView(template, { numForms: formNames.length }, {
      'touchstart .form': this._onSelectForm,
      'mousedown .form': this._onSelectForm,
    }, {
      id: 'service-form-picker',
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

  _onSelectForm(e) {
    e.preventDefault();
    e.stopPropagation();

    client.form = e.target.getAttribute('data-form');
    this.ready();
  }
}

serviceManager.register(SERVICE_ID, FormPicker);

export default FormPicker;