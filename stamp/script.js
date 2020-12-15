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

  // const videoTrigger = document.getElementById('js-video-trigger');
  // const audioTrigger = document.getElementById('js-audio-trigger');
  // const videos = document.getElementById('videos');
  const userName = document.getElementById('js-user-name');
  const videos = document.getElementById('videos');
  const testButton = document.getElementById('test')
  // const localWrapVideo = document.getElementById('local-wrap-video');

  var dummy = document.createElement("div")
  dummy.id = 'dummy';
  remoteVideos.appendChild(dummy);

  const stamps = document.getElementsByClassName('stamp');
  const localStamp = document.getElementById('local-stamp');
  // [...stamps].forEach(b => {
  //   b.addEventListener('click', () => {
  //     console.log(b.value);
  //     localStamp.src = '../img/' + b.value + '.svg';
  //   })
  // })


  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );

  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false,
    })
    .catch(console.error);

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  // eslint-disable-next-line require-atomic-updates
  const peer = (window.peer = new Peer({
    key: '649c67ae-3ae7-44b9-b389-41059053788c',
    debug: 3,
    // username: "a",
  }));

  // Register join handler
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    scrollTo(0, 50);

    // localStream.__proto__.userName = userName.value;
    // console.log(localStream)
    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
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

      dummy.appendChild(nameTag);

    });
    room.on('peerJoin', peerId => {
      // messages.textContent += `=== ${peerId} joined ===\n`;
      // messages.textContent += `=== A member joined ===\n`;
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
      // const newVideo = document.createElement('video');
      // newVideo.id = `${setId}_video`;
      // newVideo.srcObject = stream;
      // newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      // newVideo.setAttribute('data-peer-id', stream.peerId);
      // console.log(stream)
      // console.log(stream.peerId)
      var setId = stream.peerId
      // console.log(peer)
      // console.log(peer.options[setId])
      var name = peer.options[setId]
      // console.log(room)

      const wrapVideo = document.createElement('div');
      wrapVideo.className = "wrap-video";
      
      const nameTag = document.createElement('div');
      nameTag.className = "name";
      nameTag.id = `${setId}_tag`;
      nameTag.textContent = name;

      // wrapVideo.appendChild(newVideo);
      // wrapVideo.appendChild(nameTag);
      // remoteVideos.append(wrapVideo);

      // remoteVideos.append(newVideo);
      // await newVideo.play().catch(console.error);

      const newStamp = document.createElement('img');
      newStamp.id = `${setId}_stamp`;
      const area = document.createElement('div');
      area.className = 'stamp-area';
      area.id = `${setId}_area`;
      area.appendChild(newStamp);
      area.appendChild(nameTag);
      remoteVideos.append(area);
    });

    // room.on('data', ({ data, src }) => {
    //   // Show a message sent to the room and who sent
    //   messages.textContent += `${src}: ${data}\n`;
    // });
    room.on('data', ({ data }) => {
      // Show a message sent to the room and who sent
      console.log(data)
      switch(data.type) {
        case 'join':
          var setId = data.id;
          var setName = data.name;
          peer.options[setId] = setName
          console.log(peer)
      
          const nameTag = document.getElementById(setId + '_tag');
          nameTag.textContent = setName;
          
          messages.textContent += `=== ${data.name}が参加 ===\n`;
          break;
        case 'msg':
          messages.textContent += `${data.name}: ${data.msg}\n`;
          break;
        case 'leave':
          messages.textContent += `=== ${data.name}が退出 ===\n`;
          break;
        case 'stamp':
          console.log(data);
          getStamp(data.id, data.value)
          break;
        default:
          console.log('no-type');
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

      // messages.textContent += `=== ${peerId} left ===\n`;
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
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });
    // videoTrigger.addEventListener('click', onClickVideo);
    // audioTrigger.addEventListener('click', onClickAudio);

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

      // messages.textContent += `${peer.id}: ${localText.value}\n`;
      messages.textContent += `${peer.options.userName}: ${localText.value}\n`;
      localText.value = '';
      console.log(peer);
      // console.log(peer.options.debug);
      // console.log(Members);
    }

    function onClickVideo() {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getVideoTracks().forEach((track) => (videoTrigger.textContent = track.enabled ? "映像OFF" : "映像ON"));
    }

    function onClickAudio() {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      localStream.getAudioTracks().forEach((track) => (audioTrigger.textContent = track.enabled ? "音声OFF" : "音声ON"));
    }  

    function getStamp(userId, stamp) {
      const newStamp = document.getElementById(`${userId}_stamp`)
      newStamp.src = `../img/${stamp}.svg`;
    }

    // const stamps = document.getElementsByClassName('stamp');
    [...stamps].forEach(b => {
      console.log(b);
      b.addEventListener('click', () => {
        console.log(b.value);
        localStamp.src = `../img/${b.value}.svg`;
        // localStamp.src = '../img/' + b.value + '.svg';
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

  });

  peer.on('error', console.error);
})();
