import React from "react";
import { useState, useEffect } from "react";
import styles from "./index.module.scss";
import Minefield from "@/app/components/Minefield";
import { TileContent } from "@/app/types/enums";
import { Chat, Scores, TimeoutStatus, Sound } from "@/app/types/types";
import Scoreboard from "@/app/components/Scoreboard";
import ChatEntry from "@/app/components/ChatEntry";
import EntryField from "@/app/components/EntryField";
import { Client } from "tmi.js";

type GameProps = {
  client: Client | null;
};

const BOARD_RESET_TIMEOUT = 2000; // Delay before resetting the board after it is fully revealed (ms)
const USER_TIMEOUT_LENGTH = 2000; // Timeout length before a user can make another guess (ms)
const DEFAULT_MINE_RATIO = 0.15625; // Default ratio of mine tiles on the board

const MINIMUM_BOARD_SIZE = 2;
const MAXIMUM_BOARD_SIZE = 26;

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

const SOUNDS = {
  explosionSound: { file: "/sounds/explosion.wav", volume: 0.5 },
  chimeSound: { file: "/sounds/chime.wav", volume: 0.5 },
  flagSound: { file: "/sounds/flag.wav", volume: 0.3 },
  incorrectSound: { file: "/sounds/incorrect.wav", volume: 0.3 },
  newGameSound: { file: "/sounds/newgame.wav", volume: 0.5 },
} as const;

const MINESWEEPER_GUESS_REGEX = /^([a-zA-Z])([0-2]?[0-9])(f|F)?$/i; // Regex for a valid guess
const COMMANDS_REGEX = `^(${COMMANDS.CHANGE_BOARD_SIZE}|${COMMANDS.CHANGE_NUMBER_OF_MINES})\\s(\\d+)$`;

/**
 * Convert a letter to a number (0-indexed)
 *
 * @param {string} letter - String to convert to a number
 * @returns  {number} - The zero-indexed number for the letter (i.e. "a" is 0)
 */
const letterToNumber = (letter: string): number =>
  letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);

/**
 * Load the sounds into the game
 */
const preloadSounds = () => {
  Object.values(SOUNDS).forEach((sound) => {
    const audio = new Audio(sound.file);
    audio.volume = sound.volume;
    audio.preload = "auto";
  });
};

/**
 * Play a given sound
 *
 * @param {Sound} soundObject - Sound to be played
 */
const playSound = (soundObject: Sound) => {
  const soundFile = new Audio(soundObject.file);
  soundFile.volume = soundObject.volume;
  soundFile.play();
};

