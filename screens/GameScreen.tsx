import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { updateProgress, updateBest } from "../reducers/profile";
import StarryBackdrop from "../components/StarryBackdrop";
import MusicButton from "../components/MusicButton";
import {
  useFonts,
  PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootState } from "../reducers/store";
import { API_URL } from "../config";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Navigation
type RootStackParamList = {
  Game: undefined;
  Home: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, "Game">;

// Types 
type Cell = {
  bomb: boolean;
  value: number;
  revealed: boolean;
  preview?: boolean;
  animatedScale?: Animated.Value;
};

// Assets 
const pieldIcon = require("../assets/pield.png");
const blixelIcon = require("../assets/blixel.png");

// UI Palette
const palette = {
  bg1: "#050012",
  accent: "#7a3cff",
  neonPink: "#ff5cf7",
  neonViolet: "#b388ff",
  text: "#ffffff",
  glow: "#b15eff",
};

// Couleurs des niveaux (titre)
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

// Damier (exactement comme avant)
const PATTERN_DARK = "rgba(180, 0, 255, 0.55)";
const PATTERN_LIGHT = "rgba(255, 120, 255, 0.4)";

// Grille RESPONSIVE 
const ROWS = 5;
const COLS = 4;
const JOKER_DURATION = 3000;

// Calcul responsive de la taille des cellules
const calculateCellSize = () => {
  const availableWidth = SCREEN_WIDTH * 0.9; // 90% de la largeur
  const totalGaps = (COLS + 1) * 2; // Gaps entre cellules + joker
  const gapSize = SCREEN_WIDTH * 0.01; // 1% de l'écran
  const cellSize = (availableWidth - totalGaps * gapSize) / (COLS + 1);
  return Math.min(cellSize, SCREEN_HEIGHT * 0.08); // Max 8% de la hauteur
};

const CELL = calculateCellSize();
const GAP = SCREEN_WIDTH * 0.01;

// Tailles responsives
const responsive = {
  levelSize: SCREEN_WIDTH * 0.05,
  scoreSize: SCREEN_WIDTH * 0.032,
  cellTextSize: SCREEN_WIDTH * 0.025,
  hintTextSize: SCREEN_WIDTH * 0.025,
  hintBombTextSize: SCREEN_WIDTH * 0.025,
  quitButtonTextSize: SCREEN_WIDTH * 0.025,
  bombIconSize: CELL * 0.5,
  pieldIconSize: CELL * 0.75,
  revealedBombSize: CELL * 0.75,
  levelMarginBottom: SCREEN_HEIGHT * 0.012,
  scoreMarginBottom: SCREEN_HEIGHT * 0.04,
  quitMarginTop: SCREEN_HEIGHT * 0.03,
  quitPaddingVertical: SCREEN_HEIGHT * 0.015,
  quitPaddingHorizontal: SCREEN_WIDTH * 0.09,
};

// Génération de la grille
function makeGrid(levelVal: number): Cell[][] {
  const bombRate = Math.min(0.1 + levelVal * 0.08, 0.7);
  const grid: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      bomb: false,
      value: 0,
      revealed: false,
    }))
  );

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const bomb = Math.random() < bombRate;
      let value = bomb
        ? 0
        : Math.min(
            9,
            Math.floor(Math.random() * (3 + Math.floor(levelVal * 0.6))) + 1
          );

      const rowSum = grid[r].reduce((s, cell) => s + cell.value, 0);
      if (!bomb && rowSum + value > 9) value = Math.max(1, 9 - rowSum);

      const colSum = grid.reduce((s, row) => s + row[c].value, 0);
      if (!bomb && colSum + value > 9) value = Math.max(1, 9 - colSum);

      grid[r][c] = { bomb, value, revealed: false };
    }
  }
  return grid;
}

