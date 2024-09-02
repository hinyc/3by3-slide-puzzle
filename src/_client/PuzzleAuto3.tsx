"use client";
import React, { useState, useEffect } from "react";
import "./Puzzle.css";

const PuzzleAuto3: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(8);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solution, setSolution] = useState<number[][]>([]);
  const [isSolvable, setIsSolvable] = useState<boolean>(true);
  const [solveFailed, setSolveFailed] = useState<boolean>(false);
  const [solveSpeed, setSolveSpeed] = useState<number>(10);
  const [solveTime, setSolveTime] = useState<number | null>(null);

  useEffect(() => {
    const shuffledTiles = shuffle([...Array(9).keys()]);
    setTiles(shuffledTiles);
    setEmptyIndex(shuffledTiles.indexOf(8));
    setIsSolvable(checkSolvable(shuffledTiles));
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
      }, solveSpeed);
    }
    return () => clearInterval(interval);
  }, [isSolving, solution, solveSpeed]);

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

  const aStarSolve = (startTiles: number[], timeLimit: number) => {
    const startTime = Date.now();
    const openSet = new Set<string>();
    const openQueue: { tiles: number[]; path: number[][]; cost: number }[] = [];
    const closedSet = new Set<string>();

    const startKey = startTiles.join(",");
    openSet.add(startKey);
    openQueue.push({
      tiles: startTiles,
      path: [startTiles],
      cost: manhattanDistance(startTiles),
    });

    while (openQueue.length > 0) {
      if (Date.now() - startTime > timeLimit) {
        setSolveFailed(true);
        return [];
      }

      openQueue.sort((a, b) => a.cost - b.cost);
      const current = openQueue.shift()!;
      const currentKey = current.tiles.join(",");

      if (isSolved(current.tiles)) {
        return current.path;
      }

      openSet.delete(currentKey);
      closedSet.add(currentKey);

      const emptyIndex = current.tiles.indexOf(8);
      const possibleMoves = getPossibleMoves(emptyIndex);

      for (const move of possibleMoves) {
        const newTiles = [...current.tiles];
        [newTiles[emptyIndex], newTiles[move]] = [
          newTiles[move],
          newTiles[emptyIndex],
        ];
        const newKey = newTiles.join(",");

        if (closedSet.has(newKey)) continue;

        const newPath = [...current.path, newTiles];
        const newCost = newPath.length + manhattanDistance(newTiles);

        if (!openSet.has(newKey)) {
          openSet.add(newKey);
          openQueue.push({ tiles: newTiles, path: newPath, cost: newCost });
        }
      }
    }

    return [];
  };

  const bfsSolve = (startTiles: number[], timeLimit: number) => {
    const queue: number[][][] = [[[...startTiles]]];
    const visited = new Set<string>();
    visited.add(startTiles.join(","));
    const startTime = Date.now();

    while (queue.length > 0) {
      if (Date.now() - startTime > timeLimit) {
        setSolveFailed(true);
        return [];
      }
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

  const startSolvingWithAStar = () => {
    setSolveFailed(false);
    const startTime = Date.now();
    const solutionPath = aStarSolve(tiles, 5000); // 5초 제한
    const endTime = Date.now();
    setSolveTime((endTime - startTime) / 1000); // 초 단위로 변환
    setSolution(solutionPath);
    setIsSolving(true);
  };

  const startSolvingWithBFS = () => {
    setSolveFailed(false);
    const startTime = Date.now();
    const solutionPath = bfsSolve(tiles, 5000); // 5초 제한
    const endTime = Date.now();
    setSolveTime((endTime - startTime) / 1000); // 초 단위로 변환
    setSolution(solutionPath);
    setIsSolving(true);
  };

  const resetPuzzle = () => {
    const shuffledTiles = shuffle([...Array(9).keys()]);
    setTiles(shuffledTiles);
    setEmptyIndex(shuffledTiles.indexOf(8));
    setIsSolvable(checkSolvable(shuffledTiles));
    setIsSolving(false);
    setSolution([]);
    setSolveFailed(false);
    setSolveTime(null);
  };

  const checkSolvable = (tiles: number[]) => {
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] !== 8 && tiles[j] !== 8 && tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
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
      {!isSolvable && (
        <div className="error">
          This puzzle is unsolvable. Please reset the puzzle.
        </div>
      )}
      {solveFailed && (
        <div className="error">
          Puzzle solving failed due to time limit. Please reset the puzzle.
        </div>
      )}
      <div className="controls">
        <label>
          Solve Speed (ms):
          <input
            type="number"
            value={solveSpeed}
            onChange={(e) => setSolveSpeed(Number(e.target.value))}
            min="1"
          />
        </label>
        {solveTime !== null && (
          <div className="solve-time">
            Solve Time: {solveTime.toFixed(2)} seconds
          </div>
        )}
      </div>
      <button
        onClick={startSolvingWithAStar}
        disabled={isSolving || !isSolvable}
      >
        Solve with A* (Manhattan Distance)
      </button>
      <button onClick={startSolvingWithBFS} disabled={isSolving || !isSolvable}>
        Solve with BFS
      </button>
      <button onClick={resetPuzzle}>Reset</button>
    </div>
  );
};

export default PuzzleAuto3;
