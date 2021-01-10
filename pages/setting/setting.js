const setting = document.getElementById('setting');
const richness = setting.richness;

var urlHash = window.location.hash;
if (urlHash) {
  console.log(urlHash);
  switch (urlHash) {
    case '#presentation':
    case '#entertainment':
      // console.log('presentation!');
      richness.value = 2;
      break;
    case 'discussion':
      richness.value = 3;
      break;
    case '#lecture':
      richness.value = 4;
      break
    case '#talk':
      richness.value = 5;
      break;
      
  }
}