/* eslint-disable */
import { q, eventListener, ColorMode, merge, has } from "../util";
import { PageIndex } from "./pages";
//
export const EVENT__RENDER = "qspbuxnvwkp";
export const EVENT__ON_RENDER = "dridbhyaqeq";
export const PAGE__INDEX = "cmktcykbjjp";
export const PAGE__NOT_FOUND = "mjzshdricbd";
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
  }

  setState(fields) {
    this.state = merge({}, this.state, fields);
    this.e.triggerEvent(EVENT__RENDER);
  }

  // @render
  render() {
    const page = this.state.activePage;
    //
    if (PAGE__NOT_FOUND === page) {
      this.render404();
      return;
    }
    //
    this.root.innerHTML = `
      <div>
        <h1>app</h1>
        <section>
          ${this.pages[page].render()}
        </section>
      </div>
    `;
    //
    this.bindEvents();
    //
    setTimeout(() => this.e.triggerEvent(EVENT__ON_RENDER));
  }

  onRender() {
    // eslint-disable-nex-line
    console.log(`Page [${this.state.activePage}] rendered.`);
  }

  renderPage(pageId = PAGE__INDEX) {
    this.setState({
      activePage: has(this.pages, pageId) ? pageId : PAGE__NOT_FOUND,
    });
  }

  render404() {
    this.root.innerHTML = `
      <div>
        <p>Page does not exist. Try again.</p>
      </div>
    `;
  }

  bindEvents() {}

  forceRender() {
    this.setState({ _forceRender: Date.now() });
  }
}
