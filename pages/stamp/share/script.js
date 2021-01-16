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
  const audioTrigger = document.getElementById('js-audio-trigger');
  const shareTrigger = document.getElementById('js-share-trigger');
  const watchTrigger = document.getElementById('js-watch-trigger');
  const userName = document.getElementById('js-user-name');
  const mediaVideo = document.getElementById('js-media-stream');
  const footer = document.getElementById('footer');
  const confirm = document.getElementById('confirm');
  const stamps = document.getElementsByClassName('stamp-button');
  const localStamp = document.getElementById('local-stamp');
  const localStampArea = document.getElementById('local-stamp-area');

  // ボタン追加  
  const stopTrigger = document.createElement('button');
  stopTrigger.id = 'js-stop-trigger';
  stopTrigger.textContent = '共有を停止'
  footer.appendChild(stopTrigger);
  const mediaTrigger = document.createElement('button');
  mediaTrigger.id = "js-media-trigger"
  mediaTrigger.textContent = "PC画面を取得"
  footer.appendChild(mediaTrigger)

  // localStream取得・追加    
  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false,
    })
    .catch(console.error);
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  // 画面取得・追加
  async function getMedia() {
    console.log("click media");
    mediaStream = await navigator.mediaDevices
      .getDisplayMedia({
        video: true,
      })
      .catch(console.error);
    mediaVideo.srcObject = mediaStream;
    mediaVideo.playsInline = true;
    await mediaVideo.play().catch(console.error);

    mediaTrigger.style.display= 'none'
    shareTrigger.style.display= 'block'
  };
  mediaTrigger.addEventListener('click', () => {
    getMedia();
  });
      
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

      const nameTag = document.createElement('div');
      nameTag.className = "local-name";
      nameTag.textContent = peer.options.userName;

      localStampArea.appendChild(nameTag);
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
      const newAudio = document.createElement('audio');
      newAudio.srcObject = stream;
      newAudio.playsInline = true;
      newAudio.setAttribute('data-peer-id', stream.peerId)

      var setId = stream.peerId
      var userName = peer.options[setId]

      const wrapVideo = document.createElement('div');
      wrapVideo.className = "wrap-video";
      wrapVideo.id = `${setId}_wrap`;
      
      const nameTag = document.createElement('div');
      nameTag.className = "name";
      nameTag.id = `${setId}_tag`;
      nameTag.textContent = userName;

      const newStamp = document.createElement('img');
      newStamp.className = 'stamp'
      newStamp.id = `${setId}_stamp`;
      newStamp.src = '../../../img/normal.svg'

      const area = document.createElement('div');
      area.className = 'stamp-area';
      area.id = `${setId}_area`;

      area.appendChild(newStamp);
      area.appendChild(nameTag);
      remoteVideos.appendChild(area);
      remoteVideos.appendChild(newAudio);

      await newAudio.play().catch(console.error);
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
        case "share":
          watchTrigger.style.display = 'block';
          break;
        case "share-stop":
          confirm.style.display = "block";
          break;
        case "stamp":
          getStamp(data.id, data.value);
          break;
        case "remove-stamp":
          removeRemoteStamp(data.id, data.value);
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

      const wrap = document.getElementById(`${peerId}_area`);
      wrap.remove();
    });

    room.once('close', async () => {
      const videos = document.querySelectorAll('#js-remote-streams video');
      const wraps = document.querySelectorAll('#js-remote-streams .stamp-area');
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
    audioTrigger.addEventListener('click', onClickAudio);
    shareTrigger.addEventListener('click', onClickShare);
    stopTrigger.addEventListener('click', onClickStop);


    function onClickShare() {
      const data = {
        type: "share",
        name: peer.options.userName,
      }
      console.log(data);
      room.send(data);

      const nowSharing = document.createElement('p');
      nowSharing.textContent = "画面共有中";
      nowSharing.id = "now-sharing";
      localStampArea.appendChild(nowSharing);

      document.getElementById('style-sharing').disabled = false;
    }

    function onClickStop() {
      const data = {
        type: "share-stop",
      }
      room.send(data)
    }

    function onClickAudio() {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getAudioTracks().forEach((track) => (audioTrigger.textContent = track.enabled ? "音声OFF" : "音声ON"));
    }

    function removeStamp() {
      let displayValue = ""
      if (localStamp.style.display != "none") {
        localStamp.style.display = "none";
        displayValue = "none"       
      } else {
        localStamp.style.display = "inline";
        displayValue = "inline"
      }
      const data = {
        type: "remove-stamp",
        id: peer.id,
        name: peer.options.userName,
        value: displayValue,
      }
      room.send(data);
    };
    function removeRemoteStamp(userId, displayValue) {
      var newStamp = document.getElementById(`${userId}_stamp`);
      if (displayValue == "none") {
        newStamp.style.display = "none";
      } else if (displayValue == "inline") {
        newStamp.style.display = "inline";
      }
    }

    function getStamp(userId, stamp) {
      const newStamp = document.getElementById(`${userId}_stamp`);
      newStamp.src = `../../../img/${stamp}.svg`;
    }

    [...stamps].forEach(b => {
      console.log(b);
      b.addEventListener('click', () => {
        console.log(b.value);
        localStamp.src = `../../../img/${b.value}.svg`;
        const data = {
          type: 'stamp',
          id: peer.id,
          name: peer.options.userName,
          value: b.value,
        }
        console.log(data);
        room.send(data);
      })
    })

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    let keyStatus = [false, false];
    function keyDown (e) {
      console.log(e.keyCode);
      if (e.keyCode == 18) {
        keyStatus[0] = true;
      } else if (e.keyCode == 86) {
        keyStatus[1] = true;
      }
    
      if (keyStatus[0] && keyStatus[1]) {
        console.log("Yes!");
        removeStamp();
      }
    }
    function keyUp (e) {
      keyStatus = [false, false];
    }
  });

  // 共有画面送信
  shareTrigger.addEventListener('click', () => {
    if (!peer.open) {
      return;
    }

    shareTrigger.style.display = 'none';
    stopTrigger.style.display = 'inline';

    const room2 = peer.joinRoom(`${roomId.value}_media`, {
      mode: 'sfu',
      stream: mediaStream,
    });

    room2.once('open', () => {
      console.log("room2を作成！")
      console.log(room2)
      
      const data = {
        type: "media",
        id: room2._peerId,
        name: peer.options.userName,
        msg: "",
      }
      room2.send(data);
    });

    room2.on('peerJoin', peerId => {
      console.log(peerId + " joined");
    });

    room2.on('data', ({ data }) => {
      console.log(data)
    });


    room2.once('close', async () => {
      const data = {
        type: "leave",
        name: peer.options.userName,
        msg: "",
      }
      console.log(data);
      await room2.send(data);
      mediaVideo.srcObject.getTracks().forEach(track => track.stop());
      mediaVideo.srcObject = null;

      stopTrigger.style.display = 'none';
      mediaTrigger.style.display = 'inline';

      const nowSharing = document.getElementById('now-sharing');
      nowSharing.remove();

      document.getElementById('style-sharing').disabled = true;
    });

    stopTrigger.addEventListener('click', () => room2.close(), { once: true });
  });

  // 共有画面受信
  watchTrigger.addEventListener('click', () => {
    if (!peer.open) {
      return;
    }

    const room2 = peer.joinRoom(`${roomId.value}_media`, {
      mode: 'sfu',
    });

    room2.once('open', () => {

      console.log("room2を作成！")
      console.log(room2)
      
      const data = {
        type: "media",
        id: room2._peerId,
        name: peer.options.userName,
        msg: "",
      }
      room2.send(data);
    });

    room2.on('peerJoin', peerId => {
      console.log(peerId + " joined");
    });

    room2.on('stream', async stream => {
      console.log("get media!")
      mediaVideo.srcObject = stream;
      mediaVideo.playsInline = true;

      await mediaVideo.play().catch(console.error);

      watchTrigger.style.display = 'none';
    });

    room2.on('data', ({ data }) => {
      console.log(data)
      switch (data.type) {
        case "leave":
          confirm.style.display = 'block';
          break;
        default:
          console.log("No type...");
      }
    });


    room2.once('close', async () => {
      mediaVideo.srcObject = null;
    });

    const confirmTrigger = document.getElementById('js-confirm-trigger');
    console.log(confirmTrigger);
    confirmTrigger.addEventListener('click', () => {
      room2.close(), { once: true }
      confirm.style.display = 'none'
    });

  });
  

  peer.on('error', console.error);
})();