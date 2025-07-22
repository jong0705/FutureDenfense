
const { gameState, gameLoopStarted } = require('./gameState');
const { processMoves, processAttacks, processDroneEffects } = require('./gameHandlers');
const { deleteRoom } = require('../utils/rooms');

// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  if (!gameState[roomId]) return;  // 방 상태가 없으면 루프 돌릴 수 없음

  const interval = setInterval(() => {
    const state = gameState[roomId];
    const entities = gameState[roomId]?.entities || [];


    // 매 틱마다 shooter의 isAttacking을 false로 초기화 (공격하는 틱에서 true로 변경경)
    for (let entity of entities) {
      if (entity.type === 'shooter') {
        entity.isAttacking = false;
      }
    }

    // ✅ 1. 이동
    processMoves(entities);

    
    // ✅ 2. 전투 처리
    processAttacks(entities);

      // === 드론 공격 이펙트 타이머 감소 ===
    processDroneEffects(entities); // 이펙트 타이머 감소


    const UNIT_REWARD = {
      melee: 100,
      shooter: 200,
      drone: 300
    };

    // 2.5. 적을 죽이면 보상을 줌.
    for(let entity of entities){
      if(entity.hp <= 0 && entity.type !== 'tower' && !entity._rewarded){
        const killedTeam = entity.team;
        const rewardTeam = killedTeam === 'red' ? 'blue' : 'red';
        const reward = UNIT_REWARD[entity.type] || 0 ;
        state.money[rewardTeam] = (state.money[rewardTeam] || 0) + reward;
        entity._rewarded = true;
      }
    }

    // ✅ 3. 죽은 유닛 정리
    state.entities = state.entities.filter(e => e.hp > 0);

    // 3.5. 타워가 공격을 받았을 때 순간 붉어지는 효과 추가가
    for (let tower of entities.filter(e => e.type === 'tower')) {
      if (tower.hp < tower.lastHp) {
        tower.hitEffectTick = 1; // 1틱(프레임)만 효과
      }
    }

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
    state.time-=50;

    console.log(
      '[서버 emit 직전] 타워 상태:',
      state.entities.filter(e => e.type === 'tower')
    );
    // ✅ 6. 현재 상태 클라이언트에 전송
    io.to(roomId).emit('gameUpdate', {
      ...state,
      entities: state.entities.map(e => ({ ...e }))
    });

    // emit 이후에 tick 감소와 lastHp 갱신
    for (let tower of entities.filter(e => e.type === 'tower')) {
      if (tower.hitEffectTick > 0) tower.hitEffectTick--;
      tower.lastHp = tower.hp;
    }

    // ✅ 7. 시간 종료 시 게임 종료
    if (state.time <= 0) {
      clearInterval(interval);
      io.to(roomId).emit('gameOver', { reason: '시간 종료' });
      delete gameState[roomId];
      delete gameLoopStarted[roomId];
      deleteRoom(roomId); // ★★★ 반드시 추가!
    }
  }, 50);  // 50ms마다 실행 (20fps 느낌)
}

module.exports = { startGameLoop };

