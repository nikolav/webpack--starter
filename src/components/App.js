/* eslint-disable */
import { q, eventListener, ColorMode, merge, has } from "../util";
import { PageLayout, PageIndex, Page404 } from "./pages";
//
export const EVENT__ON_RENDER = "dridbhyaqeq";
export const EVENT__RENDER = "qspbuxnvwkp";
//
export const PAGE__INDEX = "cmktcykbjjp";
export const PAGE__NOT_FOUND = "mjzshdricbd";
//
export default class App {
  // render app @this node
  root = null;
  // setting it with .setState() rebuilds the app
  state = null;
  // controll color-mode
  colormode = null;
  // simple dispatcher
  e = null;
  // available pages
  pages = null;
  // rener 404 page
  page404 = null;
  // page wrapper
  layout = null;
  //
  constructor(node) {
    const app = this;
    app.e = eventListener();
    app.root = node || document.body;
    // @init state
    app.state = {
      activePage: PAGE__INDEX,
      _forceRender: null,
    };
    // init color-mode service
    app.colormode = new ColorMode();
    app.colormode.onColorModeChange((isDark) => {
      // doStuffOnNewColorMode(isDark)
    });
    // cache pages for faster loads
    app.pages = {
      [PAGE__INDEX]: new PageIndex(app),
    };
    app.page404 = new Page404(app);
    app.layout = new PageLayout(app);
    //
    app.e.addEventListener(EVENT__RENDER, app.render.bind(app));
    app.e.addEventListener(EVENT__ON_RENDER, app.onRender.bind(app));
  }

  setState(fields) {
    this.state = merge({}, this.state, fields);
    this.e.triggerEvent(EVENT__RENDER);
  }

  renderPage(pageId = PAGE__INDEX) {
    this.setState({
      activePage: has(this.pages, pageId) ? pageId : PAGE__NOT_FOUND,
    });
  }

  // @render
  render() {
    const app = this;
    const page = app.state.activePage;
    //
    if (PAGE__NOT_FOUND === page) return app.render404();
    //
    app.root.innerHTML = app.layout.render();
    //
    app.bindEvents();
    //
    setTimeout(() => app.e.triggerEvent(EVENT__ON_RENDER));
  }

  onRender() {
    // eslint-disable-nex-line
    console.log(`Page [${this.state.activePage}] rendered.`);
  }

  render404() {
    this.root.innerHTML = this.page404.render();
  }

  bindEvents() {
    const app = this;
    const page = app.state.activePage;
    //
    if ("bindEvents" in app.pages[page]) app.pages[page].bindEvents();
  }

  forceRender() {
    this.setState({ _forceRender: Date.now() });
  }
}
