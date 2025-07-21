
const { gameState, gameLoopStarted } = require('./gameState');
const { updateUnits, handleTowerDamage } = require('./gameHandlers');

// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  if (!gameState[roomId]) return;  // 방 상태가 없으면 루프 돌릴 수 없음

  const interval = setInterval(() => {
    const state = gameState[roomId];

    // ✅ 1. 유닛 이동
    updateUnits(state.units);

    // ✅ 1.5 유닛 전투 처리
    processAttacks(state.units);

    // ✅ 2. 타워 데미지 계산
    handleTowerDamage(state.units, state.towers);

    // ✅ 3. 죽은 유닛 정리
    state.units = state.units.filter(unit => unit.hp > 0);

    // ✅ 4. 게임 종료 조건 체크 (타워 체력)
    if (state.towers.red.hp <= 0 || state.towers.blue.hp <= 0) {
      clearInterval(interval);
      const winner = state.towers.red.hp <= 0 ? 'blue' : 'red';
      io.to(roomId).emit('gameOver', { reason: `🏆 ${winner} 팀 승리!` });
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
    }
  }, 100);  // 100ms마다 실행 (10fps 느낌)
}


function processAttacks(units) {
  for (let attacker of units) {
    for (let target of units) {
      if (attacker.id === target.id) continue;
      attacker.attack?.(target);  // 클래스별 attack 메서드가 처리
    }
  }

  // 죽은 유닛 제거는 여기서 한 번만
  return units.filter(u => u.hp > 0);
}

module.exports = { startGameLoop, processAttacks };

