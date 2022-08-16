export default class {
  // root component
  app = null;

  constructor(app) {
    this.app = app;
  }

  render() {
    return `
      <div>
        <p>Page does not exist. Try again.</p>
      </div>      
    `;
  }
}
