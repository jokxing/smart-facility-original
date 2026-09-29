// Preserve the existing captchaImageStr contract (raw PNG base64).
export function createCaptchaImage(code) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eff6ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 30px monospace';
  ctx.fillStyle = '#163b62';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, 80, 26);
  return canvas.toDataURL('image/png').split(',')[1];
}
