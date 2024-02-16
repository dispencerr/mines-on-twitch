import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import styles from "./index.module.scss";
import { Chat } from "@/app/types/types";

type EntryFieldProps = {
  handleChatEntry: (newChat: Chat) => void;
};

const EntryField: React.FC<EntryFieldProps> = ({ handleChatEntry }) => {
  const [getEntry, setEntry] = useState(""); // Value of the input field

  /**
   * Update the state when the input field changes
   *
   * @param event
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEntry(event.target.value);
  };

  /**
   * When a key is pressed, check if it's enter, and process it as a button click if it is
   *
   * @param event
   */
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  /**
   * When the submit button is clicked, call the function to process the chat entry
   */
  const handleButtonClick = () => {
    setEntry("");
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
        name="wordInput"
        className={styles.entryField}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        value={getEntry}
      ></input>
      <button className={styles.entryButton} onClick={handleButtonClick}>
        Enter
      </button>
    </div>
  );
};

export default EntryField;
