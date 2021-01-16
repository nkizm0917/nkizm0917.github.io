const setting = document.getElementById('setting');
const richness = setting.richness;
const share = setting.share;
const sub = setting.sub;
const self = setting.self;
const startButton = document.getElementById('start-button');

var urlHash = window.location.hash;
if (urlHash) {
  console.log(urlHash);
  switch (urlHash) {
    case '#entertainment':
      richness.value = 1;
      break;
    case '#presentation':
      richness.value = 2;
      share.value = 'on';
      break;
    case '#discussion':
      richness.value = 3;
      break;
    case '#lecture':
      richness.value = 4;
      share.value = 'on';
      break
    case '#talk':
      richness.value = 5;
      break;
  }
}

startButton.addEventListener('click', () => {
  let settingValue = [];
  settingValue.richness = richness.value;
  settingValue.share = share.value;
  settingValue.sub = sub.value;
  settingValue.self = self.value;

  console.log(settingValue);

  let url = '../'
  switch (settingValue.richness) {
    case '1':
      alert('[チャット]は準備中です。');
      return;
    case '2':
      url += 'none/';
      console.log(url);
      break;
    case '3':
      alert('[写真]は準備中です。');
      return;
    case '4':
      url += 'stamp/';
      break;
    case '5':
      url += 'video/';
      break;
  }

  if (settingValue.share == 'on') {
    if (settingValue.sub == 'on') {
      url += 'rcg-share/';
    } else {
      url += 'share/';
    }
  } else {
    if (settingValue.sub == 'on') {
      url += 'rcg/';
    } else {
      url += 'main/'
    }
  }

  if (settingValue.self == 'off') {
    url += '?self=off'
  }

  // console.log('test');
  console.log(url);
  window.location.href = url;
})