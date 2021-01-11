const Peer = window.Peer;

const urlParam = location.search.substring(1);
let paramArray = [];
if (urlParam) {
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
  const selfTrigger = document.getElementById('js-self-trigger');
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
    if (paramArray) {
      if (paramArray.self == 'off') {
        console.log('Off!');
        onClickSelf('OFF');
      }
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
      
      const nameTag = document.createElement('div');
      nameTag.className = "name";
      nameTag.id = `${setId}_tag`;
      nameTag.textContent = userName;

      wrapVideo.appendChild(newVideo);
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
    selfTrigger.addEventListener('click', () => {
      const onOff = (selfTrigger.textContent == 'セルフビューON') ? 'ON' : 'OFF';
      onClickSelf(onOff);
    });

    function onClickVideo() {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = track.enabled ? "映像OFF" : "映像ON"));
    }

    function onClickAudio() {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getAudioTracks().forEach((track) => (audioTrigger.textContent = track.enabled ? "音声OFF" : "音声ON"));
    }

    function onClickSelf(onOff) {
      // const onOff = (selfTrigger.textContent == 'セルフビューON') ? 'ON' : 'OFF';
      const wrap = document.getElementById('local-wrap-video');
      const dummy = document.getElementById('dummy');

      if (onOff == 'ON') {
        console.log('on');
        wrap.style.display = 'block'
        dummy.style.display = 'block'
        selfTrigger.textContent = 'セルフビューOFF'
      } else if (onOff == 'OFF') {
        console.log('off');
        wrap.style.display = 'none';
        dummy.style.display = 'none';
        selfTrigger.textContent = 'セルフビューON'
      }
    }
  });

  peer.on('error', console.error);
})();
