const GAME_TIME = 300000; // 300초 * 1000ms

const INIT_MONEY = {
  red: 5000,
  blue: 5000
}

const TOWER_DEFAULT_STATS = {
  hp: 1000
};

// 유닛별 초기 스탯
const UNIT_DEFAULT_STATS = {
  melee:   { hp: 100, damage: 10, speed: 3, range: 60 },
  shooter: { hp: 120, damage: 8, speed: 2, range: 200 },
  drone:   { hp: 80,  damage: 15, speed: 5, range: 120 }
};

// 유닛별 생성 비용
const UNIT_COST = {
  melee: 50,
  shooter: 100,
  drone: 150
};

// 유닛 죽일 시 보상
const UNIT_REWARD = {
  melee: 100,
  shooter: 150,
  drone: 200
};

// 유닛별 업그레이드 기본 비용
const UPGRADE_BASE_COST = {
  melee:   { hp: 50,  damage: 50 },
  shooter: { hp: 100, damage: 150 },
  drone:   { hp: 100, damage: 200 }
};

// 업그레이드 할 때마다 증가하는 수치
const UPGRADE_STEP = {
  hp: 20,
  damage: 5
}
// 필살기(운석) 비용
const METEOR_COST = 500;
const METEOR_DAMAGE = 100;

module.exports = {
  INIT_MONEY,
  TOWER_DEFAULT_STATS,
  UNIT_DEFAULT_STATS,
  UNIT_COST,
  UNIT_REWARD,
  UPGRADE_BASE_COST,
  UPGRADE_STEP,
  METEOR_COST,
  METEOR_DAMAGE,
  GAME_TIME
};