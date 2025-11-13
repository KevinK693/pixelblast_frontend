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
  CreateProfile: { token: string; mode: "create" | "edit" };
};
type Props = NativeStackScreenProps<RootStackParamList, "Inscription">;

const palette = {
  bg1: "#050012",
  accent: "#7a3cff",
  neonPink: "#ff5cf7",
  neonViolet: "#b388ff",
  text: "#ffffff",
  inputBg: "rgba(255,255,255,0.1)",
  glow: "#b15eff",
};

export default function InscriptionScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
    const insets = useSafeAreaInsets();

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;

  // Tous les hooks doivent être en haut
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const ready = useScreenReady(250);

  // Loader tant que pas prêt
  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7a3cff" />
      </View>
    );
  }

  const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const handleSignup = () => {
    if (!EMAIL_REGEX.test(email)) {
      setInvalidEmail(true);
      return;
    }
    setInvalidEmail(false);
    setLoading(true);

    fetch(`${API_URL}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          navigation.navigate("CreateProfile", {
            token: data.token,
            mode: "create",
          });
          setEmail("");
          setPassword("");
        } else {
          setEmailAlreadyExists(true);
        }
      })
      .catch((err) => console.error("❌ Erreur signup:", err))
      .finally(() => setLoading(false));
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
        accentBeams={false}
        showPlanet={false}
      />
      <MusicButton position="top-right" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Image
          source={require("../assets/loreButton.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>INSCRIPTION</Text>

        {invalidEmail && (
          <Text style={styles.errorText}>Adresse e-mail invalide</Text>
        )}
        {emailAlreadyExists && (
          <Text style={styles.errorText}>
            Un compte existe déjà avec cet e-mail
          </Text>
        )}

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

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'INSCRIRE</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Connexion")}>
          <Text style={styles.link}>
            Déjà un compte ? <Text style={styles.linkBold}>Connectez-vous</Text>
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

