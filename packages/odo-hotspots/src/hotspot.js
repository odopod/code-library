import settings from './settings';
import setUniqueId from './unique-id';

class Hotspot {
  /**
   * The hotspot class represents a single hotspot.
   * @param {Element} element Main wrapper element for the hotspot.
   * @param {Hotspots} parent A reference to the parent class.
   * @constructor
   */
  constructor(element, parent) {
    this.parent = parent;
    this.isOpen = false;
    this.wrapper = element;
    this.button = element.querySelector('.' + settings.ClassName.BUTTON);
    this.content = element.querySelector('.' + settings.ClassName.CONTENT);
    this.percentPosition = this.parseWrapperPosition();
    this.size = this.getContentSize();
    this.side = this.getSide();
    this.anchor = this.getAnchor();
    this.position = this.getWrapperPosition();
  }

  /**
   * Converts the data-position="x,y" attribute to an object with x and y properties.
   * @return {{x: number, y: number}}
   */
  parseWrapperPosition() {
    const positions = this.wrapper.getAttribute('data-position').split(',');
    return {
      x: parseFloat(positions[0]),
      y: parseFloat(positions[1]),
    };
  }

  /**
   * Returns the width and height of the content element.
   * @return {{width: number, height: number}}
   */
  getContentSize() {
    return {
      width: this.content.offsetWidth,
      height: this.content.offsetHeight,
    };
  }

  /**
   * Returns the class name of the side the hotspot should go to. If it doesn't
   * have a side, a side will be calculated for it.
   * @return {?string}
   */
  getSide() {
    if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_LEFT)) {
      return settings.ClassName.HOTSPOT_LEFT;
    } else if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_RIGHT)) {
      return settings.ClassName.HOTSPOT_RIGHT;
    }
    return null;
  }

  /**
   * Returns the class name of the anchor the hotspot should go to. If it doesn't
   * have a anchor, a anchor will be calculated for it.
   * @return {?string}
   */
  getAnchor() {
    if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_TOP)) {
      return settings.ClassName.HOTSPOT_TOP;
    } else if (this.wrapper.classList.contains(settings.ClassName.HOTSPOT_BOTTOM)) {
      return settings.ClassName.HOTSPOT_BOTTOM;
    }
    return null;
  }

  /**
   * Updates the position and size of the hotspot.
   */
  refresh() {
    // Read
    this.percentPosition = this.parseWrapperPosition();
    this.size = this.getContentSize();
    this.position = this.getWrapperPosition();

    // Write async so that multiple hotspots can be refreshed at a time without
    // causing layout thrashing.
    this.refreshId = requestAnimationFrame(() => {
      this._removeContentPosition();
      this.setPosition();
    });
  }

  /**
   * Applies the data-position attribute to the wrapper.
   */
  _setWrapperPosition() {
    this.wrapper.style.left = this.percentPosition.x + '%';
    this.wrapper.style.top = this.percentPosition.y + '%';
  }

  /**
   * Returns a rectangle describing the wrapper (not the content).
   * @return {Object}
   */
  getWrapperPosition() {
    const left = Math.round(this.parent.size.width * this.percentPosition.x / 100);
    const top = Math.round(this.parent.size.height * this.percentPosition.y / 100);
    const width = Math.round(this.wrapper.offsetWidth);
    const height = Math.round(this.wrapper.offsetHeight);
    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
    };
  }

  /**
   * Determines the side which the hotspot should go to based on the container's
   * width and the width of the hotspot content.
   * @return {string}
   */
  _getOptimalSide() {
    let side = null;

    const fitsRight = this.position.right + this.size.width <= this.parent.size.width;
    const fitsLeft = this.position.left - this.size.width >= 0;

    // If both or neither fit, choose the side which has more room.
    if ((fitsLeft && fitsRight) || (!fitsLeft && !fitsRight)) {
      if (this.percentPosition.x < 50) {
        side = settings.ClassName.HOTSPOT_RIGHT;
      } else {
        side = settings.ClassName.HOTSPOT_LEFT;
      }

    // If only on side fits, then it has to be chosen.
    } else if (fitsRight) {
      side = settings.ClassName.HOTSPOT_RIGHT;
    } else /* fitsLeft */ {
      side = settings.ClassName.HOTSPOT_LEFT;
    }

    return side;
  }

  /**
   * Determines the anchor which the hotspot should go to based on the container's
   * height and the height of the hotspot content.
   * @return {string}
   */
  _getOptimalAnchor() {
    let anchor = null;

    const fitsTop = this.position.bottom - this.size.height >= 0;
    const fitsBottom = this.position.top + this.size.height <= this.parent.size.height;

    // If both or neither fit, choose the anchor which has more room.
    if ((fitsBottom && fitsTop) || (!fitsBottom && !fitsTop)) {
      if (this.percentPosition.y > 50) {
        anchor = settings.ClassName.HOTSPOT_TOP;
      } else {
        anchor = settings.ClassName.HOTSPOT_BOTTOM;
      }

    // If only on anchor fits, then it has to be chosen.
    } else if (fitsTop) {
      anchor = settings.ClassName.HOTSPOT_TOP;
    } else /* fitsBottom */ {
      anchor = settings.ClassName.HOTSPOT_BOTTOM;
    }

    return anchor;
  }

  /**
   * If the hotspot does not have a side or anchor, they will be set for it.
   */
  _setContentPosition() {
    if (this.side === null) {
      this.wrapper.classList.add(this._getOptimalSide());
    }

    if (this.anchor === null) {
      this.wrapper.classList.add(this._getOptimalAnchor());
    }
  }

  /**
   * If the hotspot did not have a side or anchor originally, they will be removed.
   */
  _removeContentPosition() {
    if (this.side === null) {
      this.wrapper.classList.remove(
        settings.ClassName.HOTSPOT_LEFT,
        settings.ClassName.HOTSPOT_RIGHT,
      );
    }

    if (this.anchor === null) {
      this.wrapper.classList.remove(
        settings.ClassName.HOTSPOT_TOP,
        settings.ClassName.HOTSPOT_BOTTOM,
      );
    }
  }

  /**
   * Positions the wrapper and the content.
   */
  setPosition() {
    this._setWrapperPosition();
    this._setContentPosition();
  }

  /**
   * Show the hotspot.
   */
  show() {
    this.wrapper.classList.add(settings.ClassName.OPEN);
    this.content.setAttribute('aria-hidden', false);
    this.button.setAttribute('aria-describedby', this.content.id);
    this.isOpen = true;
  }

  /**
   * Hide the hotspot.
   */
  hide() {
    this.wrapper.classList.remove(settings.ClassName.OPEN);
    this.content.setAttribute('aria-hidden', true);
    this.button.removeAttribute('aria-describedby');
    this.isOpen = false;
  }

  /**
   * Set accessibility attributes so that the implementor doesn't have to worry
   * about it.
   */
  setA11yAttributes() {
    setUniqueId(this.content);
    this.content.setAttribute('aria-hidden', true);
    this.content.setAttribute('role', 'tooltip');
  }

  _removeA11yAttributes() {
    this.button.removeAttribute('aria-hidden');
    this.content.removeAttribute('role');
  }

  /**
   * Destroys the hotspot instance. It removes DOM references, classes, and styles
   * set by this class.
   */
  dispose() {
    cancelAnimationFrame(this.refreshId);
    this._removeContentPosition();
    this._removeA11yAttributes();
    this.wrapper.style.left = '';
    this.wrapper.style.top = '';
    this.wrapper = null;
    this.button = null;
    this.content = null;
    this.parent = null;
  }
}

export default Hotspot;
