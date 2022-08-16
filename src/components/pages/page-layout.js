export default class {
  // root component
  app = null;

  constructor(app) {
    this.app = app;
  }

  render() {
    const { app } = this;
    const page = app.state.activePage;
    //
    return `
      <div class="app-layout--root">
        <h1>app</h1>
        <section class="app-layout--page">
          ${app.pages[page].render()}
        </section>
      </div>      
    `;
  }
}
