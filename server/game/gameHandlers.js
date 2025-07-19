// ✅ 유닛 이동 및 타워 데미지 처리 함수 모음

function updateUnits(units) {
  for (let unit of units) {
    if (unit.hp <= 0) continue;  // 이미 죽은 유닛은 무시

    // 목표 지점 도달 여부 확인
    const arrived = Math.abs(unit.x - unit.targetX) < 1 && Math.abs(unit.y - unit.targetY) < 1;
    if (arrived) continue;

    unit.move();  // 유닛 이동
  }
}

function handleTowerDamage(units, towers) {
  for (let unit of units) {
    if (unit.hp <= 0) continue;  // 죽은 유닛은 무시

    // 레드 유닛이 블루 타워 근처 도달
    if (unit.team === 'red' && unit.x >= towers.blue.x - 10) {
      towers.blue.hp = Math.max(0, towers.blue.hp - unit.damage);
      unit.hp = 0;  // 자폭
    }

    // 블루 유닛이 레드 타워 근처 도달
    if (unit.team === 'blue' && unit.x <= towers.red.x + 10) {
      towers.red.hp = Math.max(0, towers.red.hp - unit.damage);
      unit.hp = 0;  // 자폭
    }
  }
}

module.exports = {
  updateUnits,
  handleTowerDamage
};