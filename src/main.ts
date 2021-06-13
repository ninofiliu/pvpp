import createSpiral from './createSpiral';

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
  ctx.filter = 'grayscale(100%)';
  ctx.drawImage(image, 0, 0);
  ctx.filter = 'grayscale(0%)';

  const spirals = channels.map((channel) => createSpiral({
    ctx,
    imageData,
    channel,
    stopAt: 0.5,
    kind: 'looped',
    divider: 10,
    multiplier: 3,
  }));

  const palette = ['#000', '#00f', '#0f0', '#0ff', '#f00', '#f0f', '#ff0', '#fff'];
  const drawn = new Uint8Array(3 * width * height);

  const loop = () => {
    for (let i = 0; i < 500; i++) {
      for (const channel of channels) {
        const spiral = spirals[channel];
        if (spiral.done) return;
        spiral.move();
        const n = 3 * (width * spiral.y + spiral.x);
        ctx.fillStyle = palette[4 * drawn[n] + 2 * drawn[n + 1] + drawn[n + 2]];
        ctx.fillRect(spiral.x, spiral.y, 1, 1);
        drawn[n + channel] = 1;
      }
    }
    requestAnimationFrame(loop);
  };
  loop();
};
