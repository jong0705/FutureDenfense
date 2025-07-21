// ✅ 객체들 상태를 없데이트(이동)
function processMoves(entities) {
  for (let entity of entities) {
    if (!entity.move || entity.hp <= 0) continue;

    // 가장 가까운 적 찾기 (x좌표만 사용)
    const enemies = entities.filter(e => e.team !== entity.team && e.hp > 0);
    let minDist = Infinity;
    let target = null;
    for (const e of enemies) {
      const dist = Math.abs(entity.x - e.x); // y좌표 무시
      if (dist < minDist) {
        minDist = dist;
        target = e;
      }
    }

    entity.move(target);
  }
}




function processAttacks(entities) {
  const now = Date.now();

  for (let attacker of entities) {
    if (attacker.hp <= 0 || !attacker.attack) continue;

    // 가장 가까운 적 찾기 (x좌표만 사용)
    const enemies = entities.filter(e => e.team !== attacker.team && e.hp > 0);
    let minDist = Infinity;
    let target = null;
    for (const e of enemies) {
      const dist = Math.abs(attacker.x - e.x); // y좌표 무시
      if (dist < minDist) {
        minDist = dist;
        target = e;
      }
    }

    if (!target) continue;

    const cooldown = attacker.lastAttackTime || 0;
    if (now - cooldown >= 1000) {
      attacker.attack(target);
      attacker.lastAttackTime = now;
    }
  }
  
}

module.exports = {
  processMoves,
  processAttacks
};