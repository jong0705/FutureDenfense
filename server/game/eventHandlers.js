const { gameState, gameLoopStarted, initRoomState } = require('./gameState');
const { startGameLoop } = require('./gameLoop');
const MeleeUnit = require('../entities/meleeunit');
const ShooterUnit = require('../entities/shooterunit');

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

  // ✅ 클라이언트가 'spawnUnit'을 요청하면 유닛 생성
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

    if (type === 'shooter') {
    newUnit = new ShooterUnit(socket.id, nickname || '사수', team);
    } else {
    newUnit = new MeleeUnit(socket.id, nickname || '병사', team);
    }

    // ✅ 유닛 목록에 추가
    state.units.push(newUnit);

    // ✅ 모든 클라이언트에 유닛 생성 알림
    io.to(roomId).emit('unitJoined', newUnit);

    console.log(`🆕 유닛 생성됨: ${newUnit.id}`);


    



  });
}

module.exports = { init };