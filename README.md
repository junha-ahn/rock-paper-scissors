# rock-paper-scissors

Simple rock-paper-scissors game with WebRTC

Socket은 서버를 통한 (양방향)통신이지만, WebRTC는 P2P 통신입니다.


# 구조

```
src
│   server.js       # App entry point
└───controllers     # Express route 컨트롤러
└───config          # 환경변수
└───loaders         # 모듈 로더
└───public          # html, css, js
```

# 설명

Player A, Partner B

1. [FE] A가 최초 접속 시, `socket emit 'join-room'`
    - [`getParameterByName`](https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript) 통해 key get
2. [BE] 접속에 대한 처리, 만약 key가 없다면 `uuid pakage`를 통해 생성
    - A(Player)에게 `socket emit joined-room`
    - B(Partner)에게 `socket emit 'partner-joined-room'` 
3. [FE] Join room에 대한 처리
    - A(Player)가 `socket on joined-room` 를 통한 redirect 처리 등
    - B(Partner)가 `socket on partner-joined-room` 통해 offer 작성 후, A(Player)에게 전송
4. 이후, FE `emit call-user` => BE `emit call-made` => FE `emit make-answer` => BE `emit answer-made` 흐름
5. `dataChannel.send` && `onmessage`를 통해 가위바위보 진행

# 참조

- [퍼블리싱 관련](https://codepen.io/rafaelcastrocouto/pen/NWqgJPZ)

- [Getting Started with WebRTC](https://www.html5rocks.com/ko/tutorials/webrtc/basics/)
- [WebRTC in the real world: STUN, TURN and signaling](https://www.html5rocks.com/ko/tutorials/webrtc/infrastructure/)
- [WebRTC data channels](https://www.html5rocks.com/ko/tutorials/webrtc/datachannels/)

- [A simple RTCDataChannel sample](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample)
