import styles from'./index.module.scss'

function MinefieldTile(props) {
  const { row, col } = props;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className={styles.tile}>
      {letters[row]}{col}
    </div>
  );
}

export default MinefieldTile;
