import {BoardCellTypes} from "@/types/BoardCellTypes";
import {BoardCellTypes} from "@/types/BoardCellTypes";
<template>
    <div class="cell" :class="{'snake': isSnake}" :style="`--size: ${width}`" v-html="value">
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {BoardCellModel} from '@/models/BoardCell.model';
  import {BoardSizeModel} from '@/models/boardSize.model';
  import {BoardCellTypes} from '@/types/BoardCellTypes';

  const fruits: String[] = ['&#127813;',
    '&#127814;',
    '&#127815;',
    '&#127816;',
    '&#127817;',
    '&#127818;',
    '&#127819;',
    '&#127820;',
    '&#127821;',
    '&#127822;',
    '&#127823;',
    '&#127824;',
    '&#127825;',
    '&#127826;',
    '&#127827;'];

  @Component
  export default class BoardCell extends Vue {
    @Prop() private cell!: BoardCellModel;
    @Prop() private size!: BoardSizeModel;

    get width() {
      const {x, y} = this.size;
      if (x >= y) {
        return `calc(90vmin / ${x} )`;
      } else {
        return `calc(90vmin / ${y} )`;
      }
    }

    get isSnake() {
      return this.cell.value === BoardCellTypes.SNAKE;
    }

    get value() {
      switch (this.cell.value) {
        case BoardCellTypes.SNAKE: {
          return ``;
        }
        case BoardCellTypes.SNAKEHEAD: {
          return `O`;
        }
        case BoardCellTypes.FRUIT: {
          return fruits[Math.floor(Math.random() * fruits.length - 1)];
        }
        default:
          return '';
      }
    }
  }
</script>

<style scoped lang="scss">
    .cell {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--size);
        height: var(--size);
        font-size: calc( var(--size) * 0.6);
        box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.4);

        &.snake {
            opacity: 0;
            background-color: #19be7f;
            animation: 150ms ease forwards show;
        }
    }

    @keyframes show {
        from     {
            opacity: 0;
        }

        to{
            opacity: 1;
        }

    }
</style>
