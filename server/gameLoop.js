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
    units: [
      { id: 'unit1', x: 100, y: 100, targetX: 400, targetY: 300, hp: 100 },
      { id: 'unit2', x: 200, y: 200, targetX: 600, targetY: 400, hp: 100 },
    ],
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



//서버에서 유닛 생성
// ✅ 소켓 연결된 클라이언트 1명에 대해 초기 이벤트를 설정하는 함수
function init(socket, io) {

  // 📥 클라이언트가 'register' 이벤트를 보내면 실행됨 (닉네임 포함)
  socket.on('register', ({ nickname }) => {

    // 🏠 클라이언트를 기본 방 'lobby'에 넣는다고 가정
    const roomId = 'lobby';

    // 🆕 해당 방이 처음 생성되는 경우, 초기 상태를 세팅
    // 방마다 유닛 목록과 타이머를 따로 관리하기 위해 gameState에 저장
    if (!gameState[roomId]) {
      gameState[roomId] = {
        units: [],   // 이 방에 속한 유닛들 목록
        time: 300    // 게임 제한 시간 (초 단위), 예: 5분
      };
    }

    // 👤 클라이언트 1명에 대한 유닛 데이터 생성
    const newUnit = {
      id: socket.id,                         // 고유 식별자로 소켓 ID 사용
      nickname,                              // 전달받은 닉네임
      x: 100 + Math.random() * 400,          // x 위치: 100~500 랜덤
      y: 100 + Math.random() * 300,          // y 위치: 100~400 랜덤
      hp: 100                                // 체력 초기값
    };

    // 📌 방의 유닛 목록에 이 유닛을 추가
    gameState[roomId].units.push(newUnit);

    // 🧩 소켓을 socket.io의 방(room)에 조인시킴
    // → 이후 이 클라이언트에게 특정 방에만 메시지를 보낼 수 있음
    socket.join(roomId);

    // 🖨️ 서버 콘솔에 유닛 생성 로그 출력
    console.log(`🧍 유닛 생성: ${nickname} (${socket.id})`);

    // 📡 현재 방(roomId)에 있는 **모든 클라이언트**에게
    // 이 유닛이 생성됐다는 메시지를 보냄
    // 프론트에서는 이 이벤트를 받아서 units[]에 추가하고 그림
    io.to(roomId).emit('unitJoined', newUnit);
  });
}





// ✅ 모듈로 내보내기 (exports를 하나로 통일!)
module.exports = {
  startGameLoop,
  init,
}
