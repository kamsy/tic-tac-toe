import React, { useEffect, useState } from "react";
import "./App.scss";
import { defaultSize, PLAYER_ONE, PLAYER_TWO } from "variables";
import {
  defaultPicks,
  getSavedGamesFromStorage,
  getWinningCombs,
  saveGameToStorage,
  uuid,
} from "utils";
import {
  PicksProps,
  SavedGameProp,
  StringObj,
  WinComboProp,
} from "types/index.types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import cx from "classnames";
dayjs.extend(relativeTime);

function App() {
  const [savedGames, setSavedGames] = useState<SavedGameProp[]>([]);
  const [loadedGame, setLoadedGame] = useState<SavedGameProp | null>(null);

  useEffect(() => {
    const gamesFromStorage = getSavedGamesFromStorage();
    setSavedGames(gamesFromStorage);
  }, []);

  const [gridSize, setGridSize] = useState<number>(defaultSize);

  const winningCombos: WinComboProp[] = getWinningCombs(gridSize);
  const [activePlayer, setActivePlayer] = useState<string>(PLAYER_ONE);
  const [playerPicks, setPlayerPicks] = useState<PicksProps>(defaultPicks);
  const [grid, setGrid] = useState<StringObj>({});
  const [winner, setWinner] = useState<null | string>(null);

  const resetGame = () => {
    setPlayerPicks(defaultPicks);
    setGrid({});
    setWinner(null);
    setActivePlayer(PLAYER_ONE);
  };

  const handleSizeUpdate = (e: any) => {
    e.preventDefault();
    const size = +e.target.elements[0].value;
    if (size === gridSize) return;
    if (size < 3) return alert("Grid cannot be less than 3x3");
    resetGame();
    setGridSize(size);
  };

  const handleCellClick = (col: string) => {
    const picked = grid[col];
    if (picked) return;
    setActivePlayer((prev) => (prev === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE));
    const newPicks = [...playerPicks[activePlayer]];
    newPicks.push(col);
    setPlayerPicks((prev) => ({
      ...prev,
      [activePlayer]: newPicks,
    }));
    setGrid((prev) => ({ ...prev, [col]: activePlayer }));
    winningCombos.forEach((combo) => {
      const isWinner = combo.every((choices) => newPicks.includes(choices));
      if (isWinner) {
        setTimeout(() => {
          setWinner(activePlayer);
        }, 100);
      }
    });
  };

  const saveGame = () => {
    const stem = {
      winner,
      playerPicks,
      grid,
      activePlayer,
      gridSize,
      saved_at: new Date(),
    };
    const gameToSave: SavedGameProp = loadedGame
      ? { ...loadedGame, ...stem }
      : {
          ...stem,
          id: uuid(),
          title: `Game ${savedGames.length + 1}`,
        };

    const _games = [...savedGames];
    const gameIdx = _games.findIndex((game) => game.id === gameToSave.id);
    if (gameIdx !== -1) {
      _games.splice(gameIdx, 1, gameToSave);
      setSavedGames(_games);
      saveGameToStorage(gameToSave);
      return resetGame();
    }
    setSavedGames([gameToSave, ..._games]);
    saveGameToStorage(gameToSave);
    resetGame();
  };

  const loadGame = (id: string) => {
    const gameToLoad = savedGames.find((game) => game.id === id);
    if (!gameToLoad) return;
    const { winner, playerPicks, grid, activePlayer, gridSize } = gameToLoad;
    setLoadedGame(gameToLoad);
    setWinner(winner);
    setPlayerPicks(playerPicks);
    setGrid(grid);
    setActivePlayer(activePlayer);
    setGridSize(gridSize);
  };

  const gridSquare = gridSize ** 2;

  return (
    <div className="App">
      {winner && <h2 className="winner">Player {winner} wins!🎉</h2>}
      <div className="game">
        {loadedGame && <h3>Now playing: {loadedGame.title}</h3>}
        <form onSubmit={handleSizeUpdate} className="form">
          <input placeholder="Grid size" />
          <button>Update</button>
        </form>

        <p className="turn__indicator">Turn {activePlayer}</p>
        <div
          className={cx("grid", { disable: winner })}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 56px)`,
          }}
        >
          {[...Array.from(Array(gridSquare).keys())].map((key) => {
            const col = key.toString();
            const selected = grid[col];
            return (
              <div
                key={col}
                className={cx("grid-cell", {
                  disable: !!selected,
                })}
                role="button"
                onClick={() => (winner ? null : handleCellClick(col))}
              >
                {selected}
              </div>
            );
          })}
        </div>

        <div className="buttons__wrapper">
          <button onClick={resetGame} className="reset">
            Reset
          </button>
          <button onClick={saveGame}>Save game</button>
        </div>
      </div>

      <div className="saved-games">
        <h3>Saved games</h3>
        <ul className="games-list">
          {!savedGames.length ? (
            <p>No saved games</p>
          ) : (
            savedGames.map(({ title, gridSize, saved_at, id }) => (
              <li key={id}>
                <div className="text__wrapper">
                  <span>
                    {title} ({gridSize}x{gridSize})
                  </span>
                  <span className="timestamp">{dayjs(saved_at).fromNow()}</span>
                </div>

                <button onClick={() => loadGame(id)}>Load</button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
