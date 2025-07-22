// server/entities/droneunit.js
class DroneUnit {
  constructor(socketId, nickname = '드론', team = 'red', hp, damage) {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    // 드론의 시작 위치 (예시)
    this.x = (team === 'red') ? 250 : 1600;


    // === 드론 y 애니메이션 관련 속성 ===
    this.spawnTargetY = 400;         // 최종 y좌표 (공중)
    this.spawnStartY = this.spawnTargetY + 180; // 바닥에서 시작 (조절 가능)
    this.y = this.spawnStartY;       // 처음엔 바닥에서 시작
    this.animState = 'spawn';        // 'spawn'이면 y좌표 애니메이션 중, 'move'면 정상 이동
    this.animTimer = 0;              // 애니메이션 경과 시간(ms)



    // === 능력치 ===
    this.hp = hp || 50;
    this.maxHp = hp || 50;
    this.damage = damage || 15;
    this.range = 120;
    this.speed = 10;
    this.type = 'drone';
    this.lastAttackTime = 0;
  }

  


    // x축 이동(항상 호출, y는 별도 애니메이션에서 관리)
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