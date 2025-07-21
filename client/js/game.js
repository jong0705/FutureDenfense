// game.js 수정
import {io} from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js" 

console.log('✅ game.js 실행됨');


//렌더러 
import { renderShooter } from './units/renderShooter.js';
import { renderMelee } from './units/renderMelee.js';
import { renderTowerHealthBar } from './units/renderTower.js';


// 이미지 로드
const bgImage = new Image();
const redMeleeImage = new Image();
const blueMeleeImage = new Image();
const redShooterImage = new Image(); // 슈터 부르기
const blueShooterImage = new Image();
const redTowerImage = new Image();
const blueTowerImage = new Image();



// 이미지 소스 설정
bgImage.src = '/assets/background.png';
redShooterImage.src = '/assets/unit/shooter_red.png';  
blueShooterImage.src = '/assets/unit/shooter_blue.png';
redMeleeImage.src = '/assets/unit/melee_red.png';
blueMeleeImage.src = '/assets/unit/melee_blue.png';
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
redMeleeImage.onload = checkImagesLoaded;
blueMeleeImage.onload = checkImagesLoaded;
redShooterImage.onload = checkImagesLoaded;
blueShooterImage.onload = checkImagesLoaded;
redTowerImage.onload = checkImagesLoaded;
blueTowerImage.onload = checkImagesLoaded;
bgImage.onload = checkImagesLoaded;


// 이미지 로딩 실패 이벤트
redMeleeImage.onerror = () => {
  console.error('❌ melee_red.png 이미지 로딩 실패함');
  checkImagesLoaded(); // 에러가 있어도 카운터 증가
};

blueMeleeImage.onerror = () => {
  console.error('❌ melee_blue.png 이미지 로딩 실패함');
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
let entities = [];



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


// // 유닛 생성 수신
// socket.on('unitJoined', (unit) => {
//   console.log('🟡 unitJoined 수신됨:', unit); 
// });
socket.on('unitJoined', (unit) => {
  console.log('🟡 unitJoined 수신됨:', unit); 
  entities.push(unit);
});


// === 유닛 체력바 함수 ===
function renderUnitHealthBar(ctx, unit, x, y) {
  const barWidth = 60;
  const barHeight = 8;
  ctx.save();
  ctx.fillStyle = 'gray';
  ctx.fillRect(x, y, barWidth, barHeight);
  const hpRatio = unit.maxHp ? Math.max(unit.hp, 0) / unit.maxHp : 0;
  ctx.fillStyle = 'lime';
  ctx.fillRect(x, y, barWidth * hpRatio, barHeight);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x, y, barWidth, barHeight);
  ctx.restore();
}


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

  //타워 그리기
  const redTower = entities.find(e => e.type === 'tower' && e.team === 'red');
  const blueTower = entities.find(e => e.type === 'tower' && e.team === 'blue');

  if (redTower && blueTower) {
    if (redTowerImage.complete && redTowerImage.naturalWidth > 0) {
      ctx.drawImage(redTowerImage, redTower.x, redTower.y, 200, 300);
      renderTowerHealthBar(ctx, redTower);
    }

    if (blueTowerImage.complete && blueTowerImage.naturalWidth > 0) {
      ctx.drawImage(blueTowerImage, blueTower.x, blueTower.y, 200, 300);
      renderTowerHealthBar(ctx, blueTower);
    }
  }

  // 유닛 그리기 (이미지가 로드된 경우에만)
  const unitEntities = entities.filter(u => u.type === 'melee' || u.type === 'shooter');
  const sortedEntities = [...unitEntities].sort((a, b) => a.x - b.x);

  for (let i = 0; i < sortedEntities.length; i++) {
    const u = sortedEntities[i];

    // 겹치는 유닛 그룹 찾기 (x좌표가 10px 이내인 같은 팀/타입 유닛)
    const overlapGroup = sortedEntities.filter(e =>
      Math.abs(e.x - u.x) < 10 && e.type === u.type && e.team === u.team
    );
    const myIndex = overlapGroup.findIndex(e => e.id === u.id);

    // 체력바 y좌표를 겹치지 않게 위로 쌓기
    const baseY = u.y - 15;
    const barYOffset = myIndex * 12; // 12px씩 위로

    // 유닛 이미지 그리기
    if (u.type === 'shooter') {
      if (u.team === 'red') {
        renderShooter(ctx, u, redShooterImage);
      } else {
        renderShooter(ctx, u, blueShooterImage);
      }
    } else if (u.type === 'melee') {
      if (u.team === 'red') {
        renderMelee(ctx, u, redMeleeImage);
      } else {
        renderMelee(ctx, u, blueMeleeImage);
      }
    }

    // 체력바만 따로 그리기 (x, y를 직접 지정)
    renderUnitHealthBar(ctx, u, u.x, baseY - barYOffset);
  }
  requestAnimationFrame(draw);
}


