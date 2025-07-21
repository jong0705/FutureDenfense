export function renderSoldier(ctx, unit, image) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();

  ctx.drawImage(image, unit.x, unit.y, 50, 50);
  
   // 데미지 효과
  if (unit.isDamaged) { 
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'red';
    ctx.fillRect(unit.x, unit.y, 100, 100);
    ctx.globalAlpha = 1.0;
  }

  //체력바 나타내기기
  const barWidth = 60;
  const barHeight = 8;
  const x = unit.x;
  const y = unit.y - 15;
  ctx.fillStyle = 'gray';
  ctx.fillRect(x, y, barWidth, barHeight);
  const hpRatio = unit.maxHp ? Math.max(unit.hp, 0) / unit.maxHp : 0;
  ctx.fillStyle = 'lime';
  ctx.fillRect(x, y, barWidth * hpRatio, barHeight);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x, y, barWidth, barHeight);

  ctx.restore();
}
