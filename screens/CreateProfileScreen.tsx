import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  useFonts,
  PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import { useDispatch, useSelector } from "react-redux";
import { setProfile, resetProgress } from "../reducers/profile";
import StarryBackdrop from "../components/StarryBackdrop";
import useScreenReady from "../hooks/useScreenReady";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootState } from "../reducers/store"; 

import type { RootStackParamList } from "../types/navigation";
import { API_URL } from "../config";

const { width: W, height: H } = Dimensions.get("window");

const SW = (p: number) => W * p; // % de la largeur
const SH = (p: number) => H * p; // % de la hauteur

type Props = NativeStackScreenProps<RootStackParamList, "CreateProfile">;

const palette = {
  bg1: "#050012",
  accent: "#7a3cff",
  neonPink: "#ff5cf7",
  neonViolet: "#b388ff",
  text: "#ffffff",
  inputBg: "rgba(255,255,255,0.1)",
  glow: "#b15eff",
};

const COLORS: string[] = [
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
];

export default function CreateProfileScreen({ route, navigation }: Props) {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);

  const { token, mode } = route.params ?? { token: undefined, mode: "create" };

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const ready = useScreenReady(250);

  const isEditing = mode === "edit";
  const sameUser = !!(profile.token && token && profile.token === token);

  const [nickname, setNickname] = useState(profile.nickname || "");
  const [sliderValue, setSliderValue] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    profile.color || COLORS[0]
  );
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!sameUser) {
      setNickname("");
      setSelectedColor(COLORS[0]);
    }
  }, [sameUser]);

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7a3cff" />
      </View>
    );
  }

  const hexToRgb = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255,
    };
  };

  const getColorFromValue = (v: number): string => {
    const n = COLORS.length - 1;
    if (v >= 1) return COLORS[n];
    if (v <= 0) return COLORS[0];

    const i = Math.floor(v * n);
    const t = v * n - i;

    const c1 = hexToRgb(COLORS[i]);
    const c2 = hexToRgb(COLORS[i + 1]);

    return `rgb(
      ${Math.round(c1.r + t * (c2.r - c1.r))},
      ${Math.round(c1.g + t * (c2.g - c1.g))},
      ${Math.round(c1.b + t * (c2.b - c1.b))}
    )`;
  };

  const handleSave = async () => {
    if (!nickname.trim()) return alert("Entre un pseudo !");

    setLoading(true);
    const tokenToUse = token || profile.token;

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenToUse,
          nickname,
          color: selectedColor,
        }),
      });

      const data = await response.json();

      if (!data.result) return alert(data.error ?? "Erreur serveur");

      dispatch(
        setProfile({
          token: tokenToUse,
          nickname,
          color: selectedColor,
        })
      );

      // Reset score/level seulement si c'est un nouveau profil
      if (!isEditing) {
        dispatch(resetProgress());
      }

      navigation.navigate("Home");
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StarryBackdrop
        stars={100}
        shooting={3}
        speed={0.9}
        tint={["#050012", "#050012", "#050012"]}
        planetTint={["rgba(36,16,68,0.9)", "rgba(240,46,46,0.7)"]}
        showPlanet={false}
        accentBeams={true}
      />

      <Text style={styles.title}>
        {isEditing ? "MODIFIER LE PROFIL" : "CRÉER UN PROFIL"}
      </Text>

      <Text style={[styles.nicknamePreview, { color: selectedColor }]}>
        {nickname || "VOTRE PSEUDO"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Pseudo"
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={nickname}
        onChangeText={setNickname}
      />

      <View style={styles.gradientBar}>
        <LinearGradient
          colors={COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={sliderValue}
          onValueChange={(v) => {
            setSliderValue(v);
            setSelectedColor(getColorFromValue(v));
          }}
        />
      </View>

      {isEditing && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>ANNULER</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isEditing ? "ENREGISTRER" : "CRÉER"}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.bg1,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.bg1,
  },

  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.038), 
    color: palette.text,
    marginBottom: SH(0.03),
    textAlign: "center",
  },

  nicknamePreview: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.048), 
    marginBottom: SH(0.035),
  },

  input: {
    width: "80%",
    textAlign: "center",
    backgroundColor: palette.inputBg,
    borderColor: palette.neonPink,
    borderWidth: 2,
    borderRadius: SW(0.028),
    paddingVertical: SH(0.016),
    marginBottom: SH(0.04),
    fontFamily: "PressStart2P_400Regular",
    color: palette.text,
    fontSize: SW(0.036),
  },

  gradientBar: {
    width: "80%",
    height: SH(0.035), 
    marginBottom: SH(0.04),
    borderRadius: SW(0.035),
    overflow: "hidden",
  },

  slider: {
    width: "100%",
    height: SH(0.04),
  },

  cancelText: {
    color: "#aaa",
    fontFamily: "PressStart2P_400Regular",
    marginBottom: SH(0.025),
    textDecorationLine: "underline",
    fontSize: SW(0.028), 
  },

  button: {
    backgroundColor: palette.accent,
    paddingVertical: SH(0.02),
    paddingHorizontal: SW(0.14), 
    borderRadius: SW(0.028),
    borderWidth: 2,
    borderColor: palette.neonPink,
    marginTop: SH(0.015),
  },

  buttonText: {
    fontFamily: "PressStart2P_400Regular",
    color: "#fff",
    fontSize: SW(0.034),
    textAlign: "center",
  },
});
