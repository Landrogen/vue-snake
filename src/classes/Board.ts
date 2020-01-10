import {BoardModel} from '@/models/Board.model';
import {BoardCellModel} from '@/models/BoardCell.model';
import {BoardCellTypes} from '@/types/BoardCellTypes';

/**
 * @param x
 * @param y
 */
const createBoard = (x: number, y: number): BoardCellModel[][] => {
  return Array(y).fill(null).map((i) => Array(x).fill({value: BoardCellTypes.EMPTY}));
};

export class Board implements BoardModel {
  public fields: BoardCellModel[][];

  constructor(x: number, y: number) {
    this.fields = createBoard(x, y);
  }
}

