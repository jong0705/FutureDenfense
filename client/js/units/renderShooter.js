export function renderShooter(ctx, unit, image) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();
  ctx.drawImage(image, unit.x, unit.y, 100, 100);

  // 데미지 효과
  if (unit.isDamaged) { 
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'red';
    ctx.fillRect(unit.x, unit.y, 100, 100);
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();
}
