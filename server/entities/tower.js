const { TOWER_DEFAULT_STATS } = require('../config');

class Tower {
  constructor(team, hp) {
    this.team = team;

    // 위치 지정
    if (team === 'red') {
      this.x = 50;        // 왼쪽
    } else {
      this.x = 1650;      // 오른쪽
    }
    this.y = 310;
    
    const baseStats = TOWER_DEFAULT_STATS;
    this.hp = hp !== undefined ? hp : baseStats.hp;
    this.maxHp = this.hp;
    this.type = 'tower';

    this.hitEffectTick = 0;
    this.lastHp = this.hp;
  }
}

module.exports = Tower;