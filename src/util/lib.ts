import {
  BLOCKS_NAMES,
  DIRECTION,
  SYMBOL,
  TBlock,
  TBlocks,
} from "./constants.ts";
import { TCell, TLevel, TRow } from "./interfaces.ts";
import { clone } from "./helpers.ts";

//TODO: refac - remove topY and replace with 1 or 0

export function createEmptyLevel(X: number, Y: number, topY: number): TLevel {
  const l: TLevel = [];
  for (let y = topY; y <= Y; y++) {
    l[y] = [];
    for (let x = 0; x <= X + 1; x++) {
      // todo: refac using .fill
      if (x == 0 || x == 11) {
        l[y][x] = SYMBOL.borderY;
      } else if (y == Y) {
        l[y][x] = SYMBOL.borderX;
      } else {
        l[y][x] = SYMBOL.empty;
      }
    }
  }

  return l;
}

export function transferBlockToLevel(
  level: TLevel,
  levelOfBlock: TLevel,
  sizeY: number,
  sizeX: number,
  topY: number,
): TLevel {
  // intersect arrays of level with levelOfBlock, save to level
  const l = clone(level);
  for (let y = topY; y < sizeY; y++) {
    for (let x = 1; x <= sizeX; x++) {
      if (levelOfBlock[y] && levelOfBlock[y][x] === SYMBOL.blockMapFull) {
        l[y][x] = SYMBOL.full;
      }
    }
  }

  return l;
}

export type TRandomBlockData = {
  name: string;
  data: TBlock;
};

export function pickRandomBlock(blocks: TBlocks): TRandomBlockData {
  const blocksArray = Object.entries(blocks);
  const id = Math.floor(Math.random() * blocksArray.length);
  const randomBlock = blocksArray[id];
  // console.log(randomBlock[0], randomBlock[1])

  return { name: randomBlock[0], data: randomBlock[1] };
}

export function addNewBlockToLOB(
  blockData: TBlock,
  levelOfBlock: TLevel,
  sizeX: number,
  topY: number,
): TLevel {
  const l = clone(levelOfBlock);
  const block = blockData;
  const centerX = Math.round(sizeX / 2);
  const blockHeight = block?.length;
  const blockWidth = block[0]?.length;

  for (let y = topY; y <= blockHeight; y++) {
    for (let x = 0; x <= blockWidth; x++) {
      if (block[y - topY] !== undefined || block[y - topY] !== undefined) {
        l[y][centerX + x] = block[y - topY][x];
      }
    }
  }

  return l;
}

export type TLevelBordersData = {
  left: TCell[];
  right: TCell[];
};

export function getLevelBordersData(
  levelOfBlock: TLevel,
  sizeY: number,
  sizeX: number,
  topY: number,
): TLevelBordersData {
  const edge: TLevelBordersData = {
    left: [],
    right: [],
  };

  for (let y = topY; y < sizeY; y++) {
    if (levelOfBlock[y] !== undefined) {
      edge.left.push(levelOfBlock[y][1]);
      edge.right.push(levelOfBlock[y][sizeX]);
    }
  }

  return edge;
}

//dont use vertical borders in calculations: start from 1 on X
export function hasOverlaps(
  level: TLevel,
  levelOfBlock: TLevel,
  sizeY: number,
  sizeX: number,
  topY: number,
): boolean {
  if (!level || !levelOfBlock) {
    return true;
  }

  //console.log(levelOfBlock)

  for (let y = topY; y <= sizeY; y++) {
    for (let x = 0; x <= sizeX + 1; x++) {
      if (!level[y] || !levelOfBlock[y]) {
        continue;
      }

      const currentBlockHere = levelOfBlock[y][x] === SYMBOL.blockMapFull;

      // collision with other block
      if (level[y][x] === SYMBOL.full && currentBlockHere) {
        return true;
      }

      // collision with bottom border
      const borderWidth = 0;
      if (y === sizeY - borderWidth && currentBlockHere) {
        return true;
      }

      // collision with side borders
      // const isBorderPosition = x === 0 || x === sizeX;
      // if (isBorderPosition && currentBlockHere) {
      //   return true;
      // }

      if (level[y][x] === SYMBOL.borderY && currentBlockHere) {
        // console.log("|");
        return true;
      }
    }
  }

  return false;
}

