"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "@/app/styles/globals.css";
import styles from "./page.module.scss";
import Game from "@/app/components/Game";
import StartingScreen from "@/app/components/StartingScreen";
import { Client } from "tmi.js";
import tmi from "tmi.js";

const CONNECTION_RETRY_INTERVAL = 500; // Amount to wait between connection attempts, in ms
const MAX_CONNECTION_TRIES = 5; // Number of times to try connecting before giving up

export default function Home() {
  const searchParams = useSearchParams();
  const [getClient, setClient] = useState<Client | null>(null); // The Client object containing the channel to connect to using the Twitch chat API
  const [getChannel, setChannel] = useState<string | null>(null); // The Twitch channel to connect to
  const [isLoading, setIsLoading] = useState(true); // If the game is in the loading state
  const [isConnecting, setIsConnecting] = useState(false); // If the game is attempting to connect
  const [isConnected, setIsConnected] = useState(false); // If the game has successfully connected

  /**
   * Set the game up in offline mode (change the connected state to true but keep the client as null)
   */
  const playOffline = () => {
    setIsConnected(true);
  };

  /**
   * Check the connection to the specified channel at set intervals and update the state and the URL on a successful connection
   *
   * @param {Client} client - The client object to conncet to
   */
  const testConnection = (client: Client): void => {
    setIsConnecting(true);
    // eslint-disable-next-line prefer-const
    let tryConnection: NodeJS.Timeout;
    let connectionTries = 0;

    const checkConnection = () => {
      if (client.getChannels().length > 0) {
        // Connection was successful
        setIsConnected(true);
        clearInterval(tryConnection);

        // Update the browser URL
        const params = new URLSearchParams(searchParams.toString());
        params.set("channel", client.getChannels()[0].slice(1));
        window.history.pushState(null, "", `?${params.toString()}`);
      } else if (connectionTries >= MAX_CONNECTION_TRIES) {
        // Connection was unsuccessful and tried too many times
        clearInterval(tryConnection);
        alert("Connection failed");
        setChannel("");
        setIsConnecting(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("channel");
        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : "/";
        window.history.pushState(null, "", newUrl);
        setClient(null);
      } else {
        // Connection was unsuccessful, increase the count of attempts so far
        connectionTries++;
      }
    };

    tryConnection = setInterval(checkConnection, CONNECTION_RETRY_INTERVAL);
  };

  /**
   * When the channel is set, update the Client object in the state and attempt to connect.
   */
  useEffect(() => {
    if (getChannel) {
      const client: Client = new tmi.Client({
        channels: [getChannel],
      });
      setClient(client);
      client.connect();
      testConnection(client);
    }
  }, [getChannel]);

  useEffect(() => {
    if (getChannel) {
      const client: Client = new tmi.Client({
        channels: [getChannel],
      });
      setClient(client);
      client.connect();
    }
  }, [getChannel]);

  /**
   * Parse the URL parameters to get the "channel" parameter and connect if it exists
   */
  useEffect(() => {
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
                connectToChannel={setChannel}
                playOffline={playOffline}
              />
              <a
                className={styles.link}
                href="https://github.com/dispencerr/mines-on-twitch"
              >
                Contribute on GitHub
              </a>
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
