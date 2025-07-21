export function renderTowerHealthBar(ctx, tower) {
  ctx.save();

  const barWidth = 180;   // 유닛보다 훨씬 넓게
  const barHeight = 20;   // 두껍게
  const x = tower.x + 10; // 타워 이미지에 맞게 위치 조정
  const y = tower.y - 30; // 타워 위에 띄우기

  // 배경(짙은 회색)
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, barWidth, barHeight);

  // 체력 비율
  const hpRatio = Math.max(tower.hp, 0) / (tower.maxHp || 1000);
  ctx.fillStyle = '#228B22'; // 강렬한 초록
  ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

  // 테두리(굵게)
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(x, y, barWidth, barHeight);

  // 체력 수치 텍스트(크고 굵게)
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(
    `HP: ${tower.hp} / ${tower.maxHp || 1000}`,
    x + barWidth / 2,
    y - 8 // 바 위로 8px 더 띄움
  );

  ctx.restore();
}