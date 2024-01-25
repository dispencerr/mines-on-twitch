import React from "react";
import styles from "./index.module.scss";
import MinefieldTile from "@/app/components/MinefieldTile";
import { TileContent } from "@/app/types/enums";

interface MinefieldProps {
  gameboard: TileContent[][];
  revealStatus: boolean[][];
  flaggedStatus: boolean[][];
  revealTile: (row: number, col: number) => void;
  flagTile: (row: number, col: number) => void;
}

function Minefield({
  gameboard,
  revealStatus,
  flaggedStatus,
  revealTile,
  flagTile,
}: MinefieldProps) {
  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {gameboard.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((cell, colIndex) => (
            <MinefieldTile
              row={rowIndex}
              col={colIndex}
              content={cell}
              isRevealed={revealStatus[rowIndex][colIndex]}
              isFlagged={flaggedStatus[rowIndex][colIndex]}
              revealTile={revealTile}
              flagTile={flagTile}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Minefield;
