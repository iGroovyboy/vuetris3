<template>
  <div :class="['board', statusClass]">
    <template v-for="(row, id) in renderData" :key="id">
      <div class="row" :class="'c-' + id" v-if="row.length > 0">
        <span
          class="cell"
          :class="cellClass(cell)"
          :style="cellColor(cell)"
          v-for="cell in row"
        >
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from "vue";
import { STATUS, SYMBOL } from "../util/constants.ts";
import { TCell, TLevel } from "../util/interfaces.ts";

const props = defineProps({
  renderData: {
    type: Object as PropType<TLevel>,
    required: true,
  },
  status: {
    type: Object as PropType<STATUS>,
    default: STATUS.Stop,
  },
});

let blockColor = "green";

const statusClass = ref(STATUS.Stop);

const cellClass = (cell: TCell): Record<string, boolean> => {
  return {
    empty: cell === SYMBOL.empty,
    borderY: cell === SYMBOL.borderY,
    borderX: cell === SYMBOL.borderX,
    block: cell === SYMBOL.block,
    full: cell === SYMBOL.full,
  };
};

const cellColor = (cell: TCell): Record<string, string> => {
  if (props.status === STATUS.Stop) {
    return { backgroundColor: randomColor() };
  }

  return { backgroundColor: cell === SYMBOL.block ? blockColor : "" };
};

watch(
  () => props.status,
  () => {
    statusClass.value = props.status;

    if (STATUS.NewBlock === props.status) {
      statusClass.value = STATUS.Play;
      blockColor = randomColor();
    }
  },
);

const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);
</script>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
}

.play .row {
  opacity: 1;
}

.pause .row {
  opacity: 0.4;
}

.cell {
  width: 18px;
  height: 18px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  margin: 2px;
  display: block;
  background-color: transparent;
  /* transition: background-color  1.0s cubic-bezier(0, 0, 0.1, 0.7); */
  animation: none;
}

.play .cell {
  animation: none;
}

.stop .cell.borderY,
.stop .cell.borderX {
  animation: borderCycle 4s infinite linear;
}

.stop .cell.block,
.stop .cell.empty {
  background-color: transparent !important;
  border: 1px solid black;
}

.play .cell.borderY,
.play .cell.borderX {
  background-color: orange;
}

.score .cell.borderY,
.score .cell.borderX {
  background-color: #14ff00;
}

@keyframes score {
  0% {
    background-color: orange;
  }

  50% {
    background-color: #00ff00;
  }

  100% {
    background-color: orange;
  }
}

@keyframes borderCycle {
  12.5% {
    background-color: #ff0000;
  }

  25% {
    background-color: #ffa500;
  }

  37.5% {
    background-color: #ffff00;
  }

  50% {
    background-color: #7fff00;
  }

  62.5% {
    background-color: #00ffff;
  }

  75% {
    background-color: #0000ff;
  }

  87.5% {
    background-color: #9932cc;
  }

  100% {
    background-color: #ff1493;
  }
}

.borderY {
  background-color: orange;
}

.borderX,
.play .borderX {
  background-color: orange;
  transition: background-color 0.3s ease-out;
}

.collision .borderX {
  background-color: red;
}

.block {
  border-radius: 7px;
  transition: background-color 0s;
  background-color: rgb(178, 234, 25);
}

.empty {
  border: 1px solid transparent;
  background-color: transparent;
}

.full {
  background-color: black;
  border-radius: 0;
}
</style>
