import Widget from '../lib/widget';
import { APP } from '../lib/constants';

export default class Dropdown extends Widget {
  static _createBackdrop() {
    Dropdown.backdrop = document.createElement('div');
    Dropdown.backdrop.className = 'Dropdown__backdrop';
    Dropdown.backdrop.addEventListener('click', Dropdown._handleBackdropClick);
  }

  static _handleBackdropClick() {
    Dropdown._activeDropdown.deactivate();
  }

  constructor(config) {
    super(config);

    if (!Dropdown.backdrop) Dropdown._createBackdrop();

    this.element.classList.remove('-has-dropdown');
    this.headElement = this.element.querySelector('.Dropdown__head');
    this.bodyElement = this.element.querySelector('.Dropdown__body');

    this.headElement.addEventListener('click', this._handleClick.bind(this));
  }

  _handleClick() {
    if (this.active) return this.deactivate();
    return this.activate();
  }

  activate() {
    this.active = true;
    APP.SCROLLING_BOX.style.overflow = 'hidden';
    this.element.appendChild(Dropdown.backdrop);
    this.bodyElement.setAttribute('aria-hidden', !this.active);
    Dropdown._activeDropdown = this;

    requestAnimationFrame(() => {
      Dropdown.backdrop.classList.add('active');
    });

    return null;
  }

  deactivate() {
    this.active = false;
    APP.SCROLLING_BOX.style.overflow = 'auto';
    this.bodyElement.setAttribute('aria-hidden', !this.active);
    this.element.removeChild(Dropdown.backdrop);
    Dropdown.backdrop.classList.remove('active');
    Dropdown._activeDropdown = null;
    return null;
  }
}

Dropdown.backdrop = null;
Dropdown._activeDropdown = null;