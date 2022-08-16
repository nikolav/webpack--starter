export default class {
  // root component
  app = null;

  constructor(app) {
    this.app = app;
  }

  render() {
    return `
    <div>
      <h4>page index</h4>
      <p>welcome</p>
    </div>      
  `;
  }
}
