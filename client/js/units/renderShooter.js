export function renderShooter(ctx, unit, image) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();

  if (unit.team === 'blue') {
    ctx.translate(unit.x + 25, unit.y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, -25, 0, 100, 100); // 슈터는 더 크게
  } else {
    ctx.drawImage(image, unit.x, unit.y, 100, 100);
  }

  ctx.restore();
}
