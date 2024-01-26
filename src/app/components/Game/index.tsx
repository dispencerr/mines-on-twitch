import React from "react";
import { useState, useEffect } from "react";
import styles from "./index.module.scss";
import Minefield from "@/app/components/Minefield";
import { TileContent } from "@/app/types/enums";
import { Chat, Scores, TimeoutStatus } from "@/app/types/types";
import Scoreboard from "@/app/components/Scoreboard";
import ChatEntry from "@/app/components/ChatEntry";
import EntryField from "@/app/components/EntryField";
import { Client } from "tmi.js";

type GameProps = {
  client: Client | null;
};

const MINESWEEPER_GUESS_REGEX = /^([a-zA-Z])([0-2]?[0-9])(f|F)?$/i;
const BOARD_RESET_TIMEOUT = 2000; // Delay before resetting the board after it is fully revealed (ms)
const USER_TIMEOUT_LENGTH = 2000; // Timeout length before a user can make another guess (ms)
const DEFAULT_MINE_RATIO = 0.15625;

const SCORES = {
  CORRECT_CHECK_SCORE: 1, // Score change for checking a safe tile
  INCORRECT_CHECK_SCORE: -6, // Score change for setting off a mine
  CORRECT_FLAG_SCORE: 2, // Score change for correctly flagging a mine
  INCORRECT_FLAG_SCORE: -2, // Score change for incorrectly flagging a safe tile
} as const;

const COMMANDS = {
  CHANGE_BOARD_SIZE: "!size", // Command to change the board size
  CHANGE_NUMBER_OF_MINES: "!mines", // Command to change the number of mines
} as const;

const COMMANDS_REGEX = `^(${COMMANDS.CHANGE_BOARD_SIZE}|${COMMANDS.CHANGE_NUMBER_OF_MINES})\\s(\\d+)$`;

