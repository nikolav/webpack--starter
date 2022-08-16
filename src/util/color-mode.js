import q from "nikolav-q";

const { add: classAdd, rm: classRemove } = q.class;
const { noop } = q.func;

const CLASS_DARK = "dark";
//
const EVENT_COLOR_MODE_CHANGE = "ezxzkvrlfkb";
const LOCAL_COLOR_MODE = "ftsjxyvauwz";
const MODE_DARK = "ddupvfuchad";

export default class ColorMode {
  // cache current color mode
  mode = null;

  // cache <html> node to add/rm .dark class
  root = null;

  // implement simple dispatcher
  e = null;

  // cache callback to run when color mode changes
  colorModeChanged = null;

  constructor() {
    // @init
    // - cache <html> node
    // - @first-mount init from local cache

    const modeCached = localStorage.getItem(LOCAL_COLOR_MODE);
    const qMediaDark = matchMedia("(prefers-color-scheme: dark)");

    this.root = document.documentElement;
    this.e = q.eventListener();

    // check if both preferences, cached mode.local
    // or user system preferences are set to color-mode
    if (MODE_DARK === modeCached || qMediaDark.matches) {
      this.setDark();
    } else {
      this.setLight();
    }

    // sync with system updates
    qMediaDark.addEventListener("change", ({ matches }) => {
      // can do $this in arrow function to ref parent scope
      if (matches) {
        this.setDark();
      } else {
        this.setLight();
      }
    });
    //
    // trigger callback @color-mode change
    this.e.addEventListener(
      EVENT_COLOR_MODE_CHANGE,
      (isDark) =>
        this.colorModeChanged && this.colorModeChanged(isDark)
    );
  }

  toggle() {
    if (this.isDark()) {
      this.setLight();
    } else {
      this.setDark();
    }
  }

  setDark() {
    // add .dark class to <html>
    classAdd(this.root, CLASS_DARK);
    // cache it for hard reloads
    localStorage.setItem(LOCAL_COLOR_MODE, MODE_DARK);
    // cache local
    this.mode = MODE_DARK;
    // trigger callback
    this.e.triggerEvent(EVENT_COLOR_MODE_CHANGE, true);
  }

  setLight() {
    // remove .dark class from <html>
    classRemove(this.root, CLASS_DARK);
    // clear cached
    localStorage.removeItem(LOCAL_COLOR_MODE);
    // null local
    this.mode = null;
    // trigger callback
    this.e.triggerEvent(EVENT_COLOR_MODE_CHANGE, false);
  }

  isDark() {
    return MODE_DARK === this.mode;
  }

  isLigt() {
    return !this.isDark();
  }

  onColorModeChange(callback = noop) {
    this.colorModeChanged = callback;
  }
}
