import React, { useState, useRef } from "react";
import styles from "./index.module.scss";
import { Chat } from "@/app/types/types";

type EntryFieldProps = {
  addChatMessage: (newChat: Chat) => void;
};

const EntryField: React.FC<EntryFieldProps> = ({ addChatMessage }) => {
  const [getEntry, setEntry] = useState<string>("");
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const handleInputChange = (event) => {
    setEntry(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  const handleButtonClick = () => {
    if (wordInputRef.current) {
      wordInputRef.current.value = ""; // Clear input field
    }
    const newChat: Chat = {
      user: "User",
      message: getEntry,
      color: "#000000",
    };
    addChatMessage(newChat);
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