//유닛 생성 버튼 클릭 시 소켓 전송
const spawnButton = document.getElementById('spawnButton');

spawnButton.addEventListener('click', () => {
  console.log("🟢 유닛 생성 버튼 클릭됨");
  socket.emit('spawnUnit', { type: 'melee' });
});
spawnShooterBtn.addEventListener('click', () => {
  console.log("🔫 사수 유닛 생성 버튼 클릭됨");
  socket.emit('spawnUnit', { type: 'shooter' });  // 서버로 shooter 타입 전송
});


function upgradeStat(unitType, stat) {
  socket.emit('upgradeStat', { unitType, stat });
}

document.getElementById('upgradeMeleeHpBtn').addEventListener('click', () => {
  upgradeStat('melee', 'hp');
});
document.getElementById('upgradeMeleeDamageBtn').addEventListener('click', () => {
  upgradeStat('melee', 'damage');
});
document.getElementById('upgradeShooterHpBtn').addEventListener('click', () => {
  upgradeStat('shooter', 'hp');
});
document.getElementById('upgradeShooterDamageBtn').addEventListener('click', () => {
  upgradeStat('shooter', 'damage');
});
document.getElementById('upgradeDroneHpBtn').addEventListener('click', () => {
  upgradeStat('drone', 'hp');
});
document.getElementById('upgradeDroneDamageBtn').addEventListener('click', () => {
  upgradeStat('drone', 'damage');
});



// 서버로부터 전체 게임 상태 받으면 클라이언트 유닛,타워 목록 갱신
socket.on('gameUpdate', (state) => {
  // 현재 유닛,타워 리스트를 서버에서 받은 것으로 덮어씀
  entities = state.entities;
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



// moneyDisplay DOM 가져오기
const moneyDisplay = document.getElementById('moneyDisplay');

// gameUpdate 이벤트에서 내 팀의 돈 표시
socket.on('gameUpdate', (state) => {
  entities = state.entities;

  // 내 팀의 돈 표시
  if (state.money && team) {
    moneyDisplay.textContent = `현재 금액 : ${state.money[team]}원`;
  }
  // 내 팀의 유닛 스탯 표시
  if (state.unitStats && state.unitStats[team]) {
    updateStatLabels(state.unitStats[team]);
  }
});


// 기본값(초기 스탯)
const defaultStats = {
  melee: { hp: 100, damage: 10 },
  shooter: { hp: 120, damage: 8 },
  drone: { hp: 80, damage: 15 }
};

// 각 유닛의 스텟 표기해주는 함수
function updateStatLabels(unitStats) {
  ['melee', 'shooter', 'drone'].forEach(type => {
    // 체력
    const hp = unitStats[type]?.hp ?? defaultStats[type].hp;
    const hpLevel = Math.floor((hp - defaultStats[type].hp) / 20);
    document.getElementById(`${type}HpStat`).textContent = `체력: ${hp} (Lv.${hpLevel})`;
    // 공격력
    const dmg = unitStats[type]?.damage ?? defaultStats[type].damage;
    const dmgLevel = Math.floor((dmg - defaultStats[type].damage) / 2);
    document.getElementById(`${type}DamageStat`).textContent = `공격: ${dmg} (Lv.${dmgLevel})`;
  });
}


// 업그레이드/생성 모드 전환환
let upgradeMode = false;
const toggleBtn = document.getElementById('toggleBtn');

function setUpgradeMode(on) {
  document.querySelectorAll('.upgrade-group').forEach(g => g.style.display = on ? 'flex' : 'none');
  document.querySelector('.spawn-group').style.display = on ? 'none' : 'flex';
  toggleBtn.textContent = on ? '🚀 생성' : '🛠️ 업그레이드';
  toggleBtn.style.background = on ? '#ffeaa7' : '';
}

toggleBtn.addEventListener('click', () => {
  upgradeMode = !upgradeMode;
  setUpgradeMode(upgradeMode);
});