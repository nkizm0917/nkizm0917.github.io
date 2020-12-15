const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');

  const videoTrigger = document.getElementById('js-video-trigger');
  const audioTrigger = document.getElementById('js-audio-trigger');
  const mediaTrigger = document.getElementById('js-media-trigger');
  const shareTrigger = document.getElementById('js-share-trigger');
  const watchTrigger = document.getElementById('js-watch-trigger');
  const stopTrigger = document.getElementById('js-stop-trigger');
  const testTrigger = document.getElementById('js-test');
  const emoji_1 = document.getElementById('emoji-1');
  const userName = document.getElementById('js-user-name');
  // const videos = document.getElementById('videos');
  // const mediaArea = document.getElementById('media');
  const mediaVideo = document.getElementById('js-media-stream');
  // const stop = document.getElementById('stop');
  const localWrapVideo = document.getElementById('local-wrap-video');

  testTrigger.addEventListener('click', () => {
    location.reload();
  })
  
  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const getRoomModeByHash = () => ('sfu');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );

  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);
    
  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

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
    shareTrigger.style.display= 'inline'
  };

  mediaTrigger.addEventListener('click', () => {
    getMedia();
  });        
      
  // eslint-disable-next-line require-atomic-updates
  const peer = (window.peer = new Peer({
    key: '649c67ae-3ae7-44b9-b389-41059053788c',
    debug: 3,
  }));

  // Register join handler
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
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
      messages.textContent += `=== ${peer.options.userName}がルームに参加 ===\n`;
      
      const data = {
        type: "join",
        id: room._peerId,
        name: peer.options.userName,
        msg: "",
      }
      // console.log(data);
      room.send(data);

      const nameTag = document.createElement('div');
      nameTag.className = "local-name";
      nameTag.textContent = peer.options.userName;

      localWrapVideo.appendChild(nameTag);
    });
    room.on('peerJoin', peerId => {
      console.log(peerId + " joined");

      const data = {
        type: "test",
        id: room._peerId,
        name: peer.options.userName,
        msg: "test",
      }
      room.send(data);
    });

    // Render remote stream for new peer join in the room
    room.on('stream', async stream => {
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      newVideo.setAttribute('data-peer-id', stream.peerId);
      console.log(stream)
      console.log(stream.peerId)
      var setId = stream.peerId
      console.log(peer)
      console.log(peer.options[setId])
      var name = peer.options[setId]
      // console.log(room)

      const wrapVideo = document.createElement('div');
      wrapVideo.className = "wrap-video";
      wrapVideo.id = `${setId}_wrap`;
      
      const nameTag = document.createElement('div');
      nameTag.className = "name";
      nameTag.id = `${setId}_tag`;
      nameTag.textContent = name;

      wrapVideo.appendChild(newVideo);
      wrapVideo.appendChild(nameTag);
      remoteVideos.append(wrapVideo);

      // remoteVideos.append(newVideo);
      await newVideo.play().catch(console.error);
    });

    room.on('data', ({ data }) => {
      // Show a message sent to the room and who sent
      console.log(data)
      if (data.type == "join") {
        var setId = data.id;
        var setName = data.name;
        peer.options[setId] = setName
        console.log(peer)

        const nameTag = document.getElementById(setId + '_tag');
        nameTag.textContent = setName;
        
        messages.textContent += `=== ${data.name}がルームに参加 ===\n`;
      } else if (data.type == "msg") {
        messages.textContent += `${data.name}: ${data.msg}\n`;
      } else if (data.type == "leave") {
        messages.textContent += `=== ${data.name}がルームから退出 ===\n`;
      } else if (data.type == "test") {
        var setId = data.id;
        var setName = data.name;

        peer.options[setId] = setName
        console.log(peer)
      } else if (data.type == "share") {
        watchTrigger.style.display = 'inline';
      }
    });

    // for closing room members
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();
    });

    // for closing myself
    room.once('close', async () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += `=== ${peer.options.userName}がルームから退出 ===\n`;
      const data = {
        type: "leave",
        name: peer.options.userName,
        msg: "",
      }
      await room.send(data)
      .Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });

    });

    sendTrigger.addEventListener('click', onClickSend);
    emoji_1.addEventListener('click', onClickEmoji_1);
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });
    videoTrigger.addEventListener('click', onClickVideo);
    audioTrigger.addEventListener('click', onClickAudio);
    shareTrigger.addEventListener('click', onClickShare);

    function onClickSend() {
      // Send message to all of the peers in the room via websocket
      // room.send(localText.value);
      const data = {
        type: "msg",
        name: peer.options.userName,
        msg: localText.value,
      }
      console.log(data);
      room.send(data);

      messages.textContent += `${peer.options.userName}: ${localText.value}\n`;
      localText.value = '';
      console.log(peer);
    }

    function onClickEmoji_1() {
      // Send message to all of the peers in the room via websocket
      // room.send(localText.value);
      const data = {
        type: "msg",
        name: peer.options.userName,
        msg: "emoji-1",
      }
      console.log(data);
      room.send(data);

      messages.textContent += `${peer.options.userName}: ${localText.value}\n`;
      localText.value = '';
      console.log(peer);
    }

    function onClickShare() {
      const data = {
        type: "share",
        name: peer.options.userName,
        msg: localText.value,
      }
      console.log(data);
      room.send(data);
    }

    function onClickVideo() {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = track.enabled ? "映像OFF" : "映像ON"));
    }

    function onClickAudio() {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getAudioTracks().forEach((track) => (audioTrigger.textContent = track.enabled ? "音声OFF" : "音声ON"));
    }
  
  });


  shareTrigger.addEventListener('click', () => {
    if (!peer.open) {
      return;
    }

    shareTrigger.style.display = 'none';
    messages.textContent += "画面を共有しました。";

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

    // for closing room members
    // room2.on('peerLeave', peerId => {
    //   const remoteVideo = remoteVideos.querySelector(
    //     `[data-peer-id=${peerId}]`
    //   );
    //   remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    //   remoteVideo.srcObject = null;
    //   remoteVideo.remove();
    // });

    // for closing myself
    room2.once('close', async () => {
      // sendTrigger.removeEventListener('click', onClickSend);
      // messages.textContent += `=== ${peer.options.userName}がルームから退出 ===\n`;
      const data = {
        type: "leave",
        name: peer.options.userName,
        msg: "",
      }
      await room2.send(data);
      mediaVideo.srcObject.getTracks().forEach(track => track.stop());
      mediaVideo.srcObject = null;
      // mediaVideo.remove();
      // .Array.from(remoteVideos.children).forEach(remoteVideo => {
      //   remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      //   remoteVideo.srcObject = null;
      //   remoteVideo.remove();

      stopTrigger.style.display = 'none';
      mediaTrigger.style.display = 'inline';
    });

    // leaveTrigger.addEventListener('click', () => room2.close(), { once: true });
    stopTrigger.addEventListener('click', () => room2.close(), { once: true });
 
  });


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
      // console.log(data);
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
    });

    // for closing room members
    room2.on('peerLeave', peerId => {
      const mediaVideo = mediaVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      mediaVideo.srcObject.getTracks().forEach(track => track.stop());
      mediaVideo.srcObject = null;
      mediaVideo.remove();
    });

    // for closing myself
    room2.once('close', async () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += `=== ${peer.options.userName}がルームから退出 ===\n`;
      const data = {
        type: "leave",
        name: peer.options.userName,
        msg: "",
      }
      await room2.send(data)
      .Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    leaveTrigger.addEventListener('click', () => room2.close(), { once: true });

  });
  

  peer.on('error', console.error);
})();