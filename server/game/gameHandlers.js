// ✅ 유닛 이동 및 타워 데미지 처리 함수 모음

function updateUnits(units, towers) {
  for (let unit of units) {
    if (unit.hp <= 0) continue;  // 이미 죽은 유닛은 무시

    // 목표 지점 도달 여부 확인
    const arrived = Math.abs(unit.x - unit.targetX) < 1 && Math.abs(unit.y - unit.targetY) < 1;
    if (arrived) continue;

    if (unit.type === 'shooter') {
      // 1. 사정거리 내 가장 가까운 적 찾기
      let closest = null;
      let minDist = Infinity;
      for (let other of units) {
        if (unit.id === other.id || unit.team === other.team || other.hp <= 0) continue;
        const dist = Math.abs(unit.x - other.x);
        if (dist <= unit.range && dist < minDist) {
          minDist = dist;
          closest = other;
        }
      }

      if (closest) {
        // 적이 사정거리 내에 있으면 이동하지 않음(공격은 processAttacks에서)
        continue;
      } else {
        // 적이 없으면, 타워 100픽셀 앞에서 멈춤
        const enemyTower = unit.team === 'red' ? towers.blue : towers.red;
        const towerDist = Math.abs(unit.x - enemyTower.x);
        if (towerDist <= 100) {
          continue; // 100픽셀 앞에서 멈춤
        }
        // 그 외에는 이동
        unit.move(towers);
      }
    } else {
      // melee 등은 기존 로직(공격 범위 내 적이 있으면 멈춤)
      let enemyInRange = false;
      for (let other of units) {
        if (unit.id === other.id || unit.team === other.team || other.hp <= 0) continue;
        const dist = Math.abs(unit.x - other.x);
        const attackRange = 50;
        if (dist <= attackRange) {
          enemyInRange = true;
          break;
        }
      }
      if (!enemyInRange) {
        unit.move();
      }
    }
  }
}

function handleTowerDamage(units, towers) {
  for (let unit of units) {
    if (unit.hp <= 0) continue;  // 죽은 유닛은 무시

    // 레드 유닛이 블루 타워 근처 도달
    if (unit.team === 'red' && unit.x >= unit.targetX) {
      towers.blue.hp = Math.max(0, towers.blue.hp - unit.damage);
      unit.hp = 0;  // 자폭
    }

    // 블루 유닛이 레드 타워 근처 도달
    if (unit.team === 'blue' && unit.x <= unit.targetX) {
      towers.red.hp = Math.max(0, towers.red.hp - unit.damage);
      unit.hp = 0;  // 자폭
    }
  }
}

module.exports = {
  updateUnits,
  handleTowerDamage
};