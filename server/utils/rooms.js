const { gameState } = require('../game/gameState');
const Tower = require('../entities/tower');
const { GAME_TIME, INIT_MONEY, UNIT_DEFAULT_STATS } = require('../config');

const rooms = []
let nextRoomId = 1;

createRoom("아무나");
createRoom("초보만");
createRoom("고수만");

function createRoom(roomName){
  const room = {
    id: nextRoomId++,
    name: roomName,
    red: [],
    blue: [],
    playersCount: 0,
    gameStarted: false,
    startingPlayers: []
  };
  rooms.push(room);
  return room;
}

function deleteRoom(roomId){
  const tempId = Number(roomId);
  if (isNaN(tempId)) {
    console.log('❌ 잘못된 roomId로 삭제 시도:', roomId);
    return;
  }
  const index = rooms.findIndex(room => room.id === tempId);
  if(index !== -1){
    rooms.splice(index, 1);
    console.log('🔴 방 삭제됨:', roomId);
  }else{
    console.log('🔴 방 삭제 실패:', roomId);
  }
}
//전체 방 목록 조회
function getRoomList(){
  return rooms.map(room => ({
    id: room.id,
    name: room.name,
    playersCount: room.playersCount,
    gameStarted: room.gameStarted,
  }));
}

//방 상세 정보 조회
function getRoomDetail(roomId){
  return rooms.find(room => room.id === roomId) || null;
}

function joinRoom(roomId, team, nickname){
  const room = getRoomDetail(roomId);
  if(!room) return { success: false, reason: '방이 존재하지 않습니다.' };
  // 없는 방이면 return fail
  if(room.red.includes(nickname) || room.blue.includes(nickname)){
    return { success: false, reason: '이미 참여한 닉네임입니다.' };
  }
  // 이미 참여한 방이면 return fail

  if(room.red.length+room.blue.length >= 2){
    return { success: false, reason: '이 방은 이미 2명이 모두 찼습니다.'};
  }

  room[team].push(nickname);
  room.playersCount++;
  return { success: true, room };
}

function changeTeam(roomId, nickname){
  const room = getRoomDetail(roomId);
  if(!room) return { success: false, reason: '방이 존재하지 않습니다.' };
  const from = room.red.includes(nickname) ? 'red'
          : room.blue.includes(nickname) ? 'blue'
          : null;
  if(!from) return { success: false, reason: '참여한 팀이 없습니다.' };

  const to = from === 'red' ? 'blue' : 'red';

  room[from] = room[from].filter(n => n !== nickname);
  room[to].push(nickname);
  return { success: true, room, team: to };
}


// ************* Socket.IO 이벤트 핸들러 등록 *************
function registerRoomHandlers(io, socket){
  // 로비 진입 시 방 전체 목록 전송
  socket.emit('room list', getRoomList());
  
  // 방 생성 요청 처리
  socket.on('create room', ({ roomName }) => {
    createRoom(roomName);
    io.emit('room list', getRoomList());
  });

  // 방 상세 정보 요청
  socket.on('get room detail', (roomId) => {
    const room = getRoomDetail(roomId);
    if(room){
      socket.emit('room detail', room);
    }
  });

  // 방 참가 요청 (team은 redteam으로..)
  socket.on('join room', ({ roomId, nickname }) => {

    socket.nickname = nickname;
    socket.roomId = roomId;

    const res = joinRoom(roomId, 'red', nickname);
    if (res.success) {
      // 전체 방 목록 업데이트
      socket.join(roomId);
      socket.nickname = nickname;
      socket.roomId = roomId;

      io.emit('room list', getRoomList());
      socket.emit('room detail', res.room);
      // 참가 성공 알림
      io.to(socket.id).emit('join room success', {
        roomId,
        team: 'red',
        members: res.room.red
      });
    } else {
      socket.emit('join room failure', res.reason);
    }
  });

  // 팀 전환
  socket.on('change team', ({ roomId, nickname }) => {   
    const res = changeTeam(roomId, nickname);
    if (res.success) {

      socket.leave(roomId);
      socket.join(roomId);

      socket.nickname = nickname;
      socket.roomId = roomId;

      socket.emit('room detail', res.room);
      socket.emit('change team success', { roomId, team: res.team });
    } else {
      socket.emit('change team failure', res.reason);
    }
  });


  // 방 나가기 요청
  socket.on('leave room', ({ roomId, nickname }) => {
    const room = getRoomDetail(roomId);
    if (!room) return;

    socket.leave(roomId);
    ['red','blue'].forEach(team => {
      const idx = room[team].indexOf(nickname);
      if (idx !== -1) {
        room[team].splice(idx,1);
        room.playersCount--;
      }
    });

    socket.nickname = null;
    socket.roomId = null;

    io.emit('room list', getRoomList());
    if(room) io.emit('room detail', room);
  });


  socket.on('disconnect', () => {
    console.log('🔴 소켓 해제됨:', socket.id);

    const {nickname, roomId } = socket;
    console.log('nickname : ', nickname);
    console.log('roomId : ', roomId);
    if(socket.roomId&&socket.nickname){
      const room = getRoomDetail(roomId);
      if (!room) return;

      if(room.startingPlayers.includes(nickname)){
        console.log('게임 시작 중이므로 방에서 제거하지 않습니다');
        return;
      }

      ['red','blue'].forEach(team => {
        const idx = room[team].indexOf(nickname);
        if (idx !== -1) {
          room[team].splice(idx,1);
          room.playersCount--;
        }
      });

      const totalPlayers = room.red.length + room.blue.length;
      console.log('totalPlayers : ', totalPlayers);
      if(totalPlayers <= 1){
        io.to(roomId).emit('force exit', { roomId, nickname });
      }


      io.emit('room list', getRoomList());
      io.emit('room detail', room);
    }
  });


  socket.on('start game', ({ roomId }) => {
    const room = getRoomDetail(roomId);
    if(!room) return;

    if(room.red.length == 1 && room.blue.length == 1){
      room.startingPlayers = [...room.red, ...room.blue];
      room.gameStarted = true;
      console.log('room.startingPlayers: ', room.startingPlayers);

      const deepClone = obj => JSON.parse(JSON.stringify(obj));
      if (!gameState[roomId]) {
        gameState[roomId] = {
          entities: [
            new Tower('red'),
            new Tower('blue')
          ],
          time: GAME_TIME,
          // 팀별 돈
          money: { ...INIT_MONEY },
          // 팀별 유닛 스탯
          unitStats: {
            red: deepClone(UNIT_DEFAULT_STATS),
            blue: deepClone(UNIT_DEFAULT_STATS)
          }
        };
      }
      const state = gameState[roomId];
      state.time = GAME_TIME;

      io.to(roomId).emit('game starting', {
        roomId,
        players: room.startingPlayers
      });
    }else{
      socket.emit('start game failure', '레드팀과 블루팀은 각각 1명씩 참여해야 합니다.');
    }
    
  });

  socket.on('game end', ({ roomId, nickname }) => {
    console.log('deleteRoom 호출:', roomId, rooms.map(room => room.id));
    const room = getRoomDetail(roomId);
    if(room){
      room.gameStarted = false;
    }
    deleteRoom(roomId);
    io.emit('room list', getRoomList());

    io.to(roomId).emit('game end', { roomId, nickname });
  });
}

module.exports = { registerRoomHandlers, deleteRoom }
