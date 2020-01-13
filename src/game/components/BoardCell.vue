<template>
    <div class="cell" :class="{'snake': isSnake, 'block': isBlock, 'ghost': isGhost}"  v-html="value">
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {BoardCellModel} from '@/models/BoardCell.model';
  import {BoardCellTypes} from '@/types/BoardCellTypes';

  const fruits: string[] = ['&#127813;',
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

    get isSnake() {
      return this.cell.value === BoardCellTypes.SNAKE;
    }
    get isBlock() {
      return this.cell.value === BoardCellTypes.BLOCK;
    }

    get isGhost() {
      return this.cell.value === BoardCellTypes.SNAKE_GHOST;
    }

    get value() {
      switch (this.cell.value) {
        case BoardCellTypes.BLOCK: {
          return '&#128163;';
        }case BoardCellTypes.FRUIT: {
          return fruits[Math.floor(Math.random() * fruits.length)];
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

        &.ghost {
            opacity: 0.2;
            background-color: #19be7f;
            /*animation: 150ms ease forwards show;*/
        }

        &.block {
            animation: 260ms ease forwards show;

            background: red;
        }
    }

    @keyframes show {
        from     {
            opacity: 0;
            transform: scale(1.4);
        }

        to{
            opacity: 1;
            transform: scale(1);

        }

    }
</style>
