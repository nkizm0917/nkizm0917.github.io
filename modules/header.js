class header extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <span id="js-room-mode"></span>
      Room:
      <input type="text" placeholder="ルーム名" size="15" id="js-room-id">
      User:
      <input type="text" placeholder="ユーザー名" size="15" id="js-user-name">
      <button id="js-join-trigger">参加</button>
      <button id="js-leave-trigger">退出</button>
      <a href="/pages/setting" id="to-top">設定へ</a>
    `;
  }

}
customElements.define('header-elem', header);