const Game: React.FC<GameProps> = ({ client }) => {
  const [boardSize, setBoardSize] = useState<number>(8); // Game Board size (width)
  const [numberOfMines, setNumberOfMines] = useState<number>(
    boardSize ** 2 * DEFAULT_MINE_RATIO
  ); // Number of mines
  const [gameboard, setGameboard] = useState<TileContent[][]>([]); // 2D array of every tile's content
  const [revealStatus, setRevealStatus] = useState<boolean[][]>([]); // 2D array of booleans indicating if the tile is revealed
  const [flaggedStatus, setFlaggedStatus] = useState<boolean[][]>([]); // 2D array of booleans indicating if the tile is flagged
  const [chatArray, setChatArray] = useState<Chat[]>([]); // The displayed chatbox (only of valid guesses)
  const [latestChat, setLatestChat] = useState<Chat>(); // The latest chat message that will be checked for validity
  const [timeoutStatus, setTimeoutStatus] = useState<TimeoutStatus>({}); // Object keeping track of users' timeout status
  const [userScores, setUserScores] = useState<Scores>({}); // Object keeping track of users' scores
  const isConnected = client !== null;

  let chatCount = 0;

  /**
   * Check if a given tile is valid
   *
   * @param {number} row - row # of the tile
   * @param {number} col - column # of the tile
   * @returns {boolean} - If the tile is within the board
   */
  const isValidTile = (row: number, col: number): boolean => {
    return row >= 0 && col >= 0 && row < boardSize && col < boardSize;
  };

  /**
   * Check if the board is fully revealed
   *
   * @returns {boolean} - If the board is fully revealed
   */
  const isFullyRevealed = (): boolean => {
    return revealStatus.every((row) => row.every((status) => status === true));
  };

  /**
   * Reveal a specified tile on the board (does not affect score)
   *
   * @param {number} row - row # of the tile
   * @param {number} col - column # of the tile
   */
  const revealTile = (row: number, col: number) => {
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
        initializeBoard();
      }, BOARD_RESET_TIMEOUT);
    }
  };

  /**
   * Check a tile and adjust the score of the user depending on whether it is a bomb or not
   *
   * @param {number} row - row # of the tile
   * @param {number} col - column # of the tile
   * @param {string} user - username whose score should be adjusted
   */
  const checkTile = (row: number, col: number, user: string) => {
    // Update score based on if it's a bomb
    if (user) {
      if (gameboard[row][col] === TileContent.Mine) {
        playSound(SOUNDS.explosionSound);
        updateScores(user, SCORES.INCORRECT_CHECK_SCORE);
      } else {
        playSound(SOUNDS.chimeSound);
        updateScores(user, SCORES.CORRECT_CHECK_SCORE);
      }
    }

    revealTile(row, col);
  };

  /**
   * Flag a tile and adjust the score of the user depending on whether it is a bomb or not
   *
   * @param {number} row - row # of the tile
   * @param {number} col - column # of the tile
   * @param {string} user - username whose score should be adjusted
   */
  const flagTile = (row: number, col: number, user: string) => {
    // Update the flagged status state
    const updatedFlaggedStatus = [...flaggedStatus];
    updatedFlaggedStatus[row][col] = true;
    setFlaggedStatus(updatedFlaggedStatus);

    // Update score based on if it's a bomb
    if (user) {
      if (gameboard[row][col] === TileContent.Mine) {
        playSound(SOUNDS.flagSound);
        updateScores(user, SCORES.CORRECT_FLAG_SCORE);
      } else {
        playSound(SOUNDS.incorrectSound);
        updateScores(user, SCORES.INCORRECT_FLAG_SCORE);
      }
    }

    // Reveal the tile
    revealTile(row, col);
  };

  /**
   * Initialize the game board
   */
  const initializeBoard = () => {
    // Reset the chat states
    setChatArray([]);

    // Reset the game board
    setGameboard([]);
    const newBoard = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill(TileContent.Zero)
    ); // Fill array with zeroes
    setRevealStatus(
      Array.from({ length: boardSize }, () => Array(boardSize).fill(false))
    );
    setFlaggedStatus(
      Array.from({ length: boardSize }, () => Array(boardSize).fill(false))
    );

    /**
     * Helper function that increases the number on a specified tile
     * @param {number} row - row # of the tile
     * @param {number} col - column # of the tile
     */
    const IncreaseCountOnTile = (row: number, col: number) => {
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
        randomRowIndex = Math.floor(Math.random() * boardSize);
        randomColIndex = Math.floor(Math.random() * boardSize);
      } while (newBoard[randomRowIndex][randomColIndex] === TileContent.Mine); // Ensure the selected index is not already a mine
      newBoard[randomRowIndex][randomColIndex] = TileContent.Mine;

      // Update the neighboring tiles of the new mine
      for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
          const newRow = randomRowIndex + rowOffset;
          const newCol = randomColIndex + colOffset;
          IncreaseCountOnTile(newRow, newCol);
        }
      }
    }

    // Play the new game sound if it's not the first round
    if (gameboard.length) {
      playSound(SOUNDS.newGameSound);
    }
    setGameboard([...newBoard]);
  };

  /**
   * Function called when a new tile is guessed
   *
   * @param {Chat} newChat - The chat object containing the new guess
   */
  const handleChatEntry = (newChat: Chat) => {
    const userGuess = newChat.message;

    // Check that the chat message matches the regex for a valid guess
    const [, letter, numberStr, flag] =
      userGuess.match(MINESWEEPER_GUESS_REGEX) || [];

    if (letter && numberStr) {
      if (newChat.user && timeoutStatus[newChat.user]) return; // If user is timed out do nothing
      const row = letterToNumber(letter); // Convert the number to 0-indexed number
      const col = parseInt(numberStr) - 1; // Convert the number to 0-indexed
      if (isValidTile(row, col) && !revealStatus[row][col]) {
        if (flag) {
          flagTile(row, col, newChat.user);
        } else {
          checkTile(row, col, newChat.user);
        }
        setChatArray((prevChatArray) => [...prevChatArray, newChat]);
        timeoutUser(newChat.user);
      }
    }
    // If it isn't a valid guess, check if it's a mod command
    else if (newChat.isMod) {
      const [, command, numberString] = userGuess.match(COMMANDS_REGEX) || [];
      if (command && numberString) {
        const number = parseInt(numberString);
        switch (command) {
          case COMMANDS.CHANGE_BOARD_SIZE:
            if (MINIMUM_BOARD_SIZE <= number && number <= MAXIMUM_BOARD_SIZE) {
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

  /**
   * Update the score for a specific user
   *
   * @param {string} user - Username whose score to update
   * @param {number} scoreChange - Number to increase the score by (or negative number to decrease)
   */
  const updateScores = (user: string, scoreChange: number) => {
    const currentScore = userScores[user] || 0;
    const newScore = currentScore + scoreChange;
    setUserScores((prevScores) => ({
      ...prevScores,
      [user]: newScore,
    }));
  };

  /**
   * Time out a specific user, preventing them from guessing for a set amount of time
   *
   * @param user - User to time out
   */
  const timeoutUser = (user: string) => {
    setTimeoutStatus((prevObject) => ({
      ...prevObject,
      [user]: true,
    }));
    setTimeout(function () {
      setTimeoutStatus((prevObject) => ({
        ...prevObject,
        [user]: false,
      }));
    }, USER_TIMEOUT_LENGTH);
  };

  /**
   * On initial mounting, start listening for chat messages if connected to Twitch.
   */
  useEffect(() => {
    if (isConnected) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      client.on("message", (channel, tags, message, self) => {
        const trimmedMessage = message.trim(); // Twitch adds white space to allow the broadcaster to repeat the same chat repeatedly it seems
        const user = tags["display-name"] || "User";
        const color = tags["color"] || "#FFFFFF";
        const isMod = tags.mod === true || tags.badges?.broadcaster === "1";

        const newChat: Chat = {
          message: trimmedMessage,
          user: user,
          color: color,
          isMod: isMod,
        };

        setLatestChat(newChat);
      });
    }
    preloadSounds();
  }, []);

  /**
   * Call handleChatEntry when a new chat is added
   */
  useEffect(() => {
    if (latestChat) {
      handleChatEntry(latestChat);
    }
  }, [latestChat]);

  /**
   *  When a mod changes the board size, automatically set the number of mines to a ratio of the squared board size
   */
  useEffect(() => {
    const newNumberOfMines = Math.max(
      1,
      Math.floor(boardSize ** 2 * DEFAULT_MINE_RATIO)
    );
    if (newNumberOfMines === numberOfMines) {
      initializeBoard();
    } else {
      setNumberOfMines(newNumberOfMines);
    }
  }, [boardSize]);

  /**
   * Reinitialize the board if the number of mines changes
   */
  useEffect(() => {
    initializeBoard();
  }, [numberOfMines]);

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
            isConnected={isConnected}
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
          {!isConnected && <EntryField handleChatEntry={handleChatEntry} />}
        </div>
      </div>
      <div className={styles.howToPlay}>
        <h3 className={styles.howToPlay__head}>How to Play:</h3>
        <p className={styles.howToPlay__text}>
          A3 : Open tile A3 {!isConnected && "(or left click)"}
        </p>
        <p className={styles.howToPlay__text}>
          B6f : Flag tile B6 {!isConnected && "(or right click)"}
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
