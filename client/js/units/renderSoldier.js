export function renderSoldier(ctx, unit, image) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();

  if (unit.team === 'blue') {
    ctx.translate(unit.x + 20, unit.y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, -20, 0, 40, 40);
  } else {
    ctx.drawImage(image, unit.x, unit.y, 40, 40);
  }

  ctx.restore();
}
