import React from "react";
import styles from "./index.module.scss";
import { TileContent } from "@/app/types/enums";

type MinefieldTileProps = {
  row: number;
  col: number;
  content: TileContent;
  isRevealed: boolean;
  isFlagged: boolean;
  checkTile: (row: number, col: number, user: string) => void;
  flagTile: (row: number, col: number, user: string) => void;
  isConnected: boolean;
};

const MinefieldTile: React.FC<MinefieldTileProps> = ({
  row,
  col,
  content,
  isRevealed,
  isFlagged,
  checkTile,
  flagTile,
  isConnected,
}) => {
  const displayCol = col + 1;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /**
   * When a tile is clicked, reveal the tile
   *
   * @returns void
   */
  const handleClick = (): void => {
    checkTile(row, col, "User");
  };

  /**
   * When a tile is right clicked, mark it as flagged and reveal it
   *
   * @returns void
   */
  const handleRightClick = (e): void => {
    e.preventDefault();
    flagTile(row, col, "User");
  };

  const getRevealedTileClasses = (): string => {
    let classString = `${styles.tile}`;

    switch (content) {
      case TileContent.Mine:
        classString += ` ${styles.isMine}`;
        break;
      case TileContent.Zero:
        classString += ` ${styles.isNumberZero}`;
        break;
      case TileContent.One:
        classString += ` ${styles.isNumberOne}`;
        break;
      case TileContent.Two:
        classString += ` ${styles.isNumberTwo}`;
        break;
      case TileContent.Three:
        classString += ` ${styles.isNumberThree}`;
        break;
      case TileContent.Four:
        classString += ` ${styles.isNumberFour}`;
        break;
      case TileContent.Five:
        classString += ` ${styles.isNumberFive}`;
        break;
      case TileContent.Six:
        classString += ` ${styles.isNumberSix}`;
        break;
      case TileContent.Seven:
        classString += ` ${styles.isNumberSeven}`;
        break;
      case TileContent.Eight:
        classString += ` ${styles.isNumberEight}`;
        break;
      default:
        break;
    }

    if (isFlagged) {
      classString += ` ${styles.isFlagged}`;
    }

    return classString;
  };

  return isRevealed ? (
    <div className={getRevealedTileClasses()}>
      <span className={styles.tile__content}>
        {content === TileContent.Mine ? (isFlagged ? "🚩" : "💣") : content}
      </span>
    </div>
  ) : (
    <div
      className={`${styles.tile} ${styles.unrevealedTile} ${
        !isConnected ? "" : styles.clickDisabled
      }`}
      onClick={!isConnected ? handleClick : undefined}
      onContextMenu={!isConnected ? handleRightClick : undefined}
    >
      {letters[row] + displayCol}
    </div>
  );
};

export default MinefieldTile;
