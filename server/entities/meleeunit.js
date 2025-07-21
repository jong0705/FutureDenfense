class MeleeUnit {
  constructor(socketId, nickname = '병사', team = 'red') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    this.x = (team === 'red') ? 100 : 1600;
    this.y = 600;

    this.hp = 100;
    this.damage = 10;
    this.range = 30;
    this.speed = 20;
    this.type = 'melee';
    this.lastAttackTime = 0;
  }

  move(target) {
    if (this.hp <= 0 || !target) return;

    const distance = Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2));

    // 사거리 내면 멈춤
    if (distance <= this.range) return;

    // 타겟 쪽으로 계속 전진
    const direction = (this.team === 'red') ? 1 : -1;
    this.x += this.speed * direction;
  }

  attack(target) {
    const distance = Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2));    
      if (this.team !== target.team && distance <= this.range) {
      target.hp = Math.max(0, target.hp - this.damage);
      console.log(`💥 ${this.nickname}가 ${target.nickname || `${target.team} 타워`} 공격`);
    }
  }
}

module.exports = MeleeUnit;
