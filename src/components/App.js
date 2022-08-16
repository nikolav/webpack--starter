export default class {
  constructor(node) {
    this.root = node || document.body;
  }

  render() {
    this.root.innerHTML = `<h1>App</h1>`;
  }
}
