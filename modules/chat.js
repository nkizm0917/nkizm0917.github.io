class chat extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <pre class="messages" id="js-messages"></pre>
      <input type="text" placeholder="メッセージを入力" size="20" id="js-local-text">
      <button id="js-send-trigger">送信</button>
    `;
  }

}
customElements.define('chat-elem', chat);