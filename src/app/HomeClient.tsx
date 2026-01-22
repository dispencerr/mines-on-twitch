"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import Game from "@/app/components/Game";
import StartingScreen from "@/app/components/StartingScreen";
import tmi, { Client } from "tmi.js";

const CONNECTION_RETRY_INTERVAL = 500;
const MAX_CONNECTION_TRIES = 5;

export default function HomeClient() {
  const searchParams = useSearchParams();

  const [getClient, setClient] = useState<Client | null>(null);
  const [getChannel, setChannel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const playOffline = () => {
    setIsConnected(true);
  };

  const testConnection = (client: Client): void => {
    setIsConnecting(true);
    let connectionTries = 0;

    const tryConnection = setInterval(() => {
      if (client.getChannels().length > 0) {
        setIsConnected(true);
        clearInterval(tryConnection);

        const params = new URLSearchParams(searchParams.toString());
        params.set("channel", client.getChannels()[0].slice(1));
        window.history.pushState(null, "", `?${params.toString()}`);
      } else if (connectionTries >= MAX_CONNECTION_TRIES) {
        clearInterval(tryConnection);
        alert("Connection failed");
        setChannel(null);
        setIsConnecting(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("channel");
        const newUrl = params.toString() ? `?${params}` : "/";
        window.history.pushState(null, "", newUrl);

        setClient(null);
      } else {
        connectionTries++;
      }
    }, CONNECTION_RETRY_INTERVAL);
  };

  useEffect(() => {
    if (!getChannel) return;

    const client = new tmi.Client({ channels: [getChannel] });
    setClient(client);
    client.connect();
    testConnection(client);
  }, [getChannel]);

  useEffect(() => {
    const channelParam = searchParams.get("channel");
    if (channelParam) {
      setIsConnecting(true);
      setChannel(channelParam);
    }
    setIsLoading(false);
  }, [searchParams]);

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
