// ✅ 객체들 상태를 없데이트(이동)
function processMoves(entities) {
  for (let entity of entities) {
    if (!entity.move || entity.hp <= 0) continue;



    // === 드론 y좌표 애니메이션 처리 ===
    if (entity.type === 'drone' && entity.animState === 'spawn') {
      entity.animTimer += 50; // processMoves가 50ms마다 호출된다고 가정
      const duration = 500;   // 애니메이션 총 시간(ms)
      const t = Math.min(entity.animTimer / duration, 1);
      // y좌표를 보간해서 점점 올라가게 함
      entity.y = entity.spawnStartY + (entity.spawnTargetY - entity.spawnStartY) * t;
      // 애니메이션이 끝나면 상태 전환
      if (t >= 1) {
        entity.y = entity.spawnTargetY;
        entity.animState = 'move';
      }
    }

    // === 기존 x좌표 이동 로직 ===


    let minDist = Infinity;
    let target = null;
    for (let e of entities) {
      if (e.team === entity.team || e.hp <= 0) continue;

      let targetX = e.x;
      if(e.type === 'tower' && entity.team === 'blue'){
        targetX = e.x + 200;
      }
      if(e.type === 'tower' && entity.team === 'red'){
        targetX = e.x - 60;
      }

      const dist = Math.abs(entity.x - targetX); // 필요시 y좌표도 포함
      if (dist < minDist) {
        minDist = dist;
        target = e;
        target._targetX = targetX;
      }
    }

    entity.move(target);
  }
}



//공격 함수

function processAttacks(entities) {
  const now = Date.now();

  for (let attacker of entities) {
    if (attacker.hp <= 0 || !attacker.attack) continue;

    let minDist = Infinity;
    let target = null;
    let unitTarget = null;
    let unitMinDist = Infinity;
    let towerTarget = null;
    let towerMinDist = Infinity;

    for (let e of entities) {
      if (attacker === e || e.hp <= 0) continue;
      if (attacker.team === e.team) continue;

      if (attacker.type === 'melee' && e.type === 'drone') continue; //드론은 공격 못함

      let targetX = e.x;
      
      if(e.type === 'tower' && attacker.team === 'blue'){
        targetX = e.x + 200;
      }
      if(e.type === 'tower' && attacker.team === 'red'){
        targetX = e.x - 60;
      }

      let effectiveRange = attacker.range;
      if (attacker.type === 'melee' && e.type === 'shooter') {
        effectiveRange = attacker.range + 40;
      }

      const dist = Math.abs(attacker.x - targetX);
      if (dist <= effectiveRange) {
        if (e.type !== 'tower' && dist < unitMinDist) {
          unitMinDist = dist;
          unitTarget = e;
          unitTarget._targetX = targetX;
        }
        if (e.type === 'tower' && dist < towerMinDist) {
          towerMinDist = dist;
          towerTarget = e;
          towerTarget._targetX = targetX;
        }
      }
    }

    // 적 유닛이 사거리 내에 있으면 유닛을, 없으면 타워를 공격
    target = unitTarget || towerTarget;

    if (target) {
      const cooldown = attacker.lastAttackTime || 0;
      if (now - cooldown >= 1000) {
        attacker.attack(target);
        attacker.lastAttackTime = now;
      }
    }
  }
}

// 드론 공격 이펙트 타이머 감소 함수
function processDroneEffects(entities) {
  for (let entity of entities) {
    if (entity.type === 'drone' && entity.laserEffectTimer > 0) {
      entity.laserEffectTimer = Math.max(0, entity.laserEffectTimer - 50);
    }
  }
}

module.exports = {
  processMoves,
  processAttacks,
  processDroneEffects
};