export const STR = {
  PLAYBTN: {
    true: "STOP !",
    false: "Play !",
  },
};

export const SYMBOL = {
  borderY: "|",
  borderX: "-",

  empty: ".",

  full: "X",
  block: "*",

  blockMapEmpty: 0,
  blockMapFull: 1,
};

export enum STATUS {
  Play = "play",
  Collision = "collision",
  Score = "score",
  Pause = "pause",
  Stop = "stop",
  NewBlock = "newBlock",
}

export const BLOCKS = {
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  S: [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  I: [[1], [1], [1], [1]],
  W: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
};
