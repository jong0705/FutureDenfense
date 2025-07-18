// 📁 server/gameLoop.js

// ✅ 전체 게임 상태를 저장하는 객체 (방마다 따로 관리됨)
const gameState = {}

// ✅ 유닛을 자동으로 조금씩 이동시키는 함수 (목표 좌표로 한 칸씩 이동)
function updateUnits(units) {
  for (let unit of units) {
    if (unit.x < unit.targetX) unit.x += 1
    if (unit.x > unit.targetX) unit.x -= 1
    if (unit.y < unit.targetY) unit.y += 1
    if (unit.y > unit.targetY) unit.y -= 1
  }
}

// ✅ 서버에서 루프를 돌리기 시작하는 함수 (방 단위로 실행됨)
function startGameLoop(io, roomId) {
  // 1️⃣ 초기 상태 설정
  gameState[roomId] = {
    units: [],
    time: 300, // 게임 시간: 5분 (초 단위)
  }

  // 2️⃣ 0.1초마다 루프 실행 (100ms 주기)
  const interval = setInterval(() => {
    const state = gameState[roomId]

    // 🔄 유닛 이동 처리
    updateUnits(state.units)

    // ⏱️ 시간 감소
    state.time--

    // 📤 현재 상태를 방 안의 모든 클라이언트에게 전송
    io.to(roomId).emit('gameUpdate', state)

    // 🛑 종료 조건: 시간이 다 되면 루프 중단
    if (state.time <= 0) {
      clearInterval(interval)
      io.to(roomId).emit('gameOver', { reason: '시간 종료' })
    }
  }, 100)
}



// ✅ 이 함수는 소켓이 연결되었을 때 클라이언트 1명에 대해 호출됨
// ✅ 여기서 register, spawnUnit 등 소켓 이벤트들을 바인딩함
function init(socket, io) {

  // ✅ 클라이언트가 'register' 이벤트를 보내면 실행됨 (닉네임 포함)
  socket.on('register', ({ nickname }) => {
    const roomId = 'lobby'; // 임시로 모든 유저는 'lobby' 방에 배정

    // ✅ 방이 처음 생성되는 경우, 초기 게임 상태를 설정
    if (!gameState[roomId]) {
      gameState[roomId] = {
        units: [],     // 이 방에 속한 유닛 목록
        time: 300      // 게임 시간 (초 단위) — 예: 5분
      };
    }

    // ✅ 이 소켓을 socket.io의 room에 참여시킴
    socket.join(roomId);

    // ✅ 서버 로그에 참가자 출력
    console.log(`✅ ${nickname}이 방 '${roomId}'에 참가했습니다 (${socket.id})`);
  });

  // ✅ 클라이언트가 'spawnUnit' 이벤트를 보내면 유닛 생성
  socket.on('spawnUnit', () => {
    const roomId = 'lobby'; // 현재는 고정된 방 사용
    const state = gameState[roomId];
    if (!state) return;     // 방 상태가 없으면 무시

    // ✅ 새 유닛 데이터 생성
    const newUnit = {
      id: socket.id + '-' + Date.now(),      // 유닛 고유 ID (socketID + timestamp)
      nickname: '병사',                      // 추후 유닛 종류나 이름 바꿀 수 있음
      x: 100 + Math.random() * 400,          // 초기 x좌표 (랜덤)
      y: 100 + Math.random() * 300,          // 초기 y좌표 (랜덤)
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
