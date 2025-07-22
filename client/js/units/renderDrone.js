export function renderDrone(ctx, unit, image) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();
  ctx.drawImage(image, unit.x, unit.y, 150, 150);

  // === 공격 이펙트(뒤집힌 흰색 삼각형, 더 길게) ===
  if (unit.laserEffectTimer > 0) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'white';

    // 삼각형 좌표 계산 (드론 아래, 밑변이 아래로)
    const centerX = unit.x + 75;      // 드론 이미지의 중앙 x
    const baseY = unit.y + 110;  // 드론 이미지 하단에서 더 아래로 내림 (40px)
    const height = 160;               // 삼각형 높이 (더 길게)
    const width = 200;                 // 삼각형 밑변 길이 (더 넓게)

    ctx.beginPath();
    ctx.moveTo(centerX, baseY);                   // 위쪽 꼭짓점 (좁은 쪽)
    ctx.lineTo(centerX - width / 2, baseY + height); // 왼쪽 아래
    ctx.lineTo(centerX + width / 2, baseY + height); // 오른쪽 아래
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }


  // 데미지 효과
//   if (unit.isDamaged) {
//     ctx.globalAlpha = 0.5;
//     ctx.fillStyle = 'red';
//     ctx.fillRect(unit.x - 50, unit.y - 50, 100, 100);
//     ctx.globalAlpha = 1.0;
//   }
  ctx.restore();
}