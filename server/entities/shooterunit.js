// 📁 server/entities/shooterunit.js

class ShooterUnit {
  constructor(socketId, nickname = '사수', team = 'blue') {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    if (team === 'red') {
      this.x = 250;
      this.targetX = 1550;
    } else {
      this.x = 1550;
      this.targetX = 250;
    }

    this.y = 650;
    this.targetY = 650;

    this.hp = 120;           // 일반 유닛보다 조금 더 튼튼
    this.maxHp = 120;
    this.speed = 10;          // 느리게 움직임
    this.range = 300;        // 공격 사거리
    this.damage = 8;        // 데미지
    this.type = 'shooter';   // 프론트에서 구분할 수 있도록
  }

  
  move(towers) {
    const enemyTower = this.team === 'red' ? towers.blue : towers.red;
    const towerDist = Math.abs(this.x - enemyTower.x);
    if(towerDist <= this.range) return;
    
    if (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1) return;
    this.x += this.x < this.targetX ? this.speed : -this.speed;
  }



  attack(target) {
    const distance = Math.abs(this.x - target.x);
    if (this.team !== target.team && distance <= this.range) {
      // 예: 나중에 projectile로 바꿀 수도 있음
      target.hp -= this.damage;
    }
  }

  attackTower(tower) {
    const distance = Math.abs(this.x - tower.x);
    if (distance <= this.range) { // 100픽셀 이상 떨어져 있을 때만
      tower.hp -= this.damage;
    }
  }

  // 추후 attack() 메서드도 추가 가능
}

module.exports = ShooterUnit;