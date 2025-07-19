// 📁 server/gameLoop.js

// ✅ 전체 게임 상태를 저장하는 객체 (방마다 따로 관리됨)
const gameState = {}
const gameLoopStarted = {}  // ✅ 방 별로 루프가 시작됐는지 확인용



// ✅ 유닛을 자동으로 조금씩 이동시키는 함수 (목표 좌표로 한 칸씩 이동)
function updateUnits(units) {
  for (let unit of units) {

    if (Math.abs(unit.x - unit.targetX) < 1 && Math.abs(unit.y - unit.targetY) < 1) continue;

    if (unit.x < unit.targetX) unit.x += 3
    if (unit.x > unit.targetX) unit.x -= 3
    // if (unit.y < unit.targetY) unit.y += 1
    // if (unit.y > unit.targetY) unit.y -= 1
  }
}

// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  // ✅ 기존 상태 유지 (초기화 안 함)
  if (!gameState[roomId]) {
    gameState[roomId] = {
      units: [],
      time: 10000000,
    }
  }

  // ✅ 루프 시작
    const interval = setInterval(() => {
        const state = gameState[roomId]

        // 🔄 유닛 이동
        updateUnits(state.units)

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

  socket.on('register', ({ nickname, roomId }) => {
    // 동적 방 초기화: 처음 등록되는 방이면 gameState 및 loop 시작
    if (!gameState[roomId]) {
      gameState[roomId] = { units: [], time: 10000000 };
    }
    // 게임이 시작되지 않았으면 시작하기..
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
  socket.on('spawnUnit', ({ roomId, team }) => {
    if(!roomId){
      const rooms = Array.from(socket.rooms);
      roomId = rooms.find(room => room !== socket.id);
    }
    const state = gameState[roomId];
    if (!state) return;     // 방 상태가 없으면 무시

    const startX = team === 'red' ? 100 : 2000;
    const targetX = team === 'red' ? 2000 : 100;
    // ✅ 새 유닛 데이터 생성
    const newUnit = {
        id: socket.id + '-' + Date.now(),      // 유닛 고유 ID (socketID + timestamp)
        nickname: '병사',                      // 추후 유닛 종류나 이름 바꿀 수 있음
        x: startX,           // 초기 x좌표
        y: 400,          // 초기 y좌표
        targetX: targetX,  // 👉 오른쪽으로 이동 목표
        targetY: 400,   // y는 그대로 (직선 이동)
        hp: 100                                // 체력 초기값
    };

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
