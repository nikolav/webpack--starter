import q from "nikolav-q";

const { rm: classRemove, add: classAdd } = q.class;
const CLASS_MODAL_CONTAINER = "Modal--container";
const CLASS_MODAL_BACKDROP = "Modal--backdrop";
const CLASS_MODAL_BODY = "Modal--body";
const CLASS_MODAL_CLOSE = "Modal--close";

export default class Modal {
  constructor(root = null) {
    this.root = root || document.body;
    this.modal = null;
  }

  open(modalHtml) {
    if (this.isOpen()) return;
    //
    const modal = `
      <section class="${CLASS_MODAL_CONTAINER}">
        <div class="fixed inset-0 z-[11] bg-slate-500/50 backdrop-blur-md dark:bg-stone-600/50 ${CLASS_MODAL_BACKDROP}"></div>
        <div class="fixed z-[12] overflow-hidden bg-white rounded-0 inset-0 sm:shadow-md sm:rounded-2xl sm:inset-4 md:inset-6 md:inset-x-16 lg:inset-y-8 lg:inset-x-24 lg:mx-auto lg:tall:inset-y-20 max-w-4xl sm:max-h-[720px] dark:bg-stone-900 transition-opacity opacity-0 duration-200 text-white ${CLASS_MODAL_BODY}">
          <strong class="absolute z-[13] top-0 right-0 opacity-50 scale-75 hover:scale-[.82] hover:opacity-80 cursor-pointer transition-transform text-slate-500 dark:text-white ${CLASS_MODAL_CLOSE}">${this.iconCancel(
      24
    )}</strong>
          ${modalHtml}
        </div>
      </section>
    `;
    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = modal;
    this.root.appendChild(modalDiv);
    //
    this.modal = modalDiv;
    //
    q.on({
      target: q.s(`.${CLASS_MODAL_CLOSE}`),
      run: () => this.close(),
    });
    //
    const modalBody = q.s(`.${CLASS_MODAL_BODY}`);
    // basic fade-in
    setTimeout(() => {
      classRemove(modalBody, "opacity-0");
      classAdd(modalBody, "opacity-100");
    });
  }

  close() {
    this.root.removeChild(this.modal);
    this.modal = null;
  }

  isOpen() {
    return null != this.modal;
  }

  iconCancel() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M15.35 32.65q.45.55 1.2.55t1.3-.55L24 26.5l6.25 6.2q.45.55 1.2.525.75-.025 1.25-.575.5-.45.5-1.2t-.5-1.3L26.5 24l6.25-6.25q.5-.45.475-1.2-.025-.75-.525-1.25t-1.25-.5q-.75 0-1.25.5L24 21.5l-6.2-6.25q-.5-.5-1.25-.475-.75.025-1.2.525-.55.5-.55 1.25t.55 1.25L21.5 24l-6.2 6.2q-.55.5-.525 1.25.025.75.575 1.2ZM24 44.85q-4.4 0-8.225-1.6-3.825-1.6-6.625-4.4-2.8-2.8-4.4-6.625Q3.15 28.4 3.15 24q0-4.4 1.6-8.225 1.6-3.825 4.4-6.625 2.8-2.8 6.625-4.4Q19.6 3.15 24 3.15q4.4 0 8.225 1.6 3.825 1.6 6.625 4.4 2.8 2.8 4.4 6.625 1.6 3.825 1.6 8.225 0 4.4-1.6 8.225-1.6 3.825-4.4 6.625-2.8 2.8-6.625 4.4-3.825 1.6-8.225 1.6ZM24 24Zm0 17q7 0 12-4.975T41 24q0-7-5-12T24 7q-7.05 0-12.025 5Q7 17 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Z" fill="currentcolor"/></svg>
    `;
  }
}
