<template>
  <div class="scores">
    <span class="score">Score: {{ score }}</span>
    <span class="level"
      >Level: {{ Math.floor(blockN / blocksPerSpeedLevel) + 1 }}</span
    >
  </div>

  <div class="main">
    <TBoard :renderData="renderData" :status="status" ref="board" />

    <TMobileButtons
      :is-on="isOn"
      :is-pause="isPause"
      @play="play"
      @resume="play(true)"
      @pause="pauseGame"
      @stop="stopGame"
      @left="action(DIRECTION.Left)"
      @right="action(DIRECTION.Right)"
      @down="action(DIRECTION.Down)"
      @rotate="action(DIRECTION.Rotate)"
    />
  </div>
</template>

<script setup lang="ts">
import TBoard from "./TBoard.vue";
import * as fn from "../util/lib.ts";
import { TRandomBlockData } from "../util/lib.ts";
import {
  BLOCKS,
  BLOCKS_NAMES,
  DIRECTION,
  SCORE_MAP,
  STATUS,
  SYMBOL,
  TBlock,
  USER_KEYS,
} from "../util/constants.ts";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { TLevel, TRow } from "../util/interfaces.ts";
import { clone, playSound } from "../util/helpers.ts";
import TMobileButtons from "./TMobileButtons.vue";

const blocksPerSpeedLevel = 15;
const msPerSpeedLevel = 50;

const speedMin = 500;
let speed = speedMin;

const sizeX = 10;
const sizeY = 20;
const topY = 0;

const isOn = ref(false);
const isPause = ref(false);

const renderData = ref<TLevel>([]);
const renderTxt = ref<TLevel | string>("");
const status = ref<STATUS>(STATUS.Stop);

const destroyed = ref(0);
const score = ref(0);
const blockN = ref(0);

const isAnimation = ref(false);

let timer: number | null = null;
let frame: number = 0;
let currentBlock: BLOCKS_NAMES | null = null;
let currentBlockData: TBlock | null = null;
let allowRotation = true;
let level: TLevel;
let levelOfBlock: TLevel = [];

watch(
  () => blockN.value,
  () => {
    if (
      status.value === STATUS.Play &&
      blockN.value % blocksPerSpeedLevel === 0 &&
      speed > 50
    ) {
      speed -= msPerSpeedLevel;
      if (timer) clearInterval(timer);
      play(true);
    }
  },
);

const init = () => {
  level = fn.createEmptyLevel(sizeX, sizeY, topY);
  levelOfBlock = fn.createEmptyLevel(sizeX, sizeY, topY);
  renderView();
};

const play = (resume = false) => {
  isOn.value = true;

  //if (isOn === false){
  //  clearInterval(timer);
  //  frame = 0;
  //  console.log('Game stopped');
  //  return;
  //}

  if (!resume && isPause.value === true && timer) {
    clearInterval(timer);
    return;
  }

  if (resume) {
    isPause.value = false;
  }

  status.value = STATUS.Play;

  timer = setInterval(() => {
    if (frame === 0) {
      level = fn.createEmptyLevel(sizeX, sizeY, topY);
      levelOfBlock = fn.createEmptyLevel(sizeX, sizeY, topY);

      destroyed.value = 0;
      score.value = 0;
    }

    runTick();

    frame++;

    if (isOn.value === false && timer) {
      clearInterval(timer);
    }
  }, speed);
};

// kills interval, etc.
const pauseGame = () => {
  isPause.value = true;
  if (timer) clearInterval(timer);
  status.value = STATUS.Pause;
};

// kills interval, etc.
const stopGame = () => {
  status.value = STATUS.Stop;

  if (timer) clearInterval(timer);

  isOn.value = false;
  isPause.value = false;
  frame = 0;
  blockN.value = 0;
  speed = speedMin;

  level = fn.createEmptyLevel(sizeX, sizeY, topY);
  levelOfBlock = [];
  currentBlock = null;
  currentBlockData = null;
  // renderView();
};

