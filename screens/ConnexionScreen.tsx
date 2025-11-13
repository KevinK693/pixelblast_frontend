import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { setProfile } from "../reducers/profile";
import {
  useFonts,
  PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import StarryBackdrop from "../components/StarryBackdrop";
import MusicButton from "../components/MusicButton";
import useScreenReady from "../hooks/useScreenReady";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { API_URL } from "../config";


const { width: W, height: H } = Dimensions.get("window");

const SW = (p: number) => W * p; // % de la largeur
const SH = (p: number) => H * p; // % de la hauteur

type RootStackParamList = {
  Connexion: undefined;
  Home: undefined;
  Inscription: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, "Connexion">;

// 🎨 Palette cohérente avec le HomeScreen
const palette = {
  bg1: "#050012",
  accent: "#7a3cff",
  neonPink: "#ff5cf7",
  neonViolet: "#b388ff",
  text: "#ffffff",
  inputBg: "rgba(255,255,255,0.1)",
  glow: "#b15eff",
};

export default function ConnexionScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [wrongInfo, setWrongInfo] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;

  // petit délai pour affichage fluide
  const ready = useScreenReady();

  // Loader avant affichage (fonts ou delay)
  if (!ready || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#050012",
        }}
      >
        <ActivityIndicator size="large" color="#7a3cff" />
      </View>
    );
  }

  // Connexion utilisateur
  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setWrongInfo(true);
      return;
    }

    setLoading(true);

    fetch(`${API_URL}/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 Réponse backend :", data);

        if (data.result) {
          dispatch(
            setProfile({
              token: data.token,
              nickname: data.nickname,
              color: data.color || "#b388ff",
              id: data.id,
            })
          );

          setEmail("");
          setPassword("");
          setWrongInfo(false);
          navigation.navigate("Home");
        } else {
          setWrongInfo(true);
        }
      })
      .catch((err) => {
        console.error("❌ Erreur login:", err);
      })
      .finally(() => setLoading(false));
  };

  // Écran principal
  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Fond spatial animé */}
      <StarryBackdrop
        stars={100}
        shooting={3}
        speed={0.9}
        planetTint={["rgba(36,16,68,0.9)", "rgba(240,46,46,0.7)"]}
        accentBeams={false}
        showPlanet={false}
      />
      <MusicButton position="top-right" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Logo */}
        <Image
          source={require("../assets/loreButton.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Titre */}
        <Text style={styles.title}>CONNEXION</Text>

        {wrongInfo && (
          <Text style={styles.errorText}>
            Identifiant ou mot de passe incorrect
          </Text>
        )}

        {/* Champ e-mail */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="john@gmail.com"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Champ mot de passe */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>MOT DE PASSE</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Mot de passe oublié */}
        <TouchableOpacity>
          <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Bouton Connexion */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>SE CONNECTER</Text>
          )}
        </TouchableOpacity>

        {/* Lien vers inscription */}
        <TouchableOpacity onPress={() => navigation.navigate("Inscription")}>
          <Text style={styles.link}>
            Pas de compte ? <Text style={styles.linkBold}>Inscrivez-vous</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050012",
  },

  container: {
    flex: 1,
    backgroundColor: palette.bg1,
  },

  keyboard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SW(0.06), 
  },

  logo: {
    width: W * 0.56,  
    height: W * 0.56,
    marginBottom: SH(0.012), 
    borderRadius: W * 0.14,
  },

  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.045), 
    color: palette.text,
    textShadowRadius: SH(0.012), 
    marginBottom: SH(0.03), 
    letterSpacing: SW(0.008),
  },

  inputContainer: {
    width: "100%",
    marginBottom: SH(0.018), 
  },
  forgot: {
    alignSelf: "flex-end",
    color: palette.neonViolet,
    fontSize: SW(0.026),
    marginTop: SH(0.006),
    marginBottom: SH(0.024),
    textDecorationLine: "underline",
    fontFamily: "PressStart2P_400Regular",
  },
  label: {
    color: palette.neonViolet,
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.028), 
    marginBottom: SH(0.008),
  },

  input: {
    backgroundColor: palette.inputBg,
    borderWidth: 1.5,
    borderColor: palette.neonPink,
    borderRadius: SW(0.026),
    paddingHorizontal: SW(0.036),
    paddingVertical: SH(0.014),
    fontSize: SW(0.034),
    color: palette.text,
    fontFamily: "PressStart2P_400Regular",
  },

  button: {
    backgroundColor: palette.accent,
    borderColor: palette.neonPink,
    shadowColor: palette.neonPink,
    width: "100%",
    borderWidth: 2,
    shadowOpacity: 0.8,
    shadowRadius: SW(0.04),
    borderRadius: SW(0.026),
    paddingVertical: SH(0.018),
    marginTop: SH(0.012),
    marginBottom: SH(0.04),
  },

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: SW(0.032),
    fontFamily: "PressStart2P_400Regular",
  },

  link: {
    color: palette.text,
    textAlign: "center",
    fontSize: SW(0.028),
    fontFamily: "PressStart2P_400Regular",
  },

  linkBold: {
    color: palette.neonPink,
  },

  errorText: {
    color: "#ff5c5c",
    fontSize: SW(0.026),
    marginBottom: SH(0.018),
    fontFamily: "PressStart2P_400Regular",
    textAlign: "center",
  },
});