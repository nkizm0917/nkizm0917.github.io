class footerstamp extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <button class="stamp-button" id="stamp-1" value="normal" title="普通"><img src="../../../img/normal.svg"></button>
      <button class="stamp-button" id="stamp-2" value="niko" title="笑顔"><img src="../../../img/niko.svg"></button>
      <button class="stamp-button" id="stamp-3" value="bad" title="困り顔"><img src="../../../img/bad.svg"></button>
      <button class="stamp-button" id="stamp-4" value="good" title="了解、いいね"><img src="../../../img/good.svg"></button>
      <button class="stamp-button" id="stamp-5" value="isee" title="なるほど"><img src="../../../img/isee.svg"></button>
      <button class="stamp-button" id="stamp-6" value="raise" title="挙手"><img src="../../../img/raise.svg"></button>
      <button id="js-audio-trigger">音声OFF</button>
    `;
  }

}
customElements.define('footerstamp-elem', footerstamp);