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

export enum DIRECTION {
  Left = "left",
  Right = "right",
  Down = "down",
  Up = "up",
}

export enum BLOCKS_NAMES {
  L = "L",
  S = "S",
  I = "I",
  W = "W",
  O = "O",
}

export type TBlockRow = number[];

export type TBlock = TBlockRow[];

export type TBlocks = Record<BLOCKS_NAMES, TBlock>;

export const BLOCKS: TBlocks = {
  [BLOCKS_NAMES.L]: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [BLOCKS_NAMES.S]: [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  [BLOCKS_NAMES.I]: [[1], [1], [1], [1]],
  [BLOCKS_NAMES.W]: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [BLOCKS_NAMES.O]: [
    [1, 1],
    [1, 1],
  ],
};
