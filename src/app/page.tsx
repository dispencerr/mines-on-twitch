"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "@/app/styles/globals.css";
import styles from "./page.module.scss";
import Game from "@/app/components/Game";
import StartingScreen from "@/app/components/StartingScreen";
import { Client } from "tmi.js";
import tmi from "tmi.js";

export default function Home() {
  const searchParams = useSearchParams();
  const [getClient, setClient] = useState<Client | null>(null);
  const [getChannel, setChannel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const playOffline = () => {
    setIsConnected(true);
  };

  const changeChannel = (channel: string) => {
    setChannel(channel);
  };

  useEffect(() => {
    if (getClient) {
      setIsConnecting(true);
      // eslint-disable-next-line prefer-const
      let tryConnection: NodeJS.Timeout;
      let connectionTries = 0;

      const checkConnection = () => {
        if (getClient.getChannels().length > 0) {
          setIsConnected(true);
          clearInterval(tryConnection);
          const params = new URLSearchParams(searchParams.toString());
          params.set("channel", getClient.getChannels()[0].slice(1));
          window.history.pushState(null, "", `?${params.toString()}`);
        } else if (connectionTries >= 5) {
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
          connectionTries++;
        }
      };

      tryConnection = setInterval(checkConnection, 500);
    }
  }, [getClient]);

  useEffect(() => {
    if (getChannel) {
      const client: Client = new tmi.Client({
        channels: [getChannel],
      });
      setClient(client);
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
