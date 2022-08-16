export default class {
  render(node) {
    const root = node || document.body;
    root.innerHTML = `<h1>App</h1>`;
  }
}
