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
  const towerWidth = 200;

  for (let unit of units) {
    if (unit.hp <= 0) continue;

    const range = unit.range || 30;  // 근접 유닛은 range 없으면 30

    if (unit.team === 'red') {
      const towerX = towers.blue.x;
      const towerCenter = towerX + towerWidth / 2;
      const distance = Math.abs(unit.x - towerCenter);

      if (distance <= range) {
        towers.blue.hp = Math.max(0, towers.blue.hp - unit.damage);
        unit.hp = 0;
        console.log(`💥 레드 유닛(${unit.type})이 블루 타워 타격! 거리: ${distance}`);
      }
    }

    if (unit.team === 'blue') {
      const towerX = towers.red.x;
      const towerCenter = towerX + towerWidth / 2;
      const distance = Math.abs(unit.x - towerCenter);

      if (distance <= range) {
        towers.red.hp = Math.max(0, towers.red.hp - unit.damage);
        unit.hp = 0;
        console.log(`💥 블루 유닛(${unit.type})이 레드 타워 타격! 거리: ${distance}`);
      }
    }
  }
}



module.exports = {
  updateUnits,
  handleTowerDamage
};