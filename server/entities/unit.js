// 유닛 분리

class Unit {
  constructor(socketId, nickname = '병사', team = 'red') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    this.x = 100;          // 고정된 시작 위치
    this.y = 400;

    this.targetX = 100000; // ✅ 원래 코드에 맞게 오른쪽 끝까지 이동
    this.targetY = 400;

    this.hp = 100;
  }

  move() {
    // 목표 위치에 도달했으면 이동 안 함
    if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) return;

    // x축 이동 (속도: +3 / -1)
    if (this.x < this.targetX) this.x += 3;
    if (this.x > this.targetX) this.x -= 1;

    // y축 이동은 잠시 비활성화
    // if (this.y < this.targetY) this.y += 1;
    // if (this.y > this.targetY) this.y -= 1;
  }
}

module.exports = Unit;
