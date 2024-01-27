<template>
    <div :class="['board', status]">
        <template v-for="row in renderData">
            <div class="row" v-if="row.length > 0">
                <span class="cell" :class="cellClass(cell)" :style="cellColor(cell)" v-for="cell in row">
                </span>
            </div>
        </template>
    </div>
</template>
  
<script>
import { SYMBOL } from '@/util/strings.ts';
import { ref } from 'vue';

export default {
    name: 'TBoard',
    props: {
        renderData: Array,
        renderTxt: String,
    },
    setup(props) {
        let blockColor = ref('green');
        const status = ref('stop');
        let stopTimer = null;

        const cellClass = (cell) => {
            return {
                empty: cell === SYMBOL.empty,
                borderY: cell === SYMBOL.borderY,
                borderX: cell === SYMBOL.borderX,
                block: cell === SYMBOL.block,
                full: cell === SYMBOL.full,
            };
        };

        const cellColor = (cell) => {
            if (status.value === 'stop') {
                return { backgroundColor: cell === randomColor() };
            }
            return { backgroundColor: cell === SYMBOL.block ? blockColor.value : '' };
        };

        const newBlockEvent = () => {
            status.value = 'play';
            blockColor.value = randomColor();
        };

        const collisionEvent = () => {
            status.value = 'collision';
        };
        const scoreEvent = () => {
            status.value = 'score';
        };
        const gamePauseEvent = () => {
            status.value = 'pause';
        };
        const gamePlayEvent = () => {
            status.value = 'play';
        };
        const gameStopEvent = () => {
            status.value = 'stop';
        };

        const randomColor = () =>
            '#' + Math.floor(Math.random() * 16777215).toString(16);

        return {
            blockColor,
            status,

            cellClass,
            cellColor,
            newBlockEvent,
            randomColor,

            scoreEvent,
            gamePauseEvent,
            gameStopEvent,
            gamePlayEvent,
            collisionEvent,
        };
    },
};
</script>
  
<style scoped>
.board {
    margin: 0;

    margin-left: -5px;
    margin-top: -5px;

    font-family: monospace;
    font-size: 28px;
    position: absolute;
    display: flex;

    flex-direction: column;
}

.row {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
}

.play .row {
    opacity: 1;
}

.pause .row {
    opacity: 0.4;
}

.cell {
    width: 12px;
    height: 12px;
    border: 1px solid black;
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
  