// 📁 server/gameLoop.js

// ✅ 전체 게임 상태를 저장하는 객체 (방마다 따로 관리됨)
const gameState = {}
const gameLoopStarted = {}  // ✅ 방 별로 루프가 시작됐는지 확인용
const Unit = require('./entities/unit'); // 상단에 import 있어야 함
const ShooterUnit = require('./entities/shooterunit');
const Tower = require('./entities/tower');




// ✅ 유닛을 자동으로 조금씩 이동시키는 함수 (목표 좌표로 한 칸씩 이동)
function updateUnits(units) {
  for (let unit of units) {
    if (Math.abs(unit.x - unit.targetX) < 1 && Math.abs(unit.y - unit.targetY) < 1) continue;
    unit.move()
  }
}

//타워 업데이트 : 타워의 체력
function handleTowerDamage(units, towers) {
  for (let unit of units) {
    if (unit.team === 'red' && unit.x >= towers.blue.x - 10) {
      towers.blue.hp -= unit.damage;
      unit.hp = 0;
    }

    if (unit.team === 'blue' && unit.x <= towers.red.x + 10) {
      towers.red.hp -= unit.damage;
      unit.hp = 0;
    }
  }
}




// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  // ✅ 기존 상태 유지 (초기화 안 함)
  if (!gameState[roomId]) {
    gameState[roomId] = {
      units: [],
      time: 100000,
      towers: {
        red: new Tower('red'),
        blue: new Tower('blue')
      }
    }
  }

  // ✅ 루프 시작
    const interval = setInterval(() => {
        const state = gameState[roomId]

        // 업데이트되는 내용들
        updateUnits(state.units);  // 유닛 이동
        handleTowerDamage(state.units, state.towers);  // 타워에 데미지 적용


        //타워 체력 0이면 게임 종료
        if (state.towers.red.hp <= 0 || state.towers.blue.hp <= 0) {
          clearInterval(interval);
          const winner = state.towers.red.hp <= 0 ? 'blue' : 'red';
          io.to(roomId).emit('gameOver', { reason: `🏆 ${winner} 팀 승리!` });
          return; // ✅ 반드시 return으로 아래 코드 실행 막아줘야 함
        }
        
        // ⏱️ 시간 감소
        state.time--

        // 📤 상태 전송
        io.to(roomId).emit('gameUpdate', state)

        // 🛑 종료 조건
        if (state.time <= 0) {
        clearInterval(interval)
        io.to(roomId).emit('gameOver', { reason: '시간 종료' })
        }
    }, 100)
}



// ✅ 이 함수는 소켓이 연결되었을 때 클라이언트 1명에 대해 호출됨
// ✅ 여기서 register, spawnUnit 등 소켓 이벤트들을 바인딩함
function init(socket, io) {

  socket.on('register', ({ nickname }) => {
    const roomId = 'lobby'; // 임시로 모든 유저는 'lobby' 방에 배정

    if (gameState[roomId] && gameState[roomId].time <= 0) {
      gameState[roomId] = {
        units: [], 
        time: 100000,
        towers: {
          red: new Tower('red'),
          blue: new Tower('blue')
        }
      };
      gameLoopStarted[roomId] = false;
    }
    // ✅ 방 상태가 없으면 초기화
    if (!gameState[roomId]) {
      gameState[roomId] = {
        units: [],
        time: 300,
        towers: {
          red: new Tower('red'),
          blue: new Tower('blue')
        }
      };
    }

    // ✅ 루프가 아직 시작되지 않았으면 시작
    if (!gameLoopStarted[roomId]) {
      startGameLoop(io, roomId);
      gameLoopStarted[roomId] = true;
      console.log(`▶️ '${roomId}' 방에 대한 게임 루프 시작됨`);
    }

    // ✅ 소켓을 room에 참가시키고 로그 출력
    socket.join(roomId);
    console.log(`✅ ${nickname}이 방 '${roomId}'에 참가했습니다 (${socket.id})`);
  });

  // 🔽 여기에 spawnUnit 이벤트 바인딩 등 계속 이어짐




  // ✅ 클라이언트가 'spawnUnit' 이벤트를 보내면 유닛 생성
  socket.on('spawnUnit', (data = {}) => {
      const { type } = data;
      const roomId = 'lobby'; // 현재는 고정된 방 사용
      const state = gameState[roomId];
      if (!state) return;     // 방 상태가 없으면 무시

      let newUnit;

      if (type === 'shooter') {
        newUnit = new ShooterUnit(socket.id, '사수', 'blue');  // ShooterUnit 필요
      } else {
        newUnit = new Unit(socket.id, '병사', 'red');
      }



        // ✅ 방의 유닛 목록에 추가
      state.units.push(newUnit);

      // ✅ 해당 방의 모든 유저에게 unitJoined 이벤트 전송
      io.to(roomId).emit('unitJoined', newUnit);

        // ✅ 서버 로그 출력
      console.log(`🆕 유닛 생성됨: ${newUnit.id}`);
  });

}






// ✅ 모듈로 내보내기 (exports를 하나로 통일!)
module.exports = {
  startGameLoop,
  init,
}
