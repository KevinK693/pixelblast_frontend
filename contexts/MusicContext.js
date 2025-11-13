// contexts/MusicContext.js
import React, { createContext, useState, useEffect } from "react";
import { Audio } from "expo-av";

export const MusicContext = createContext();

export default function MusicProvider({ children }) {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState("Night");
  const [isPlaying, setIsPlaying] = useState(false);

  // Liste des musiques disponibles
  const tracks = {
    Night: require("../assets/music/Night.mp3"),
    MEW: require("../assets/music/MEW.mp3"),
    Ronny: require("../assets/music/Ronny.mp3"),
    STAZ: require("../assets/music/STAZ.mp3"),
    Aube: require("../assets/music/Aube.mp3"),
    Highway: require("../assets/music/Highway.mp3"),
    Belgrade: require("../assets/music/Belgrade.mp3"),
    Pocket: require("../assets/music/Pocket.mp3"),
    Year: require("../assets/music/Year.mp3"),
  };

  // Ordre de lecture (playlist)
  const trackOrder = ["Night", "MEW", "Ronny", "STAZ", "Aube", "Highway", "Belgrade", "Pocket", "Year"];

  // utilitaire: nom de la piste suivante
  const getNextName = (name) => {
    const i = trackOrder.indexOf(name);
    const nextIndex = i === -1 ? 0 : (i + 1) % trackOrder.length;
    return trackOrder[nextIndex];
  };

  // Initialisation au lancement (autoplay comme dans ton code d’origine)
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });
        await playTrack(currentTrack);
      } catch (e) {
        console.error("Erreur initialisation audio:", e);
      }
    };

    initAudio();

    // Nettoyage
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  Lecture d'une musique (corrigée: pas de loop + passe à la suivante à la fin)
  async function playTrack(trackName) {
    try {
      // Stoppe/décharge l’ancien son
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      }

      // Charge et lit SANS boucle
      const { sound: newSound } = await Audio.Sound.createAsync(
        tracks[trackName],
        { shouldPlay: true, isLooping: false }
      );

      // Quand la piste se termine → jouer la suivante
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status?.isLoaded) return;
        setIsPlaying(!!status.isPlaying);
        if (status.didJustFinish && !status.isLooping) {
          const nextName = getNextName(trackName);
          playTrack(nextName);
        }
      });

      setSound(newSound);
      setCurrentTrack(trackName);
      setIsPlaying(true);
    } catch (error) {
      console.error("🎵 Erreur lecture musique :", error);
    }
  }

  // Stop
  async function stopMusic() {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.stopAsync();
      }
      setIsPlaying(false);
    }
  }

  // Reprise
  async function resumeMusic() {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  }

  return (
    <MusicContext.Provider
      value={{
        sound,
        isPlaying,
        currentTrack,
        playTrack,
        stopMusic,
        resumeMusic,
        tracks,
        trackOrder,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}
