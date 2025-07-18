console.log('✅ game.js 실행됨');  // JS 로딩 확인용



// client/js/game.js
const socket = io(); // 자동으로 서버랑 연결

socket.on('connect', () => {
  console.log('🟢 소켓 연결됨!', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 소켓 해제됨');
});
