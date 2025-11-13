// utils/assetsLoader.ts
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";

// Avec require() dans RN, le type est `number`
const imageModules: number[] = [
  require("../assets/loreButton.png"),
  // ajoute ici toutes les images importantes
];

const audioModules: number[] = [
  // ex: require("../assets/music/Night.mp3"),
];

export async function loadAppAssets(): Promise<void> {
  // ⚠️ Ne pas gérer le SplashScreen ici (tu le fais déjà dans App.tsx)
  const fontTask = Font.loadAsync({ PressStart2P_400Regular });

  // Précharge les fichiers dans le cache d'Expo
  const imageTask = Asset.loadAsync(imageModules);
  const audioTask = Asset.loadAsync(audioModules);

  await Promise.all([fontTask, imageTask, audioTask]);
  // ❌ Supprimé: Asset.setDownloadResumableEnabled(true)
}
