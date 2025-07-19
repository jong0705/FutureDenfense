// 📁 server/entities/shooterunit.js

class ShooterUnit {
  constructor(socketId, nickname = '사수', team = 'blue') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    this.x = 1200;           // blue팀은 오른쪽에서 시작
    this.y = 300;
    this.targetX = 0;        // 왼쪽으로 이동
    this.targetY = 300;

    this.hp = 120;           // 일반 유닛보다 조금 더 튼튼
    this.speed = 2;          // 느리게 움직임
    this.range = 300;        // 공격 사거리
    this.damage = 40;        // 데미지
    this.type = 'shooter';   // 프론트에서 구분할 수 있도록
  }

  move() {
    if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) return;
    this.x += this.x < this.targetX ? this.speed : -this.speed;
  }

  // 추후 attack() 메서드도 추가 가능
}

module.exports = ShooterUnit;
