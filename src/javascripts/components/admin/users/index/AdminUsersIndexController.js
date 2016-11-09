import Widget from '../../../../lib/widget';
import { serialize } from '../../../../lib/AdminUtils';
import AdminUsersIndexTableControls from './AdminUsersIndexTableControls';

export default class AdminUsersIndexController extends Widget {
  constructor(config) {
    super(config);

    this.appendChild(new AdminUsersIndexTableControls({
      name: 'AdminUsersIndexTableControls',
      element: document.querySelector('thead'),
    }));

    this.originalQuery = {
      filters: {
        role: this.AdminUsersIndexTableControls.roleSelect.value,
      },
      search: this.AdminUsersIndexTableControls.searchInput.value,
      state: this.AdminUsersIndexTableControls.stateSelect.value,
      order: this.AdminUsersIndexTableControls.orderSelect.value,
    };

    this._query = JSON.parse(JSON.stringify(this.originalQuery));

    this.pagination = document.querySelector('.Pagination ul');

    this._bindEvents();
  }

  _bindEvents() {
    this.AdminUsersIndexTableControls.bind('searchInput', data => {
      this._query.search = data.value;
      this._updateApplyButton();
    });

    this.AdminUsersIndexTableControls.bind('stateChange', data => {
      this._query.state = data.value;
      this._updateApplyButton();
    });

    this.AdminUsersIndexTableControls.bind('roleChange', data => {
      this._query.filters.role = data.value;
      this._updateApplyButton();
    });

    this.AdminUsersIndexTableControls.bind('orderChange', data => {
      this._query.order = data.value;
      this._updateApplyButton();
    });

    this.AdminUsersIndexTableControls.bind('applyFilters', () => {
      const search = serialize(this._query);
      window.location.replace(`?${search}`);
    });

    this.AdminUsersIndexTableControls.bind('resetFilters', () => {
      window.location.replace('?page=1');
    });

    this._paginationClickHandlerRef = this._paginationClickHandler.bind(this);
    this.pagination.addEventListener('click', this._paginationClickHandlerRef);
  }

  _updateApplyButton() {
    if (
      (this._query.filters.role !== this.originalQuery.filters.role) ||
      (this._query.search !== this.originalQuery.search) ||
      (this._query.state !== this.originalQuery.state) ||
      (this._query.order !== this.originalQuery.order)
    ) {
      return this.AdminUsersIndexTableControls.enableApplyButton();
    }

    return this.AdminUsersIndexTableControls.disableApplyButton();
  }

  _paginationClickHandler(ev) {
    const target = ev.target;
    ev.stopPropagation();

    if (target.tagName === 'BUTTON') {
      const search = serialize(this.originalQuery);
      window.location.replace(`?page=${target.dataset.page}&${search}`);
    }
  }
}