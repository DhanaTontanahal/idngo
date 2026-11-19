function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function createDemonstrationImage(title) {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#DCEBE3';
  ctx.fillRect(0, 0, 960, 600);
  ctx.fillStyle = '#FFFFFF';
  roundedRect(ctx, 40, 40, 880, 520, 20);
  ctx.fill();
  ctx.strokeStyle = '#006747';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = '#B7D4C6';
  ctx.lineWidth = 2;
  roundedRect(ctx, 72, 84, 816, 432, 12);
  ctx.stroke();
  ctx.fillStyle = '#04261C';
  ctx.textAlign = 'center';
  ctx.font = '700 40px "Source Sans 3", "Segoe UI", sans-serif';
  ctx.fillText(title, 480, 286);
  ctx.fillStyle = '#3C5148';
  ctx.font = '400 22px "Source Sans 3", "Segoe UI", sans-serif';
  ctx.fillText('Demonstration photograph', 480, 342);
  ctx.fillText('Not a real customer document', 480, 378);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function readImageFile(file) {
  if (!file) {
    return Promise.reject(new Error('Choose a photograph first.'));
  }
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Use a JPEG, PNG, or WebP photograph.'));
  }
  if (file.size > 10 * 1024 * 1024) {
    return Promise.reject(new Error('That photograph is larger than 10 MB.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The photograph could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxEdge = 1280;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({
          fileName: file.name || 'document.jpg',
          dataUrl: canvas.toDataURL('image/jpeg', 0.72),
        });
      };
      image.onerror = () => reject(new Error('Use a JPEG, PNG, or WebP photograph.'));
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
