import React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import Minefield from "@/app/components/Minefield";
import { TileContent } from "@/app/types/enums";
import { Chat, Scores } from "@/app/types/types";
import Scoreboard from "@/app/components/Scoreboard";
import ChatEntry from "@/app/components/ChatEntry";
import EntryField from "@/app/components/EntryField";
import { Client } from "tmi.js";

type GameProps = {
  client: Client;
};

const MINESWEEPER_GUESS_REGEX = /^([a-hA-H])([1-8])(f|F)?$/i;
const BOARD_RESET_TIMEOUT = 2000; // Delay before resetting the board after it is fully revealed

const CORRECT_CHECK_SCORE = 1; // Score change for checking a safe tile
const INCORRECT_CHECK_SCORE = -6; // Score change for setting off a mine
const CORRECT_FLAG_SCORE = 2; // Score change for correctly flagging a mine
const INCORRECT_FLAG_SCORE = -2; // Score change for incorrectly flagging a safe tile

const Game: React.FC<GameProps> = ({ client }) => {
  const boardSize = 8; // Game Board size
  const numOfMines = 10; // Number of mines
  const [gameboard, setGameboard] = useState<TileContent[][]>([]);
  const [revealStatus, setRevealStatus] = useState<boolean[][]>([]);
  const [flaggedStatus, setFlaggedStatus] = useState<boolean[][]>([]);
  const [getChatArray, setChatArray] = useState<Chat[]>([]); // The displayed chatbox (only of valid guesses)
  const [getChatMessages, setChatMessages] = useState<Chat[]>([]); // Array of all chats (not displayed)
  const [getUserScores, setUserScores] = useState<Scores>({});
  const prevDependencyRef = useRef<Chat[]>();

  if (client) {
    client.on("message", (channel, tags, message, self) => {
      const newChat: Chat = {
        message: message,
        user: tags["display-name"],
        color: tags["color"],
      };
      addChatMessage(newChat);
    });
  }

  const isValidTile = (row: number, col: number): boolean => {
    return row >= 0 && col >= 0 && row < boardSize && col < boardSize;
  };

  const isFullyRevealed = (): boolean => {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (revealStatus[row][col] !== true) {
          return false; // Found an unrevealed tile
        }
      }
    }
    return true; // All tiles are revealed
  };

  const revealTile = (row: number, col: number): void => {
    if (!isValidTile(row, col)) {
      return;
    } // Outside the board
    if (revealStatus[row][col]) {
      return;
    } // Already revealed
    const updatedRevealStatus = [...revealStatus];
    // Update the specified row and col with true
    updatedRevealStatus[row][col] = true;

    // Update the state
    setRevealStatus(updatedRevealStatus);

    // If 0, reveal neighboring tiles recursively
    if (gameboard[row][col] === TileContent.Zero) {
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          if (rowOffset === 0 && colOffset === 0) {
            continue;
          }
          const newRow = row + rowOffset;
          const newCol = col + colOffset;
          revealTile(newRow, newCol);
        }
      }
    }

    // If all tiles are revealed, reinitialize
    if (isFullyRevealed()) {
      setTimeout(() => {
        initializeBoard(boardSize);
      }, BOARD_RESET_TIMEOUT);
    }
  };

  const checkTile = (row: number, col: number, user?: string): void => {
    // Update score based on if it's a bomb
    if (user) {
      if (gameboard[row][col] === TileContent.Mine) {
        updateScores(user, INCORRECT_CHECK_SCORE);
      } else {
        updateScores(user, CORRECT_CHECK_SCORE);
      }
    }

    revealTile(row, col);
  };

  const flagTile = (row: number, col: number, user?: string): void => {
    // Update the state
    const updatedFlaggedStatus = [...flaggedStatus];
    updatedFlaggedStatus[row][col] = true;
    setFlaggedStatus(updatedFlaggedStatus);

    // Update score based on if it's a bomb
    if (user) {
      if (gameboard[row][col] === TileContent.Mine) {
        updateScores(user, CORRECT_FLAG_SCORE);
      } else {
        updateScores(user, INCORRECT_FLAG_SCORE);
      }
    }

    // Reveal the tile
    revealTile(row, col);
  };

  const initializeBoard = (size: number): void => {
    setGameboard([]);
    let newBoard = Array.from({ length: size }, () =>
      Array(size).fill(TileContent.Zero)
    ); //Fill array with zeroes
    setRevealStatus(
      Array.from({ length: size }, () => Array(size).fill(false))
    );
    setFlaggedStatus(
      Array.from({ length: size }, () => Array(size).fill(false))
    );

    const IncreaseCountOnTile = (row: number, col: number): void => {
      if (!isValidTile(row, col)) {
        return;
      } // Outside the board
      if (newBoard[row][col] === TileContent.Mine) {
        return;
      } // Already a mine
      newBoard[row][col]++;
    };

    // Add mines
    for (let i = 0; i < numOfMines; i++) {
      let randomRowIndex, randomColIndex;
      do {
        randomRowIndex = Math.floor(Math.random() * size);
        randomColIndex = Math.floor(Math.random() * size);
      } while (newBoard[randomRowIndex][randomColIndex] === TileContent.Mine); // Ensure the selected index is not already a mine
      newBoard[randomRowIndex][randomColIndex] = TileContent.Mine;

      // Update neighboring tiles
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          const newRow = randomRowIndex + rowOffset;
          const newCol = randomColIndex + colOffset;
          IncreaseCountOnTile(newRow, newCol);
        }
      }
    }

    setGameboard([...newBoard]);
  };

  // Function called when a new tile is guessed
  const handleChatEntry = (newChat: Chat) => {
    let userGuess = newChat.message.trim(); //twitch adds white space to allow the broadcaster to repeat the same chat repeatedly it seems

    // Convert the letter to a number (0-indexed)
    const letterToNumber = (letter: string): number =>
      letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);

    //Check that the chat message matches the regex for a valid guess
    const [, letter, numberStr, flag] =
      userGuess.match(MINESWEEPER_GUESS_REGEX) || [];
    // console.log(userGuess);
    // console.log(letter, numberStr, flag);

    if (letter && numberStr) {
      // console.log("Valid guess");
      // TODO: Check for timeout
      const row = letterToNumber(letter); // Convert the number to 0-indexed number
      const col = parseInt(numberStr) - 1; // Convert the number to 0-indexed
      if (isValidTile(row, col) && !revealStatus[row][col]) {
        if (flag) {
          flagTile(row, col, newChat.user);
        } else {
          checkTile(row, col, newChat.user);
        }
        setChatArray((prevChatArray) => [...prevChatArray, newChat]);
      }
    }
  };

  const addChatMessage = (newChat: Chat): void => {
    setChatMessages((prevChatMessages) => [...prevChatMessages, newChat]);
  };

  const updateScores = (user: string, scoreChange: number) => {
    let currentScore = getUserScores[user] || 0;
    let newScore = currentScore + scoreChange;
    // console.log(user + "'s new score: " + newScore);
    setUserScores((prevScores) => ({
      ...prevScores,
      [user]: newScore,
    }));
  };

  useEffect(() => {
    initializeBoard(boardSize);
  }, []);

  useEffect(() => {
    if (prevDependencyRef.current !== undefined && getChatMessages.length) {
      let latestChat = getChatMessages[getChatMessages.length - 1];
      handleChatEntry(latestChat);
    }
    prevDependencyRef.current = getChatMessages;
  }, [getChatMessages]);

  return (
    <>
      <div className={styles.game}>
        <div className={styles.leftContainer}>
          <Scoreboard getUserScores={getUserScores} />
        </div>
        <div className={styles.middleContainer}>
          <Minefield
            gameboard={gameboard}
            revealStatus={revealStatus}
            flaggedStatus={flaggedStatus}
            revealTile={revealTile}
            flagTile={flagTile}
          />
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.wordBlockContainer}>
            {getChatArray.map((chatEntry, index) => (
              <ChatEntry chat={chatEntry} key={index} />
            ))}
          </div>
          {!client ? (
            <EntryField addChatMessage={addChatMessage} />
          ) : (
            <EntryField addChatMessage={addChatMessage} />
          )}
        </div>
      </div>
      <div className={styles.howToPlay}>
        <h3 className={styles.howToPlay__head}>How to Play:</h3>
        <p className={styles.howToPlay__text}>"A3": Open tile A3</p>
        <p className={styles.howToPlay__text}>"B6f": Flag tile B6</p>
        <p className={styles.howToPlay__text}>
          The number on a tile indicates how many of the surrounding tiles
          (including diagonals) are mines. Gain points by opening safe tiles (+
          {CORRECT_CHECK_SCORE}) and flagging mines (+{CORRECT_FLAG_SCORE}).
          Lose points if you open a mine ({INCORRECT_CHECK_SCORE}) or flag a
          safe tile ({INCORRECT_FLAG_SCORE}).
        </p>
      </div>
    </>
  );
};

export default Game;
