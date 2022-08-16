export default class {
  // root component
  app = null;

  constructor(app) {
    this.app = app;
  }

  render() {
    const { app } = this;
    return `
      <div class="app-layout--root">
        <h1>app</h1>
        <section class="app-layout--page">
          ${app.pages[app.state.activePage].render()}
        </section>
      </div>      
    `;
  }
}
