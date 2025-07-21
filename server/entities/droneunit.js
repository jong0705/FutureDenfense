// server/entities/droneunit.js
class DroneUnit {
  constructor(socketId, nickname = '드론', team = 'red') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    // 드론의 시작 위치 (예시)
    this.x = (team === 'red') ? 250 : 1600;
    this.y = 500; // 드론은 공중 유닛이니 y값을 다르게 줄 수도 있음

    this.hp = 50;
    this.maxHp = 50;
    this.damage = 15;
    this.range = 120;
    this.speed = 15;
    this.type = 'drone';
    this.lastAttackTime = 0;
  }

  move(target) {
    if (this.hp <= 0 || !target) return;

    const targetX = target._targetX !== undefined ? target._targetX : target.x;
    const distance = Math.abs(this.x - targetX);

    // 사거리 내면 멈춤
    if (distance <= this.range) return;

    // 타겟 쪽으로 이동
    const direction = (this.team === 'red') ? 1 : -1;
    this.x += this.speed * direction;
  }

  attack(target) {
    const targetX = target._targetX !== undefined ? target._targetX : target.x;
    const distance = Math.abs(this.x - targetX);

    if (this.team !== target.team && distance <= this.range) {
      target.hp = Math.max(0, target.hp - this.damage);
      // console.log(`💥 ${this.nickname}가 ${target.nickname || `${target.team} 타워`} 공격`);
    }
  }
}

module.exports = DroneUnit;