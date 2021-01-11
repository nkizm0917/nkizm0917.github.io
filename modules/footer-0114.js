class footer extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <button id="js-video-on-trigger">映像あり</button>
      <button id="js-video-off-trigger">映像なし</button>
      <button id="js-photo-trigger">映像なし(写真)</button>
    `;
  }

}
customElements.define('footer-elem', footer);