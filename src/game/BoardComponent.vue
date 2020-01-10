<template>
    <div class="board">
        <template v-for="y in board">
            <div class="board__row">
                <BoardCell v-for="x in y" :cell="x" :size="size"/>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import {BoardSizeModel} from '@/models/boardSize.model';
import BoardCell from './components/BoardCell.vue';
import {BoardCellTypes} from '@/types/BoardCellTypes';

@Component({
  components: {
    BoardCell,
  },
})
export default class BoardComponent extends Vue {
  @Prop() private board!: BoardSizeModel;
  @Prop() private size!: BoardSizeModel;
}
</script>

<style scoped lang="scss">
    .board {
        display: inline-block;
        border: 1px solid lightblue;
        &__row {
            display: flex;
            justify-content: center;
        }
    }
</style>
