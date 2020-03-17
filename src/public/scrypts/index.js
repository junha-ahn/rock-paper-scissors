const config = {
  WIN: '이겼습니다',
  DRAW: '비겼습니다',
  LOSE: '졌습니다',
}

const room = getParameterByName('key');

// class GameConsole 
// value private화를 위한, IIFE return class
const GameConsole = (() => { 
  const partnerStatus = Symbol('player');
  const playerValue = Symbol('playerValue');
  const partnerValue = Symbol('partnerValue');

  return class {
    constructor(_partnerStatus = false) {
      this[partnerStatus] = _partnerStatus;
      this[playerValue] = null;
      this[partnerValue] = null;
    }
    set playerValue(value) { 
      if (value) this[playerValue] = value 
    }
    set partnerValue(value) { 
      if (value) this[partnerValue] = value
    }
    set partnerStatus(value) { 
      if (value) this[partnerStatus] = value
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

  const gameOver = () => {
    try {
      const result = game.result;
      makeNotice(result);
    } catch {
      makeNotice('선택을 기다리고 있습니다')
    }
  }

  const clickBtn = isPartner => value => {
    if (isPartner) { 
      game.partnerValue = value 
    }
    else {
      if (!game.partnerStatus) return alert('상대를 기다려주세요')
      game.playerValue = value
    }

    const btnList = document.querySelectorAll(`#${isPartner ? 'partner' : 'player'} .game-btn`);
    _.map(btnList, btn => {
      if (btn.id === value) {
        btn.setAttribute("class", "game-btn");
      } else {
        btn.setAttribute("class", "game-btn hidden");
      }
    })
    gameOver();
  }
  const partnerClickBtn = value => {
    clickBtn(true)(value)
  }
  const playerClickBtn = ({target}) => {
    if (game.playerValue) return alert('중복 클릭은 불가능합니다')
    clickBtn(false)(target.id)
  };
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
  const makeNotice = (text = '상대를 기다리고 있습니다') => {
    const notice = document.querySelector('#notice');
    notice.textContent = text
  }
  initBtn()
  makeNotice()
}

init()

const socket = io();

socket.emit("join-room", {
  room,
});

socket.on("joined-room", (data) => {
  if (!data.status) return alert('이미 가득찬 방입니다');
  if (room !== data.room) location.href = "/?key=" + data.room;
  if (data.partner) game.partnerStatus = true;
});
socket.on("partner-joined-room", (data) => {
  game.partnerStatus = true;
});