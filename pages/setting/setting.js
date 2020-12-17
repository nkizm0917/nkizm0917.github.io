const startButton = document.getElementById('start-button');
const setting = document.getElementById('setting')


startButton.addEventListener('click', () => {
  const audioVal = setting.audio.value;
  const screenVal = setting.screen.value;
  const chatVal = setting.chat.value;
  const shareVal = setting.share.value;  
  // window.location.href = "./room";
  // const audio = setting.audio;
  // const audio_Val = audio.value;
  // console.log(audio_Val);

  // const settingVal = setting1_Val+setting2_Val
  // console.log(settingVal)

  // switch (settingVal) {
  //   case "aa":
  //     console.log("aa!");
  //     break;
  //   case "ab":
  //     console.log("ab!");
  //     break;
  //   default:
  //     console.log("No...");
  // }

  // const settingVal = audioVal + videoVal + chatVal + shareVal;
  // console.log(settingVal);
  let linkTo = ""
  switch (screenVal) {
    case "video":
      linkTo = "../video"
      if(audioVal=="yes") {
        linkTo += "/main"
        window.location.href = linkTo
      }
      break;
    case "stamp":
      linkTo = "../stamp"
      break;
    case "no":
      linkTo = "../none"
      break;
  }
  console.log(linkTo);
  
})