import styles from'./index.module.scss'
import MinefieldTile from '@/app/components/MinefieldTile'

function Minefield(props) {
  const { gameboard, revealStatus, flaggedStatus={flaggedStatus}, revealTile, flagTile } = props;

  return (
    <div>
      {gameboard.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((cell, colIndex) => (
            <MinefieldTile row={rowIndex} col={colIndex} content={cell} isRevealed={revealStatus[rowIndex][colIndex]} isFlagged={flaggedStatus[rowIndex][colIndex]} revealTile={revealTile} flagTile={flagTile} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Minefield;
