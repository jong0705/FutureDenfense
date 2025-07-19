const rooms = []
let nextRoomId = 1;

createRoom("방1");
createRoom("방2");
createRoom("방3");

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

// function deleteRoom(roomId){
//   const index = rooms.findIndex(room => room.id === roomId);
//   if(index !== -1 && rooms[index].playersCount === 0){
//     rooms.splice(index, 1);
//   }
// }

//전체 방 목록 조회
function getRoomList(){
  return rooms.map(room => ({
    id: room.id,
    name: room.name,
    playersCount: room.playersCount,
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
    const res = joinRoom(roomId, 'red', nickname);
    if (res.success) {
      // 전체 방 목록 업데이트
      socket.join(roomId);
      socket.nickname = nickname;
      socket.roomId = roomId;

      io.emit('room list', getRoomList());
      io.emit('room detail', res.room);
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

      io.emit('room detail', res.room);
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
      io.emit('room list', getRoomList());
      io.emit('room detail', room);
    }
  });


  socket.on('start game', ({ roomId }) => {
    const room = getRoomDetail(roomId);
    if(!room) return;

    room.startingPlayers = [...room.red, ...room.blue];
    console.log('room.startingPlayers: ', room.startingPlayers);
    io.to(roomId).emit('game starting', {
      roomId,
      players: room.startingPlayers
    });
  });

  socket.on('game end', ({ roomId, nickname }) => {
    const room = getRoomDetail(roomId);
    if(!room) return;

    room.red = [];
    room.blue = [];
    room.playersCount = 0;
    room.startingPlayers = [];
    room.gameStarted = false;

    io.emit('room list', getRoomList());
    io.emit('room detail', room);

    io.to(roomId).emit('game end', { roomId, nickname });
  });
}

module.exports = { registerRoomHandlers }
