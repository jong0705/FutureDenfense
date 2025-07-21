// ✅ 객체들 상태를 없데이트(이동)

function processMoves(entities) {
  for (let entity of entities) {
    if (!entity.move || entity.hp <= 0) continue;

    // 가장 가까운 적 하나 찾기
    const target = entities.find(e =>
      e.team !== entity.team &&
      e.hp > 0
    );

    entity.move(target);
  }
}





function processAttacks(entities) {
  const now = Date.now();

  for (let attacker of entities) {
    if (attacker.hp <= 0 || !attacker.attack) continue;

    for (let target of entities) {
      if (attacker === target || target.hp <= 0) continue;
      if (attacker.team === target.team) continue;

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