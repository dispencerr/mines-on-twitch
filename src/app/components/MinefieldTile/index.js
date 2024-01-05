import styles from'./index.module.scss'

function MinefieldTile(props) {
  const { row, col, content } = props;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className={`${styles.tile} ${content === '*' ? styles.isMine : ''}`}>
      {content}
      {/* {letters[row]}{col} */}
    </div>
  );
}

export default MinefieldTile;
