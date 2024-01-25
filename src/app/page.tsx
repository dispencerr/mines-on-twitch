"use client";
import React, { useState, useEffect } from "react";
import "@/app/styles/globals.css";
import styles from "./page.module.scss";
import Game from "@/app/components/Game";
import StartingScreen from "@/app/components/StartingScreen";
import { TmiClient } from "./types/types";
import { Client } from "tmi.js";

export default function Home() {
  const [getClient, setClient] = useState<TmiClient | null>(null);
  const [getChannel, setChannel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const tmi = require("tmi.js");

  const playOffline = (): void => {
    setIsConnected(true);
  };

  const changeChannel = (channel: string): void => {
    setChannel(channel);
  };

  useEffect(() => {
    if (getClient) {
      setIsConnecting(true);
      let tryConnection;
      let connectionTries = 0;

      const checkConnection = () => {
        if (getClient.channels.length > 0) {
          setIsConnected(true);
          clearInterval(tryConnection);
          //update router?
        } else if (connectionTries >= 5) {
          clearInterval(tryConnection);
          alert("Connection failed");
          setChannel("");
          setIsConnecting(false);
        } else {
          connectionTries++;
        }
      };

      tryConnection = setInterval(checkConnection, 500);
    }
  }, [getClient]);

  useEffect(() => {
    if (getChannel) {
      let client: Client = new tmi.Client({
        channels: [getChannel],
      });
      setClient(client as unknown as TmiClient);
      client.connect();
    }
  }, [getChannel]);

  useEffect(() => {
    // Parse the URL parameters to get the "channel" parameter
    const searchParams = new URLSearchParams(location.search);
    const channelParam = searchParams.get("channel");

    if (channelParam) {
      setIsConnecting(true);
      setChannel(channelParam);
    }
    setIsLoading(false);
  }, []);

  return (
    <main className={styles.main}>
      {!isConnected ? (
        !isConnecting ? (
          !isLoading ? (
            <>
              <StartingScreen
                changeChannel={changeChannel}
                playOffline={playOffline}
              />
              {/* <a
                className={styles.link}
                href="https://github.com/dispencerr/wordle-on-twitch"
              >
                Contribute on GitHub
              </a> */}
            </>
          ) : (
            <span>Loading...</span>
          )
        ) : (
          <span>Connecting...</span>
        )
      ) : (
        <Game client={getClient} />
      )}
    </main>
  );
}
