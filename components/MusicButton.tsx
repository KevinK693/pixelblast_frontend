import React, { useContext, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Text,
  useWindowDimensions
} from "react-native";
import { MusicContext } from "../contexts/MusicContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MusicButtonProps = {
  position?: "top-right" | "top-left";
};

export default function MusicButton({ position = "top-right" }: MusicButtonProps) {
  const {
    playTrack,
    stopMusic,
    resumeMusic,
    currentTrack,
    isPlaying,
    tracks,
    trackOrder,
  } = useContext(MusicContext);

  const [modalVisible, setModalVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const { width: W } = useWindowDimensions(); 

  const posStyle =
    position === "top-right"
      ? { top: insets.top + W * 0.02, right: W * 0.04 }
      : { top: insets.top + W * 0.02, left: W * 0.04 };

  const list = useMemo(() => {
    const names = trackOrder?.length ? trackOrder : Object.keys(tracks || {});
    return names.filter((n: string) => tracks?.[n]);
  }, [trackOrder, tracks]);

  const getNext = () => {
    if (!list?.length) return null;
    const i = Math.max(0, list.indexOf(currentTrack));
    return list[(i + 1) % list.length];
  };

  const getPrev = () => {
    if (!list?.length) return null;
    const i = Math.max(0, list.indexOf(currentTrack));
    return list[(i - 1 + list.length) % list.length];
  };

  const onTogglePlay = async () => {
    if (isPlaying) stopMusic();
    else resumeMusic();
  };

  const onNext = async () => {
    const n = getNext();
    if (n) playTrack(n);
  };

  const onPrev = async () => {
    const p = getPrev();
    if (p) playTrack(p);
  };

  return (
    <View style={[styles.wrap, posStyle]}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Image
          source={require("../assets/musical-note.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir une musique 🎧</Text>

            {/* 🎛️ Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={onPrev}>
                <Text style={styles.ctrl}>⏮️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onTogglePlay}>
                <Text style={styles.ctrl}>{isPlaying ? "⏸️" : "▶️"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onNext}>
                <Text style={styles.ctrl}>⏭️</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nowPlaying}>
              {currentTrack ? `En cours : ${currentTrack}` : "Aucune piste"}
            </Text>

            {list.length === 0 ? (
              <Text style={styles.noTrack}>Aucune musique trouvée</Text>
            ) : (
              list.map((trackName :string) => (
                <TouchableOpacity
                  key={trackName}
                  style={[
                    styles.trackButton,
                    currentTrack === trackName && styles.activeTrack,
                  ]}
                  onPress={() => {
                    playTrack(trackName);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.trackText}>
                    {currentTrack === trackName ? `🎵 ${trackName}` : trackName}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {isPlaying && (
              <TouchableOpacity onPress={stopMusic} style={styles.stopBtn}>
                <Text style={styles.stopText}>⏹️ Stop</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", zIndex: 9999, elevation: 9999 },
  button: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "#b388ff",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { width: 34, height: 34 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#1a0938",
    borderWidth: 2,
    borderColor: "#b388ff",
    borderRadius: 16,
    padding: 25,
    width: "80%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "PressStart2P_400Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 12,
  },
  ctrl: { color: "#fff", fontSize: 18 },
  nowPlaying: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  noTrack: { color: "#fff", textAlign: "center" },
  trackButton: {
    borderWidth: 1,
    borderColor: "#b388ff",
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 10,
  },
  activeTrack: { backgroundColor: "rgba(179,136,255,0.3)" },
  trackText: {
    color: "#fff",
    fontFamily: "PressStart2P_400Regular",
    fontSize: 9,
    textAlign: "center",
  },
  stopBtn: { marginTop: 8, alignSelf: "center" },
  stopText: {
    color: "#ff5cf7",
    fontFamily: "PressStart2P_400Regular",
    fontSize: 10,
  },
  closeBtn: {
    alignSelf: "center",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b388ff",
  },
  closeText: {
    color: "#fff",
    fontFamily: "PressStart2P_400Regular",
    fontSize: 10,
  },
});
