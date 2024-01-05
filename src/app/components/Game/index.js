'use client'
import { useState, useEffect } from 'react';
import styles from'./index.module.scss'
import Minefield from '@/app/components/Minefield'

function Game(props) {
  const { } = props;
  const boardSize = 8; // Game Board size
  const numOfMines = 10; // Number of mines
  const [gameboard, setGameboard] = useState([]);
  const [revealStatus, setRevealStatus] = useState([]);
  const [flaggedStatus, setFlaggedStatus] = useState([]);

  const isValidTile = (row, col) => {
    return row >= 0 && col >=0 && row < boardSize && col < boardSize;
  }

  const isFullyRevealed = () => {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (revealStatus[row][col] !== true) {
          return false; // Found an entry that is not true
        }
      }
    }
    return true; // All entries are true
  }

  const revealTile = (row, col) => {
    if(!isValidTile(row,col)) { return; } // Outside the board
    if(revealStatus[row][col]) { return; } // Already revealed
    const updatedRevealStatus = [...revealStatus]; 
    // Update the specified row and col with true
    updatedRevealStatus[row][col] = true;
  
    // Update the state
    setRevealStatus(updatedRevealStatus);

    // If 0, reveal neighboring tiles recursively
    if(gameboard[row][col] === 0){
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          if(rowOffset === 0 && colOffset === 0) { continue; }
          const newRow = row + rowOffset;
          const newCol = col + colOffset;
          revealTile(newRow, newCol);
        }
      }
    }

    // If all tiles are revealed, reinitialize
    if(isFullyRevealed()){
      setTimeout(() => {
        initializeBoard(boardSize);
      }, 2000);
    }
  }

  const flagTile = (row, col) => {
    if(!isValidTile(row,col)) { return; } // Outside the board
    const updatedFlaggedStatus = [...flaggedStatus]; 
    // Update the specified row and col with true
    updatedFlaggedStatus[row][col] = true;
  
    // Update the state
    setFlaggedStatus(updatedFlaggedStatus);
  }

  const initializeBoard = (size) => {
    setGameboard([]);
    let newBoard = Array.from({ length: size }, () => Array(size).fill(0)); //Fill array with zeroes
    setRevealStatus(Array.from({ length: size }, () => Array(size).fill(false)));
    setFlaggedStatus(Array.from({ length: size }, () => Array(size).fill(false)));

    function increaseMineCount(row, col) {
      if(!isValidTile(row,col)) { return; } // Outside the board
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
      <Minefield gameboard={gameboard} revealStatus={revealStatus} flaggedStatus={flaggedStatus} revealTile={revealTile} flagTile={flagTile} />
    </>
  );
}

export default Game;
