import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { PLAYER_ONE, PLAYER_TWO } from "variables";

const setup = () => {
  const view = render(<App />);
  const gridCells = screen.getAllByTestId("grid__cell");
  return { view, gridCells };
};

test("renders correctly", async () => {
  const { view } = setup();
  expect(view).toMatchSnapshot();
  expect(screen.getByTestId("no__games").textContent).toMatchInlineSnapshot(
    `"No saved games"`
  );
  expect(
    screen.getByTestId("turn__indicator").textContent
  ).toMatchInlineSnapshot(`"Turn X"`);
});

test("clicking a box fills it with activeplayer's icon and disables it", async () => {
  const { gridCells } = setup();
  const firstCell = gridCells[0];
  userEvent.click(firstCell);
  expect(firstCell.textContent).toBe(PLAYER_ONE);
  expect(firstCell).toHaveClass("disable");
});

describe("either player can win the game:", () => {
  test(`Player ${PLAYER_ONE} wins:`, async () => {
    const { gridCells } = setup();
    [0, 1, 4, 3, 8, 5].forEach((num) => userEvent.click(gridCells[num]));
    expect(
      (await screen.findByRole("heading", { level: 2 })).textContent
    ).toMatchInlineSnapshot(`"Player X wins!🎉"`);
    expect(screen.getByTestId("grid")).toHaveClass("disable");
  });

  test(`Player ${PLAYER_TWO} wins:`, async () => {
    const { gridCells } = setup();
    [1, 0, 3, 4, 5, 8].forEach((num) => userEvent.click(gridCells[num]));
    expect(
      (await screen.findByRole("heading", { level: 2 })).textContent
    ).toMatchInlineSnapshot(`"Player O wins!🎉"`);
  });
});

test("players are notified when it's a draw", async () => {
  const { gridCells } = setup();
  [0, 1, 2, 6, 7, 8, 3, 4, 5].forEach((num) => userEvent.click(gridCells[num]));
  expect(
    (await screen.findByRole("heading", { level: 2 })).textContent
  ).toMatchInlineSnapshot(`"Game over! Draw🤝"`);
  expect(screen.getByTestId("grid")).toHaveClass("disable");
});

test("can set the grid size to >= 3x3:", async () => {
  render(<App />);
  const gridCells = screen.getAllByTestId("grid__cell");
  expect(gridCells.length).toBe(9);
  const input = screen.getByPlaceholderText(/grid size/i);
  const text = "5";
  userEvent.type(input, text);
  const updateBtn = screen.getByRole("button", {
    name: /Update/i,
  });
  userEvent.click(updateBtn);
  const updatedGridCells = screen.getAllByTestId("grid__cell");
  expect(updatedGridCells.length).toBe((+text) ** 2);
});

test("alerts user grid < 3x3 is set:", async () => {
  render(<App />);
  const alertMock = jest.spyOn(window, "alert").mockImplementation();
  const input = screen.getByPlaceholderText(/grid size/i);
  userEvent.type(input, "2");
  const updateBtn = screen.getByRole("button", {
    name: /Update/i,
  });
  userEvent.click(updateBtn);
  expect(alertMock).toHaveBeenCalledTimes(1);
});

test("saves a game and resets the grid:", async () => {
  const { gridCells } = setup();
  const randomArr = [0, 1, 4, 7];
  randomArr.forEach((num) => userEvent.click(gridCells[num]));
  expect(screen.getByTestId("no__games")).toBeInTheDocument();
  const saveBtn = screen.getByRole("button", {
    name: /Save game/i,
  });
  userEvent.click(saveBtn);
  expect(screen.queryByTestId("no__games")).not.toBeInTheDocument();
  randomArr.forEach((num) => expect(gridCells[num].textContent).toBe(""));
});

test("can load a saved game", async () => {
  const { gridCells } = setup();
  const randomArr1 = [0, 1, 4, 7];
  const randomArr2 = [0, 1, 4, 7];
  const arr = [randomArr1, randomArr2];
  const saveBtn = screen.getByRole("button", {
    name: /Save game/i,
  });
  arr.forEach((arr) => {
    userEvent.click(saveBtn);
    arr.forEach((num) => userEvent.click(gridCells[num]));
  });

  const savedGamesList = screen.getByRole("list");
  expect(savedGamesList.childNodes).toHaveLength(3);
  const gameToLoad = screen.queryAllByTestId("saved__game")[0];
  const loadBtn = within(gameToLoad).getByRole("button", { name: /load/i });
  userEvent.click(loadBtn);
  expect(
    (await screen.findByTestId("loaded__game_title")).textContent
  ).toMatchInlineSnapshot(`"Now playing: Game 3"`);
});
