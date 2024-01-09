import React from 'react';
import 'destyle.css';
import styles from './page.module.scss';
import Game from '@/app/components/Game'

export default function Home() {
  return (
    <main className={styles.main}>
      <Game />
    </main>
  )
}
