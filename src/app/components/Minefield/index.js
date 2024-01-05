import styles from'./index.module.scss'
import MinefieldTile from '@/app/components/MinefieldTile'

function Minefield(props) {
  const { gameboard } = props;

  return (
    <div>
      {gameboard.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((cell, colIndex) => (
            <MinefieldTile row={rowIndex} col={colIndex+1} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Minefield;
