const startButton = document.getElementById('start-button');
const setting = document.getElementById('setting')

startButton.addEventListener('click', () => {
  // window.location.href = "./room";
  const audio = setting.audio;
  const audio_Val = audio.value;
  console.log(audio_Val);

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

})