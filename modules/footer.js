class footer extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <button id="js-video-trigger">映像OFF</button>
      <button id="js-audio-trigger">音声OFF</button>
      <button id="js-self-trigger">セルフビューOFF</button>
    `;
  }

}
customElements.define('footer-elem', footer);