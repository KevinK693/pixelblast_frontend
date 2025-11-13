import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import StarsBackground from "../components/StarryBackdrop";
import {
  useFonts,
  PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import useScreenReady from "../hooks/useScreenReady";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootState } from "../reducers/store";
import { API_URL } from "../config";

// Navigation types
type RootStackParamList = {
  Home: undefined;
  LeaderBoard: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, "LeaderBoard">;

type LeaderboardPlayer = {
  id: string;
  nickname: string;
  bestScore: number;
  bestLevel: number;
  color?: string;
};

// Palette
const palette = {
  bg1: "#050012",
  accent: "#7a3cff",
  neonPink: "#ff5cf7",
  neonViolet: "#b388ff",
  text: "#ffffff",
};

const levelColors = [
  "rgb(135, 158, 174)",
  "rgba(251, 146, 60, 1)",
  "rgba(251, 191, 36, 1)",
  "rgba(52, 211, 153, 1)",
  "rgba(45, 212, 191, 1)",
  "rgba(96, 165, 250, 1)",
  "rgba(139, 92, 246, 1)",
  "rgba(236, 72, 153, 1)",
  "rgba(248, 113, 113, 1)",
  "rgba(244, 114, 182, 1)",
];

// ITEM
function LeaderboardItem({
  item,
  index,
  currentNickname,
  onRemoveFriend,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  r,
}: {
  item: LeaderboardPlayer;
  index: number;
  currentNickname: string;
  onRemoveFriend: (friendId: string) => void;
  SCREEN_WIDTH: number;
  SCREEN_HEIGHT: number;
  r: any;
}) {
  const isMe = item.nickname === currentNickname;
  const color = item.color || palette.neonViolet;

  const rankLabel =
    index === 0
      ? "🥇"
      : index === 1
      ? "🥈"
      : index === 2
      ? "🥉"
      : `#${index + 1}`;

  const handleLongPress = () => {
    if (isMe) return;
    Alert.alert("❌ Supprimer ami", `Supprimer ${item.nickname} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => onRemoveFriend(item.id),
      },
    ]);
  };

  return (
    <View style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).itemOuter}>
      <TouchableOpacity activeOpacity={0.8} onLongPress={handleLongPress}>
        <View style={[styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).cardWrapper, { borderColor: color }]}>
          <View style={[
            styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).glow,
            { backgroundColor: color, opacity: isMe ? 0.18 : 0.12 },
          ]}/>

          <View style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).headerRow}>
            <Text style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).rank}>{rankLabel}</Text>
            <Text
              style={[styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).nickname, { color }]}
              numberOfLines={1}
            >
              {item.nickname}
            </Text>
            <View style={{ width: SCREEN_WIDTH * 0.08 }} />
          </View>

          <View style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).statsBox}>
            <Text style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).statText}>🏹 SCORE : {item.bestScore}</Text>
            <Text
              style={[
                styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).statText,
                { color: levelColors[(item.bestLevel - 1) % levelColors.length] },
              ]}
            >
              🧩 NIVEAU : {item.bestLevel}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ✅ SCREEN
export default function LeaderboardScreen({ navigation }: Props) {
  const profile = useSelector((state: RootState) => state.profile);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const r = {
    titleSize: SCREEN_WIDTH * 0.045,
    titleMarginTop: SCREEN_HEIGHT * 0.02,
    titleMarginBottom: SCREEN_HEIGHT * 0.035,
    rankSize: SCREEN_WIDTH * 0.038,
    nicknameSize: SCREEN_WIDTH * 0.03,
    statSize: SCREEN_WIDTH * 0.03,
    backButtonSize: SCREEN_WIDTH * 0.03,
    listMaxHeight: SCREEN_HEIGHT * 0.63,
    cardPaddingVertical: SCREEN_HEIGHT * 0.018,
    cardPaddingHorizontal: SCREEN_WIDTH * 0.04,
    itemMarginVertical: SCREEN_HEIGHT * 0.012,
    backButtonBottom: SCREEN_HEIGHT * 0.045,
  };

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const ready = useScreenReady(250);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    if (!profile.token) return;
    fetch(`${API_URL}/users/friends/leaderboard/${profile.token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) setLeaderboard(data.leaderboard);
      });
  }, [profile.token]);

  const onRemoveFriend = (friendId: string) => {
    fetch(`${API_URL}/users/friends/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: profile.token, friendId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setLeaderboard((prev) => prev.filter((p) => p.id !== friendId));
        }
      });
  };

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).loaderContainer}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[
      styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).container,
      { paddingTop: insets.top, paddingBottom: insets.bottom },
    ]}>
      <StarsBackground stars={100} shooting={3} speed={0.9} showPlanet={false} />

      <Text style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).title}>🏆 CLASSEMENT AMIS</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardItem
            item={item}
            index={index}
            currentNickname={profile.nickname ?? ""}
            onRemoveFriend={onRemoveFriend}
            SCREEN_WIDTH={SCREEN_WIDTH}
            SCREEN_HEIGHT={SCREEN_HEIGHT}
            r={r}
          />
        )}
        style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).listContainer}
        contentContainerStyle={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).listContent}
        showsVerticalScrollIndicator
      />

      <TouchableOpacity
        style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles(SCREEN_WIDTH, SCREEN_HEIGHT, r).backText}>
          ⬅ RETOUR
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = (SCREEN_WIDTH: number, SCREEN_HEIGHT: number, r: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.bg1,
      alignItems: "center",
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: palette.bg1,
    },
    title: {
      fontFamily: "PressStart2P_400Regular",
      fontSize: r.titleSize,
      color: palette.text,
      marginTop: r.titleMarginTop,
      marginBottom: r.titleMarginBottom,
      width: "100%",
      textAlign: "center",
      paddingHorizontal: SCREEN_WIDTH * 0.04,
    },
    listContainer: {
      width: "100%",
      maxHeight: r.listMaxHeight,
    },
    listContent: {
      paddingBottom: SCREEN_HEIGHT * 1.22,
    },
    itemOuter: {
      width: "90%",
      alignSelf: "center",
      marginVertical: r.itemMarginVertical,
    },
    cardWrapper: {
      borderWidth: 3,
      borderRadius: 16,
      paddingVertical: r.cardPaddingVertical,
      paddingHorizontal: r.cardPaddingHorizontal,
      backgroundColor: "rgba(0,0,0,0.35)",
      overflow: "hidden",
    },
    glow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
    },
    rank: {
      fontFamily: "PressStart2P_400Regular",
      fontSize: r.rankSize,
      width: "17%",
      minWidth: 38,
      textAlign: "center",
      color: "#CBCBCB",
    },
    nickname: {
      fontFamily: "PressStart2P_400Regular",
      fontSize: r.nicknameSize,
      maxWidth: "65%",
      flexShrink: 1,
      textAlign: "center",
    },
    statsBox: {
      width: "100%",
      marginTop: SCREEN_HEIGHT * 0.01,
      alignItems: "center",
    },
    statText: {
      fontFamily: "PressStart2P_400Regular",
      fontSize: r.statSize,
      color: palette.text,
      textAlign: "center",
      marginBottom: SCREEN_HEIGHT * 0.005,
    },
    backButton: {
      position: "absolute",
      bottom: r.backButtonBottom,
      paddingVertical: SCREEN_HEIGHT * 0.018,
      paddingHorizontal: SCREEN_WIDTH * 0.09,
      borderWidth: 2,
      borderRadius: 14,
      borderColor: palette.neonPink,
      backgroundColor: palette.accent,
      alignItems: "center",
      minWidth: SCREEN_WIDTH * 0.45,
    },
    backText: {
      fontFamily: "PressStart2P_400Regular",
      fontSize: r.backButtonSize,
      color: "#FFF",
      textAlign: "center",
    },
  });
