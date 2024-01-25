import React from "react";
import styles from "./index.module.scss";
import MinefieldTile from "@/app/components/MinefieldTile";
import { TileContent } from "@/app/types/enums";

type MinefieldProps = {
  gameboard: TileContent[][];
  revealStatus: boolean[][];
  flaggedStatus: boolean[][];
  revealTile: (row: number, col: number) => void;
  flagTile: (row: number, col: number) => void;
};

const Minefield: React.FC<MinefieldProps> = ({
  gameboard,
  revealStatus,
  flaggedStatus,
  revealTile,
  flagTile,
}) => {
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
              key={rowIndex + "-" + colIndex}
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
};

export default Minefield;