const renderView = () => {
  let levelTxt = "",
    levelArray: TLevel = [];

  for (let Y = topY; Y <= sizeY; Y++) {
    levelArray[Y] = [];
    for (let X = 0; X <= sizeX + 1; X++) {
      if (!level[Y]) {
        continue;
      }
      if (levelOfBlock[Y] === undefined) {
        continue;
      }

      let cellView = level[Y][X];
      // draw level cell

      // draw current block
      if (
        levelOfBlock[Y] !== null &&
        levelOfBlock[Y][X] === SYMBOL.blockMapFull
      ) {
        cellView = SYMBOL.block;
      }

      levelTxt += cellView;
      levelArray[Y].push(cellView);

      if (X == sizeX + 1) {
        levelTxt += "\n";
      }
    }
  }
  renderTxt.value = levelTxt;

  let emptyRow = new Array(sizeX + 2);
  emptyRow = emptyRow.fill(SYMBOL.borderY);

  levelArray.unshift(emptyRow);
  renderData.value = levelArray.filter((el) => el != null);

  //console.clear();
  //console.log(levelTxt);
};

const runTick = () => {
  if (!currentBlock) {
    blockN.value++;
    const randomBlock: TRandomBlockData = fn.pickRandomBlock(BLOCKS);

    levelOfBlock = fn.createEmptyLevel(sizeX, sizeY, topY);
    levelOfBlock = fn.addNewBlockToLOB(
      randomBlock.data,
      levelOfBlock,
      sizeX,
      topY,
    );

    currentBlock = randomBlock.name as BLOCKS_NAMES;
    currentBlockData = randomBlock.data;

    status.value = STATUS.NewBlock;

    if (fn.hasOverlaps(level, levelOfBlock, sizeY, sizeX, topY)) {
      //gameover coz we have overlaps on top
      stopGame();
      playSound("gameover");
    }
  }

  if (moveCurrentBlockDown()) {
    renderView();
  }

  maybeDestroyLines();

  return true;
};

const moveCurrentBlockDown = () => {
  if (!currentBlock) {
    return false;
  }

  allowRotation = false;

  // shift data one row down on levelOfBlock
  let emptyRow = new Array(sizeX + 2);
  emptyRow = emptyRow.fill(SYMBOL.borderY).fill(SYMBOL.empty, 1, sizeX + 1);

  let levelOfBlockShifted = clone(levelOfBlock); //[...levelOfBlock];
  levelOfBlockShifted.pop();
  levelOfBlockShifted.unshift(emptyRow);
  levelOfBlockShifted = levelOfBlockShifted.filter((el: TRow) => el != null);

  if (fn.hasOverlaps(level, levelOfBlockShifted, sizeY, sizeX, topY)) {
    level = fn.transferBlockToLevel(level, levelOfBlock, sizeY, sizeX, topY);

    // clear currentBlock, levelOfBlock
    currentBlock = null;
    levelOfBlock = [];

    status.value = STATUS.Collision;

    playSound("fall");

    return false;
  }

  levelOfBlock = levelOfBlockShifted;

  allowRotation = true;

  return true;
};

// check lines, destroy them, animate
const maybeDestroyLines = () => {
  const linesToDestroy = fn.getFullLines(level, sizeY, topY);

  if (!linesToDestroy.length || isAnimation.value === true) {
    return false;
  }

  console.log(
    "Lines to be removed: " + linesToDestroy.length,
    linesToDestroy,
    level,
  );

  isAnimation.value = true;

  level = fn.removeLineFromLevel(level, linesToDestroy, sizeX);

  isAnimation.value = false;

  //console.log('AFTER DESTROY ', level);
  destroyed.value += linesToDestroy.length;

  score.value += calcScore(linesToDestroy.length);
  status.value = STATUS.Score;

  playSound("explosion");

  return true;
};

const calcScore = (lines: number) => SCORE_MAP[lines];

// user
// left/-1 right/1 null/0
const moveBlock = (direction: DIRECTION) => {
  let levelOfBlockMOVE = [...levelOfBlock];

  // shift data
  // get edges of level to see if there are block cells
  const edge = fn.getLevelBordersData(levelOfBlock, sizeY, sizeX, topY);

  // if block cells are on the edge - dont move block
  if (DIRECTION.Left === direction && edge.left.includes(SYMBOL.blockMapFull)) {
    return false;
  } else if (
    DIRECTION.Right === direction &&
    edge.right.includes(SYMBOL.blockMapFull)
  ) {
    return false;
  }

  for (let y = topY; y < sizeY; y++) {
    levelOfBlockMOVE[y] = fn.arrShift(levelOfBlockMOVE[y], direction, sizeX);
  }

  // checkCollision
  if (fn.hasOverlaps(level, levelOfBlockMOVE, sizeY, sizeX, topY)) {
    return false;
  }

  // update levelOfBlock if possible
  levelOfBlock = levelOfBlockMOVE;

  return true;
};

