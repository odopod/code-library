// Type definitions for OdoDialog
// Project: odopod-code-library
// Definitions by: Glen Cheney <https://github.com/Vestride>

export as namespace OdoDialog;

export = OdoDialog;

declare class OdoDialog {
  /**
   * Create a new dialog.
   * @param {Element} element Main element which represents this class.
   * @param {OdoDialog.Options} [opts] Instance options.
   * @throws {TypeError} Throws when the element is not of type Element.
   */
  constructor(element: Element, opts?: OdoDialog.Options);

  /** Main element for this class */
  element: Element;

  options: OdoDialog.Options;

  /**
   * Id attribute from the main element.
   * @type {string}
   */
  id: string;

  /**
   * Dialog backdrop element.
   * @protected
   * @type {Element}
   */
  protected backdrop: Element;

  /**
   * Dialog content (role=document)
   * @protected
   * @type {Element}
   */
  protected content: Element;

  /**
   * Whether the dialog is open.
   * @type {boolean}
   */
  isOpen: boolean;

  /**
   * z-index of the main dialog element. This only changes when multiple dialogs
   * are open at the same time.
   */
  z: number;

  /**
   * Whether the dialog is currently animating.
   * @protected
   * @type {boolean}
   */
  protected isAnimating: boolean;

  /*~
   *~ From tiny emitter
   *~ https://github.com/scottcorgan/tiny-emitter/blob/master/index.d.ts
   */
  on   (event: string, callback: Function, ctx?: any): OdoDialog;
  once (event: string, callback: Function, ctx?: any): OdoDialog;
  emit (event: string, ...args: any[]): OdoDialog;
  off  (event: string, callback?: Function): OdoDialog;

  /**
   * Find descendent element by class.
   * @param {string} name Name of the class to find.
   * @return {Element} The element or undefined.
   */
  getByClass(name: string): Element | undefined;

  /**
   * Click handler on the main element. When the dialog is dismissable and the
   * user clicked outside the content (i.e. the backdrop), close it.
   * @param {Event} evt Event object.
   * @protected
   */
  protected onClick(evt: MouseEvent): void;

  /**
   * Keypress event handler
   * @param {Event} evt Event object
   * @protected
   */
  protected onKeyPress(evt: KeyboardEvent): void;

  /**
   * The dialog has a height of 100vh, which, in mobile safari, is incorrect
   * when the toolbars are visible, not allowing the user to scroll the full
   * height of the content within it.
   * The viewportHeight parameter is optional so that it can be read in the open()
   * method with all the other DOM reads. This avoids read->write->read #perfmatters.
   * @param {number} [viewportHeight=window.innerHeight] Height of the viewport.
   * @protected
   */
  protected onResize(viewportHeight?: number): void;

  /**
   * Checks to see if a dialog is already open or animating If not, opens dialog.
   * @param {boolean} [sync=false] Whether to open with transitions or not.
   */
  open(sync?: false): void;

  /**
   * Hides dialog
   * @param {boolean} [sync=false] Whether to close with transitions or not.
   */
  close(sync?: false): void;

  /**
   * Modify dialog z-indices and more because there are about to be multiple
   * dialogs open at the same time.
   */
  protected handleOtherOpenDialogs(): void;

  /**
   * Dialog went into the background and has another dialog open above it.
   */
  protected didEnterBackground(): void;

  /**
   * Dialog came back into the foreground after being in the background.
   */
  protected didEnterForeground(): void;

  /**
   * Close the dialog, remove event listeners and element references.
   */
  dispose(): void;
}

declare namespace OdoDialog {
  export interface Options {
    dismissable?: boolean;
    scrollableElement?: string;
  }

  /**
   * Instantiates all instances of dialogs with the same settings
   * @param {OdoDialog.Options} [options] Object of all dialog options. Is optional.
   * @return {OdoDialog[]}
   */
  function initializeAll(options?: OdoDialog.Options): OdoDialog[];

  /**
   * Clear all references to dialogs so there are no duplicates.
   */
  function disposeAll(): void;

  /**
   * Retrieve a dialog instance by its id.
   * @param {string} id Id of the dialog.
   * @return {OdoDialog} The dialog or undefined if there is no dialog with the given id.
   */
  function getDialogById(id: string): OdoDialog | undefined;

  /**
   * Count how many dialogs are currently open.
   * @return {number}
   */
  function getOpenDialogCount(): number;

  /**
   * Find the z index of the top-most dialog instance.
   * @return {number}
   */
  function getTopLayer(): number;

  /**
   * Array of dialog instances.
   * @type {OdoDialog[]}
   */
  const Instances: OdoDialog[];

  /**
   * HTML class names for elements of the dialog.
   */
  const Classes: {
    [key: string]: string;
  };

  /**
   * Events emitted by dialog instances.
   */
  const EventType: {
    OPENED: string,
    CLOSED: string,
    TRIGGER_CLICKED: string,
  };

  const Keys: {
    ESC: number,
    TAB: number,
  };

  /**
   * Default options for each instance.
   */
  const Defaults: OdoDialog.Options;

  /**
   * Whether auto margins work for flex children in the current browser.
   */
  const SUPPORTS_AUTO_MARGINS: boolean;

  /**
   * Width of the scrollbar.
   */
  const SCROLLBAR_WIDTH: number;
}
