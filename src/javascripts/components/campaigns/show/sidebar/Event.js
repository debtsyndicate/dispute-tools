import Widget from '../../../../lib/widget';
import ReadMore from '../../../../components/ReadMore';
import currentUser from '../../../../lib/currentUser';

/**
 * Reference that holds the csrf token for the server to accept our requests.
 * @type {string}
 * @const
 */
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

export default class Event extends Widget {
  template(data) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const date = new Date(data.date);

    return `
      <div>
        <div class="CampaignEvent">
          <div>
            <div class="CampaignEvent_date">
              <h4 class="-ff-sec">${date.getDate()}</h4>
              <p class="-fw-700 -ff-sec -ttu">${months[date.getMonth()]}</p>
            </div>
          </div>
          <div class="CampaignEvent_content">
            <h4>${data.name}</h4>
          </div>
        </div>

        <div class='pt2'>
          <div class='ReadMore' data-collapsed-height='60px'>
            <div id='inm-description'
              data-readmore-content
              aria-expanded='false'
              style='max-height: 60px;'>
              ${(function _printDescription() {
                return data.description.split(/\n/g).map(line => {
                  if (line.trim()) return `<p class="pb1 -caption -fw-500">${line}</p>`;
                  return '';
                }).join('');
              }())}
            </div>
            <div class='center'>
              <a class='-caption inline-block -fw-500' href='#'
                data-readmore-toggler
                aria-controls='inm-description'>Read more</a>
            </div>
          </div>
          <div class="CampaignEventMapWrapper mt2 mxn3">
            <iframe width="100%" height="100%" frameborder="0" allowfullscreen="" src="https://www.google.com/maps/embed/v1/place?key=${this.googleMapsKey}&amp;q=${encodeURIComponent(data.locationName)}"></iframe>
          </div>
          <div class="pt3 -caption -fw-500 mr1">
            <div class="flex pb2">
              <div>
                <svg class="mr1 -neutral-mid" width="12" height="12">
                  <use xlink:href="#svg-clock-filled"></use>
                </svg>
              </div>
              <p>${data.timespan}</p>
            </div>
            <div class="flex pb2">
              <div>
                <svg class="mr1 -neutral-mid" width="10" height="14">
                  <use xlink:href="#svg-pin"></use>
                </svg>
              </div>
              <p>${data.locationName}</p>
            </div>
          </div>
        </div>

        ${this._renderAttendees()}

        <div class="pt2">
          ${this._renderButtons()}
          <span class="-ttu -caption -fw-500">
            ${data.attendees.length}
            <span class="-neutral-mid pl1">attendees</span>
          </span>
        </div>
      </div>
    `;
  }

  _renderAttendees() {
    if (!this.data.attendees.length) {
      return '';
    }

    function _renderAttendee(attendee) {
      let _avatarUrl = '/images/profile/placeholder-small.png';
      if (attendee.user.account.image.urls.smallRedSquare) {
        _avatarUrl = attendee.user.account.image.urls.smallRedSquare;
      }

      return `
        <li class='mb1'>
          <a class='block'
            href='/users/${attendee.user.id}'
            title='${attendee.user.account.fullname}’s profile'>
            <img src='${_avatarUrl}'
              alt='${attendee.user.account.fullname}'
              width='50' height='50'/>
          </a>
        </li>
      `;
    }

    return `
        <div class='pt2'>
          <ul class='AvatarList'>
            ${this.data.attendees.map(attendee => _renderAttendee(attendee)).join('')}
          </ul>
        </div>
    `;
  }

  _renderButtons() {
    let buttons = '';

    if (!currentUser.get()) {
      return buttons;
    }

    if (this.data.imAttendee) {
      // Not going button
      buttons += `
        <form class='inline-block mr2' action="/campaigns/events/${this.data.id}/rsvp" method='post'>
          <input type='hidden' name='_method' value='delete'>
          <input type='hidden' name='_destroy' value=1>
          <input type='hidden' name='_csrf' value=${csrfToken}>
          <button class='-k-btn btn-dark -sm -fw-700' type='submit'>Not going</button>
        </form>
      `;
    } else {
      // Attend button
      buttons += `
        <form class="inline-block mr2" action="/campaigns/events/${this.data.id}/rsvp" method="post">
          <input type="hidden" name="_method" value="post">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          <button class="-k-btn btn-primary -sm -fw-700" type="submit">Attend</button>
        </form>
      `;
    }

    return buttons;
  }

  /**
   * @override
   */
  _render(el, beforeElement) {
    super._render(el, beforeElement);

    Array.prototype.slice.call(this.element.querySelectorAll('.ReadMore')).forEach((element, i) => {
      this.appendChild(new ReadMore({
        name: `ReadMore-${i}`,
        element,
      }));
    });
  }
}