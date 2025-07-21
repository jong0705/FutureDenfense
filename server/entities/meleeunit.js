// 유닛 분리

class MeleeUnit {
  constructor(socketId, nickname = '병사', team = 'red') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    // ✅ 팀에 따라 위치 다르게 설정
    if (team === 'red') {
      this.x = 250;
      this.targetX = 1600;
    } else {
      this.x = 1600;
      this.targetX = 250;
    }

    this.y = 680;
    this.targetY = 680;

    this.speed =10;
    this.hp = 100;
    this.maxHp = 100;
    this.damage = 10;
  }
  

  move() {
    if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) return;
    this.x += this.x < this.targetX ? this.speed : -this.speed;
  }
  attack(target) {
    const distance = Math.abs(this.x - target.x);
    if (this.team !== target.team && distance <= 50) {
      target.hp -= this.damage;
    }
  }


}

module.exports = MeleeUnit;