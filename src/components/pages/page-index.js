import { q } from "../../util";
//
const NAMESPACE = "PageIndex";
//
const ID01 = `${NAMESPACE}--01`;
//
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
      <button id="${ID01}" class="button">welcome</button>
    </div>      
  `;
  }

  //
  bindEvents() {
    q.on({
      target: q.s(`#${ID01}`),
      // eslint-disable-next-line
      run: () => alert(new Date().toLocaleString()),
    });
  }
}
