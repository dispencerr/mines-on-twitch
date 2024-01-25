import React from "react";
import styles from "./index.module.scss";
import { TileContent } from "@/app/types/enums";

type MinefieldTileProps = {
  row: number;
  col: number;
  content: TileContent;
  isRevealed: boolean;
  isFlagged: boolean;
  revealTile: (row: number, col: number) => void;
  flagTile: (row: number, col: number) => void;
};

const MinefieldTile: React.FC<MinefieldTileProps> = ({
  row,
  col,
  content,
  isRevealed,
  isFlagged,
  revealTile,
  flagTile,
}) => {
  const displayCol = col + 1;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /**
   * When a tile is clicked, reveal the tile
   *
   * @returns void
   */
  const handleClick = (): void => {
    revealTile(row, col);
  };

  /**
   * When a tile is right clicked, mark it as flagged and reveal it
   *
   * @returns void
   */
  const handleRightClick = (e): void => {
    e.preventDefault();
    flagTile(row, col);
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
      {content === TileContent.Mine ? (isFlagged ? "🚩" : "💣") : content}
    </div>
  ) : (
    <div
      className={`${styles.tile} ${styles.unrevealedTile}`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    >
      {letters[row] + displayCol}
    </div>
  );
};

export default MinefieldTile;
