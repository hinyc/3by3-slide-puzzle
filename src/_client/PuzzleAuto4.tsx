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

  const manhattanDistance = (tiles: number[]) => {
    let distance = 0;
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] !== 8) {
        const targetRow = Math.floor(tiles[i] / 3);
        const targetCol = tiles[i] % 3;
        const currentRow = Math.floor(i / 3);
        const currentCol = i % 3;
        distance +=
          Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
      }
    }
    return distance;
  };

  const getPossibleMoves = (emptyIndex: number): number[] => {
    const possibleMoves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    if (row > 0) possibleMoves.push(emptyIndex - 3); // 위로 이동
    if (row < 2) possibleMoves.push(emptyIndex + 3); // 아래로 이동
    if (col > 0) possibleMoves.push(emptyIndex - 1); // 왼쪽으로 이동
    if (col < 2) possibleMoves.push(emptyIndex + 1); // 오른쪽으로 이동

    return possibleMoves;
  };

  const findBestMove = (currentTiles: number[], emptyIndex: number) => {
    const possibleMoves = getPossibleMoves(emptyIndex);
    let bestMove = null;
    let bestDistance = Infinity;

    for (const move of possibleMoves) {
      const newTiles = [...currentTiles];
      [newTiles[emptyIndex], newTiles[move]] = [
        newTiles[move],
        newTiles[emptyIndex],
      ];
      const distance = manhattanDistance(newTiles);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMove = newTiles;
      }
    }

    return bestMove;
  };

  const solvePuzzle = (startTiles: number[]) => {
    const solutionPath = [];
    let currentTiles = [...startTiles];
    let currentEmptyIndex = currentTiles.indexOf(8);

    while (!isSolved(currentTiles)) {
      const nextMove = findBestMove(currentTiles, currentEmptyIndex);
      if (nextMove) {
        solutionPath.push(nextMove);
        currentTiles = nextMove;
        currentEmptyIndex = currentTiles.indexOf(8);
      } else {
        break;
      }
    }

    return solutionPath;
  };

  const startSolving = () => {
    const solutionPath = solvePuzzle(tiles);
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
