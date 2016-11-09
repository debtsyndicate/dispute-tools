/* eslint-disable no-console */
import Checkit from 'checkit';
import Pisces from 'pisces';
import Widget from '../../lib/widget';
import Button from '../../components/Button';
import ConfirmInline from '../../components/ConfirmInline';

export default class DisputesInformationForm extends Widget {
  constructor(config) {
    super(config);

    this.appendChild(new Button({
      name: 'Button',
      element: this.element.querySelector('button'),
    }));

    const _this = this;
    const data = this.dispute.disputeTool.data.options[this.dispute.data.option];
    const formData = data.steps.filter(step => {
      return step.type === 'form';
    })[0];

    this.constraints = {};
    this._constraintsAll = {};

    function test(fs) {
      fs.fields.forEach(r => {
        r.forEach(f => {
          if (f.type === 'group') {
            return test(f);
          }

          if (!f.validations) {
            console.warn('skipped', f.name, f.validations);
            return undefined;
          }

          _this.constraints[f.name] = f.validations;
          _this._constraintsAll[f.name] = f.validations;
          return undefined;
        });
      });
    }

    formData.fieldSets.forEach(test);

    this.ui = {};
    Object.keys(this.constraints).forEach(key => {
      const query = `[name="fieldValues[${key}]"]`;
      this.ui[key] = this.element.querySelector(query);
    });
    this._checkit = new Checkit(this.constraints);

    this.form = this.element.querySelector('form');
    this._handleFormSubmitRef = this._handleFormSubmit.bind(this);
    this.form.addEventListener('submit', this._handleFormSubmitRef);

    this.togglers = [].slice.call(
      document.querySelectorAll('[data-toggle-radio]')
    );
    this._handleContentToggleRef = this._handleContentToggle.bind(this);
    this.togglers.forEach(t => {
      t.addEventListener('change', this._handleContentToggleRef);
      if (t.value === 'no' && t.checked) {
        t.checked = false;
        t.click();
      }
    });

    this.toogleRadios = [].slice.call(
      document.querySelectorAll('[data-partial-toggle-radio]')
    );
    this._toogleRadiosRefs = {};
    this._handlePartialTogglerRef = this._handlePartialToggler.bind(this);
    this.toogleRadios.forEach(t => {
      t.addEventListener('change', this._handlePartialTogglerRef);
      if (t.checked) {
        this._initHiddenElements.call(this, t);
        if (t.value !== t.dataset.default) {
          t.checked = false;
          t.click();
        }
      }
    });

    this.handleAlertRadios = [].slice.call(document.querySelectorAll('[data-alert]'));
    if (this.handleAlertRadios.length) {
      this._handleAlertRadioChangeRef = this._handleAlertRadioChange.bind(this);
      this.handleAlertRadios.forEach(t => {
        t.addEventListener('change', this._handleAlertRadioChangeRef);
      });
    }

    this.pisces = new Pisces(this.element.parentElement);
  }

  /**
   * Handle the `alert` radio change event.
   * If the value matches with the option that should display the `alert` it
   * creates a new ConfirmInline widget instance and subscribe to its customEvents.
   * @private
   * @listens @module:ConfirmInline~event:onCancel
   * @listens @module:ConfirmInline~event:onOk
   * @return undefined
   */
  _handleAlertRadioChange(ev) {
    const target = ev.target;
    const parentElement = target.parentElement;
    const data = JSON.parse(target.dataset.alert);
    const matched = data[target.value];

    if (!matched) {
      return;
    }

    const opossiteAction = (target.value === 'yes') ? 'no' : 'yes';

    this.appendChild(new ConfirmInline({
      name: 'ConfirmInline',
      className: '-warning mt2',
      data: {
        text: `▲ ${matched.message}`,
        cancelButtonText: `Select ${opossiteAction}`,
        okButtonText: 'Exit form',
      },
    }));

    this.ConfirmInline.bind('onCancel', () => {
      parentElement.querySelector(`[name="${ev.target.name}"][value="${opossiteAction}"]`).click();
    });

    this.ConfirmInline.bind('onOk', () => {
      this.dispatch('deleteDispute');
    });

    this.ConfirmInline.render(parentElement).activate();
  }

