"use strict";

//TODO: refac - remove topY and replace with 1 or 0

export function createEmptyLevel(X, Y, topY, SYMBOL) {
  let l = [];
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
  level,
  levelOfBlock,
  SYMBOL,
  sizeY,
  sizeX,
  topY
) {
  // intersect arrays of level with levelOfBlock, save to level
  for (let y = topY; y < sizeY; y++) {
    for (let x = 1; x <= sizeX; x++) {
      if (levelOfBlock[y] && levelOfBlock[y][x] === SYMBOL.blockMapFull) {
        level[y][x] = SYMBOL.full;
      }
    }
  }

  return level;
}

export function pickRandomBlock(blocks) {
  const blocksArray = Object.entries(blocks);
  const id = Math.floor(Math.random() * blocksArray.length);
  const randomBlock = blocksArray[id];
  // console.log(randomBlock[0], randomBlock[1])

  return { name: randomBlock[0], data: randomBlock[1] };
}

export function addNewBlockToLOB(blockData, levelOfBlock, sizeX, topY) {
  const block = blockData;
  const centerX = Math.round(sizeX / 2);
  const blockHeight = block.length;
  const blockWidth = block[0].length;

  for (let y = topY; y <= blockHeight; y++) {
    for (let x = 0; x <= blockWidth; x++) {
      if (block[y - topY] !== undefined || block[y - topY] !== undefined) {
        levelOfBlock[y][centerX + x] = block[y - topY][x];
      }
    }
  }

  return levelOfBlock;
}

export function getLevelBordersData(levelOfBlock, sizeY, sizeX, topY) {
  let edge = [];

  edge["left"] = [];
  edge["right"] = [];

  for (let y = topY; y < sizeY; y++) {
    if (levelOfBlock[y] !== undefined) {
      edge["left"].push(levelOfBlock[y][1]);
      edge["right"].push(levelOfBlock[y][sizeX]);
    }
  }

  return edge;
}

//dont use vertical borders in calculations: start from 1 on X
export function hasOverlaps(level, levelOfBlock, SYMBOL, sizeY, sizeX, topY) {
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
        console.log("|");
        return true;
      }
    }
  }

  return false;
}

export function arrShift(arr, direction, SYMBOL, sizeX) {
  let row = [];
  if (arr === undefined || !Array.isArray(arr)) {
    return arr;
  }

  if (direction === "left" || direction === -1) {
    row = arr.slice(1, sizeX + 1);
    row.push(SYMBOL.empty); // todo: do we need this?
  } else if (direction === "right" || direction === 1) {
    row = arr.slice(0, sizeX);
    row.unshift(SYMBOL.empty);
  } else {
    row = arr;
  }

  return row;
}

// rotates array of arrays left (ccw)
export function rotateMatrixLeft(matrix) {
  let rotatedMatrix = [];
  for (let y = matrix.length - 1; y >= 0; y--) {
    for (let x = matrix[y].length - 1; x >= 0; x--) {
      rotatedMatrix[x] = rotatedMatrix[x] || [];

      if (matrix !== undefined) {
        const i = matrix[y].length - 1 - x;
        rotatedMatrix[x][y] = matrix[y][i];
      }
    }
  }
  return rotatedMatrix;
}

export function getCurrentBlockPos(
  currentBlock,
  levelOfBlock,
  lowestY,
  lowestX,
  SYMBOL,
  sizeY,
  sizeX,
  topY
) {
  if (!currentBlock) {
    return { lowestY: topY, lowestX: Math.round(sizeX / 2) };
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

  return { lowestY: lY, lowestX: lX };
}

export function getFullLines(level, SYMBOL, sizeY, sizeX, topY) {
  if (!level) {
    return [];
  }

  let coords = [];
  let levelClone = JSON.parse(JSON.stringify(level));

  for (let y = topY; y <= sizeY; y++) {
    if (!levelClone[y]) {
      continue;
    }

    //remove borders
    if (levelClone[y]) {
      let row = Array.isArray(levelClone[y])
        ? levelClone[y]
        : levelClone[y].split("");

      row.pop();
      row.shift();

      if (row.every((cell) => cell === SYMBOL.full)) {
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
  level,
  SYMBOL,
  linesToDestroy,
  sizeY,
  sizeX,
  topY
) {
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
