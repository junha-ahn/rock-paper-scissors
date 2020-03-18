const config = {
  room: getParameterByName('key'),
  WIN: 1,
  DRAW: 0,
  LOSE: -1,
}
const GameConsole = (() => { 
  // class GameConsole 
  // value private화를 위한, IIFE return class
  const partnerStatus = Symbol('player');
  const playerValue = Symbol('playerValue');
  const partnerValue = Symbol('partnerValue');

  return class {
    constructor() {
      this[partnerStatus] = false;
      this[playerValue] = null;
      this[partnerValue] = null;
    }
    set playerValue(value) { 
      this[playerValue] = value 
    }
    set partnerValue(value) { 
      this[partnerValue] = value
    }
    set partnerStatus(value) { 
      this[partnerStatus] = value
    }
    get playerValue() { return this[playerValue] }
    get partnerValue() { return this[partnerValue] }
    get partnerStatus() { return this[partnerStatus] }

    get result() {
      const player = this.playerValue;
      const partner = this.partnerValue;
  
      if (!(hasValue(player) && hasValue(partner))) throw new Error('선택 이전');
  
      if (player === partner) return config.DRAW;
      if (player === 'rock') {
        if (partner === 'scissor') return config.WIN
        if (partner === 'paper') return config.LOSE
      }
      if (player === 'scissor') {
        if (partner === 'paper') return config.WIN
        if (partner === 'rock') return config.LOSE
      }
      if (player === 'paper') {
        if (partner === 'rock') return config.WIN
        if (partner === 'scissor') return config.LOSE
      }
    }
  }
})()
const socket = io();

function init() {
  const game = new GameConsole()

  let isAlreadyCalling = false
  const perrConnection = new RTCPeerConnection()
  const dataChannel = perrConnection.createDataChannel("label")
  perrConnection.ondatachannel = function(event) {
    const channel = event.channel;
    channel.onmessage = function(event) {
      console.log('onmessage: ', event.data);
      clickBtn(true)(event.data)
    }
  }

  function writeNotice() {
    const text = {
      [config.WIN]: '이겼습니다',
      [config.DRAW]: '비겼습니다',
      [config.LOSE]: '졌습니다',
      WATTING_PARTNER: '[파트너 미접속] 상대를 기다리고 있습니다',
      WATTING_PLAYER_CLICK: '[파트너 접속] 선택해주세요.',
      WATTING_PARTNER_CLICK: '[파트너: 접속] 상대의 선택을 기다리고 있습니다.',
    }
    const getText = (game) => {
      try {
        return text[game.result] // 이미 완료된 게임일 경우, 항상 같은 결과 Return
      } catch {
        if (!game.partnerStatus) return text.WATTING_PARTNER
        if (!hasValue(game.playerValue)) return text.WATTING_PLAYER_CLICK
        if (!hasValue(game.partnerValue)) return text.WATTING_PARTNER_CLICK
      }
    }
    const notice = document.querySelector('#notice');
    notice.textContent = getText(game);
  }
  function resetBtn(first) {
    // .game-btn 노출/숨김처리 관련 함수
    const partners = document.querySelectorAll(`#partner .game-btn`);
    const players = document.querySelectorAll(`#player .game-btn`);
    _.forEach(players, btn => {
      if (first) btn.addEventListener('click', (event) => {  clickBtn(false)(event.target.getAttribute("value")) });
      btn.setAttribute("class", "game-btn");
      if (hasValue(game.playerValue) && btn.getAttribute("value") !== game.playerValue) {
        btn.setAttribute("class", "game-btn hidden");
      }
    })
    _.forEach(partners, btn => {
      btn.setAttribute("class", "game-btn hidden");
      if (game.playerValue && btn.getAttribute("value") === game.partnerValue) {
        btn.setAttribute("class", "game-btn");
      }
    })
  }
  function initPage(first) {
    resetBtn(first)
    writeNotice()
  }
  function clickBtn(isPartner) {
    return value => {
      try { 
        if (isPartner) {
          game.partnerValue = value
        } else {
          if (!game.partnerStatus) throw new Error('상대를 기다려주세요')
          if (game.playerValue) throw new Error('중복 클릭은 불가능합니다')
          game.playerValue = value
          dataChannel.send(value);
        }
        initPage()
      } catch (e) {
        alert(e.message)
      }
    }
  }
  
  socket.emit("join-room", {
    room: config.room,
  });

  socket.on("joined-room", (data) => {
    if (!data.status) return alert('이미 가득찬 방입니다');
    if (config.room !== data.room) location.href = "/?key=" + data.room;
    if (data.partner) game.partnerStatus = true;
    writeNotice()
  });
  socket.on("partner-join-room", ({
    partnerId,
  }) => {
    game.partnerStatus = true;
    callUser(partnerId);
    writeNotice()
  });
  socket.on("partner-out-room", (data) => {
    game.partnerStatus = false;
    // isAlreadyCalling = false;
    writeNotice()
  });

  socket.on("call-made", async (data) => {
    // 받은 offer에 대한 설정 후, answer 전달
    await perrConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await perrConnection.createAnswer();
    await perrConnection.setLocalDescription(new RTCSessionDescription(answer));
  
    socket.emit("make-answer", {
      answer,
      to: data.id
    });
    getCalled = true;
  });
  socket.on("answer-made", async data => {
    await perrConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  
    if (!isAlreadyCalling) {
      isAlreadyCalling = true;
      callUser(data.id);
    }
  });

  async function callUser(socketId) {
    const offer = await perrConnection.createOffer();  
    perrConnection.setLocalDescription(new RTCSessionDescription(offer));
    // offer 작성 후, 파트너에게 전송

    socket.emit("call-user", {
      offer,
      to: socketId
    });
  }
  
  initPage(true)
}
init()

