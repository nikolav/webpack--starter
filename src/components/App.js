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
      page: PAGE__INDEX,
    };
    this.colormode = new ColorMode();
    this.pages = {
      index: new PageIndex(this),
    };
    //
    this.e.addEventListener(EVENT__RENDER, this.render.bind(this));
    this.e.addEventListener(EVENT__ON_RENDER, this.onRender.bind(this));
    //
    this.bindEvents();
    //
    setTimeout(() => this.e.triggerEvent(EVENT__ON_RENDER));
  }

  setState(newState) {
    this.state = merge({}, this.state, newState);
    this.e.triggerEvent(EVENT__RENDER);
  }

  // @render
  render() {
    this.root.innerHTML = `
      <div>
        <h1>app</h1>
        <section>
          ${this.pages.index.render()}
        </section>
      </div>
    `;
  }

  onRender() {}

  bindEvents() {}
}