export function arrShift(arr: TRow, direction: DIRECTION, sizeX: number): TRow {
  let row = [];
  if (arr === undefined || !Array.isArray(arr)) {
    return arr;
  }

  if (direction === DIRECTION.Left) {
    row = arr.slice(1, sizeX + 1);
    row.push(SYMBOL.empty); // todo: do we need this?
  } else if (direction === DIRECTION.Right) {
    row = arr.slice(0, sizeX);
    row.unshift(SYMBOL.empty);
  } else {
    row = arr;
  }

  return row;
}

// rotates array of arrays left (ccw)
export function rotateMatrixLeft(matrix: TBlock): TBlock {
  if (!matrix || !matrix.length) {
    return matrix;
  }

  let rotatedMatrix: TBlock = [];
  for (let y = matrix?.length - 1; y >= 0; y--) {
    for (let x = matrix[y]?.length - 1; x >= 0; x--) {
      rotatedMatrix[x] = rotatedMatrix[x] || [];

      if (matrix) {
        const i = matrix[y].length - 1 - x;
        rotatedMatrix[x][y] = matrix[y][i];
      }
    }
  }

  return rotatedMatrix;
}

export type TBlockPosition = {
  lowestY: number;
  lowestX: number;
};

export function getCurrentBlockPos(
  currentBlock: BLOCKS_NAMES | null,
  levelOfBlock: TLevel,
  lowestY: number,
  lowestX: number,
  sizeY: number,
  sizeX: number,
  topY: number,
): TBlockPosition {
  if (!currentBlock) {
    return {
      lowestY: topY,
      lowestX: Math.round(sizeX / 2),
    };
  }

  let lY = lowestY,
    lX = lowestX;
  for (let y = sizeY; y > topY; y--) {
    for (let x = 0; x <= sizeX + 1; x++) {
      if (
        levelOfBlock[y] !== undefined &&
        levelOfBlock[y][x] === SYMBOL.blockMapFull
      ) {
        if (y > lY) {
          lY = y;
        }

        if (x < lX) {
          lX = x;
        }
      }
    }
  }

  return {
    lowestY: lY,
    lowestX: lX,
  };
}

export function getFullLines(
  level: TLevel,
  sizeY: number,
  topY: number,
): number[] {
  if (!level) {
    return [];
  }

  const coords = [];
  const levelClone = clone(level);

  for (let y = topY; y <= sizeY; y++) {
    if (!levelClone[y]) {
      continue;
    }

    //remove borders
    if (levelClone[y]) {
      let row: TRow = Array.isArray(levelClone[y])
        ? levelClone[y]
        : levelClone[y].split("");

      row.pop();
      row.shift();

      if (row.every((cell: TCell) => cell === SYMBOL.full)) {
        coords.push(y);
      }
    }
  }

  coords.sort(function (a, b) {
    return b - a;
  });

  return coords;
}

export function removeLineFromLevel(
  level: TLevel,
  linesToDestroy: number[],
  sizeX: number,
): TLevel {
  if (!level) {
    return level;
  }

  level = JSON.parse(JSON.stringify(level));

  let emptyRow = new Array(sizeX + 2);
  emptyRow = emptyRow.fill(SYMBOL.borderY).fill(SYMBOL.empty, 1, sizeX + 1);

  let bottomRow = new Array(sizeX + 2);
  bottomRow = bottomRow.fill(SYMBOL.borderY).fill(SYMBOL.borderX, 1, sizeX + 1);

  for (let id = linesToDestroy.length - 1; id >= 0; id--) {
    level.splice(linesToDestroy[id], 1);
    level.unshift(emptyRow);
  }

  level.push(bottomRow);

  //let emptyRow = new Array(sizeX + 2);
  //emptyRow = emptyRow.fill(SYMBOL.borderY).fill(SYMBOL.empty, 1, sizeX + 1)

  //for(let id = 0; id < linesToDestroy.length; id++){
  //  level.unshift(emptyRow);
  //}

  return level.filter((el) => el != null);
}
