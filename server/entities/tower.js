
// 📁 server/entities/tower.js

class Tower {
  constructor(team) {
    this.team = team;

    // 위치 지정
    if (team === 'red') {
      this.x = 50;        // 왼쪽
    } else {
      this.x = 1650;      // 오른쪽
    }

    this.y = 460;
    this.hp = 1000;
    this.maxHp = 1000;
    this.type = 'tower'

  }
}

module.exports = Tower;