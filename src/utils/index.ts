import { PLAYER_ONE, PLAYER_TWO } from "variables";
import {
  GetWinningComboProp,
  SavedGameProp,
  WinComboProp,
} from "types/index.types";
import AppConfig from "configs/AppConfig";

const defaultPicks = {
  [PLAYER_ONE]: [],
  [PLAYER_TWO]: [],
};

const getWinningRows = ({
  gridSize,
  gridLen,
  fullGrid,
}: GetWinningComboProp) => {
  const rows: WinComboProp[] = [];
  for (let i = 0; i < gridLen; i += gridSize) {
    const end = i === 0 ? gridSize : gridSize + i;
    const newArr = fullGrid.slice(i, end);
    rows.push(newArr);
  }
  return rows;
};

const getWinningCols = (gridSize: number) =>
  new Array(gridSize).fill([]).map((col, index) => {
    const colsCount = [...Array.from(Array(gridSize).keys())];
    return colsCount.map((count) => (index + count * gridSize).toString());
  });

const getWinningDiags = ({
  gridSize,
  column_row,
}: {
  gridSize: number;
  column_row: WinComboProp[];
}) => {
  const diags: WinComboProp[] = [];
  [1, 2].forEach((diagonal) => {
    const diagArr = [];
    if (diagonal === 1) {
      for (let i = 0; i < gridSize; i++) {
        diagArr[i] = column_row[i][i];
      }
    } else {
      for (let i = 0; i < gridSize; i++) {
        const idx = gridSize - 1 - i;
        diagArr[i] = column_row[i][idx];
      }
    }
    diags.push(diagArr);
  });

  return diags;
};

const getWinningCombs = (gridSize: number) => {
  const fullGrid = [...Array.from(Array(gridSize ** 2).keys())].map((item) =>
    item.toString()
  );
  const gridLen = fullGrid.length;

  const winningRows: WinComboProp[] = getWinningRows({
    gridSize,
    gridLen,
    fullGrid,
  });

  const winningCols: WinComboProp[] = getWinningCols(gridSize);

  const winningDiags: WinComboProp[] = getWinningDiags({
    gridSize,
    // generated column or row would work for this
    column_row: winningRows,
  });

  return [...winningRows, ...winningCols, ...winningDiags];
};

const getSavedGamesFromStorage = () => {
  const savedGames = localStorage.getItem(AppConfig.savedGamesKey);
  if (!savedGames) return [];
  return JSON.parse(savedGames);
};

const uuid = () => {
  const hashTable = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  const uuid = [];
  for (let i = 0; i < 35; i++) {
    switch (i) {
      case 7:
      case 12:
      case 17:
      case 22:
        uuid[i] = "-";
        break;
      default:
        uuid[i] = hashTable[Math.floor(Math.random() * hashTable.length - 1)];
        break;
    }
  }
  return uuid.join("");
};

const saveGameToStorage = (gameToSave: SavedGameProp) => {
  const games: SavedGameProp[] = getSavedGamesFromStorage();
  const gameIdx = games.findIndex((game) => game.id === gameToSave.id);
  if (gameIdx !== -1) {
    games.splice(gameIdx, 1, gameToSave);
    return localStorage.setItem(AppConfig.savedGamesKey, JSON.stringify(games));
  }
  games.unshift(gameToSave);
  localStorage.setItem(AppConfig.savedGamesKey, JSON.stringify(games));
};

export {
  defaultPicks,
  getWinningRows,
  getWinningCombs,
  getSavedGamesFromStorage,
  saveGameToStorage,
  uuid,
};