const Game: React.FC<GameProps> = ({ client }) => {
  const [boardSize, setBoardSize] = useState<number>(8); // Game Board size (width)
  const [numberOfMines, setNumberOfMines] = useState<number>(
    boardSize ** 2 * DEFAULT_MINE_RATIO
  ); // Number of mines
  const [gameboard, setGameboard] = useState<TileContent[][]>([]); // 2D array of every tile's content
  const [revealStatus, setRevealStatus] = useState<boolean[][]>([]); // 2D array of booleans indicating if the tile is revealed
  const [flaggedStatus, setFlaggedStatus] = useState<boolean[][]>([]); // 2D array of booleans indicating if the tile is flagged
  const [chatArray, setChatArray] = useState<Chat[]>([]); // The displayed chatbox (only of valid guesses)
  const [chatMessages, setChatMessages] = useState<Chat[]>([]); // Array of all chats (not displayed)
  const [timeoutStatus, setTimeoutStatus] = useState<TimeoutStatus>({}); // Object keeping track of users' timeout status
  const [userScores, setUserScores] = useState<Scores>({}); // Object keeping track of users' scores
  let chatCount = 0;

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
        updateScores(user, SCORES.INCORRECT_CHECK_SCORE);
      } else {
        updateScores(user, SCORES.CORRECT_CHECK_SCORE);
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
        updateScores(user, SCORES.CORRECT_FLAG_SCORE);
      } else {
        updateScores(user, SCORES.INCORRECT_FLAG_SCORE);
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
    for (let i = 0; i < numberOfMines; i++) {
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
      if (newChat.user && timeoutStatus[newChat.user]) return; // If user is timed out do nothing
      // console.log("Valid guess");
      const row = letterToNumber(letter); // Convert the number to 0-indexed number
      const col = parseInt(numberStr) - 1; // Convert the number to 0-indexed
      if (isValidTile(row, col) && !revealStatus[row][col]) {
        if (flag) {
          flagTile(row, col, newChat.user);
        } else {
          checkTile(row, col, newChat.user);
        }
        setChatArray((prevChatArray) => [...prevChatArray, newChat]);
        if (newChat.user) {
          timeoutUser(newChat.user);
        }
      }
    }
    // Check if it's a mod command
    else if (newChat.isMod) {
      const [, command, numberString] = userGuess.match(COMMANDS_REGEX) || [];
      console.log(newChat, command, numberString, COMMANDS_REGEX);
      if (command && numberString) {
        const number = parseInt(numberString);
        switch (command) {
          case COMMANDS.CHANGE_BOARD_SIZE:
            if (1 < number && number <= 26) {
              setBoardSize(number);
            }
            break;
          case COMMANDS.CHANGE_NUMBER_OF_MINES:
            if (0 < number && number < boardSize ** 2) {
              setNumberOfMines(number);
            }
            break;
          default:
            break;
        }
      }
    }
  };

  const updateScores = (user: string, scoreChange: number) => {
    let currentScore = userScores[user] || 0;
    let newScore = currentScore + scoreChange;
    // console.log(user + "'s new score: " + newScore);
    setUserScores((prevScores) => ({
      ...prevScores,
      [user]: newScore,
    }));
  };

  const timeoutUser = (user: string) => {
    setTimeoutStatus((prevObject) => ({
      ...prevObject,
      [user]: true,
    }));
    // console.log('Timed out ' + user);
    setTimeout(function () {
      setTimeoutStatus((prevObject) => ({
        ...prevObject,
        [user]: false,
      }));
      // console.log('Untimed out ' + user);
    }, USER_TIMEOUT_LENGTH);
  };

  useEffect(() => {
    if (client) {
      client.on("message", (channel, tags, message, self) => {
        const newChat: Chat = {
          message: message,
          user: tags["display-name"] || "User",
          color: tags["color"] || "#FFFFFF",
          isMod: tags.mod === true || tags.badges?.broadcaster === "1",
        };
        setChatMessages((prevChatMessages) => [...prevChatMessages, newChat]);
      });
    }
  }, []);

  // When a mod changes the board size, automatically set the number of mines to a ratio of the squared board size
  useEffect(() => {
    const newNumberOfMines = Math.max(
      1,
      Math.floor(boardSize ** 2 * DEFAULT_MINE_RATIO)
    );
    if (newNumberOfMines === numberOfMines) {
      initializeBoard(boardSize);
    } else {
      setNumberOfMines(newNumberOfMines);
    }
  }, [boardSize]);

  useEffect(() => {
    setChatArray([]);
    setChatMessages([]);
    initializeBoard(boardSize);
  }, [numberOfMines]);

  useEffect(() => {
    if (chatMessages.length) {
      let latestChat = chatMessages[chatMessages.length - 1];
      handleChatEntry(latestChat);
    }
  }, [chatMessages]);

  return (
    <>
      <div className={styles.game}>
        <div className={styles.leftContainer}>
          <Scoreboard userScores={userScores} />
        </div>
        <div className={styles.middleContainer}>
          <div className={styles.header}>
            <h1 className={styles.header__h1}>Mines on Twitch</h1>
            <h2 className={styles.header__h2}>
              https://mines-on-twitch.vercel.app/
            </h2>
          </div>
          <Minefield
            gameboard={gameboard}
            revealStatus={revealStatus}
            flaggedStatus={flaggedStatus}
            checkTile={checkTile}
            flagTile={flagTile}
          />
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.chatboxContainer}>
            {chatArray.map((chatEntry) => (
              <ChatEntry
                chat={chatEntry}
                timeoutLength={USER_TIMEOUT_LENGTH}
                key={chatCount++}
              />
            ))}
          </div>
          {!client && <EntryField handleChatEntry={handleChatEntry} />}
        </div>
      </div>
      <div className={styles.howToPlay}>
        <h3 className={styles.howToPlay__head}>How to Play:</h3>
        <p className={styles.howToPlay__text}>
          A3 : Open tile A3 {!client && "(or left click)"}
        </p>
        <p className={styles.howToPlay__text}>
          B6f : Flag tile B6 {!client && "(or right click)"}
        </p>
        <p className={styles.howToPlay__text}>
          The number on a tile indicates how many of the surrounding tiles
          (including diagonals) are mines. Gain points by opening safe tiles (+
          {SCORES.CORRECT_CHECK_SCORE}) and flagging mines (+
          {SCORES.CORRECT_FLAG_SCORE}). Lose points if you open a mine (
          {SCORES.INCORRECT_CHECK_SCORE}) or flag a safe tile (
          {SCORES.INCORRECT_FLAG_SCORE}).
        </p>
      </div>
    </>
  );
};

export default Game;
