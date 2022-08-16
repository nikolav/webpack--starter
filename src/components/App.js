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
  page404 = null;
  //
  layout = null;
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
    this.page404 = new Page404(this);
    this.layout = new PageLayout(this);
    //
    this.e.addEventListener(EVENT__RENDER, this.render.bind(this));
    this.e.addEventListener(EVENT__ON_RENDER, this.onRender.bind(this));
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
    if (PAGE__INDEX === page) {
      q.on({
        target: q.s("#b01"),
        // eslint-disable-next-line
        run: () => alert(new Date().toLocaleString()),
      });
    }
  }

  forceRender() {
    this.setState({ _forceRender: Date.now() });
  }
}
