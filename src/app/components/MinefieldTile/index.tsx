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

  return isRevealed ? (
    <div
      className={`${styles.tile} ${
        content === TileContent.Mine ? styles.isMine : ""
      } ${isFlagged ? styles.isFlagged : ""}`}
    >
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
