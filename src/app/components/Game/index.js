'use client'
import { useState, useEffect } from 'react';
import styles from'./index.module.scss'
import Minefield from '@/app/components/Minefield'

function Game(props) {
  const { } = props;
  const size = 8; // Game Board size
  const [gameboard, setGameboard] = useState([]);

  const initializeBoard = (size) => {
    let newBoard = Array.from({ length: size }, () => Array(size).fill(0));
    setGameboard([...newBoard]);
  }

  useEffect(() => {
    initializeBoard(size);
  }, []);

  return (
    <>
      <Minefield gameboard={gameboard} />
    </>
  );
}

export default Game;
