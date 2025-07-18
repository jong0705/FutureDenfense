

console.log('✅ game.js 실행됨');  // JS 로딩 확인용

import { io } from "socket.io-client";

const unitImage = new Image();




let imageLoaded = false;      // ✅ 이미지 로딩 완료 여부
let drawStarted = false;      // ✅ draw() 중복 실행 방지용
const units = [];


// ✅ 이미지 로드 완료 시 플래그 세우고 draw 조건 검사
unitImage.onload = () => {
  console.log("🖼️ 이미지 로드 완료");

  imageLoaded = true;
  tryStartDraw();
};



unitImage.src = '/assets/soldier.png';



// client/js/game.js
const socket = io('http://localhost:3000'); // 또는 실제 서버 주소 // 자동으로 서버랑 연결

socket.on('connect', () => {
  console.log('🟢 소켓 연결됨!', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 소켓 해제됨');
});


// 예시: URL에 ?nickname=철수 라고 되어 있다고 가정
const params = new URLSearchParams(window.location.search);
const nickname = params.get('nickname') || '익명';

// 서버에 닉네임 전송 → 서버가 유닛 생성
socket.emit('register', { nickname });



//일단 캔버스 불러오고
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');








// ✅ 서버로부터 유닛 받으면 배열에 추가 + draw 조건 검사
socket.on('unitJoined', (unit) => {
  console.log('🟡 unitJoined 수신됨:', unit); 
  units.push(unit);
  tryStartDraw();
});




// ✅ 이미지도 로드됐고, 유닛도 1명 이상일 때만 draw() 시작
function tryStartDraw() {
      console.log("✅ tryStartDraw() 호출됨", { imageLoaded, unitsLength: units.length, drawStarted });

  if (imageLoaded && units.length > 0 && !drawStarted) {
    drawStarted = true;
    draw();
  }
}


// ctx위에서 부른 canvas 도구
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const u of units) {
    ctx.drawImage(unitImage, u.x, u.y, 40, 40);
  }

  requestAnimationFrame(draw);
}




unitImage.onerror = () => {
  console.error('❌ soldier.png 이미지 로딩 실패함');
};