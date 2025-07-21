export function renderDrone(ctx, unit, image) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();
  ctx.drawImage(image, unit.x, unit.y, 150, 150);

  // 데미지 효과
//   if (unit.isDamaged) {
//     ctx.globalAlpha = 0.5;
//     ctx.fillStyle = 'red';
//     ctx.fillRect(unit.x - 50, unit.y - 50, 100, 100);
//     ctx.globalAlpha = 1.0;
//   }
  ctx.restore();
}