import {Direction} from "@/types/Direction";
import {Direction} from "@/types/Direction";
import {Direction} from "@/types/Direction";
import {BoardCellTypes} from "@/types/BoardCellTypes";
<template>
    <div class="game">
        <div class="gameboard">
            <BoardComponent :size="boardSizes" :board="gameBoard.fields"/>
            <EndGameModal :points="points" v-if="endGame"/>
        </div>
        SPEED: {{1000 / speed}}
        <br>
        POINTS: {{points}}
    </div>
</template>

<script lang="ts">
import BoardComponent from '@/game/BoardComponent.vue';
import EndGameModal from '@/game/components/endGameModal.vue';
import {BoardCellTypes} from '@/types/BoardCellTypes';
import {BoardCellModel} from '@/models/BoardCell.model';
import {Coords} from '@/models/Coords';
import {Component, Vue} from 'vue-property-decorator';
import {BoardModel} from '@/models/Board.model';
import {Direction} from '@/types/Direction';
import {Board} from '@/classes/Board';
import {BoardCell} from '@/classes/BoardCell';

const BOARD_SIZE = {
  x: 25,
  y: 25,
};

const createFruit = (colCount: number, rowCount: number): BoardCellModel => {
  const {x, y} = getRandomCoors(colCount, rowCount);
  return new BoardCell(BoardCellTypes.FRUIT, x, y);
};

const createSnake = (): BoardCellModel[] => {
  return Array(10).fill({}).map((val, i) =>
    new BoardCell(
      BoardCellTypes.SNAKE,
      Math.floor(BOARD_SIZE.x / 2),
      Math.floor(BOARD_SIZE.y / 2) - i,
    ),
  );
};

const getRandomCoors = (x: number, y: number): Coords => {
  const newX = Math.floor(Math.random() * x);
  const newY = Math.floor(Math.random() * y);

  return {x: newX, y: newY};
};


const moveSnake = (snake: BoardCellModel[], direction: Direction, fruit: BoardCellModel): {
  head: BoardCellModel,
  tail: BoardCellModel[],
} => {
  const [head] = snake;

  const newHead = {...head};

  switch (direction) {
    case Direction.TOP:
      newHead.y -= 1;
      break;
    case Direction.BOTTOM:
      newHead.y += 1;
      break;
    case Direction.RIGHT:
      newHead.x += 1;
      break;
    case Direction.LEFT:
      newHead.x -= 1;
      break;
  }

  if (newHead.x >= BOARD_SIZE.x) {
    newHead.x = 0;
  }

  if (newHead.x < 0) {
    newHead.x = BOARD_SIZE.x - 1;
  }

  if (newHead.y < 0) {
    newHead.y = BOARD_SIZE.y - 1;
  }

  if (newHead.y >= BOARD_SIZE.y) {
    newHead.y = 0;
  }


  return {
    head: newHead,
    tail: [...snake],
  };
};


const renderBoard = (board: BoardModel, snake: BoardCellModel[], fruit: BoardCellModel): BoardModel => {
  const fields = board.fields.map((row, y) =>
    row.map((cell, x) => {
      const snakeCell = snake.find((snakeItem) => {
        if (x === snakeItem.x && y === snakeItem.y) {
          return snakeItem;
        }
      });

      if (snakeCell) {
        return snakeCell;
      }

      if (x === fruit.x && y === fruit.y) {
        return fruit;
      }

      return cell;
    }),
  );

  return {...board, fields};
};

@Component({
  components: {
    BoardComponent,
    EndGameModal,
  },
})
export default class Game extends Vue {
  private board: BoardModel = new Board(BOARD_SIZE.x, BOARD_SIZE.y);
  private boardSizes: any = BOARD_SIZE;
  private snake: BoardCellModel[] = createSnake();
  private fruit: BoardCellModel = createFruit(BOARD_SIZE.x, BOARD_SIZE.y);
  private direction: Direction = Direction.RIGHT;
  private gameBoard: BoardModel = new Board(BOARD_SIZE.x, BOARD_SIZE.y);
  private speed: number = 100;
  private timer: number = 0;
  private endGame: boolean = false;
  private points: number = 0;

  public mounted() {
    this.timer = setTimeout(() => {
      this.gameTick();
    }, this.speed);

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      this.changeDirection(e.key as Direction);
    });
  }

  public gameTick() {
    const {head, tail} = moveSnake(this.snake, this.direction, this.fruit);
    const {fruit} = this;

    const isSelfEat = tail.some(
      (snakeSegment: BoardCellModel): boolean =>
        snakeSegment.x === head.x && snakeSegment.y === head.y,
    );

    if (isSelfEat) {
      this.endGame = true;
      return;
    }

    if (head.x === fruit.x && head.y === fruit.y) {
      this.eatFruit();
      this.snake = [head, ...tail];
    } else {
      this.snake = [head, ...tail.slice(0, -1)];
    }

    this.gameBoard = renderBoard(this.board, this.snake, this.fruit);

    setTimeout(() => {
      this.gameTick();
    }, this.speed);
  }

  public eatFruit() {
    const {fruit} = this;

    const newFruitPositions = getRandomCoors(BOARD_SIZE.x, BOARD_SIZE.y);
    fruit.x = newFruitPositions.x;
    fruit.y = newFruitPositions.y;

    this.points++;
    this.speed -= 5;

  }

  public changeDirection(direction: Direction) {
    /* блокируем изменение направления на противоположные*/
    if (direction === Direction.BOTTOM && this.direction === Direction.TOP ||
      direction === Direction.TOP && this.direction === Direction.BOTTOM ||
      direction === Direction.LEFT && this.direction === Direction.RIGHT ||
      direction === Direction.RIGHT && this.direction === Direction.LEFT
    ) {
      return;
    }

    switch (direction) {
      case 'ArrowUp':
        this.direction = Direction.TOP;
        break;
      case 'ArrowDown':
        this.direction = Direction.BOTTOM;
        break;
      case 'ArrowLeft':
        this.direction = Direction.LEFT;
        break;
      case 'ArrowRight':
        this.direction = Direction.RIGHT;
        break;
    }
  }
}
</script>

<style scoped lang="scss">
</style>
