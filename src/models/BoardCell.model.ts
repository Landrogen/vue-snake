import {BoardCellTypes} from '@/types/BoardCellTypes';
import {Coords} from '@/models/Coords';

export interface BoardCellModel {
  value: BoardCellTypes;
  x: number;
  y: number;
}
