// ✅ 각 방의 게임 상태를 저장하는 전역 객체들
const Tower = require('../entities/tower');
const { GAME_TIME, INIT_MONEY, UNIT_DEFAULT_STATS } = require('../config');

// 방 별 상태 저장
const gameState = {};          // 각 방의 유닛/타워/시간 저장
const gameLoopStarted = {};    // 각 방의 루프 실행 여부
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// ✅ 방의 초기 상태를 설정하는 함수
function initRoomState(roomId) {
  gameState[roomId] = {
    entities: [
      new Tower('red'),
      new Tower('blue')
    ],
    time: GAME_TIME, // 게임 진행 시간간
    // 팀별 돈
    money: { ...INIT_MONEY },
    // 팀별 유닛 스탯
    unitStats: {
      red: deepClone(UNIT_DEFAULT_STATS),
      blue: deepClone(UNIT_DEFAULT_STATS)
    }
  };
  gameLoopStarted[roomId] = false;
}


module.exports = {
  gameState,
  gameLoopStarted,
  initRoomState
};
