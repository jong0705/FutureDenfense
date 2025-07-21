// ✅ 객체들 상태를 없데이트(이동)

function processMoves(entities) {
  for (let entity of entities) {
    if (!entity.move || entity.hp <= 0) continue;

    let minDist = Infinity;
    let target = null;
    for (let e of entities) {
      if (e.team === entity.team || e.hp <= 0) continue;
      const dist = Math.abs(entity.x - e.x); // 필요시 y좌표도 포함
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

    // 가장 가까운 적 찾기 (공격 사거리 내에서)
    let minDist = Infinity;
    let target = null;
    for (let e of entities) {
      if (attacker === e || e.hp <= 0) continue;
      if (attacker.team === e.team) continue;
      const dist = Math.abs(attacker.x - e.x);
      if (dist < minDist && dist <= (attacker.range || 50)) { // 사거리 체크
        minDist = dist;
        target = e;
      }
    }

    if (target) {
      const cooldown = attacker.lastAttackTime || 0;
      if (now - cooldown >= 1000) {
        attacker.attack(target);
        attacker.lastAttackTime = now;
      }
    }
  }
}

module.exports = {
  processMoves,
  processAttacks
};