// Firebase
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyC_ErVpCsAKuStNckz9ZRJSQyD2TLhL5do",
  authDomain: "meeting-31b2f.firebaseapp.com",
  projectId: "meeting-31b2f",
  storageBucket: "meeting-31b2f.appspot.com",
  messagingSenderId: "951454481920",
  appId: "1:951454481920:web:5d7d4e4de4581b95f4e2e5",
  measurementId: "G-5CKSC1TXYR"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

//Msg送信準備
const newPostRef = firebase.database();

// SkyWay
const Peer = window.Peer;

let urlParam = location.search.substring(1);
let paramArray = [];
if (urlParam) {
  console.log(urlParam);
  urlParam = decodeURI(urlParam);
  console.log(urlParam);
  var param = urlParam.split('&');
  for (i = 0; i < param.length; i++) {
    var paramItem = param[i].split('=');
    paramArray[paramItem[0]] = paramItem[1];
  }
  console.log(paramArray);
}
if (paramArray.room) {
  const input_room = document.getElementById('js-room-id');
  input_room.value = paramArray.room;
}
if (paramArray.user) {
  const input_user = document.getElementById('js-user-name');
  input_user.value = paramArray.user;
}

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const videoTrigger = document.getElementById('js-video-trigger');
  const audioTrigger = document.getElementById('js-audio-trigger');
  const userName = document.getElementById('js-user-name');

  // dummy作成
  const dummy = document.createElement("div")
  dummy.id = 'dummy';
  remoteVideos.appendChild(dummy);

  // localStream取得・追加
  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  // peer作成
  const peer = (window.peer = new Peer({
    key: '649c67ae-3ae7-44b9-b389-41059053788c',
    debug: 3,
  }));

  joinTrigger.addEventListener('click', () => {
    if (!peer.open) {
      return;
    }
    scrollTo(0, 50);

    const room = peer.joinRoom(roomId.value, {
      mode: 'mesh',
      stream: localStream,
    });

    room.once('open', () => {
      console.log(room)      
      peer.options.userName = userName.value;      
      const data = {
        type: "join",
        id: room._peerId,
        name: peer.options.userName,
        msg: "",
      }
      room.send(data);

      const rcgText = document.createElement('p');
      rcgText.className = "rcg-text";
      rcgText.id = "local_text";

      const nameTag = document.createElement('div');
      nameTag.className = "local-name";
      nameTag.textContent = peer.options.userName;

      dummy.appendChild(rcgText);
      dummy.appendChild(nameTag);
    });

    room.on('peerJoin', peerId => {
      console.log(peerId + " joined");
      const data = {
        type: "info",
        id: room._peerId,
        name: peer.options.userName,
        msg: "",
      }
      room.send(data);
    });

    room.on('stream', async stream => {
      console.log(stream)
      const setId = stream.peerId
      const userName = peer.options[setId]

      const newVideo = document.createElement('video');
      newVideo.id = `${setId}_video`;
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      newVideo.setAttribute('data-peer-id', stream.peerId);

      const wrapVideo = document.createElement('div');
      wrapVideo.className = "wrap-video";
      wrapVideo.id = `${setId}_wrap`;

      const rcgText = document.createElement('p');
      rcgText.className = "rcg-text";
      rcgText.id = `${setId}_text`;
      
      const nameTag = document.createElement('div');
      nameTag.className = "name";
      nameTag.id = `${setId}_tag`;
      nameTag.textContent = userName;

      wrapVideo.appendChild(newVideo);
      wrapVideo.appendChild(rcgText);
      wrapVideo.appendChild(nameTag);
      remoteVideos.append(wrapVideo);

      await newVideo.play().catch(console.error);
    });

    room.on('data', ({ data }) => {
      console.log(data)
      switch (data.type) {
        case "join":
          var setId = data.id;
          var setName = data.name;
          peer.options[setId] = setName;
          const nameTag = document.getElementById(setId + '_tag');
          nameTag.textContent = setName;
          break;
        case "info":
          var setId = data.id;
          var setName = data.name;
          peer.options[setId] = setName;
          break;
        default:
          console.log("No type...");
      }
    });

    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      const wrap = document.getElementById(`${peerId}_wrap`);
      wrap.remove();
    });

    room.once('close', async () => {
      const videos = document.querySelectorAll('#js-remote-streams video');
      const wraps = document.querySelectorAll('#js-remote-streams .wrap-video');
      videos.forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
      wraps.forEach(wrap => {
        wrap.remove();
      });
    });

    leaveTrigger.addEventListener('click', () => room.close(), { once: true });
    videoTrigger.addEventListener('click', onClickVideo);
    audioTrigger.addEventListener('click', onClickAudio);

    function onClickVideo() {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = track.enabled ? "映像OFF" : "映像ON"));
    }

    function onClickAudio() {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getAudioTracks().forEach((track) => (audioTrigger.textContent = track.enabled ? "音声OFF" : "音声ON"));
    }    
  });

  peer.on('error', console.error);

  // 音声認識
  let room = "room1";
  const username = document.getElementById("js-user-name");

  //Msg受信処理
  function text() {
    newPostRef.ref(room).on("child_added", function (data) {
      const v = data.val();
      // const k = data.key;

      const rcgTextArea = document.getElementById(`${v.id}_text`)
      if (v.username == username.value) {
        console.log("local-text")
        const localText = document.getElementById("local_text");
        localText.textContent = v.text;
      } else if (rcgTextArea) {
        rcgTextArea.textContent = v.text;
      } else {
        console.log("No area...");
      }

      const cleanUp = function() {
        console.log("Clean up!");
        rcgTexts = document.getElementsByClassName("rcg-text");
        const rcgTextArray = Array.prototype.slice.call(rcgTexts);
        console.log(rcgTextArray);
        for (let i = 0; i < rcgTextArray.length; i += 1) {
          rcgTextArray[i].textContent = null;
        }
      }
      setTimeout(cleanUp, 5000);    
    });
  }

  //時間を取得する関数
  function time() {
    var date = new Date();
    var hh = ("0" + date.getHours()).slice(-2);
    var min = ("0" + date.getMinutes()).slice(-2);
    var sec = ("0" + date.getSeconds()).slice(-2);
    var time = hh + ":" + min + ":" + sec;
    return time;
  }

  //音声認識処理
  const speech = new webkitSpeechRecognition();
  speech.lang = 'ja-JP';
  
  joinTrigger.addEventListener('click', function () {
    room = document.getElementById('js-room-id').value;
    speech.start();
    text();
  });

  leaveTrigger.addEventListener('click', function(){
    location.reload();
  })

  speech.onresult = function (e) {
    speech.stop();
    if (e.results[0].isFinal) {
      var autotext = e.results[0][0].transcript
      console.log(e);
      console.log(autotext);

      newPostRef.ref(room).push({
        username: username.value,
        id: peer.id,
        text: autotext,
        time: time()
      });      
    }
  }

  speech.onend = () => {
    speech.start()
  };

})();
