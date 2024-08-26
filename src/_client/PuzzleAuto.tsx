"use client";
import React, { useState, useEffect } from "react";
import "./Puzzle.css";

const PuzzleAuto: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(8);

  useEffect(() => {
    const shuffledTiles = shuffle([...Array(9).keys()]);
    setTiles(shuffledTiles);
    setEmptyIndex(shuffledTiles.indexOf(8));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSolved()) {
        moveRandomTile();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [tiles, emptyIndex]);

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

  const moveRandomTile = () => {
    const possibleMoves = getPossibleMoves(emptyIndex);
    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    handleTileClick(randomMove);
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

  const canSwap = (index1: number, index2: number) => {
    const row1 = Math.floor(index1 / 3);
    const col1 = index1 % 3;
    const row2 = Math.floor(index2 / 3);
    const col2 = index2 % 3;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const isSolved = () => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return true;
  };

  return (
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
      {isSolved() && <div className="solved">Puzzle Solved!</div>}
    </div>
  );
};

export default PuzzleAuto;