  _handleContentToggle(ev) {
    const target = ev.currentTarget;
    const fieldset = target.parentElement.querySelector('fieldset');

    if (fieldset) {
      const whitelist = 'input, select, textarea';
      const names = [].slice.call(fieldset.querySelectorAll(whitelist)).map(i => {
        return i.dataset.name;
      });

      if (target.value === 'no') {
        names.forEach(name => {
          const el = this.ui[name];

          if (el) {
            el.disabled = true;
          }

          if (this.constraints[name]) {
            delete this.constraints[name];
          }
        });
      } else {
        names.forEach(name => {
          const el = this.ui[name];
          const vals = this._constraintsAll[name];

          if (el) el.disabled = false;
          if (vals) this.constraints[name] = vals;
        });
      }

      this._checkit = new Checkit(this.constraints);
    }
  }

  _initHiddenElements(element) {
    const names = JSON.parse(element.dataset.partialToggleRadio);

    names.forEach(name => {
      const el = this.ui[name];
      let parent = el.parentElement;

      if (parent.classList.contains('col') === false) {
        parent = parent.parentElement;
      }

      if (el.dataset.hidden === 'true') {
        el.disabled = true;
        parent.classList.add('hide');

        if (this.constraints[name]) {
          delete this.constraints[name];
        }
      }

      this._toogleRadiosRefs[name] = {
        el,
        parent,
      };
    });

    this._checkit = new Checkit(this.constraints);
  }

  _handlePartialToggler(ev) {
    const target = ev.currentTarget;
    const names = JSON.parse(target.dataset.partialToggleRadio);

    names.forEach(name => {
      const ref = this._toogleRadiosRefs[name];

      if (ref.el.dataset.hidden === 'true') {
        const vals = this._constraintsAll[name];
        if (vals) {
          this.constraints[name] = vals;
        }

        ref.el.dataset.hidden = 'false';
        ref.parent.classList.remove('hide');
        ref.el.disabled = false;

        return;
      }

      ref.el.dataset.hidden = 'true';
      ref.el.disabled = true;
      ref.parent.classList.add('hide');

      if (this.constraints[name]) {
        delete this.constraints[name];
      }

      return;
    });

    this._checkit = new Checkit(this.constraints);
  }

  _handleFormSubmit(ev) {
    this.Button.disable();
    this._clearFieldErrors();

    const [err] = this._checkit.validateSync(this._getFieldsData());

    if (err) {
      ev.preventDefault();
      this.Button.enable();
      return this._displayFieldErrors(err.errors);
    }

    this.Button.updateText();

    return undefined;
  }

  _displayFieldErrors(errors) {
    Object.keys(errors).forEach(key => {
      const parent = this.ui[key].parentNode;
      let errorLabel = parent.querySelector('.-on-error');

      parent.classList.add('error');

      if (errorLabel) {
        errorLabel.innerText = `▲ ${errors[key].message}`;
        return;
      }

      errorLabel = parent.nextSibling;
      if (errorLabel && errorLabel.classList.contains('-on-error')) {
        errorLabel.innerText = `▲ ${errors[key].message}`;
      }
    });

    const firstErrorKey = Object.keys(errors)[0];

    if (firstErrorKey) {
      const element = this.ui[firstErrorKey];
      const parent = element.parentElement;
      let y = parent.getBoundingClientRect().top;

      y = (y >= 0) ? `+${y}` : y.toString();

      this.pisces.scrollToPosition({ y }, {
        onComplete: () => {
          element.focus();
        },
      });
    }
  }

  _clearFieldErrors() {
    Object.keys(this.constraints).forEach(key => {
      this.ui[key].parentNode.classList.remove('error');
    });
  }

  _getFieldsData() {
    const data = {};
    let val;

    Object.keys(this.constraints).forEach(key => {
      if (this.ui[key].type === 'radio') {
        val = document.querySelector(`[name="${this.ui[key].name}"]:checked`);
      } else {
        val = this.ui[key].value;
      }

      data[key] = val;
    });

    return data;
  }
}