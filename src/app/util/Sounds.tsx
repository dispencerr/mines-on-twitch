import { useRef, useEffect, useMemo } from "react";

export const useWhooshSound = () => {
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);

  const whooshSound = useMemo(() => {
    if (typeof Audio !== "undefined" && !whooshSoundRef.current) {
      whooshSoundRef.current = new Audio("/sounds/whoosh.wav");
      whooshSoundRef.current.volume = 0.5;
    }
    return whooshSoundRef.current;
  }, []);

  const playWhooshSound = (): void => {
    whooshSound?.play();
  };

  useEffect(() => {
    return () => {
      if (whooshSoundRef.current) {
        whooshSoundRef.current.pause();
        whooshSoundRef.current = null;
      }
    };
  }, []);

  return { playWhooshSound };
};
