import { Scores } from "@/app/types/types";
import styles from "./index.module.scss";

type ScoreboardProps = {
  getUserScores: Scores;
};

const Scoreboard: React.FC<ScoreboardProps> = ({ getUserScores }) => {
  // Sort data by score in descending order
  const sortedScores = Object.entries(getUserScores).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div>
      <h2 className={styles.scoreboardTitle}>Scoreboard:</h2>
      <ol>
        {sortedScores.map(([username, score]) => (
          <li key={username} className={styles.scoreboardItem}>
            <span className={styles.username}>{username}</span>
            <span className={styles.score}>{score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Scoreboard;
