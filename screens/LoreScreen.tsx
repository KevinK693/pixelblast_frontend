import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import useScreenReady from "../hooks/useScreenReady";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const responsive = {
  horizontalPadding: SCREEN_WIDTH * 0.07,
  verticalPadding: SCREEN_HEIGHT * 0.08,
  titleSize: SCREEN_WIDTH * 0.038,
  subtitleSize: SCREEN_WIDTH * 0.048,
  textSize: SCREEN_WIDTH * 0.032,
  lineHeight: SCREEN_HEIGHT * 0.03,
  buttonPaddingV: SCREEN_HEIGHT * 0.02,
  buttonPaddingH: SCREEN_WIDTH * 0.08,
  buttonMarginTop: SCREEN_HEIGHT * 0.07,
  buttonTextSize: SCREEN_WIDTH * 0.03,
};

type RootStackParamList = {
  Lore: undefined;
  Home: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, "Lore">;

export default function LoreScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const ready = useScreenReady(250);

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#7a3cff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/lore.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>LES ORIGINES</Text>
          <Text style={styles.subtitle}>PIELD & BLIXEL</Text>

          <Text style={styles.text}>
            Dans les confins du monde <Text style={styles.highlight}>Néonora</Text>, un royaume vibrant de lumière
            et d’énergie, vivaient deux frères nés d’une même étincelle :{" "}
            <Text style={styles.pield}>Pield</Text>, le bouclier de lumière, et{" "}
            <Text style={styles.blixel}>Blixel</Text>, la flamme créatrice.{"\n\n"}
            Ensemble, ils protégeaient l’équilibre entre le chaos et l’harmonie.
            {"\n\n"}
            Mais un jour, une ombre ancienne s’empara du cœur de Blixel. Corrompu
            par l’<Text style={styles.highlight}>Esprit du Néant</Text>, il devint instable,
            répandant le désordre à travers les circuits du monde qu’ils avaient juré de protéger.{"\n\n"}
            Refusant de blesser son frère, <Text style={styles.pield}>Pield</Text> fit le serment de le ramener à la raison.
            Armé de patience et de lumière, il parcourt désormais{" "}
            <Text style={styles.highlight}>Néonora</Text> pour contenir la fureur de{" "}
            <Text style={styles.blixel}>Blixel</Text> et protéger ceux qui croisent sa route.{"\n\n"}
            Leur affrontement ne cesse jamais vraiment. Car là où{" "}
            <Text style={styles.pield}>la lumière existe</Text>,{" "}
            <Text style={styles.blixel}>l’ombre</Text> guette toujours.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>RETOUR</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050012",
  },
  container: { flex: 1, backgroundColor: "#050012" },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.30)",
  },
  scroll: {
    paddingHorizontal: responsive.horizontalPadding,
    paddingVertical: responsive.verticalPadding,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: responsive.titleSize,
    color: "#5ee0ff",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.02,
    textShadowColor: "#00baff",
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: responsive.subtitleSize,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.04,
    textShadowColor: "#b15eff",
    textShadowRadius: 10,
  },
  text: {
    color: "#ffffff",
    fontSize: responsive.textSize,
    lineHeight: responsive.lineHeight,
    textAlign: "justify",
    fontFamily: "PressStart2P_400Regular",
  },
  highlight: { color: "#5ee0ff" },
  pield: { color: "#60a5fa" },
  blixel: { color: "#ff5c5c" },
  button: {
    alignSelf: "center",
    marginTop: responsive.buttonMarginTop,
    backgroundColor: "#7a3cff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#b388ff",
    paddingVertical: responsive.buttonPaddingV,
    paddingHorizontal: responsive.buttonPaddingH,
  },
  buttonText: {
    color: "#fff",
    fontSize: responsive.buttonTextSize,
    fontFamily: "PressStart2P_400Regular",
    textAlign: "center",
  },
});
