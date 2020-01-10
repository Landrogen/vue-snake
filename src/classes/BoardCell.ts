import {BoardCellModel} from '@/models/BoardCell.model';
import {BoardCellTypes} from '@/types/BoardCellTypes';

export class BoardCell implements BoardCellModel {
  public value: BoardCellTypes;
  public x: number;
  public y: number;

  constructor(type: BoardCellTypes, x: number, y: number) {
    this.value = type;
    this.x = x;
    this.y = y;
  }
}
