class NavbarPosition {
  constructor() {
    this.queryParams = new URLSearchParams(window.location.search);

    this.contentContainer = null;
    this.contentContainerMutationObserver = null;
  }

  start() {
    let navbarPosition;

    if (this.queryParams.get('navbar_cache') !== null) {
      navbarPosition = this.queryParams.get('navbar');

      if (navbarPosition) {
        window.localStorage.setItem('navbar_position', navbarPosition);
      } else {
        window.localStorage.removeItem('navbar_position');
      }
    } else if (this.queryParams.get('navbar') !== null) {
      navbarPosition = this.queryParams.get('navbar');
    } else {
      navbarPosition = window.localStorage.getItem('navbar_position');
    }

    if (navbarPosition === 'bottom') {
      this.applyChangesAndReschedule();
    }
  }

  applyChangesAndReschedule() {
    try {
      this.applyNavbarPositionChanges();
      this.applyPaddingChanges();
    } catch (e) {
      console.error('ERROR while applying navbar changes:', e);
    } finally {
      setTimeout(() => this.applyChangesAndReschedule(), 1000);
    }
  }

  get huiRootElement() {
    return document
      .querySelector("home-assistant")?.shadowRoot
      ?.querySelector("home-assistant-main")?.shadowRoot
      ?.querySelector("ha-panel-lovelace")?.shadowRoot
      ?.querySelector("hui-root")?.shadowRoot;
  }

  applyNavbarPositionChanges() {
    let appHeader = this.huiRootElement?.querySelector("app-header");

    if (appHeader && (appHeader.style.top !== 'auto' || appHeader.style.bottom !== '0px')) {
      appHeader.style.setProperty('top', 'auto', 'important');
      appHeader.style.setProperty('bottom', '0px', 'important');
    }
  }

  applyPaddingChanges() {
    let contentContainer = this.huiRootElement?.querySelector("#layout")?.shadowRoot?.querySelector("#contentContainer");

    if (contentContainer !== this.contentContainer) {
      if (this.contentContainerMutationObserver) {
        this.contentContainerMutationObserver.disconnect();
        this.contentContainerMutationObserver = null;
      }

      this.contentContainer = contentContainer;

      if (contentContainer) {
        contentContainer.style.setProperty('padding-top', '0px');
        contentContainer.style.setProperty('padding-bottom', '56px');

        this.contentContainerMutationObserver = new MutationObserver(() => {
          if (contentContainer.style.paddingTop != '0px' || contentContainer.style.paddingBottom != '56px') {
            contentContainer.style.paddingTop = '0px';
            contentContainer.style.paddingBottom = '56px';
          }
        }).observe(contentContainer, {
          attributes: true,
          attributeFilter: ['style']
        });
      }
    }
  }
}

window.navbarPosition = new NavbarPosition();
window.navbarPosition.start();

// This is the quickest, hackiest thing I could throw together to allow the
// navbar to be moved on devices that don't readily allow inputting a custom
// URL (like the HA mobile apps). It really ought to be redone to actually
// look halfway decent.
class NavbarPositionConfigurationCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            <button onclick="if (localStorage.getItem('navbar_position') === 'bottom') { localStorage.removeItem('navbar_position'); } else { localStorage.setItem('navbar_position', 'bottom'); } window.location.reload();">Toggle navigation bar position</button>
          </div>
        </ha-card>
      `;
    }
  }

  setConfig(config) {
  }
}

customElements.define('navbar-position-configuration-card', NavbarPositionConfigurationCard);
window.customCards.push({
  type: 'navbar-position-configuration-card',
  name: 'Navbar Position Configuration Card',
  description: 'A simple card that allows toggling where the dashboard navigation bar is shown'
});
