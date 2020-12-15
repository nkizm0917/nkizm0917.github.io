const startButton = document.getElementById('start-button');
const setting = document.getElementById('setting')


startButton.addEventListener('click', () => {
  // window.location.href = "./room";
  const setting1 = setting.setting1;
  const setting1_Val = setting1.value;
  const setting2 = setting.setting2;
  const setting2_Val = setting2.value;
  // console.log(setting1_Val);

  const settingVal = setting1_Val+setting2_Val
  console.log(settingVal)

  switch (settingVal) {
    case "aa":
      console.log("aa!");
      break;
    case "ab":
      console.log("ab!");
      break;
    default:
      console.log("No...");
  }

})

