import { useState } from "react";
import styles from "./index.module.scss";

function MinefieldTile(props) {
  const { row, col, content, isRevealed, isFlagged, revealTile, flagTile } = props;
  const displayCol = col + 1;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const handleClick = () => {
    revealTile(row, col);
  }

  const handleRightClick = (e) => {
    e.preventDefault();
    flagTile(row, col);
    revealTile(row, col);
  }

  return isRevealed ? (
    <div className={`${styles.tile} ${content === '*' ? styles.isMine : ''} ${isFlagged ? styles.isFlagged : ''}`}>
      {content === '*' ? isFlagged ? '🚩' : '💣' : content}
    </div>
  ) : (
    <div className={`${styles.tile} ${styles.unrevealedTile}`} onClick={handleClick} onContextMenu={handleRightClick}>
      {letters[row] + displayCol}
    </div>
  );
}

export default MinefieldTile;
