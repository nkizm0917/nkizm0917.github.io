class stamp extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <div class="wrap-video" id="local-wrap-video">
        <video id="js-local-stream"></video>        
        <div class="stamp-area" id="local-stamp-area">
          <img class="stamp" id="local-stamp" src="../../../img/normal.svg"></img>
        </div>
      </div>
      <div class="remote-streams" id="js-remote-streams"></div>
    `;
  }

}
customElements.define('stamp-elem', stamp);