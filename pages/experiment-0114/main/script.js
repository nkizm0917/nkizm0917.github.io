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
  const videoOnTrigger = document.getElementById('js-video-on-trigger');
  const videoOffTrigger = document.getElementById('js-video-off-trigger');
  const photoTrigger = document.getElementById('js-photo-trigger');
  // const audioTrigger = document.getElementById('js-audio-trigger');
  // const selfTrigger = document.getElementById('js-self-trigger');
  const userName = document.getElementById('js-user-name');
  const videos = document.getElementById('videos');
  const localPhoto = document.getElementById('local-photo');
  const localWrapVideo = document.getElementById('local-wrap-video')
  const footer = document.getElementById('footer');



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

  const speech = new webkitSpeechRecognition();
  speech.lang = 'ja-JP';

  joinTrigger.addEventListener('click', () => {
    if (!peer.open) {
      return;
    }
    peer.options.admin = false;
    if (paramArray) {
      if (paramArray.self == 'off') {
        console.log('Off!');
        onClickSelf('OFF');
      }
      if (paramArray.admin == 'true') {
        console.log('admin!');
        peer.options.admin = true;

        localWrapVideo.classList.add('admin');
        dummy.classList.add('admin');

        const adminOff = document.createElement('button');
        adminOff.id = 'admin-off';
        adminOff.textContent = '管理者OFF'
        footer.appendChild(adminOff);
        adminOff.addEventListener('click', onClickAdmin)
      }
    }

    if (userName.value) {
      switch (userName.value) {
        // case 'sample':
        //   localPhoto.src = '../photo/sample.jpg';
        case '齊藤数馬':
          localPhoto.src = '../photo/saito.jpg';
          break;
        case '鈴木圭祐':
          localPhoto.src = '../photo/suzuki.jpg';
          break;
        case '岩田真奈':
          localPhoto.src = '../photo/iwata.jpg';
          break;
        case '吉村勇佐':
          localPhoto.src = '../photo/yoshimura.jpg';
          break;
        default:
          localPhoto.src = '../photo/sample.jpg';          
      }
    }

    scrollTo(0, 50);

    const room = peer.joinRoom(roomId.value, {
      mode: 'mesh',
      stream: localStream,
    });

    room.once('open', () => {
      console.log(room);
      peer.options.userName = userName.value;
      const data = {
        type: "join",
        id: room._peerId,
        name: peer.options.userName,
        msg: "",
        admin: peer.options.admin,
      }
      room.send(data);

      const frame = document.createElement('div');
      frame.className = "frame";
      frame.id = 'local_frame';

      const nameTag = document.createElement('div');
      nameTag.className = "local-name";
      nameTag.textContent = peer.options.userName;

      dummy.appendChild(frame);
      dummy.appendChild(nameTag);

      speech.start();
    });

    room.on('peerJoin', peerId => {
      console.log(peerId + " joined");
      const data = {
        type: "info",
        id: room._peerId,
        name: peer.options.userName,
        msg: "",
        admin: peer.options.admin,
      }
      room.send(data);
    });

    room.on('stream', async stream => {
      console.log(stream)
      const setId = stream.peerId
      console.log(peer);
      const userName = peer.options[setId];
      // console.log(userName);

      const newVideo = document.createElement('video');
      newVideo.id = `${setId}_video`;
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      newVideo.setAttribute('data-peer-id', stream.peerId);

      const wrapVideo = document.createElement('div');
      wrapVideo.className = "wrap-video";
      wrapVideo.id = `${setId}_wrap`;

      const photo = document.createElement('img');
      photo.className = 'photo';
      photo.id = `${setId}_photo`;

      const frame = document.createElement('div');
      frame.className = "frame";
      frame.id = `${setId}_frame`;
      
      const nameTag = document.createElement('div');
      nameTag.className = "name";
      nameTag.id = `${setId}_tag`;
      nameTag.textContent = userName;

      wrapVideo.appendChild(frame);
      wrapVideo.appendChild(newVideo);
      wrapVideo.appendChild(photo);
      wrapVideo.appendChild(nameTag);

      const optionAdmin = `${setId}_admin`;
      console.log(optionAdmin);
      console.log(peer.options);
      console.log(peer.options[setId]);
      console.log(peer.options[optionAdmin]);
      if (peer.options[optionAdmin]) {
        wrapVideo.classList.add('admin')
        videos.appendChild(wrapVideo);
      } else {
        remoteVideos.appendChild(wrapVideo);
      }

      await newVideo.play().catch(console.error);

      if (userName) {
        setPhoto(setId, userName);
      }
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
          if (data.admin) {
            // peer.options[`${setId}_admin`] = true;
            const wrap = document.getElementById(`${setId}_wrap`);
            wrap.classList.add('admin');
            videos.appendChild(wrap);
          }
          setPhoto(setId, setName);
          break;
        case "info":
          var setId = data.id;
          var setName = data.name;
          peer.options[setId] = setName;
          if (data.admin) {
            peer.options[`${setId}_admin`] = true;
          }
          break;
        case "frame":
          var setId = data.id;
          var startOrEnd = data.msg;
          peerframe(setId, startOrEnd);
          break;
        case "photo":
          var setId = data.id;
          const video = document.getElementById(`${setId}_video`)
          const photo = document.getElementById(`${setId}_photo`)
          if (data.msg == "on") {
            video.style.display = 'none';
            photo.style.display = "inline";
          } else {
            video.style.display = 'inline';
            photo.style.display = "none";
          }
          break;
        case "admin":
          var setId = data.id
          const wrap = document.getElementById(`${setId}_wrap`)
          if (data.msg == 'on') {
            wrap.style.display = 'block';
          } else if (data.msg == 'off') {
            wrap.style.display = 'none';
          }
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
    console.log(videoOnTrigger);
    console.log(videoOffTrigger);
    videoOnTrigger.addEventListener('click', onClickVideoOn);
    videoOffTrigger.addEventListener('click', onClickVideoOff);
    photoTrigger.addEventListener('click', onClickPhoto);
    // audioTrigger.addEventListener('click', onClickAudio);
    // selfTrigger.addEventListener('click', () => {
    //   const onOff = (selfTrigger.textContent == 'セルフビューON') ? 'ON' : 'OFF';
    //   onClickSelf(onOff);
    // });

    function onClickVideoOn() {
      localStream.getVideoTracks().forEach((track) => (track.enabled = true));
      localPhoto.style.display = 'none';
      const data = {
        type: "photo",
        id: room._peerId,
        name: peer.options.userName,
        msg: "off",
      }
      room.send(data);
      // localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = "映像OFF"));
    }

    function onClickVideoOff() {
      localStream.getVideoTracks().forEach((track) => (track.enabled = false));
      localPhoto.style.display = 'none'
      const data = {
        type: "photo",
        id: room._peerId,
        name: peer.options.userName,
        msg: "off",
      }
      room.send(data);
      // localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = "映像ON"));
    }

    function onClickPhoto() {
      console.log('click photo');
      localStream.getVideoTracks().forEach((track) => (track.enabled = false));
      localPhoto.style.display = 'inline';
      const data = {
        type: "photo",
        id: room._peerId,
        name: peer.options.userName,
        msg: "on",
      }
      room.send(data);
    }

    function setPhoto(id, name) {
      console.log('set photo');
      console.log(id);
      console.log(name);
      console.log(document.getElementById(`${id}_photo`));
      if (document.getElementById(`${id}_photo`)) {
        const photo = document.getElementById(`${id}_photo`);
        switch (name) {
          case '齊藤数馬':
            photo.src = '../photo/saito.jpg';
            break;
          case '鈴木圭祐':
            photo.src = '../photo/suzuki.jpg';
            break;
          case '岩田真奈':
            photo.src = '../photo/iwata.jpg';
            break;
          case '吉村勇佐':
            photo.src = '../photo/yoshimura.jpg';
            break;
          default:
            photo.src = '../photo/sample.jpg';
        }
        // photo.src = `../photo/${name}.jpg`;
      }
    }

    function onClickAdmin() {
      const button = document.getElementById('admin-off');
      const wrap = document.getElementById('local-wrap-video');
      const dummy = document.getElementById('dummy')
      if (button.textContent == '管理者OFF') {
        console.log('admin off');
        localStream.getVideoTracks().forEach((track) => (track.enabled = false));
        wrap.style.display = 'none';
        dummy.style.display = 'none';
        const data = {
          type: "admin",
          id: room._peerId,
          msg: "off",
        }
        room.send(data);
        button.textContent = '管理者ON';
      } else if (button.textContent == '管理者ON') {
        console.log('admin on');
        localStream.getVideoTracks().forEach((track) => (track.enabled = true));
        wrap.style.display = 'block';
        dummy.style.display = 'block';
        const data = {
          type: "admin",
          id: room._peerId,
          msg: "on",
        }
        room.send(data);
        button.textContent = '管理者OFF';
      }
    }

    // function onClickVideo() {
    //   localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    //   localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = track.enabled ? "映像OFF" : "映像ON"));
    // }

    // function onClickAudio() {
    //   localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    //   localStream.getAudioTracks().forEach((track) => (audioTrigger.textContent = track.enabled ? "音声OFF" : "音声ON"));
    // }

    // function onClickSelf(onOff) {
    //   // const onOff = (selfTrigger.textContent == 'セルフビューON') ? 'ON' : 'OFF';
    //   const wrap = document.getElementById('local-wrap-video');
    //   const dummy = document.getElementById('dummy');
    //   if (onOff == 'ON') {
    //     console.log('on');
    //     wrap.style.display = 'block'
    //     dummy.style.display = 'block'
    //     selfTrigger.textContent = 'セルフビューOFF'
    //   } else if (onOff == 'OFF') {
    //     console.log('off');
    //     wrap.style.display = 'none';
    //     dummy.style.display = 'none';
    //     selfTrigger.textContent = 'セルフビューON'
    //   }
    // }

    function peerframe(id, startOrEnd) {
      const frame = document.getElementById(`${id}_frame`)
      if (startOrEnd == "start") {
        frame.style.display = 'inline';
      } else {
        frame.style.display = 'none';
      }
    }
  
    speech.onspeechstart = () => {
      console.log('on speech start');      
      const frame = document.getElementById('local_frame');
      frame.style.display = 'inline'
      const data = {
        type: "frame",
        id: room._peerId,
        name: peer.options.userName,
        msg: "start",
      }
      room.send(data);
    }
  
    speech.onspeechend = () => {
      console.log('on speech end');
      const frame = document.getElementById('local_frame');
      frame.style.display = 'none'
      // speech.start()
      const data = {
        type: "frame",
        id: room._peerId,
        name: peer.options.userName,
        msg: "end",
      }
      room.send(data);
    };
  
    let speech_error = false;

    speech.onend = () => {
      if (speech_error == false) {
        console.log('on end');
        speech.start();
      }
      // try {
      //   speech.start();
      // } catch(e) {
      //   console.log(e);
      // }
    }

    speech.onerror = () => {
      console.log('on error');
      speech_error = true;
      setTimeout(stopSpeech(),10000);
    }

    const stopSpeech = function () {
      try {
        speech.start();
      } catch(e) {
        console.log(e);
      }
      speech_error = false;
    }
  });

  peer.on('error', console.error);

})();
