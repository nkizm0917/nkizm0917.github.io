class footerstamp extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = `
      <button class="stamp-button" id="stamp-1" value="normal"><img src="../../../img/normal.svg"></button>
      <button class="stamp-button" id="stamp-2" value="niko"><img src="../../../img/niko.svg"></button>
      <button class="stamp-button" id="stamp-3" value="bad"><img src="../../../img/bad.svg"></button>
      <button class="stamp-button" id="stamp-5" value="good"><img src="../../../img/good.svg"></button>
      <button class="stamp-button" id="stamp-4" value="isee"><img src="../../../img/isee.svg"></button>
      <button class="stamp-button" id="stamp-6" value="raise"><img src="../../../img/raise.svg"></button>
      <button id="js-audio-trigger">音声OFF</button>
    `;
  }

}
customElements.define('footerstamp-elem', footerstamp);