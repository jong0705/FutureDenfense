const params = new URLSearchParams(window.location.search);
const nickname = params.get('nickname');  // ********* 닉네임 파라미터 가져오기
if(!nickname) {
  alert('닉네임이 없습니다. 다시 로그인해주세요.');
  window.location.href = 'index.html';
}

const myNickname = document.getElementById('myNickname');
myNickname.textContent = nickname;



const socket = io();  // ********* 소켓 연결

// ********* 버튼 요소 가져오기
const createRoomBtn = document.getElementById('createRoomBtn');
const leaveLobbyBtn = document.getElementById('leaveLobbyBtn');
const roomList = document.getElementById('roomList');

const roomTitle = document.getElementById('roomTitle');
const redList = document.getElementById('redList');
const blueList = document.getElementById('blueList');

const joinBtn = document.getElementById('joinBtn');
const toggleTeamBtn = document.getElementById('toggleTeamBtn');

// const createModalOverlay = document.getElementById('createModalOverlay');
// const createRoomInput = document.getElementById('createRoomInput');
// const createConfirmBtn = document.getElementById('createConfirmBtn');
// const createCancelBtn = document.getElementById('createCancelBtn');

// const exitModalOverlay = document.getElementById('exitModalOverlay');
// const exitConfirmBtn = document.getElementById('exitConfirmBtn');
// const exitCancelBtn = document.getElementById('exitCancelBtn');
// **************** 버튼 요소 가져오기

let selectedRoomId = null; // 현재 선택된 방 ID
let currentRoomId = null; // 현재 참가중인 방 ID



// 오른쪽 detail 패널 초기 상태로
function clearSection(){
  selectedRoomId = null;
  roomTitle.textContent = '방을 선택하세요';
  detailContent.style.display = 'none';
}

// 방 선택 함수
function selectRoom(roomId) {
  selectedRoomId = roomId;
  detailContent.style.display = 'block';
  socket.emit('get room detail', roomId);
}

// 서버 -> 로비 진입 시 방 목록
socket.on('room list', rooms => {
  roomList.innerHTML = '';
  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room-item';
    div.textContent = `방 ${room.id}: ${room.name} (참가자 ${room.playersCount}명)`;
    div.onclick = () => selectRoom(room.id);
    roomList.appendChild(div);
  });
});

// 방 상세 정보 수신 -> 디테일 패널 렌더링
socket.on('room detail', (room) => {
  roomTitle.textContent = `방 ${room.id}: ${room.name}`;

  redList.innerHTML = '';
  room.red.forEach(userName => {
    const li = document.createElement('li');
    li.textContent = userName;
    redList.appendChild(li);
  });

  blueList.innerHTML = '';
  room.blue.forEach(userName => {
    const li = document.createElement('li');
    li.textContent = userName;
    blueList.appendChild(li);
  });
});

// 참여하기 버튼 -> Red팀 참가
joinBtn.addEventListener('click', () => {
  if(!selectedRoomId) return alert('먼저 방을 선택하세요.');

  if(currentRoomId && currentRoomId !== selectedRoomId){
    const oldRoom = currentRoomId;
    socket.emit('leave room', { roomId: currentRoomId, nickname });
    alert(`방${oldRoom}에서 나갔습니다.`);
    socket.emit('get room detail', oldRoom);
  }

  socket.emit('join room', { roomId: selectedRoomId, nickname });
});

// 팀 전환 버튼 -> Red-Blue 이동
toggleTeamBtn.addEventListener('click', () => {
  if(!selectedRoomId) return alert('먼저 방을 선택하세요.');

  // 아직 참여 안했으면 경고
  const inAny = [...redList.children, ...blueList.children].some(li => li.textContent === nickname);

  if(!inAny){
    return alert("먼저 방에 참여하세요.")
  };
  
  socket.emit('change team', { roomId: selectedRoomId, nickname });
});

// 서버 응답 : 참여 성공/실패
socket.on('join room success', ({roomId, team}) => {
  alert(`방${roomId}에 참여하였습니다`);
  currentRoomId = roomId;
  socket.emit('get room detail', roomId);
});
socket.on('join room failure', (reason) => {
  alert(`참여 실패: ${reason}`);
})

// 서버 응답 : 팀전환 성공/실패
socket.on('change team success', ({ roomId, team }) => {
  alert(`팀이 ${team === 'red' ? 'Red' : 'Blue'}로 변경되었습니다.`);
  socket.emit('get room detail', roomId);
});
socket.on('change team failure', reason => {
  alert(`팀 전환 실패: ${reason}`);
});


// 방 생성 버튼 클릭 이벤트 처리
createRoomBtn.addEventListener('click', () => {
  createRoomInput.value = '';
  createModalOverlay.style.display = 'flex';
  createRoomInput.focus();
});

// // 방생성 시 확인 버튼 클릭 이벤트 처리리
createConfirmBtn.addEventListener('click', () => {
  const roomName = createRoomInput.value.trim();
  if(!roomName){
    alert('방 제목을 입력해주세요.');
    createRoomInput.focus();
    return;
  }
  socket.emit('create room', { roomName });
  alert(`새로운 방이 생성되었습니다 : ${roomName}`);
  createModalOverlay.style.display = 'none';
});



// 방생성 시 취소 버튼 클릭 이벤트 처리
createCancelBtn.addEventListener('click', () => {
  createModalOverlay.style.display = 'none';
});

// 로비에서 나가기 버튼 클릭 이벤트 처리
leaveLobbyBtn.addEventListener('click', () => {
  exitModalOverlay.style.display = 'flex';
});

// 로비에서 나가기 시 확인 버튼 클릭 이벤트 처리
exitConfirmBtn.addEventListener('click', () => {
  exitModalOverlay.style.display = 'none';
  socket.disconnect();
  window.location.href = 'index.html';
});

// 로비에서 나가기 시 취소 버튼 클릭 이벤트 처리
exitCancelBtn.addEventListener('click', () => {
  exitModalOverlay.style.display = 'none';
});



