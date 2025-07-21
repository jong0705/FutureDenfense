
const { gameState, gameLoopStarted } = require('./gameState');
const { updateUnits, handleTowerDamage } = require('./gameHandlers');

// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  if (!gameState[roomId]) return;  // 방 상태가 없으면 루프 돌릴 수 없음

  const interval = setInterval(() => {
    const state = gameState[roomId];

    // ✅ 1. 유닛 이동
    updateUnits(state.units, state.towers);

    // ✅ 1.5 유닛 전투 처리
    processAttacks(state.units, state.towers);

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
  }, 50);  // 100ms마다 실행 (10fps 느낌)
}


function processAttacks(units, towers) {
  for (let attacker of units) {
    if (attacker.hp <= 0) continue;

    if (attacker.type === 'shooter') {
      // 사정거리 내 가장 가까운 적 유닛 찾기
      let closest = null;
      let minDist = Infinity;
      for (let target of units) {
        if (attacker.id === target.id || attacker.team === target.team || target.hp <= 0) continue;
        const dist = Math.abs(attacker.x - target.x);
        if (dist <= attacker.range && dist < minDist) {
          minDist = dist;
          closest = target;
        }
      }
      if (closest) {
        attacker.attack?.(closest);
      } else {
        // 적이 없으면 타워 공격
        const enemyTower = attacker.team === 'red' ? towers.blue : towers.red;
        const towerDist = Math.abs(attacker.x - enemyTower.x);
        // 타워 100픽셀 앞에서 멈추고, 사정거리 내면 공격
        if (towerDist <= attacker.range && towerDist >= 100) {
          attacker.attackTower?.(enemyTower);
        }
      }
    } else {
      // melee 등은 기존처럼 모든 적을 대상으로 attack
      for (let target of units) {
        if (attacker.id === target.id) continue;
        attacker.attack?.(target);
      }
    }
  }

  // 죽은 유닛 제거는 여기서 한 번만
  return units.filter(u => u.hp > 0);
}

module.exports = { startGameLoop, processAttacks };

