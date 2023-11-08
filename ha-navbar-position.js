class NavbarPosition {
  get huiRootElement() {
    return document
      .querySelector("home-assistant")?.shadowRoot
      ?.querySelector("home-assistant-main")?.shadowRoot
      ?.querySelector("ha-panel-lovelace")?.shadowRoot
      ?.querySelector("hui-root")?.shadowRoot;
  }

  constructor() {
    this.queryParams = new URLSearchParams(window.location.search);
  }

  init() {
    let navbarPosition = fetchNavbarFromCache();

    if (navbarPosition === 'bottom') {
      this.applyChangesAndReschedule();
    }
  }

  fetchNavbarFromCache() {
    if (this.queryParams.get('navbar_cache')) {
      let navbarPosition = this.queryParams.get('navbar');

      if (!navbarPosition) {
        window.localStorage.removeItem('navbar_position');
        return;
      }
      window.localStorage.setItem('navbar_position', navbarPosition);
      return navbarPosition;
    }

    return this.queryParams.get('navbar') ?? window.localStorage.getItem('navbar_position');
  }

  applyChangesAndReschedule() {
    try {
      this.applyNavbarPositionChanges();
      this.applyPaddingChanges();
    } catch (e) {
      console.error('ERROR while applying navbar changes:', e);
    } finally {
      console.log('Finally');
      setTimeout(() => this.applyChangesAndReschedule(), 1000);
    }
  }

  applyNavbarPositionChanges() {
    let appHeader = this.huiRootElement?.querySelector(".header");

    if (appHeader && (appHeader.style.top !== 'auto' || appHeader.style.bottom !== '0px')) {
      appHeader.style.setProperty('top', 'auto', 'important');
      appHeader.style.setProperty('bottom', '0px', 'important');
    }
  }

  applyPaddingChanges() {
    let contentContainer = this.huiRootElement?.querySelector("#view");
    if (!contentContainer) {
      return;
    }

    const topPadding = 'env(safe-area-inset-top)';
    const bottomPadding = 'calc(var(--header-height) + env(safe-area-inset-bottom))';

    if (contentContainer.style.top !== topPadding || contentContainer.style.paddingBottom !== bottomPadding) {
      contentContainer.style.setProperty('padding-top', 'env(safe-area-inset-top)');
      contentContainer.style.setProperty('padding-bottom', 'calc(var(--header-height) + env(safe-area-inset-bottom))');
    }
  }
}

window.navbarPosition = new NavbarPosition();
window.navbarPosition.init();

// This is the quickest, hackiest thing I could throw together to allow the
// navbar to be moved on devices that don't readily allow inputting a custom
// URL (like the HA mobile apps). It really ought to be redone to actually
// look halfway decent.
class NavbarPositionConfigurationCard extends HTMLElement {
  set hass(_hass) {
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
}

customElements.define('navbar-position-configuration-card', NavbarPositionConfigurationCard);
window.customCards.push({
  type: 'navbar-position-configuration-card',
  name: 'Navbar Position Configuration Card',
  description: 'A simple card that allows toggling where the dashboard navigation bar is shown'
});
