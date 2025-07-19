// game.js 수정
import {io} from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js" 

console.log('✅ game.js 실행됨');

// 이미지 로드
const unitImage = new Image();
const bgImage = new Image();

// 슈터 부르기
const shooterImage = new Image();

// 이미지 소스 설정
shooterImage.src = '/assets/shooter.png';  
unitImage.src = '/assets/soldier.png';
bgImage.src = '/assets/background.png'

// 이미지 로딩 카운터
let imagesLoaded = 0;
const totalImages = 3;

function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    // 모든 이미지가 로드되면 그리기 시작
    if (!drawStarted) {
      drawStarted = true;
      draw();
    }
  }
}

// 이미지 로딩 완료 이벤트
unitImage.onload = checkImagesLoaded;
bgImage.onload = checkImagesLoaded;
shooterImage.onload = checkImagesLoaded;


// 이미지 로딩 실패 이벤트
unitImage.onerror = () => {
  console.error('❌ soldier.png 이미지 로딩 실패함');
  checkImagesLoaded(); // 에러가 있어도 카운터 증가
};

bgImage.onerror = () => {
  console.error('❌ background.png 이미지 로딩 실패함');
  checkImagesLoaded(); // 에러가 있어도 카운터 증가
};


shooterImage.onerror = () => {
  console.error('❌ shooter.png 이미지 로딩 실패함');
  checkImagesLoaded();
};

;

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



// 그리기 루프 (이미지 로드 완료 후 시작)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경 그리기 (이미지가 로드된 경우에만)
  if (bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {}

  // 유닛 그리기 (이미지가 로드된 경우에만)
  for (const u of units) {
    let img;

    if (u.type === 'shooter') {
      img = shooterImage;
    } else {
      img = unitImage;
    }

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, u.x, u.y, 40, 40);
    } else {
      ctx.fillStyle = 'gray';
      ctx.fillRect(u.x, u.y, 40, 40);
    }
  }

  requestAnimationFrame(draw);
}


//유닛 생성 버튼 클릭 시 소켓 전송
const spawnButton = document.getElementById('spawnButton');

spawnButton.addEventListener('click', () => {
  console.log("🟢 유닛 생성 버튼 클릭됨");
  socket.emit('spawnUnit');
});

spawnShooterBtn.addEventListener('click', () => {
  console.log("🔫 사수 유닛 생성 버튼 클릭됨");
  socket.emit('spawnUnit', { type: 'shooter' });  // 서버로 shooter 타입 전송
});



// 서버로부터 전체 게임 상태 받으면 클라이언트 유닛 목록 갱신
socket.on('gameUpdate', (state) => {
  //  console.log('📡 gameUpdate 수신:', state.units) -> 너무 많이 실행됨

  // �� 현재 유닛 리스트를 서버에서 받은 것으로 덮어씀
  units.length = 0
  units.push(...state.units)
})