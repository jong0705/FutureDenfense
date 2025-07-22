const { gameState, gameLoopStarted, initRoomState } = require('./gameState');
const { startGameLoop } = require('./gameLoop');
const MeleeUnit = require('../entities/meleeunit');
const ShooterUnit = require('../entities/shooterunit');
const DroneUnit = require('../entities/droneunit'); 

// ✅ 소켓 연결 시 호출되는 이벤트 핸들러 등록 함수
function init(socket, io) {
  socket.on('game register', ({ nickname, roomId, team }) => {
    socket.nickname = nickname;
    socket.roomId = roomId;
    socket.team = team;
    
    // ✅ 기존 게임 상태가 있고 시간이 끝났으면 초기화
    if (gameState[roomId] && gameState[roomId].time <= 0) {
      initRoomState(roomId);
    }

    // ✅ 방 상태가 없으면 새로 초기화
    if (!gameState[roomId]) {
      initRoomState(roomId);
    }

    // ✅ 게임 루프 시작되지 않았으면 시작
    if (!gameLoopStarted[roomId]) {
      startGameLoop(io, roomId);
      gameLoopStarted[roomId] = true;
      console.log(`▶️ '${roomId}' 게임 루프 시작됨`);
    }

    // ✅ 해당 유저를 소켓 룸에 참가시키기
    socket.join(roomId);
    console.log(`✅ ${nickname}이 방 '${roomId}'에 참가했습니다 (${socket.id})`);


    // ✅ team 저장
    if (!gameState[roomId].players) {
        gameState[roomId].players = {};
    }

    gameState[roomId].players[socket.id] = {
        nickname,
        team
    };

  });

  const UNIT_COST = { melee: 50, shooter: 100, drone: 150 };
  
  // ✅ 클라이언트가 ''을 요청하면 유닛 생성
  socket.on('spawnUnit', (data = {}) => {
    const { type } = data;
    const rooms = Array.from(socket.rooms);
    const roomId = rooms.find(room => room !== socket.id);
    const state = gameState[roomId];
    if (!state) return;

    let newUnit;

    const player = state.players[socket.id];
    if (!player) return;

    const team = player.team;  // ✅ 여기서 진짜 팀 가져옴
    const nickname = player.nickname;

    if (!state.unitStats) {
      state.unitStats = {
        red: {
          melee: { hp: 100, damage: 10 },
          shooter: { hp: 120, damage: 8 },
          drone: { hp: 80, damage: 15 }
        },
        blue: {
          melee: { hp: 100, damage: 10 },
          shooter: { hp: 120, damage: 8 },
          drone: { hp: 80, damage: 15 }
        }
      };
    }

    const stats = state.unitStats[team][type];

    // ✅ 유닛 생성 비용 차감감
    const cost = UNIT_COST[type];
    if(state.money[team] === undefined) state.money[team] = 0;

    if(state.money[team] < cost) return;

    state.money[team] -= cost;




      // 🔥 명시적 분기 처리
    switch (type) {
      case 'shooter':
        newUnit = new ShooterUnit(socket.id, nickname || '사수', team, stats.hp, stats.damage);
        break;
      case 'melee':
        newUnit = new MeleeUnit(socket.id, nickname || '병사', team, stats.hp, stats.damage);
        break;
      case 'drone':
        newUnit = new DroneUnit(socket.id, nickname || '드론', team, stats.hp, stats.damage);
        break;
      default:
        console.warn(`❌ 알 수 없는 유닛 타입: ${type}`);
        return; // 잘못된 타입이면 유닛 생성하지 않음
    }

    // ✅ 유닛 목록에 추가
    state.entities.push(newUnit);

    // ✅ 모든 클라이언트에 유닛 생성 알림
    io.to(roomId).emit('unitJoined', newUnit);

    io.to(roomId).emit('gameUpdate', state);

    console.log(`🆕 유닛 생성됨: ${newUnit.id}`);

  });

  const UPGRADE_BASE_COST = {
    melee: { hp: 50, damage: 50 },
    shooter: { hp: 100, damage: 150 },
    drone: { hp: 100, damage: 200 }
  };

  const DEFAULT_STATS = {
    melee:   { hp: 100, damage: 10 },
    shooter: { hp: 120, damage: 8 },
    drone:   { hp: 80, damage: 15 }
  };
  
  socket.on('upgradeStat', ({ unitType, stat }) => {
    const roomId = socket.roomId;
    const team = socket.team;
    const state = gameState[roomId];
    if (!state) return;

    // 현재 레벨 계산
    const currentStat = state.unitStats?.[team]?.[unitType]?.[stat];
    const defaultStat = DEFAULT_STATS[unitType][stat]; // 예: { melee: { hp: 100, damage: 10 }, ... }
    const level = Math.floor((currentStat - defaultStat) / (stat === 'hp' ? 20 : 5)); 
    //hp는 20, damage는 5 단위로 증가

    // 업그레이드 비용 계산
    const baseCost = UPGRADE_BASE_COST[unitType][stat];
    const upgradeCost = baseCost + (level * 50);

    if (state.money[team] === undefined) state.money[team] = 0;

    if (state.money[team] < upgradeCost) {
      return;
    }

    // 돈 차감
    state.money[team] -= upgradeCost;

    // 실제 업그레이드 적용
    if (stat === 'hp') {
      state.unitStats[team][unitType].hp += 20; // hp는 20씩 증가
    } else if (stat === 'damage') {
      state.unitStats[team][unitType].damage += 5; // damage는 5씩 증가
    }

    // 상태 갱신
    io.to(roomId).emit('gameUpdate', state);
  });

  // ✅ 방 목록 요청 이벤트 추가
  socket.on('get room list', () => {
    const rooms = Object.keys(gameState).map(roomId => {
      const state = gameState[roomId];
      return {
        id: roomId,
        name: state.name || '',
        playersCount: state.players ? Object.keys(state.players).length : 0,
        gameStarted: state.gameStarted || false
      };
    });
    socket.emit('room list', rooms);
  });

  const METEOR_COST = 500;

  socket.on('useMeteor', ({ roomId, team }) => {
    const state = gameState[roomId];
    if (!state) return;

    if(state.money[team] === undefined) state.money[team] = 0;

    if(state.money[team] < METEOR_COST) return;

    state.money[team] -= METEOR_COST;

    const enemyTeam = team === 'red' ? 'blue' : 'red';
    const myTower = state.entities.find(e => e.type === 'tower' && e.team === team);
    const enemyTower = state.entities.find(e => e.type === 'tower' && e.team === enemyTeam);

    // 팀별로 대칭적으로 좌표 계산
    let startX, startY, endX, endY;
    if (team === 'red') {
      startX = myTower.x + 110; // 레드팀은 +10
      startY = myTower.y - 320;
      endX = enemyTower.x - 150;
      endY = enemyTower.y + 120;
    } else {
      startX = myTower.x + 90; // 블루팀은 -10
      startY = myTower.y - 320;
      endX = enemyTower.x + 450;
      endY = enemyTower.y + 120;
    }

    io.to(roomId).emit('meteorStrike', { 
      team, 
      startX, startY, endX, endY 
    });

    io.to(roomId).emit('gameUpdate', state);
    // === 딜레이 후 데미지 적용 ===
    setTimeout(() => {
      const DAMAGE = 100; // 운석 데미지
      state.entities.forEach(e => {
        if (e.team === enemyTeam) {
          e.hp -= DAMAGE;
        }
      });
      // (선택) 데미지 이펙트 알림을 따로 보내고 싶으면 아래처럼 추가
      // io.to(roomId).emit('meteorDamage', { team: enemyTeam });
    }, 1000); //  후 데미지 적용 (애니메이션 길이에 맞게 조정)
  });

}

module.exports = { init };