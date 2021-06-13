type SpiralParams = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  imageData: ImageData;
  colorChannel: 0 | 1 | 2;
  /** between 0 and 1 */
  stopAt: number;
} & (
  | {
    kind: 'basic';
    /** between 0 and 1 */
    treshold: number;
  }
  | {
    kind: 'linear';
    /** starting at 1 */
    divider: number;
  }
  | {
    kind: 'looped';
    /** starting at 1 */
    divider: number;
    /** starting at 1 */
    multiplier: number;
  }
);

export default (params: SpiralParams) => {
  const state = {
    x: Math.floor(params.width / 2),
    y: Math.floor(params.height / 2),
    done: false,
  };

  const stopFn = (() => {
    switch (params.kind) {
      case 'basic': return (l: number) => l < params.treshold;
      case 'linear': return (l: number, i: number) => l < (i / params.divider);
      case 'looped': return (l: number, i: number) => ((l * params.multiplier) % 1) < (i / params.divider);
    }
  })();

  const createMatrix = (fn) => (new Array(params.width)).fill(null).map((_, x) => (
    (new Array(params.height)).fill(null).map((__, y) => (
      fn(x, y)
    ))
  ));

  const src = createMatrix((x, y) => params.imageData.data[4 * (params.width * y + x) + params.colorChannel] / 256);
  const drawn = createMatrix(() => false);

  const isInCanvas = ({ x, y }) => x >= 0 && x < params.width && y >= 0 && y < params.height;

  function* spiralPositions() {
    const spiralPosition = {
      x: state.x,
      y: state.y,
    };
    for (let l = 1; l < Math.max(params.width, params.height); l += 2) {
      for (let i = 0; i < l; i++) {
        spiralPosition.x++;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
      for (let i = 0; i < l; i++) {
        spiralPosition.y++;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
      for (let i = 0; i < l + 1; i++) {
        spiralPosition.x--;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
      for (let i = 0; i < l + 1; i++) {
        spiralPosition.y--;
        if (isInCanvas(spiralPosition)) yield spiralPosition;
      }
    }
  }

  let nbDrawn = 0;
  const move = () => {
    let i = 0;
    for (const spiralPosition of spiralPositions()) {
      i++;
      const { x, y } = spiralPosition;
      if (!drawn[x][y]) {
        if (stopFn(src[x][y], i)) {
          state.x = x;
          state.y = y;
          drawn[x][y] = true;
          nbDrawn++;
          if (nbDrawn > params.width * params.height * params.stopAt) state.done = true;
          return;
        }
      }
    }
    state.done = true;
  };

  return Object.assign(state, { move });
};
