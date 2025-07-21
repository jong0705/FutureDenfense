// game.js 수정
import {io} from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js" 

console.log('✅ game.js 실행됨');


//렌더러 
import { renderShooter } from './units/renderShooter.js';
import { renderSoldier } from './units/renderSoldier.js';


// 이미지 로드
const bgImage = new Image();
const redSoldierImage = new Image();
const blueSoldierImage = new Image();
const redShooterImage = new Image(); // 슈터 부르기
const blueShooterImage = new Image();
const redTowerImage = new Image();
const blueTowerImage = new Image();



// 이미지 소스 설정
bgImage.src = '/assets/background.png';
redShooterImage.src = '/assets/unit/shooter_red.png';  
blueShooterImage.src = '/assets/unit/shooter_blue.png';
redSoldierImage.src = '/assets/unit/soldier_red.png';
blueSoldierImage.src = '/assets/unit/soldier_blue.png';
redTowerImage.src = '/assets/unit/red_tower.png';
blueTowerImage.src = '/assets/unit/blue_tower.png';

// 이미지 로딩 카운터
let imagesLoaded = 0; 
const totalImages = 7;

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
redSoldierImage.onload = checkImagesLoaded;
blueSoldierImage.onload = checkImagesLoaded;
redShooterImage.onload = checkImagesLoaded;
blueShooterImage.onload = checkImagesLoaded;
redTowerImage.onload = checkImagesLoaded;
blueTowerImage.onload = checkImagesLoaded;
bgImage.onload = checkImagesLoaded;


// 이미지 로딩 실패 이벤트
redSoldierImage.onerror = () => {
  console.error('❌ soldier_red.png 이미지 로딩 실패함');
  checkImagesLoaded(); // 에러가 있어도 카운터 증가
};

blueSoldierImage.onerror = () => {
  console.error('❌ soldier_blue.png 이미지 로딩 실패함');
  checkImagesLoaded(); // 에러가 있어도 카운터 증가
};

bgImage.onerror = () => {
  console.error('❌ background.png 이미지 로딩 실패함');
  checkImagesLoaded(); // 에러가 있어도 카운터 증가
};

redShooterImage.onerror = () => {
  console.error('❌ shooter_red.png 이미지 로딩 실패함');
  checkImagesLoaded();
};

blueShooterImage.onerror = () => {
  console.error('❌ shooter_blue.png 이미지 로딩 실패함');
  checkImagesLoaded();
};


redTowerImage.onerror = () => {
  console.error('❌ red_tower.png 로딩 실패');
  checkImagesLoaded();
};

blueTowerImage.onerror = () => {
  console.error('❌ blue_tower.png 로딩 실패');
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
let towers = {};


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
const roomId = params.get('roomId') || 'lobby';
const team = params.get('team') || 'red';

socket.emit('game register', { nickname, roomId, team });


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
    ctx.save(); 
    ctx.globalAlpha = 0.7;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {}

  // 유닛 그리기 (이미지가 로드된 경우에만)
  for (const u of units) {
    if (u.type === 'shooter') {
      if (u.team === 'red') {
        renderShooter(ctx, u, redShooterImage);
      } else {
        renderShooter(ctx, u, blueShooterImage);
      }
    } else {
      if (u.team === 'red') {
        renderSoldier(ctx, u, redSoldierImage);
      } else {
        renderSoldier(ctx, u, blueSoldierImage);
      }
    }
  }



  //타워 그리기
  if (towers.red && towers.blue) {
    // 빨간 팀 타워
    if (redTowerImage.complete && redTowerImage.naturalWidth > 0) {
      ctx.drawImage(redTowerImage, towers.red.x, towers.red.y, 200, 300);
    }
    // 파란 팀 타워
    if (blueTowerImage.complete && blueTowerImage.naturalWidth > 0) {
      ctx.drawImage(blueTowerImage, towers.blue.x, towers.blue.y, 200, 300);
    }

    const towerWidth = 200;
    const towerHeight = 300;

    // ❤️ 체력 텍스트
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center'; // ✅ 중심 정렬!
    ctx.fillText(`HP: ${towers.red.hp}`, towers.red.x + towerWidth / 2, towers.red.y - 10);
    ctx.fillText(`HP: ${towers.blue.hp}`, towers.blue.x + towerWidth / 2, towers.blue.y - 10);
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



// 서버로부터 전체 게임 상태 받으면 클라이언트 유닛,타워 목록 갱신
socket.on('gameUpdate', (state) => {

  // 현재 유닛,타워 리스트를 서버에서 받은 것으로 덮어씀
  units.length = 0
  units.push(...state.units)
  towers = state.towers; 
})


// 게임 오버 수신 처리
socket.on('gameOver', (data) => {
  console.log('🛑 게임 종료됨:', data.reason);

  // 예: 알림창으로 표시
  alert(data.reason);
});

const exitGameBtn = document.getElementById('exitGameBtn');
exitGameBtn.addEventListener('click', () => {
  socket.emit('game end', { roomId, nickname });
  setTimeout(() => {
    socket.disconnect();
    window.location.href = `joinRoom.html?nickname=${nickname}`;
  }, 600);
});

socket.on('force exit', () => {
  alert('게임이 강제 종료되었습니다.');
  socket.disconnect();
  setTimeout(() => {
    window.location.href = `joinRoom.html?nickname=${nickname}`;
  }, 200);
});