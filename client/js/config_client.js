export const UNIT_COST = {
  melee: 50,
  shooter: 100,
  drone: 150
};

export const METEOR_COST = 500;

export const SOCKET_URL = 'http://localhost:3000';

export const UNIT_DEFAULT_STATS = {
  melee:   { hp: 100, damage: 10, speed: 3, range: 60 },
  shooter: { hp: 120, damage: 8, speed: 2, range: 200 },
  drone:   { hp: 80,  damage: 15, speed: 5, range: 120 }
};

export const UPGRADE_BASE_COST = {
  melee:    { hp: 50, damage: 50 },
  shooter:  { hp: 100, damage: 150 },
  drone:    { hp: 100, damage: 200 }
};

export const UPGRADE_STEP = {
  hp: 20,
  damage: 5
}

export const UNIT_DEFAULT_COOLDOWN_TIME = {
  melee: 0.5,
  shooter: 1,
  drone: 3
};

export const METEOR_COOLDOWN = 30.0;