// 📁 server/game/gameState.js

// ✅ 각 방의 게임 상태를 저장하는 전역 객체들
const Tower = require('../entities/tower');

// 방 별 상태 저장
const gameState = {};          // 각 방의 유닛/타워/시간 저장
const gameLoopStarted = {};    // 각 방의 루프 실행 여부

// ✅ 방의 초기 상태를 설정하는 함수
function initRoomState(roomId) {
  gameState[roomId] = {
    entities: [  // ✅ 유닛은 나중에 push로 추가됨
      new Tower('red'),
      new Tower('blue')
    ],
    time: 100000
  };
  gameLoopStarted[roomId] = false;
}


module.exports = {
  gameState,
  gameLoopStarted,
  initRoomState
};
