import Checkit from 'checkit';
import Widget from '../../../../lib/widget';
import Button from '../../../../components/Button';

export default class AdminUsersEditForm extends Widget {
  static get constraints() {
    return {
      role: ['required'],
      fullname: ['required'],
      email: ['required', 'email'],
      state: ['required'],
      zip: ['required', {
        rule(val) {
          if (/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(val) === false) {
            throw new Error('The zip code is invalid.');
          }
        },
      }],
      'twitter-url': [{
        rule: 'url',
        message: 'The twitter address is not valid',
      }],
      'facebook-url': [{
        rule: 'url',
        message: 'The facebook address is not valid',
      }],
      'website-url': [{
        rule: 'url',
        message: 'The website address is not valid',
      }],
    };
  }

  constructor(config) {
    super(config);

    this.fileInput = this.element.querySelector('[type="file"]');
    this.image = this.element.querySelector('.EditProfile__image-wrapper');
    this.roleSelect = this.element.querySelector('[name="role"]');
    this.collectiveManagerWrapper = this.element.querySelector('[data-collective-manager]');
    this.socialLinks = this.element.querySelector('[name="socialLinks"]');

    this.ui = {};
    Object.keys(this.constructor.constraints).forEach(key => {
      const query = `[name="${key}"]`;
      this.ui[key] = this.element.querySelector(query);
    });
    this._checkit = new Checkit(this.constructor.constraints);

    this.appendChild(new Button({
      name: 'Button',
      element: this.element.querySelector('button[type="submit"]'),
    }));

    this._bindEvents();
  }

  _bindEvents() {
    this._handleFormSubmitRef = this._handleFormSubmit.bind(this);
    this.element.addEventListener('submit', this._handleFormSubmitRef);

    this._handleFileChangeRef = this._handleFileChange.bind(this);
    this.fileInput.addEventListener('change', this._handleFileChangeRef);

    this._handleRoleChangeRef = this._handleRoleChange.bind(this);
    this.roleSelect.addEventListener('change', this._handleRoleChangeRef);
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

    this._updateSocialLinksValue();
    this.Button.updateText();

    return null;
  }

  _handleFileChange(ev) {
    const input = ev.currentTarget;

    if (input.files && input.files[0] && input.files[0].type.match('image.*')) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.image.style.backgroundImage = `url(${e.target.result})`;
        reader.onload = null;
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  _handleRoleChange(ev) {
    if (ev.target.value === 'CollectiveManager') {
      this.collectiveManagerWrapper.classList.remove('hide');
    } else {
      this.collectiveManagerWrapper.classList.add('hide');
    }
  }

  _updateSocialLinksValue() {
    const result = {};
    const twitter = this.ui['twitter-url'].value;
    const facebook = this.ui['facebook-url'].value;
    const website = this.ui['website-url'].value;

    if (twitter) result.twitter = twitter;
    if (facebook) result.facebook = facebook;
    if (website) result.website = website;

    if (Object.keys(result).length) {
      this.socialLinks.value = JSON.stringify(result);
    }
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
  }

  _clearFieldErrors() {
    Object.keys(this.constructor.constraints).forEach(key => {
      this.ui[key].parentNode.classList.remove('error');
    });
  }

  _getFieldsData() {
    const data = {};
    Object.keys(this.constructor.constraints).forEach(key => {
      data[key] = this.ui[key].value;
    });
    return data;
  }
}