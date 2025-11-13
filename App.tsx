import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { RootStackParamList } from "./types/navigation";

import { store, persistor } from "./reducers/store";

// Screens
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import ConnexionScreen from "./screens/ConnexionScreen";
import InscriptionScreen from "./screens/InscriptionScreen";
import CreateProfileScreen from "./screens/CreateProfileScreen";
import LoreScreen from "./screens/LoreScreen";
import LeaderBoardScreen from "./screens/LeaderBoardScreen";

// Music
import MusicProvider from "./contexts/MusicContext";

// Asset loader
import { loadAppAssets } from "./utils/assetsLoader";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      try {
        await loadAppAssets();
      } catch (err) {
        console.warn("Erreur chargement assets :", err);
      }
      setReady(true);
      await SplashScreen.hideAsync();
    })();
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050012",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#7a3cff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MusicProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
              initialRouteName="Connexion"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Connexion" component={ConnexionScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="Inscription" component={InscriptionScreen} />
              <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
              <Stack.Screen name="Lore" component={LoreScreen} />
              <Stack.Screen name="LeaderBoard" component={LeaderBoardScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </MusicProvider>
      </PersistGate>
    </Provider>
  );
}
