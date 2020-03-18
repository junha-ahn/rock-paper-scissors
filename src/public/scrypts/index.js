const config = {
  room: getParameterByName('key'),
  WIN: 1,
  DRAW: 0,
  LOSE: -1,
}

const socket = io();

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
  
      if (player === null || partner === null) throw new Error('선택 이전');
  
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
const game = new GameConsole()

function init() {
  const connectData = (() => {
    const connection = new RTCPeerConnection();
    const channel = connection.createDataChannel("label")
    connection.ondatachannel = function(event) {
      const channel = event.channel;
      channel.onmessage = function(event) {
        console.log('onmessage: ', event.data);
        partnerClickBtn(event.data)
      }
    }
  
    return {
      isAlreadyCalling: false,
      connection,
      channel,
    }
  })()
  const writeNotice = (game) => {
    const text = {
      [config.WIN]: '이겼습니다',
      [config.DRAW]: '비겼습니다',
      [config.LOSE]: '졌습니다',
      WATTING_PARTNER: '[파트너 미접속] 상대를 기다리고 있습니다',
      WATTING_PLAYER_CLICK: '[파트너 접속] 선택해주세요.',
      WATTING_PARTNER_CLICK: '[파트너: 접속] 상대의 선택을 기다리고 있습니다.',
    }
    const getText = (game) => {
      if (!game.partnerStatus) return text.WATTING_PARTNER
      if (!game.playerValue) return text.WATTING_PLAYER_CLICK
      if (!game.parterValue) return text.WATTING_PARTNER_CLICK
      return text[game.result]
    }
    const notice = document.querySelector('#notice');
    notice.textContent = getText(game);
  }
  const clickBtn = isPartner => value => {
    const btnList = document.querySelectorAll(`#${isPartner ? 'partner' : 'player'} .game-btn`);
    _.map(btnList, btn => {
      if (btn.id === value) {
        btn.setAttribute("class", "game-btn");
      } else {
        btn.setAttribute("class", "game-btn hidden");
      }
    })
    writeNotice(game);
  }
  const partnerClickBtn = value => {
    console.log('partnerClickBtn :: ', value)
    game.partnerValue = value 
    clickBtn(true)(value)
  }
  const playerClickBtn = ({target}) => {
    const value = target.id;
    if (!game.partnerStatus) return alert('상대를 기다려주세요')
    if (game.playerValue) return alert('중복 클릭은 불가능합니다')
    game.playerValue = value
    connectData.channel.send(value);
    clickBtn(false)(value)
  };
  const initHTML = () => {
    const initBtn = () => {
      function makeBtn(name, isPartner) {
        const btn = document.createElement("span");
        btn.setAttribute("id", name);
        btn.innerHTML = name === "rock" ? `✊` : name === "paper" ? `🤚` : `✌️`;
        btn.setAttribute("class", "game-btn");
  
        if (isPartner) btn.classList.add("hidden");
        else btn.addEventListener('click', playerClickBtn);
  
        return btn
      }
      const partner = document.querySelector('#partner');
      const player = document.querySelector('#player');
      partner.appendChild(makeBtn('rock', true));
      partner.appendChild(makeBtn('paper', true));
      partner.appendChild(makeBtn('scissor', true));
      
      player.appendChild(makeBtn('rock'));
      player.appendChild(makeBtn('paper'));
      player.appendChild(makeBtn('scissor'));
    }
    initBtn()
    writeNotice(game)
  }
  
  socket.emit("join-room", {
    room: config.room,
  });

  socket.on("joined-room", (data) => {
    if (!data.status) return alert('이미 가득찬 방입니다');
    if (config.room !== data.room) location.href = "/?key=" + data.room;
    if (data.partner) game.partnerStatus = true;
    writeNotice(game)
  });
  socket.on("partner-join-room", ({
    partnerId,
  }) => {
    game.partnerStatus = true;
    callUser(partnerId);
    writeNotice(game)
  });
  socket.on("partner-out-room", (data) => {
    game.partnerStatus = false;
    connectData.isAlreadyCalling = false;
    writeNotice(game)
  });

  socket.on("call-made", async (data) => {
    console.log('on call-made')
    // 받은 offer에 대한 설정 후, answer 전달
    await connectData.connection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await connectData.connection.createAnswer();
    await connectData.connection.setLocalDescription(new RTCSessionDescription(answer));
  
    socket.emit("make-answer", {
      answer,
      to: data.id
    });
    getCalled = true;
  });
  socket.on("answer-made", async data => {
    await connectData.connection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  
    if (!connectData.isAlreadyCalling) {
      connectData.isAlreadyCalling = true;
      callUser(data.id);
    }
  });

  async function callUser(socketId) {
    const offer = await connectData.connection.createOffer();  
    connectData.connection.setLocalDescription(new RTCSessionDescription(offer));
    // offer 작성 후, 파트너에게 전송

    socket.emit("call-user", {
      offer,
      to: socketId
    });
  }
  

  initHTML()
}
  

init()

