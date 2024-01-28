<template>
  <div class="main">
    <h1>VUETRIS</h1>
    <div>
      <span class="score"
        >Score: {{ score }} | Level:
        {{ Math.floor(blockN / blocksPerSpeedLevel) + 1 }}</span
      >
    </div>
    <div class="zone">
      <TBoard :renderData="renderData" :status="status" ref="board" />
    </div>

    <div class="buttons">
      <button class="btn" v-show="!isOn || (!isOn && !isPause)" @click="play()">
        {{ playBtnText }}
      </button>
      <button class="btn" v-show="isOn && isPause" @click="play(true)">
        {{ resumeBtnText }}
      </button>
      <button class="btn" v-show="isOn && !isPause" @click="pauseGame()">
        {{ pauseBtnText }}
      </button>
      <button class="btn" v-show="isOn" @click="stopGame()">
        {{ stopBtnText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import TBoard from "./TBoard.vue";
import * as fn from "@/util/lib.ts";
import {
  BLOCKS,
  BLOCKS_NAMES,
  DIRECTION,
  SCORE_MAP,
  STATUS,
  SYMBOL,
  TBlock,
} from "@/util/constants.ts";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { TLevel } from "@/util/interfaces.ts";
import { clone } from "@/util/helpers.ts";

const blocksPerSpeedLevel = 15;
const msPerSpeedLevel = 50;

const speedMin = 500;
let speed = speedMin;

const sizeX = 10;
const sizeY = 20;
const topY = 0;

const playBtnText = "Play";
const pauseBtnText = "Pause";
const resumeBtnText = "Resume";
const stopBtnText = "Stop";

const isOn = ref(false);
const isPause = ref(false);

const renderData = ref<TLevel>([]);
const renderTxt = ref<TLevel>("");
const status = ref<STATUS>("stop");

const destroyed = ref(0);
const score = ref(0);
const blockN = ref(0);

const isAnimation = ref(false);

let timer: number | null = null;
let frame: number = 0;
let currentBlock: BLOCKS_NAMES | null = null;
let currentBlockData: TBlock | null = null;
let allowRotation = true;
let level: TLevel = null;
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
      clearInterval(timer);
      play(true);
    }
  },
);

const play = (resume = false) => {
  isOn.value = true;

  //if (isOn === false){
  //  clearInterval(timer);
  //  frame = 0;
  //  console.log('Game stopped');
  //  return;
  //}

  if (!resume && isPause.value === true) {
    clearInterval(timer);
    console.log("Game paused");
    return;
  }

  if (resume) {
    isPause.value = false;
  }

  status.value = STATUS.Play;

  console.log("Game is on!");

  timer = setInterval(() => {
    if (frame === 0) {
      level = fn.createEmptyLevel(sizeX, sizeY, topY);
      levelOfBlock = fn.createEmptyLevel(sizeX, sizeY, topY);

      destroyed.value = 0;
      score.value = 0;
    }

    runTick();

    frame++;

    if (isOn.value === false) {
      clearInterval(timer);
    }
  }, speed);
};

// kills interval, etc.
const pauseGame = () => {
  isPause.value = true;
  clearInterval(timer);
  status.value = STATUS.Pause;
  console.log("GAME PAUSED", isPause.value, isOn.value); // todo: add html
};

// kills interval, etc.
const stopGame = () => {
  status.value = STATUS.Stop;

  clearInterval(timer);

  isOn.value = false;
  frame = 0;
  blockN.value = 0;
  speed = speedMin;

  level = fn.createEmptyLevel(sizeX, sizeY, topY);
  levelOfBlock = [];
  currentBlock = null;
  currentBlockData = null;
  // renderView();

  console.log("Game Stoped"); // todo: add html
};

const renderView = () => {
  let levelTxt = "",
    levelArray = [];

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
    const randomBlock = fn.pickRandomBlock(BLOCKS);

    levelOfBlock = fn.createEmptyLevel(sizeX, sizeY, topY);
    levelOfBlock = fn.addNewBlockToLOB(
      randomBlock.data,
      levelOfBlock,
      sizeX,
      topY,
    );

    currentBlock = randomBlock.name;
    currentBlockData = randomBlock.data;

    status.value = STATUS.NewBlock;

    //console.log('New Block of type: ' + randomBlock.name, randomBlock.data)

    if (fn.hasOverlaps(level, levelOfBlock, sizeY, sizeX, topY)) {
      //gameover coz we have overlaps on top
      stopGame();
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
  levelOfBlockShifted = levelOfBlockShifted.filter((el) => el != null);

  if (fn.hasOverlaps(level, levelOfBlockShifted, sizeY, sizeX, topY)) {
    level = fn.transferBlockToLevel(level, levelOfBlock, sizeY, sizeX, topY);

    // clear currentBlock, levelOfBlock
    currentBlock = null;
    levelOfBlock = [];

    status.value = STATUS.Collision;

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

  level = fn.removeLineFromLevel(level, linesToDestroy, sizeY, sizeX);

  isAnimation.value = false;

  //console.log('AFTER DESTROY ', level);
  destroyed.value += linesToDestroy.length;

  score.value += calcScore(linesToDestroy.length);
  status.value = STATUS.Score;

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
  // TODO: add direction?
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

const userKeyDown = (e) => {
  // console.log(e)
  if (level === null || levelOfBlock === null) {
    return;
  }

  let r = false;

  if (e.code === "ArrowRight") {
    r = moveBlock(DIRECTION.Right);
    if (r) renderView();
  } else if (e.code === "ArrowLeft") {
    r = moveBlock(DIRECTION.Left);
    if (r) renderView();
  } else if (e.code === "ArrowUp" && allowRotation) {
    // e.code === 'Space'
    r = rotateBlock(currentBlockData || BLOCKS[currentBlock]);
    if (r) renderView();
    // TODO: 1 bug - when rotating too often block gets up
    // TODO: 2 bug - extra line blinks below horiz border
  } else if (e.code === "ArrowDown") {
    for (let times = 1; times <= 3; times++) {
      // TODO: maybe optimize
      r = moveCurrentBlockDown();
      if (r) renderView();
    }
  } else if (e.code === "Space") {
    for (let times = 1; times <= sizeY; times++) {
      // TODO: maybe optimize
      r = moveCurrentBlockDown();
      if (r) renderView();
    }
  }
};

onMounted(() => {
  console.log("mounted");
  console.clear();
  document.addEventListener("keydown", userKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", userKeyDown);
});
</script>

<style scoped>
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

.score {
  font-size: 1.2rem;
}

.buttons {
  display: flex;
}

.btn {
  background-color: orange;
  border: 2px solid black;
  padding: 5px 20px;
  margin: 10px;
  font-size: 1rem;
  font-weight: 600;
  min-width: 110px;
}
</style>