// user
const rotateBlock = (blockData: TBlock) => {
  // TODO: mb add debounce to avoid 'climbing up'

  if (blockData === undefined) {
    return false;
  }

  const rotatedBlock = fn.rotateMatrixLeft(blockData);

  //find lowest and leftest point in levelOfBlock - use is as y coord
  const h = rotatedBlock.length,
    w = rotatedBlock[0].length;

  let lowestY = 0,
    lowestX = sizeX - 1 - w;

  ({ lowestX, lowestY } = fn.getCurrentBlockPos(
    currentBlock,
    levelOfBlock,
    lowestY,
    lowestX,
    sizeY,
    sizeX,
    topY,
  ));

  if (lowestY <= h) {
    console.log(`Can't rotate - no available space`);
    return false;
  }

  currentBlockData = rotatedBlock;

  //clear levelOfBlock
  levelOfBlock = fn.createEmptyLevel(sizeX, sizeY, topY);

  //paste at y coord torated src block using block height
  const y1Pos = lowestY - h;
  const y2Pos = lowestY - 1;

  const x1Pos = lowestX;
  const x2Pos = lowestX - 1 + w;

  for (let y = y1Pos; y <= y2Pos; y++) {
    for (let x = x1Pos; x <= x2Pos; x++) {
      levelOfBlock[y][x] = rotatedBlock[y - y1Pos][x - x1Pos];
    }
  }

  return true;
};

const action = (action: DIRECTION) => {
  playSound("move");
  let r = false;

  if (action === DIRECTION.Right) {
    r = moveBlock(DIRECTION.Right);
    if (r) renderView();
  } else if (action === DIRECTION.Left) {
    r = moveBlock(DIRECTION.Left);
    if (r) renderView();
  } else if (action === DIRECTION.Rotate && allowRotation) {
    r = rotateBlock(currentBlockData || BLOCKS[currentBlock || BLOCKS_NAMES.I]);
    if (r) renderView();
    // TODO: 1 bug - when rotating too often block gets up
    // TODO: 2 bug - extra line blinks below horiz border
  } else if (action === DIRECTION.Down) {
    for (let times = 1; times <= 3; times++) {
      // TODO: maybe optimize
      r = moveCurrentBlockDown();
      if (r) renderView();
    }
  }
};

const userKeyDown = (e: KeyboardEvent) => {
  if (level === null || levelOfBlock === null) {
    return;
  }

  playSound("move");

  let r = false;

  if (e.code === USER_KEYS.ArrowRight) {
    r = moveBlock(DIRECTION.Right);
    if (r) renderView();
  } else if (e.code === USER_KEYS.ArrowLeft) {
    r = moveBlock(DIRECTION.Left);
    if (r) renderView();
  } else if (e.code === USER_KEYS.ArrowUp && allowRotation) {
    // e.code === 'Space'
    r = rotateBlock(currentBlockData || BLOCKS[currentBlock || BLOCKS_NAMES.I]);
    if (r) renderView();
    // TODO: 1 bug - when rotating too often block gets up
    // TODO: 2 bug - extra line blinks below horiz border
  } else if (e.code === USER_KEYS.ArrowDown) {
    for (let times = 1; times <= 3; times++) {
      // TODO: maybe optimize
      r = moveCurrentBlockDown();
      if (r) renderView();
    }
  } else if (e.code === USER_KEYS.Space) {
    for (let times = 1; times <= sizeY; times++) {
      // TODO: maybe optimize
      r = moveCurrentBlockDown();
      if (r) renderView();
    }
  }
};

onMounted(() => {
  document.addEventListener("keydown", userKeyDown);
  init();
});

onUnmounted(() => {
  document.removeEventListener("keydown", userKeyDown);
});
</script>

<style scoped>
.scores {
  display: flex;
  column-gap: 40px;
  justify-content: center;

  span {
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.zone {
  min-width: 210px;
  min-height: 400px;
  padding: 0;
}
</style>