export default function GameScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);

  // Hooks
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [level, setLevel] = useState<number>(profile.level || 1);
  const [score, setScore] = useState<number>(profile.score || 0);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [jokerAvailable, setJokerAvailable] = useState<boolean>(true);
  const [jokerActive, setJokerActive] = useState<boolean>(false);
  const [grid, setGrid] = useState<Cell[][]>(() => makeGrid(level));
  const insets = useSafeAreaInsets();

  // Backdrop stable, zIndex derrière tout 
  const stableBackground = useMemo(
    () => (
      <View style={styles.backdropWrap} pointerEvents="none">
        <StarryBackdrop
          stars={100}
          shooting={3}
          speed={0.9}
          tint={["#050012", "#050012"]}
          showPlanet={false}
          accentBeams={false}
        />
      </View>
    ),
    []
  );

  // Indices colonnes
  const columnHints = useMemo(
    () =>
      Array.from({ length: COLS }, (_, c) =>
        grid.reduce(
          (acc, row) => {
            const cell = row[c];
            if (cell?.bomb) acc.bombs++;
            else if (cell) acc.points += cell.value;
            return acc;
          },
          { bombs: 0, points: 0 }
        )
      ),
    [grid]
  );

  // Indices lignes
  const rowHints = useMemo(
    () =>
      grid.map((row) =>
        row.reduce(
          (acc, cell) => {
            if (cell.bomb) acc.bombs++;
            else acc.points += cell.value;
            return acc;
          },
          { bombs: 0, points: 0 }
        )
      ),
    [grid]
  );

  // Révéler case
  const reveal = (r: number, c: number) => {
    const target = grid[r][c];
    if (target.revealed) return;

    // Joker preview : révèle 3s puis remet
    if (jokerActive) {
      setGrid((g) =>
        g.map((row, i) =>
          row.map((cell, j) =>
            i === r && j === c
              ? { ...cell, revealed: true, preview: true }
              : cell
          )
        )
      );
      setTimeout(() => {
        setGrid((g) =>
          g.map((row, i) =>
            row.map((cell, j) =>
              i === r && j === c
                ? { ...cell, revealed: false, preview: false }
                : cell
            )
          )
        );
        setJokerActive(false);
        setJokerAvailable(false);
      }, JOKER_DURATION);
      return;
    }

    // Bombe 
    if (target.bomb) {
      const animatedValue = new Animated.Value(0.5);
      Animated.spring(animatedValue, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }).start(() =>
        Animated.spring(animatedValue, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start()
      );

      setGrid((g) =>
        g.map((row, i) =>
          row.map((cell, j) =>
            i === r && j === c
              ? { ...cell, revealed: true, animatedScale: animatedValue }
              : cell
          )
        )
      );

      setTimeout(() => {
        Alert.alert("💥 Boom", `Tu as perdu le niveau ${level} !`, [
          {
            text: "Réessayer",
            onPress: () => {
              setLevelScore(0);
              setGrid(makeGrid(level));
              setJokerAvailable(true);
            },
          },
        ]);
      }, 600);
      return;
    }

    // Case sûre
    setGrid((g) =>
      g.map((row, i) =>
        row.map((cell, j) => {
          if (i === r && j === c && !cell.revealed) {
            setLevelScore((s) => s + cell.value);
            return { ...cell, revealed: true };
          }
          return cell;
        })
      )
    );
  };

  // Passage de niveau si toutes les cases sûres sont révélées
  // Passage de niveau si toutes les cases sûres sont révélées
  useEffect(() => {
    const allSafeRevealed = grid.every((row) =>
      row.every((c) => c.bomb || c.revealed)
    );
    if (!allSafeRevealed) return;

    const multiplier = 1 + level * 0.1;
    const earned = Math.floor(levelScore * multiplier);

    Alert.alert(
      "🎉 Bravo",
      `Tu gagnes ${earned} points (+${((multiplier - 1) * 100).toFixed(
        0
      )}% bonus) ! Niveau suivant : ${level + 1}`,
      [
        {
          text: "Continuer",
          onPress: () => {
            const next = level + 1;
            setScore((s) => s + earned);
            setLevelScore(0);
            setLevel(next);
            setGrid(makeGrid(next));
            setJokerAvailable(true);
          },
        },
      ]
    );
  }, [grid]); 

  // Quitter / sauvegarder best
  const quitGame = async () => {
    dispatch(updateProgress({ level, score }));

    if (profile.token) {
      try {
        const res = await fetch(
          `${API_URL}/users/best`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: profile.token,
              bestScore: score,
              bestLevel: level,
            }),
          }
        );
        const data = await res.json();
        if (data.result) {
          dispatch(
            updateBest({ bestScore: data.bestScore, bestLevel: data.bestLevel })
          );
        }
      } catch (err) {
        console.error("❌ Erreur /users/best:", err);
      }
    }
    navigation.navigate("Home");
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={palette.accent} />
      </SafeAreaView>
    );
  }

  const levelColor = levelColors[(level - 1) % levelColors.length];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Backdrop derrière tout */}
      {stableBackground}

      <MusicButton position="top-right" />

      {/* Contenu au-dessus */}
      <View style={styles.content}>
        <Text style={[styles.level, { color: levelColor }]}>
          NIVEAU {level}
        </Text>
        <Text style={styles.score}>SCORE : {score}</Text>

        <View style={styles.row}>
          {columnHints.map((hint, c) => (
            <View key={`col-${c}`} style={styles.hintBox}>
              <Text style={styles.hintPoints}>{hint.points}</Text>
              <View style={styles.hintBombs}>
                <Image source={blixelIcon} style={styles.bombIcon} />
                <Text style={styles.hintBombText}>{hint.bombs}</Text>
              </View>
            </View>
          ))}

          {/* Joker */}
          <TouchableOpacity
            style={[
              styles.hintBox,
              jokerAvailable ? styles.jokerBox : styles.jokerUsed,
              jokerActive && styles.jokerPressed,
            ]}
            onPress={() => jokerAvailable && setJokerActive((p) => !p)}
            activeOpacity={0.85}
          >
            <Image
              source={pieldIcon}
              style={[
                styles.pieldIcon,
                !jokerAvailable && { tintColor: "#555", opacity: 0.4 },
                jokerActive && { tintColor: "#93c5fd" },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Grille */}
        {grid.map((row, r) => (
          <View key={`row-${r}`} style={styles.row}>
            {row.map((cell, c) => (
              <TouchableOpacity
                key={`cell-${r}-${c}`}
                style={[
                  styles.cell,
                  cell.revealed && (cell.bomb ? styles.bomb : styles.safe),
                ]}
                onPress={() => reveal(r, c)}
                activeOpacity={0.85}
              >
                {/* Damier visible UNIQUEMENT si non révélé */}
                {!cell.revealed && (
                  <View style={styles.innerPattern} pointerEvents="none">
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={styles.patternDark} />
                      <View style={styles.patternLight} />
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View style={styles.patternLight} />
                      <View style={styles.patternDark} />
                    </View>
                  </View>
                )}

                {/* Bombe révélée */}
                {cell.revealed && cell.bomb && (
                  <Animated.Image
                    source={blixelIcon}
                    style={[
                      styles.revealedBomb,
                      { transform: [{ scale: cell.animatedScale || 1 }] },
                    ]}
                    resizeMode="contain"
                  />
                )}

                {/* Valeur révélée */}
                {cell.revealed && !cell.bomb && (
                  <Text style={styles.cellText}>+{cell.value}</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Indices lignes */}
            <View style={styles.hintBox}>
              <Text style={styles.hintPoints}>{rowHints[r].points}</Text>
              <View style={styles.hintBombs}>
                <Image source={blixelIcon} style={styles.bombIcon} />
                <Text style={styles.hintBombText}>{rowHints[r].bombs}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.quitButton} onPress={quitGame}>
          <Text style={styles.quitText}>QUITTER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.bg1,
  },
  container: {
    flex: 1,
    backgroundColor: palette.bg1,
    position: "relative",
  },

  // Backdrop derrière tout
  backdropWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },

  // Tout le contenu au-dessus du backdrop
  content: {
    flex: 1,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.1, 
    paddingBottom: SCREEN_HEIGHT * 0.06,
  },

  level: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: responsive.levelSize,
    marginBottom: responsive.levelMarginBottom,
    textShadowColor: palette.glow,
    textShadowRadius: 8,
    color: palette.text,
  },
  score: {
    color: palette.text,
    fontSize: responsive.scoreSize,
    marginBottom: responsive.scoreMarginBottom,
    fontFamily: "PressStart2P_400Regular",
  },

  row: { flexDirection: "row", alignItems: "center" },

  cell: {
    width: CELL,
    height: CELL,
    margin: GAP,
    borderRadius: CELL * 0.13,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: palette.neonPink,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  // Damier
  innerPattern: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CELL * 0.1,
    overflow: "hidden",
  },
  patternDark: { flex: 1, backgroundColor: PATTERN_DARK },
  patternLight: { flex: 1, backgroundColor: PATTERN_LIGHT },

  // États révélés
  safe: { backgroundColor: "#34d399", borderColor: "#10b981" },
  bomb: { backgroundColor: "#ef4444", borderColor: "#f87171" },

  cellText: {
    color: "#fff",
    fontSize: responsive.cellTextSize,
    fontFamily: "PressStart2P_400Regular",
  },

  // Indices colonnes/lignes
  hintBox: {
    width: CELL,
    height: CELL,
    margin: GAP,
    borderWidth: 2,
    borderRadius: CELL * 0.13,
    justifyContent: "center",
    alignItems: "center",
    borderColor: palette.neonViolet,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  hintPoints: {
    color: "#fff",
    fontSize: responsive.hintTextSize,
    fontFamily: "PressStart2P_400Regular",
  },
  bombIcon: {
    width: responsive.bombIconSize,
    height: responsive.bombIconSize,
    marginRight: GAP * 0.5,
  },
  hintBombs: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: GAP * 0.3,
  },
  hintBombText: {
    color: palette.neonPink,
    fontSize: responsive.hintBombTextSize,
    fontFamily: "PressStart2P_400Regular",
  },

  // Joker
  pieldIcon: {
    width: responsive.pieldIconSize,
    height: responsive.pieldIconSize,
  },
  jokerBox: {
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  jokerPressed: { transform: [{ scale: 0.95 }] },
  jokerUsed: { opacity: 0.4 },

  // Bombe révélée
  revealedBomb: {
    width: responsive.revealedBombSize,
    height: responsive.revealedBombSize,
  },

  // Quitter
  quitButton: {
    marginTop: responsive.quitMarginTop,
    paddingVertical: responsive.quitPaddingVertical,
    paddingHorizontal: responsive.quitPaddingHorizontal,
    borderRadius: CELL * 0.13,
    borderWidth: 2,
    borderColor: palette.neonViolet,
    backgroundColor: palette.accent,
  },
  quitText: {
    color: "#fff",
    fontSize: responsive.quitButtonTextSize,
    fontFamily: "PressStart2P_400Regular",
  },
});
