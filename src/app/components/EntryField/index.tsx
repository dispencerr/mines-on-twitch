import React, { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import styles from "./index.module.scss";
import { Chat } from "@/app/types/types";

type EntryFieldProps = {
  handleChatEntry: (newChat: Chat) => void;
};

const EntryField: React.FC<EntryFieldProps> = ({ handleChatEntry }) => {
  const [getEntry, setEntry] = useState("");
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEntry(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  const handleButtonClick = (): void => {
    if (wordInputRef.current) {
      wordInputRef.current.value = ""; // Clear input field
    }
    const newChat: Chat = {
      user: "User",
      message: getEntry,
      color: "#FFFFFF",
      isMod: true,
    };
    handleChatEntry(newChat);
  };

  return (
    <div className={styles.entryContainer}>
      <input
        type="text"
        ref={wordInputRef}
        name="wordInput"
        className={styles.entryField}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      ></input>
      <button className={styles.entryButton} onClick={handleButtonClick}>
        Enter
      </button>
    </div>
  );
};

export default EntryField;
