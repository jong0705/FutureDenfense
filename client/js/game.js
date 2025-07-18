console.log('✅ game.js 실행됨');  // JS 로딩 확인용

import { io } from "socket.io-client";

// 이미지 로드
const unitImage = new Image();
unitImage.src = '/assets/soldier.png';

const bgImage = new Image();
bgImage.src = '/assets/background.png';

// 캔버스 & 컨텍스트
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ✅ 실제 해상도를 화면 크기로 맞춰줌
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

// 창 크기 바뀔 때 자동 조절
window.addEventListener('resize', resizeCanvas);

// 상태
let drawStarted = false;
const units = [];

// 소켓 연결
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('🟢 소켓 연결됨!', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 소켓 해제됨');
});

// 닉네임 파싱 → register
const params = new URLSearchParams(window.location.search);
const nickname = params.get('nickname') || '익명';
socket.emit('register', { nickname });

// 유닛 생성 수신
socket.on('unitJoined', (unit) => {
  console.log('🟡 unitJoined 수신됨:', unit); 
  units.push(unit);

});

if (!drawStarted) {
    drawStarted = true;
    draw();
  }

// 그리기 루프
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경 먼저

  ctx.globalAlpha = 0.7  
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // 유닛 그리기
  for (const u of units) {
    ctx.drawImage(unitImage, u.x, u.y, 40, 40);
  }

  requestAnimationFrame(draw);
}

// 이미지 로딩 실패 대비 (선택사항)
unitImage.onerror = () => {
  console.error('❌ soldier.png 이미지 로딩 실패함');
};

bgImage.onerror = () => {
  console.error('❌ background.png 이미지 로딩 실패함');
};


//유닛 생성 버튼 클릭 시 소켓 전송
const spawnButton = document.getElementById('spawnButton');

spawnButton.addEventListener('click', () => {
  console.log("🟢 유닛 생성 버튼 클릭됨");
  socket.emit('spawnUnit');
});


// 서버로부터 전체 게임 상태 받으면 클라이언트 유닛 목록 갱신
socket.on('gameUpdate', (state) => {
   console.log('📡 gameUpdate 수신:', state.units) // 이걸 추가해보자

  // 🟡 현재 유닛 리스트를 서버에서 받은 것으로 덮어씀
  units.length = 0
  units.push(...state.units)
})