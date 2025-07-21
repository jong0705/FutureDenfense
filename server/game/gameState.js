// 📁 server/game/gameState.js

// ✅ 각 방의 게임 상태를 저장하는 전역 객체들
const Tower = require('../entities/tower');

// 방 별 상태 저장
const gameState = {};          // 각 방의 유닛/타워/시간 저장
const gameLoopStarted = {};    // 각 방의 루프 실행 여부

// ✅ 방의 초기 상태를 설정하는 함수
function initRoomState(roomId) {
  gameState[roomId] = {
    units: [],                 // 유닛 목록
    time: 100000,                 // 남은 시간
    towers: {
      red: new Tower('red'),  // 빨간팀 타워
      blue: new Tower('blue') // 파란팀 타워
    }
  };
  gameLoopStarted[roomId] = false;
}

module.exports = {
  gameState,
  gameLoopStarted,
  initRoomState
};
