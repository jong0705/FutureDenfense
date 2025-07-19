// 유닛 분리

class MeleeUnit {
  constructor(socketId, nickname = '병사', team = 'red') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    this.x = 100;          // 고정된 시작 위치
    this.y = 650;
    this.targetX = 1600; // ✅ 원래 코드에 맞게 오른쪽 끝까지 이동
    this.targetY = 650;

    this.speed = 2;          // 느리게 움직임
    this.hp = 100;
    this.damage = 10;  
  }

  move() {
    if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) return;
    this.x += this.x < this.targetX ? this.speed : -this.speed;
  }
}

module.exports = MeleeUnit;