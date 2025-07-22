// 📁 server/entities/shooterunit.js

class ShooterUnit {
  constructor(socketId, nickname = '사수', team = 'blue', hp = 120, damage = 8) {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    if (team === 'red') {
      this.x = 250;
    } else {
      this.x = 1550;
    }

    this.y = 640;

    this.hp = hp;           // 일반 유닛보다 조금 더 튼튼
    this.maxHp = hp;
    this.speed = 10;          // 느리게 움직임
    this.range = 200;        // 공격 사거리
    this.damage = damage;        // 데미지
    this.type = 'shooter';   // 프론트에서 구분할 수 있도록
    this.isAttacking = false; // 공격격 중인지 확인

    this.lastAttackTime = 0;  // 공격 시간 간격을 위한 요소
  }

  move(target) {
    if (this.hp <= 0 || !target) return;

    const targetX = target._targetX !== undefined ? target._targetX : target.x;
    const distance = Math.abs(this.x - targetX);

    // 사거리 내면 멈춤
    if (distance <= this.range) return;

    // 타겟 쪽으로 계속 전진
    const direction = (this.team === 'red') ? 1 : -1;
    this.x += this.speed * direction;
  }

  attack(target) {
    const targetX = target._targetX !== undefined ? target._targetX : target.x;
    const distance = Math.abs(this.x - targetX);
    if (this.team !== target.team && distance <= this.range) {
      target.hp = Math.max(0, target.hp - this.damage);
      this.isAttacking = true;
      // console.log(`💥 ${this.nickname}가 ${target.nickname || `${target.team} 타워`} 공격`);
    }
  }


}


module.exports = ShooterUnit;