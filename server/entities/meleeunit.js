const { UNIT_DEFAULT_STATS } = require('../config');

class MeleeUnit {
  constructor(socketId, nickname = '병사', team = 'red', hp, damage, speed, range) {
    const timestamp = Date.now();

    this.id = `${socketId}-${timestamp}`;
    this.nickname = nickname;
    this.team = team;

    this.x = (team === 'red') ? 250 : 1600;
    this.y = 520;

    const baseStats = UNIT_DEFAULT_STATS.melee;
    this.hp = hp !== undefined ? hp : baseStats.hp;
    this.maxHp = this.hp;
    this.damage = damage !== undefined ? damage : baseStats.damage;
    this.range = range !== undefined ? range : baseStats.range;
    this.speed = speed !== undefined ? speed : baseStats.speed;
    this.type = 'melee';
    this.lastAttackTime = 0;
  }

  move(target) {
    if (this.hp <= 0 || !target) return;

    let effectiveRange = this.range;
    if(target.type === 'shooter'){
      effectiveRange = this.range + 40;
    }

    // _targetX가 있으면 그걸 우선 사용, 없으면 target.x
    let targetX = target._targetX !== undefined ? target._targetX : target.x;

    const distance = Math.abs(this.x - targetX);

    // 드론이면 사거리 체크 무시하고 계속 이동
    if (target.type !== 'drone' && distance <= effectiveRange) return;

    // 타겟 쪽으로 계속 전진
    const direction = (this.team === 'red') ? 1 : -1;
    this.x += this.speed * direction;
  }

  attack(target) {
    let effectiveRange = this.range;
    if(target.type === 'shooter'){
      effectiveRange = this.range + 40;
    }
    
    let targetX = target._targetX !== undefined ? target._targetX : target.x;

    const distance = Math.abs(this.x - targetX); 
    
    if (this.team !== target.team && distance <= effectiveRange) {
      target.hp = Math.max(0, target.hp - this.damage);
      // console.log(`💥 ${this.nickname}가 ${target.nickname || `${target.team} 타워`} 공격`);
    }
  }
}

module.exports = MeleeUnit;
