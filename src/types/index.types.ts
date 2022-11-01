export type GetWinningComboProp = {
  gridSize: number;
  gridLen: number;
  fullGrid: string[];
};

export type PicksProps = {
  [key: string]: string[];
};

export type WinComboProp = string[];

export type StringObj = { [key: string]: string };

export type SavedGameProp = {
  winner: null | string;
  playerPicks: PicksProps;
  grid: StringObj;
  activePlayer: string;
  gridSize: number;
  saved_at: Date;
  title: string;
  id: string;
};
