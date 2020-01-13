<template>
    <div class="game">
        <div class="gameboard">
            <BoardComponent :size="boardSizes" :board="gameBoard.fields"/>
            <EndGameModal :points="points" v-if="endGame"/>
            <div class="gameboard__users">
                <h3>In game</h3>
                <table>
                    <thead>
                    <tr>
                        <td>id</td>
                        <td>score</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="u in users" class="user" :class="{'looser': u.looser}">
                        <td>{{u.id}}</td>
                        <td>
                            {{u.points}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
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
  import io from 'socket.io-client';
  import SocketIOClient from 'socket.io-client';

  const BOARD_SIZE = {
    x: 30,
    y: 30,
  };

  const createFruit = (colCount: number, rowCount: number): BoardCellModel => {
    const {x, y} = getRandomCoors(colCount, rowCount);
    return new BoardCell(BoardCellTypes.FRUIT, x, y);
  };

  const createBlock = (colCount: number, rowCount: number): BoardCellModel => {
    const {x, y} = getRandomCoors(colCount, rowCount);
    return new BoardCell(BoardCellTypes.BLOCK, x, y);
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


  const moveSnake = (snake: BoardCellModel[], direction: Direction): {
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


  const renderBoard = (board: BoardModel, snake: BoardCellModel[], fruit: BoardCellModel, blocks:BoardCellModel[], ghosts: BoardCellModel[]): BoardModel => {
    const fields = board.fields.map((row, y) =>
      row.map((cell, x) => {
        const blockCell = blocks.find((blockItem) => {
          if (x === blockItem.x && y === blockItem.y) {
            return blockItem;
          }
        });

        if (blockCell) {
          return  blockCell;
        }

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

        const ghostCell = ghosts.find((ghostItem) => {
          if (x === ghostItem.x && y === ghostItem.y) {
            return ghostItem;
          }
        });

        if (ghostCell) {
          return ghostCell;
        }

        return cell;
      }),
    );

    return {...board, fields};
  };

  const isIntersection = (target: BoardCellModel, blocks: BoardCellModel[]): boolean => {
    return blocks.some(
      (block: BoardCellModel): boolean =>
        block.x === target.x && block.y === target.y,
    );
  };

  const initSocket = (): void => {
    return io(':3000');
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
    private blocks: BoardCellModel[] = [];
    private fruit: BoardCellModel = createFruit(BOARD_SIZE.x, BOARD_SIZE.y);
    private direction: Direction = Direction.RIGHT;
    private gameBoard: BoardModel = new Board(BOARD_SIZE.x, BOARD_SIZE.y);
    private speed: number = 100;
    private timer: number = 0;
    private endGame: boolean = false;
    private points: number = 0;
    private io: SocketIOClient = null;

    private users: SocketIOClientStatic[] = [];

    get userSnake() {
      return this.users.map(u => u.snake).filter(s => s!== undefined);
    }

    public mounted() {
      this.timer = setTimeout(() => {
        this.gameTick();
      }, this.speed);

      this.io = initSocket();

      this.io.on('snake eat', ({user, point}) => {
        this.users = this.users.map(u => {
          if (u.id === user) {
            u.points = point;
          }

          return u;
        });

        this.addBlock();
        this.moveFruit();
      });
      this.io.on('snake gameover', ({user, points}) => {
        this.users = this.users.map(u => {
          if (u.id === user) {
            u.points = points;
            u.looser = true;
          }

          return u;
        });

        this.addBlock();
        this.moveFruit();
      });

      this.io.on('snake move', ({ user, snake }) => {
        this.users = this.users.map(u => {
          if (u.id === user) {
            u.snake = snake;
          }
          return u;
        });
      });

      this.io.on('snake users', ({users}) => {
        this.users = users;
      });

      document.addEventListener('keydown', (e: KeyboardEvent) => {
        this.changeDirection(e.key as Direction);
      });
    }

    public gameTick() {
      const {head, tail} = moveSnake(this.snake, this.direction, this.fruit);
      const {fruit, blocks} = this;

      const isSelfEat = isIntersection(head, [...tail, ...blocks]);


      if (isSelfEat) {
        this.endGame = true;

        this.io.emit('snake gameover', {
          points: this.points
        });

        return;
      }

      if (head.x === fruit.x && head.y === fruit.y) {
        this.eatFruit();
        this.snake = [head, ...tail];
      } else {
        this.snake = [head, ...tail.slice(0, -1)];
      }

      this.io.emit('snake move', {
        snake: this.snake
      });

        const ghostItems = this.userSnake.flat().map(i => {i.value = BoardCellTypes.SNAKE_GHOST; return i});

      this.gameBoard = renderBoard(this.board, this.snake, this.fruit, this.blocks, ghostItems);

      setTimeout(() => {
        this.gameTick();
      }, this.speed);
    }

    public moveFruit(): void {
      const {fruit} = this;

      const newFruitPositions = getRandomCoors(this.boardSizes.x, this.boardSizes.y);
      fruit.x = newFruitPositions.x;
      fruit.y = newFruitPositions.y;
    }

    public eatFruit() {
      this.moveFruit();

      this.points++;

      this.io.emit('snake eat', {
        points: this.points
      });

      this.speed -= this.speed === 0 ? 0 : 5;
    }

    public addBlock():void {
      this.blocks.push(createBlock(BOARD_SIZE.x, BOARD_SIZE.y));
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
    .gameboard {
        display: flex;

        &__users {
            width: 200px;
            text-align: left;
        }
    }

    .user {
        span {
            font-weight: bold;
            margin-left: auto;
        }

        &.looser {
            background-color: #ffd931;
        }
    }
</style>
