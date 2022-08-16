/* eslint-disable */
import { q, eventListener, ColorMode, merge } from "../util";
import { PageIndex } from "./pages";
//
export const EVENT__RENDER = "qspbuxnvwkp";
export const EVENT__ON_RENDER = "dridbhyaqeq";
export const PAGE__INDEX = "cmktcykbjjp";
//
export default class App {
  //
  root = null;
  //
  state = null;
  //
  colormode = null;
  //
  e = null;
  //
  pages = null;
  //
  constructor(node) {
    this.e = eventListener();
    this.root = node || document.body;
    this.state = {
      activePage: PAGE__INDEX,
      _forceRender: null,
    };
    this.colormode = new ColorMode();
    this.pages = {
      [PAGE__INDEX]: new PageIndex(this),
    };
    //
    this.e.addEventListener(EVENT__RENDER, this.render.bind(this));
    this.e.addEventListener(EVENT__ON_RENDER, this.onRender.bind(this));
    //
    this.bindEvents();
    //
    setTimeout(() => this.e.triggerEvent(EVENT__ON_RENDER));
  }

  setState(fields) {
    this.state = merge({}, this.state, fields);
    this.e.triggerEvent(EVENT__RENDER);
  }

  // @render
  render() {
    this.root.innerHTML = `
      <div>
        <h1>app</h1>
        <section>
          ${this.pages[this.state.activePage].render()}
        </section>
      </div>
    `;
  }

  onRender() {}

  bindEvents() {}

  forceRender() {
    this.setState({ _forceRender: Date.now() });
  }
}
