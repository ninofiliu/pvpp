import createSpiral from './createSpiral';

// ________________0_______1_______2_______3_______4_______5_______6_______7_____
// ________________..._____..1_____.1._____.11_____1.._____1.1_____11._____111___
const palette = ['#000', '#222', '#333', '#555', '#777', '#999', '#bbb', '#fff'];
const reveal = [1, 2, 4];
const batch = 500;

const channels = [0, 1, 2] as const;

const canvas = document.querySelector('canvas');
const image = new Image();
image.src = '/in/nelle.jpg';
image.onload = () => {
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  ctx.filter = 'grayscale(100%) contrast(1.5)';
  ctx.drawImage(image, 0, 0);
  const greyImageData = ctx.getImageData(0, 0, width, height);
  ctx.filter = 'grayscale(0%) contrast(1)';

  const spirals = channels.map((channel) => createSpiral({
    ctx,
    imageData,
    channel,
    stopAt: 0.8,
    kind: 'compressed',
    divider: 8,
    multiplier: 4,
    quality: 5,
  }));

  const drawn = new Uint8Array(3 * width * height);

  let paused = false;
  const loop = () => {
    if (paused) return;
    for (let i = 0; i < batch; i++) {
      for (const channel of channels) {
        const spiral = spirals[channel];
        if (spiral.done) return;
        spiral.move();
        const n = (width * spiral.y + spiral.x);
        const drawnIndex = 3 * n;
        const paletteIndex = 4 * drawn[drawnIndex] + 2 * drawn[drawnIndex + 1] + drawn[drawnIndex + 2];
        const paletteColor = palette[paletteIndex];
        const srcColor = `rgb(${greyImageData.data[4 * n]},${greyImageData.data[4 * n + 1]},${greyImageData.data[4 * n + 2]})`;
        ctx.fillStyle = reveal.includes(paletteIndex) ? srcColor : paletteColor;
        ctx.fillRect(spiral.x, spiral.y, 1, 1);
        drawn[drawnIndex + channel] = 1;
      }
    }
    requestAnimationFrame(loop);
  };
  document.addEventListener('keypress', (evt) => {
    switch (evt.key) {
      case ' ':
        if (paused) {
          paused = false;
          loop();
        } else {
          paused = true;
        }
        break;
    }
  });
  loop();
};
