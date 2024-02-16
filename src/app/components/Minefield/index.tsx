import React from "react";
import styles from "./index.module.scss";
import MinefieldTile from "@/app/components/MinefieldTile";
import { TileContent } from "@/app/types/enums";

type MinefieldProps = {
  gameboard: TileContent[][];
  revealStatus: boolean[][];
  flaggedStatus: boolean[][];
  checkTile: (row: number, col: number, user: string) => void;
  flagTile: (row: number, col: number, user: string) => void;
  isConnected: boolean;
};

const Minefield: React.FC<MinefieldProps> = ({
  gameboard,
  revealStatus,
  flaggedStatus,
  checkTile,
  flagTile,
  isConnected,
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
              checkTile={checkTile}
              flagTile={flagTile}
              isConnected={isConnected}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Minefield;
