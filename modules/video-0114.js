class video extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <div class="wrap-video" id="local-wrap-video">
        <video id="js-local-stream"></video>
        <div class="wrap-local-photo">
          <img class="photo" id="local-photo"></img>
        </div>
      </div>
      <div class="remote-streams" id="js-remote-streams"></div>
    `;
  }

}
customElements.define('video-elem', video);