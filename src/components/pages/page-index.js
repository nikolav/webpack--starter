import { q } from "../../util";
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
      <button id="b01" class="button">welcome</button>
    </div>      
  `;
  }

  //
  bindEvents() {
    q.on({
      target: q.s("#b01"),
      // eslint-disable-next-line
      run: () => alert(new Date().toLocaleString()),
    });
  }
}
