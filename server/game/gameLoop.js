
const { gameState, gameLoopStarted } = require('./gameState');
const { processMoves, processAttacks } = require('./gameHandlers');
const { deleteRoom } = require('../utils/rooms');

// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  if (!gameState[roomId]) return;  // 방 상태가 없으면 루프 돌릴 수 없음

  const interval = setInterval(() => {
    const state = gameState[roomId];
    const entities = state.entities;


    // ✅ 1. 이동
    processMoves(entities);

    // ✅ 2. 전투 처리
    processAttacks(entities);

    for(let entity of entities){
      if(entity.hp <= 0 && entity.type !== 'tower' && !entity._rewarded){
        const killedTeam = entity.team;
        const rewardTeam = killedTeam === 'red' ? 'blue' : 'red';
        state.money[rewardTeam] = (state.money[rewardTeam] || 0) + 50;
        entity._rewarded = true;
      }
    }

    // ✅ 3. 죽은 유닛 정리
    state.entities = state.entities.filter(e => e.hp > 0);

    // ✅ 4. 게임 종료 조건 체크 (타워 체력)
    // ✅ 타워 죽었는지 확인
    const redTower = entities.find(e => e.type === 'tower' && e.team === 'red');
    const blueTower = entities.find(e => e.type === 'tower' && e.team === 'blue');
    if (redTower?.hp <= 0 || blueTower?.hp <= 0) {
      clearInterval(interval);
      const winner = redTower.hp <= 0 ? 'blue' : 'red';
      io.to(roomId).emit('gameOver', { reason: `🏆 ${winner} 팀 승리!` });
      delete gameState[roomId];
      delete gameLoopStarted[roomId];
      deleteRoom(roomId); // ★★★ 반드시 추가!
      return;
    }

    // ✅ 5. 남은 시간 감소
    state.time--;

    // ✅ 6. 현재 상태 클라이언트에 전송
    io.to(roomId).emit('gameUpdate', state);

    // ✅ 7. 시간 종료 시 게임 종료
    if (state.time <= 0) {
      clearInterval(interval);
      io.to(roomId).emit('gameOver', { reason: '시간 종료' });
      delete gameState[roomId];
      delete gameLoopStarted[roomId];
      deleteRoom(roomId); // ★★★ 반드시 추가!
    }
  }, 50);  // 100ms마다 실행 (10fps 느낌)
}

module.exports = { startGameLoop };

