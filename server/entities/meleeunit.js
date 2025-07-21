// 유닛 분리

class MeleeUnit {
  constructor(socketId, nickname = '병사', team = 'red') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    // ✅ 팀에 따라 위치 다르게 설정
    if (team === 'red') {
      this.x = 100;
      this.targetX = 1600;
    } else {
      this.x = 1600;
      this.targetX = 100;
    }

    this.y = 650;
    this.targetY = 650;

    this.speed = 20;
    this.hp = 100;
    this.damage = 10;
    this.range = 30;           // 🔥 근접 사거리 명시
    this.type = 'melee';       // 🔥 타입 추가
  }
  

  move() {
    if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) return;
    this.x += this.x < this.targetX ? this.speed : -this.speed;
  
  
  }


  attack(target) {
    const distance = Math.abs(this.x - target.x);
    if (this.team !== target.team && distance <= 30) {
      target.hp -= this.damage;
    }
  }


}

module.exports = MeleeUnit;