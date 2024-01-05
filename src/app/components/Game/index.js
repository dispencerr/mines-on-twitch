'use client'
import { useState, useEffect } from 'react';
import styles from'./index.module.scss'
import Minefield from '@/app/components/Minefield'

function Game(props) {
  const { } = props;
  const boardSize = 8; // Game Board size
  const numOfMines = 10; // Number of mines
  const [gameboard, setGameboard] = useState([]);

  const initializeBoard = (size) => {
    let newBoard = Array.from({ length: size }, () => Array(size).fill(0)); //Fill array with zeroes

    function increaseMineCount(row, col) {
      if(row < 0 || col < 0 || row >= size || col >= size) { return; } // Outside the board
      if(newBoard[row][col] === '*') { return; } // Already a mine
      newBoard[row][col]++;
    }

    // Add mines
    for (let i = 0; i < numOfMines; i++) {
      let randomRowIndex, randomColIndex;
      do {
        randomRowIndex = Math.floor(Math.random() * size);
        randomColIndex = Math.floor(Math.random() * size);
      } while (newBoard[randomRowIndex][randomColIndex] === '*'); // Ensure the selected index is not already a mine
      newBoard[randomRowIndex][randomColIndex] = '*';

      // Update neighboring tiles
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          const newRow = randomRowIndex + rowOffset;
          const newCol = randomColIndex + colOffset;
          increaseMineCount(newRow, newCol);
        }
      }
    }

    setGameboard([...newBoard]);
  }

  useEffect(() => {
    initializeBoard(boardSize);
  }, []);

  return (
    <>
      <Minefield gameboard={gameboard} />
    </>
  );
}

export default Game;
