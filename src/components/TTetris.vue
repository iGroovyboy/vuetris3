<template>
  <div class="main">
    <h1>VUETRIS</h1>
    <div>
      <span class="score">Score: {{ score }}</span>
    </div>
    <div class="zone">
      <TBoard :renderData="renderData" :status="status" ref="board" />
    </div>

    <div class="buttons">
      <button class="btn" v-show="!isOn || (!isOn && !isPause)" @click="main()">
        {{ playBtnText }}
      </button>
      <button class="btn" v-show="isOn && isPause" @click="main(true)">
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

<script>
import TBoard from "./TBoard.vue";

import * as fn from "@/util/lib.ts";
import { STR, SYMBOL, BLOCKS, STATUS } from "@/util/constants.ts";

export default {
  name: "TTetris",
  props: {
    msg: String,
  },
  components: {
    TBoard,
  },
  data() {
    return {
      speed: 500,
      isOn: false,
      isPause: false,
      playBtnText: "Play",
      pauseBtnText: "Pause",
      resumeBtnText: "Resume",
      stopBtnText: "Stop",
      timer: null,
      frame: 0,
      isAnimation: false,

      board: "",
      sizeX: 10,
      sizeY: 20,
      topY: 0,

      currentBlock: null,
      currentBlockData: null,
      allowRotation: true,

      level: null,
      levelOfBlock: [],

      renderData: [],
      renderTxt: "",
      status: "stop",

      destroyed: 0,
      score: 0,
    };
  },
  created() {
    console.clear();
  },
  mounted() {
    document.addEventListener("keydown", this.userKeyDown);
  },
  unmounted() {
    document.removeEventListener("keydown", this.userKeyDown);
  },
  methods: {
    main(resume = false) {
      this.isOn = true;

      //if (this.isOn === false){
      //  clearInterval(this.timer);
      //  this.frame = 0;
      //  console.log('Game stopped');
      //  return;
      //}

      if (!resume && this.isPause === true) {
        clearInterval(this.timer);
        console.log("Game paused");
        return;
      }

      if (resume) {
        this.isPause = false;
      }

      this.status = STATUS.Play;

      console.log("Game is on!");

      this.timer = setInterval(() => {
        if (this.frame === 0) {
          this.level = fn.createEmptyLevel(
            this.sizeX,
            this.sizeY,
            this.topY,
            SYMBOL,
          );
          this.levelOfBlock = fn.createEmptyLevel(
            this.sizeX,
            this.sizeY,
            this.topY,
            SYMBOL,
          );

          this.destroyed = 0;
          this.score = 0;
        }

        this.runTick();
        this.board = this.frame;

        this.frame++;

        if (this.isOn === false) {
          clearInterval(this.timer);
        }
      }, this.speed);
    },

    // kills interval, etc.
    pauseGame() {
      this.isPause = true;
      clearInterval(this.timer);
      this.status = STATUS.Pause;
      console.log("GAME PAUSED", this.isPause, this.isOn); // todo: add html
    },

    // kills interval, etc.
    stopGame() {
      this.status = STATUS.Stop;

      clearInterval(this.timer);
      this.timer = null;

      this.isOn = false;
      this.frame = 0;
      this.speed = 500;

      this.level = fn.createEmptyLevel(
        this.sizeX,
        this.sizeY,
        this.topY,
        SYMBOL,
      );
      this.levelOfBlock = [];
      this.currentBlock = null;
      this.currentBlockData = null;
      // this.renderView();

      console.log("Game Stoped"); // todo: add html
    },

    renderView() {
      let levelTxt = "",
        levelArray = [];

      for (let Y = this.topY; Y <= this.sizeY; Y++) {
        levelArray[Y] = [];
        for (let X = 0; X <= this.sizeX + 1; X++) {
          if (!this.level[Y]) {
            continue;
          }
          if (this.levelOfBlock[Y] === undefined) {
            continue;
          }

          let cellView = this.level[Y][X];
          // draw level cell

          // draw current block
          if (
            this.levelOfBlock[Y] !== null &&
            this.levelOfBlock[Y][X] === SYMBOL.blockMapFull
          ) {
            cellView = SYMBOL.block;
          }

          levelTxt += cellView;
          levelArray[Y].push(cellView);

          if (X == this.sizeX + 1) {
            levelTxt += "\n";
          }
        }
      }
      this.renderTxt = levelTxt;

      let emptyRow = new Array(this.sizeX + 2);
      emptyRow = emptyRow.fill(SYMBOL.borderY);

      levelArray.unshift(emptyRow);
      this.renderData = levelArray.filter((el) => el != null);

      //console.clear();
      //console.log(levelTxt);
    },

    runTick() {
      if (!this.currentBlock) {
        const randomBlock = fn.pickRandomBlock(BLOCKS);

        this.levelOfBlock = fn.createEmptyLevel(
          this.sizeX,
          this.sizeY,
          this.topY,
          SYMBOL,
        );
        this.levelOfBlock = fn.addNewBlockToLOB(
          randomBlock.data,
          this.levelOfBlock,
          this.sizeX,
          this.topY,
        );

        this.currentBlock = randomBlock.name;
        this.currentBlockData = randomBlock.data;

        this.status = STATUS.NewBlock;

        //console.log('New Block of type: ' + randomBlock.name, randomBlock.data)

        if (
          fn.hasOverlaps(
            this.level,
            this.levelOfBlock,
            SYMBOL,
            this.sizeY,
            this.sizeX,
            this.topY,
          )
        ) {
          //gameover coz we have overlaps on top
          this.stopGame();
        }
      }

      if (this.moveCurrentBlockDown()) {
        this.renderView();
      }

      this.maybeDestroyLines();

      return true;
    },

    moveCurrentBlockDown() {
      if (!this.currentBlock) {
        return false;
      }

      this.allowRotation = false;

      // shift data one row down on levelOfBlock
      let emptyRow = new Array(this.sizeX + 2);
      emptyRow = emptyRow
        .fill(SYMBOL.borderY)
        .fill(SYMBOL.empty, 1, this.sizeX + 1);

      let levelOfBlockShifted = JSON.parse(JSON.stringify(this.levelOfBlock)); //[...this.levelOfBlock];
      levelOfBlockShifted.pop();
      levelOfBlockShifted.unshift(emptyRow);
      levelOfBlockShifted = levelOfBlockShifted.filter((el) => el != null);

      if (
        fn.hasOverlaps(
          this.level,
          levelOfBlockShifted,
          SYMBOL,
          this.sizeY,
          this.sizeX,
          this.topY,
        )
      ) {
        this.level = fn.transferBlockToLevel(
          this.level,
          this.levelOfBlock,
          SYMBOL,
          this.sizeY,
          this.sizeX,
          this.topY,
        );

        // clear currentBlock, levelOfBlock
        this.currentBlock = null;
        this.levelOfBlock = [];

        this.status = STATUS.Collision;

        return false;
      }

      this.levelOfBlock = levelOfBlockShifted;

      this.allowRotation = true;

      return true;
    },

    // check lines, destroy them, animate
    maybeDestroyLines() {
      const linesToDestroy = fn.getFullLines(
        this.level,
        SYMBOL,
        this.sizeY,
        this.sizeX,
        this.topY,
      );

      if (!linesToDestroy.length || this.isAnimation === true) {
        return false;
      }

      console.log(
        "Lines to be removed: " + linesToDestroy.length,
        linesToDestroy,
        this.level,
      );

      this.isAnimation = true;

      this.level = fn.removeLineFromLevel(
        this.level,
        SYMBOL,
        linesToDestroy,
        this.sizeY,
        this.sizeX,
        this.topY,
      );

      this.isAnimation = false;

      //console.log('AFTER DESTROY ', this.level);
      this.destroyed += linesToDestroy.length;

      this.score += this.calcScore(linesToDestroy.length);
      this.status = STATUS.Score;

      return true;
    },

    calcScore(lines) {
      const scoreMap = {
        1: 100,
        2: 300,
        3: 500,
        4: 1000,
        5: 2000,
      };

      return scoreMap[lines];
    },

    // left/-1 right/1 null/0
    moveBlock(direction) {
      let levelOfBlockMOVE = [...this.levelOfBlock];

      // shift data
      // get edges of level to see if there are block cells
      const edge = fn.getLevelBordersData(
        this.levelOfBlock,
        this.sizeY,
        this.sizeX,
        this.topY,
      );

      // if block cells are on the edge - dont move block
      if ("left" === direction && edge["left"].includes(SYMBOL.blockMapFull)) {
        return false;
      } else if (
        "right" === direction &&
        edge["right"].includes(SYMBOL.blockMapFull)
      ) {
        return false;
      }

      for (let y = this.topY; y < this.sizeY; y++) {
        levelOfBlockMOVE[y] = fn.arrShift(
          levelOfBlockMOVE[y],
          direction,
          SYMBOL,
          this.sizeX,
        );
      }

      // checkCollision
      if (
        fn.hasOverlaps(
          this.level,
          levelOfBlockMOVE,
          SYMBOL,
          this.sizeY,
          this.sizeX,
          this.topY,
        )
      ) {
        return false;
      }

      // update levelOfBlock if possible
      this.levelOfBlock = levelOfBlockMOVE;

      return true;
    },

    rotateBlock(blockData, direction = "left") {
      // TODO: add direction?
      if (blockData === undefined) {
        return false;
      }

      const rotatedBlock = fn.rotateMatrixLeft(blockData);

      //find lowest and leftest point in levelOfBlock - use is as y coord
      const h = rotatedBlock.length,
        w = rotatedBlock[0].length;

      let lowestY = 0,
        lowestX = this.sizeX - 1 - w;

      ({ lowestX, lowestY } = fn.getCurrentBlockPos(
        this.currentBlock,
        this.levelOfBlock,
        lowestY,
        lowestX,
        SYMBOL,
        this.sizeY,
        this.sizeX,
        this.topY,
      ));

      if (lowestY <= h) {
        console.log(`Can't rotate - no available space`);
        return false;
      }

      this.currentBlockData = rotatedBlock;

      //clear levelOfBlock
      this.levelOfBlock = fn.createEmptyLevel(
        this.sizeX,
        this.sizeY,
        this.topY,
        SYMBOL,
      );

      //paste at y coord torated src block using block height
      const y1Pos = lowestY - h;
      const y2Pos = lowestY - 1;

      const x1Pos = lowestX;
      const x2Pos = lowestX - 1 + w;

      for (let y = y1Pos; y <= y2Pos; y++) {
        for (let x = x1Pos; x <= x2Pos; x++) {
          this.levelOfBlock[y][x] = rotatedBlock[y - y1Pos][x - x1Pos];
        }
      }

      return true;
    },

    userKeyDown(e) {
      // console.log(e)
      if (this.level === null || this.levelOfBlock === null) {
        return;
      }

      let r = false;

      if (e.code === "ArrowRight") {
        r = this.moveBlock("right");
        if (r) this.renderView();
      } else if (e.code === "ArrowLeft") {
        r = this.moveBlock("left");
        if (r) this.renderView();
      } else if (e.code === "ArrowUp" && this.allowRotation) {
        // e.code === 'Space'
        r = this.rotateBlock(
          this.currentBlockData || BLOCKS[this.currentBlock],
        );
        if (r) this.renderView();
        // TODO: 1 bug - when rotating too often block gets up
        // TODO: 2 bug - extra line blinks below horiz border
      } else if (e.code === "ArrowDown") {
        for (let times = 1; times <= 3; times++) {
          // TODO: maybe optimize
          r = this.moveCurrentBlockDown();
          if (r) this.renderView();
        }
      } else if (e.code === "Space") {
        for (let times = 1; times <= this.sizeY; times++) {
          // TODO: maybe optimize
          r = this.moveCurrentBlockDown();
          if (r) this.renderView();
        }
      }
    },
  },
};
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.zone {
  width: 210px;
  height: 400px;
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
