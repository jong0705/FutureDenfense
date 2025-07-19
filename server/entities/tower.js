
// 📁 server/entities/tower.js

class Tower {
  constructor(team) {
    this.team = team;

    // 위치 지정
    if (team === 'red') {
      this.x = 60;        // 왼쪽
    } else {
      this.x = 1600;      // 오른쪽
    }

    this.y = 600;
    this.hp = 1000;

    this.width = 40;
    this.height = 80;
  }
}

module.exports = Tower;
