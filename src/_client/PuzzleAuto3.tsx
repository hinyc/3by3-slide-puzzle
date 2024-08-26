"use client";
import React, { useState, useEffect } from "react";
import "./Puzzle.css";

const PuzzleAuto3: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(8);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solution, setSolution] = useState<number[][]>([]);

  useEffect(() => {
    const shuffledTiles = shuffle([...Array(9).keys()]);
    setTiles(shuffledTiles);
    setEmptyIndex(shuffledTiles.indexOf(8));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSolving && solution.length > 0) {
      interval = setInterval(() => {
        if (solution.length > 0) {
          const nextMove = solution.shift()!;
          setTiles(nextMove);
          setEmptyIndex(nextMove.indexOf(8));
        } else {
          setIsSolving(false);
        }
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isSolving, solution]);

  const shuffle = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleTileClick = (index: number) => {
    const newTiles = [...tiles];
    if (canSwap(index, emptyIndex)) {
      [newTiles[index], newTiles[emptyIndex]] = [
        newTiles[emptyIndex],
        newTiles[index],
      ];
      setTiles(newTiles);
      setEmptyIndex(index);
    }
  };

  const canSwap = (index1: number, index2: number) => {
    const row1 = Math.floor(index1 / 3);
    const col1 = index1 % 3;
    const row2 = Math.floor(index2 / 3);
    const col2 = index2 % 3;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const isSolved = (tiles: number[]) => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return true;
  };

  const bfsSolve = (startTiles: number[]) => {
    const queue: number[][][] = [[[...startTiles]]];
    const visited = new Set<string>();
    visited.add(startTiles.join(","));

    while (queue.length > 0) {
      const path = queue.shift()!;
      const currentTiles = path[path.length - 1];
      const emptyIndex = currentTiles.indexOf(8);

      if (isSolved(currentTiles)) {
        return path;
      }

      const possibleMoves = getPossibleMoves(emptyIndex);
      for (const move of possibleMoves) {
        const newTiles = [...currentTiles];
        [newTiles[emptyIndex], newTiles[move]] = [
          newTiles[move],
          newTiles[emptyIndex],
        ];
        const newTilesKey = newTiles.join(",");

        if (!visited.has(newTilesKey)) {
          visited.add(newTilesKey);
          queue.push([...path, newTiles]);
        }
      }
    }

    return [];
  };

  const getPossibleMoves = (emptyIndex: number) => {
    const moves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;
    if (row > 0) moves.push(emptyIndex - 3); // Move up
    if (row < 2) moves.push(emptyIndex + 3); // Move down
    if (col > 0) moves.push(emptyIndex - 1); // Move left
    if (col < 2) moves.push(emptyIndex + 1); // Move right
    return moves;
  };

  const startSolving = () => {
    const solutionPath = bfsSolve(tiles);
    setSolution(solutionPath);
    setIsSolving(true);
  };

  const resetPuzzle = () => {
    const shuffledTiles = shuffle([...Array(9).keys()]);
    setTiles(shuffledTiles);
    setEmptyIndex(shuffledTiles.indexOf(8));
    setIsSolving(false);
    setSolution([]);
  };

  return (
    <div>
      <div className="puzzle">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`tile ${tile === 8 ? "empty" : ""}`}
            onClick={() => handleTileClick(index)}
          >
            {tile !== 8 && tile + 1}
          </div>
        ))}
        {isSolved(tiles) && <div className="solved">Puzzle Solved!</div>}
      </div>
      <button onClick={startSolving} disabled={isSolving}>
        Start Solving
      </button>
      <button onClick={resetPuzzle}>Reset</button>
    </div>
  );
};

export default PuzzleAuto3;
