class share extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <video id="js-media-stream"></video>
      <button id="js-share-trigger">全員に画面を共有</button>
      <button id="js-watch-trigger">共有された画面を表示</button>
      <div id="confirm">
        <p>共有は停止されました</p>
        <button id="js-confirm-trigger">確認</button>
      </div>
    `;
  }

}
customElements.define('share-elem', share);