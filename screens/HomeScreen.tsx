import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  AppState,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
  useFonts,
  PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import MusicButton from "../components/MusicButton";
import StarryBackdrop from "../components/StarryBackdrop";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootState } from "../reducers/store";
import { API_URL } from "../config";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SW = (pct: number) => SCREEN_WIDTH * pct;   // width %
const SH = (pct: number) => SCREEN_HEIGHT * pct;  // height %



type RootStackParamList = {
  Home: undefined;
  LeaderBoard: undefined;
  Game: undefined;
  Lore: undefined;
  CreateProfile: { token: string; mode: "create" | "edit" };
};
type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const palette = {
  bg1: "#050012",
  accent: "#7a3cff",
  neonPink: "#ff5cf7",
  neonViolet: "#b388ff",
  scoreGrey: "#eaeaea",
  text: "#ffffff",
  glow: "#b15eff",
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

type FriendRequest = {
  _id: string;
  nickname: string;
  color?: string;
};
export default function HomeScreen({ navigation }: Props) {
  const profile = useSelector((state: RootState) => state.profile) || {};
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [pulse] = useState(new Animated.Value(1));
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [addFriendModal, setAddFriendModal] = useState<boolean>(false);
  const [friendNickname, setFriendNickname] = useState<string>("");

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendRequestsModal, setFriendRequestsModal] =
    useState<boolean>(false);

  // API calls
  const fetchFriendRequests = async () => {
    try {
      const res = await fetch(
        `${API_URL}/users/friends/requests/${profile.token}`
      );
      const data = await res.json();
      if (data.result) setFriendRequests(data.requests);
    } catch (err) {
      console.error("Erreur récupération demandes:", err);
    }
  };

  const acceptFriend = async (friendId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/users/friends/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userToken: profile.token, friendId }),
        }
      );
      const data = await res.json();
      if (data.result) {
        Alert.alert("✅ Ami ajouté !");
        setFriendRequests((prev) => prev.filter((r) => r._id !== friendId));
        fetchFriendRequests();
      } else {
        Alert.alert("❌ Erreur", "Impossible d'accepter la demande");
      }
    } catch (err) {
      console.error("Erreur acceptation ami:", err);
    }
  };

  const sendFriendRequest = async () => {
    if (!friendNickname.trim())
      return Alert.alert("Erreur", "Entre un pseudo !");
    try {
      const response = await fetch(
        `${API_URL}/users/friends/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderToken: profile.token,
            receiverNickname: friendNickname.trim(),
          }),
        }
      );
      const data = await response.json();
      if (data.result) {
        Alert.alert("✅ Succès", "Demande d'ami envoyée !");
        setFriendNickname("");
        setAddFriendModal(false);
      } else {
        Alert.alert(
          "❌ Erreur",
          data.error || "Impossible d’envoyer la demande"
        );
      }
    } catch (error) {
      console.error("Erreur demande d’ami:", error);
      Alert.alert("Erreur", "Problème de connexion au serveur.");
    }
  };

  //  Effects
  useEffect(() => {
    if (!profile.token || !isFocused) return;
    setLoading(true);
    fetch(`${API_URL}/users/${profile.token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          const userLevel = data.user.bestLevel || 1;
          const currentScore = data.user.score || 0;
          const bestScore = data.user.bestScore || 0;
          const displayScore = currentScore > 0 ? currentScore : bestScore;
          setLevel(userLevel);
          setScore(displayScore);
        }
      })
      .catch((err) => console.error("❌ Erreur fetch user:", err))
      .finally(() => setLoading(false));
  }, [profile.token, isFocused]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Badge auto-refresh
  useEffect(() => {
    if (!profile.token) return;
    if (isFocused) fetchFriendRequests();
  }, [isFocused, profile.token]);

  useEffect(() => {
    if (!profile.token) return;
    fetchFriendRequests();
    const id = setInterval(fetchFriendRequests, 15000);
    return () => clearInterval(id);
  }, [profile.token]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && profile.token) fetchFriendRequests();
    });
    return () => sub.remove();
  }, [profile.token]);

  // --- Render
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={palette.accent} />
      </SafeAreaView>
    );
  }

  const levelColor = levelColors[(level - 1) % levelColors.length];
  const pseudoColor = profile.color || palette.neonViolet;

  return (
    <SafeAreaView style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
    
      <StarryBackdrop
        stars={100}
        shooting={3}
        speed={0.9}
        tint={["#050012", "#050012", "#050012"]}
        planetTint={["rgba(36,16,68,0.9)", "rgba(240,46,46,0.7)"]}
        accentBeams={true}
      />

<MusicButton position="top-right" />



      {/* Bouton menu + badge */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.loreButton}
        onPress={() => setMenuVisible(true)}
      >
        <Image
          source={require("../assets/loreButton.png")}
          style={styles.loreIcon}
          resizeMode="contain"
        />
        {friendRequests.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {friendRequests.length > 9 ? "9+" : friendRequests.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Lore");
              }}
            >
              <Text style={styles.menuText}>📜 Lore</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setAddFriendModal(true);
              }}
            >
              <Text style={styles.menuText}>👥 Ajouter un ami</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setFriendRequestsModal(true);
              }}
            >
              <Text style={styles.menuText}>📩 Demandes reçues</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.title}>PIXEL BLAST</Text>
        <Text style={[styles.subtitle, { color: palette.neonViolet }]}>
          A Dark Battle Game
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("CreateProfile", {
              token: profile.token || "",
              mode: "edit",
            })
          }
          style={[
            styles.profileCard,
            { borderColor: pseudoColor, shadowColor: pseudoColor },
          ]}
        >
          <Text style={[styles.nickname, { color: pseudoColor }]}>
            {profile.nickname || "JOUEUR"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.statsBox, { borderColor: palette.neonPink }]}>
          {loading ? (
            <ActivityIndicator size="small" color={palette.neonViolet} />
          ) : (
            <>
              <Text style={[styles.statsLabel, { color: levelColor }]}>
                NIVEAU : {level}
              </Text>
              <Text style={[styles.statsValue, { color: palette.scoreGrey }]}>
                SCORE : {score}
              </Text>
            </>
          )}
        </View>

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.startButton, { borderColor: palette.neonPink }]}
            onPress={() => navigation.navigate("Game")}
          >
            <Text style={styles.startText}>▶ START</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.secondaryButton, { borderColor: palette.neonPink }]}
          onPress={() => navigation.navigate("LeaderBoard")}
        >
          <Text style={[styles.secondaryText, { color: palette.neonPink }]}>
            🏆 CLASSEMENT
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© 2025 Pixel Blast Studio</Text>
      </View>

      {/* Modal ajout ami */}
      <Modal
        visible={addFriendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>👤 Ajouter un ami</Text>
            <TextInput
              placeholder="Pseudo de ton ami"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={friendNickname}
              onChangeText={setFriendNickname}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={sendFriendRequest}
                style={[styles.modalBtn, { borderColor: palette.neonPink }]}
              >
                <Text style={styles.modalBtnText}>ENVOYER</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAddFriendModal(false)}
                style={[styles.modalBtn, { borderColor: "#555" }]}
              >
                <Text style={styles.modalBtnText}>ANNULER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal demandes reçues */}
      <Modal
        visible={friendRequestsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFriendRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📩 Demandes reçues</Text>

            {friendRequests.length === 0 ? (
              <Text
                style={{
                  color: "#ccc",
                  fontFamily: "PressStart2P_400Regular",
                  fontSize: 8,
                  marginVertical: 20,
                }}
              >
                Aucune demande reçue
              </Text>
            ) : (
              friendRequests.map((req) => (
                <View
                  key={req._id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: req.color || palette.neonViolet,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 10,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Text
                    style={{
                      color: req.color || palette.neonViolet,
                      fontFamily: "PressStart2P_400Regular",
                      fontSize: 8,
                      flex: 1,
                    }}
                  >
                    {req.nickname}
                  </Text>

                  <TouchableOpacity
                    onPress={() => acceptFriend(req._id)}
                    style={{
                      borderWidth: 1.5,
                      borderColor: palette.neonPink,
                      borderRadius: 6,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: "rgba(255,92,247,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        color: palette.neonPink,
                        fontFamily: "PressStart2P_400Regular",
                        fontSize: 8,
                      }}
                    >
                      ✅ Accepter
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Bouton RETOUR */}
            <TouchableOpacity
              onPress={() => setFriendRequestsModal(false)}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>RETOUR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loreButton: {
    position: "absolute",
    top: SH(0.075),         
    left: SW(0.05),         
    zIndex: 20,
    borderWidth: 3,
    borderColor: palette.neonViolet,
    borderRadius: SW(0.12),  
    backgroundColor: "rgba(255, 92, 247, 0.1)",
    shadowColor: palette.neonPink,
    shadowRadius: SW(0.05),  
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
  },
  loreIcon: { width: SW(0.13), height: SW(0.13), borderRadius: SW(0.18) }, 
  badge: {
    position: "absolute",
    top: -SW(0.02),         
    right: -SW(0.02),        
    backgroundColor: "red",
    borderRadius: SW(0.028), 
    width: SW(0.06),         
    height: SW(0.06),     
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "white",
    fontSize: SW(0.028),    
    fontFamily: "PressStart2P_400Regular",
  },

  menuOverlay: { flex: 1, backgroundColor: "transparent" },
  menuContainer: {
    position: "absolute",
    top: SH(0.13),      
    left: SW(0.05),   
    backgroundColor: "rgba(20,5,40,0.95)",
    borderColor: palette.neonViolet,
    borderWidth: 2,
    borderRadius: SW(0.03), 
    padding: SW(0.03),      
    width: SW(0.6),         
  },
  menuItem: {
    paddingVertical: SH(0.008), 
  },
  menuText: {
    fontFamily: "PressStart2P_400Regular",
    color: palette.text,
    fontSize: SW(0.028),    
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.050),   
    color: palette.text,
    textShadowColor: palette.glow,
    textShadowRadius: SH(0.012), 
    letterSpacing: SW(0.008),    
    marginBottom: SH(0.012),     
  },

  subtitle: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.030),     
    marginBottom: SH(0.045), 
  },
  
  profileCard: {
    borderWidth: 2,
    paddingVertical: SH(0.018), 
    paddingHorizontal: SW(0.11),
    borderRadius: SW(0.03),     
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: SH(0.045),    
  },

 nickname: { 
  fontFamily: "PressStart2P_400Regular", 
  fontSize: SW(0.036),       
},
statsBox: {
  borderWidth: 2,
  borderRadius: SW(0.03),   
  backgroundColor: "rgba(255,255,255,0.08)",
  paddingVertical: SH(0.030),
  paddingHorizontal: SW(0.10), 
  alignItems: "center",
  marginBottom: SH(0.065),   
},
statsLabel: {
  fontFamily: "PressStart2P_400Regular",
  fontSize: SW(0.040),       
  marginBottom: SH(0.010),   
},

statsValue: { 
  fontFamily: "PressStart2P_400Regular", 
  fontSize: SW(0.040),       
},
startButton: {
  backgroundColor: palette.accent,
  borderRadius: SW(0.03),    
  paddingVertical: SH(0.014),
  paddingHorizontal: SW(0.18), 
  borderWidth: 3,
},
startText: {
  fontFamily: "PressStart2P_400Regular",
  color: "#fff",
  fontSize: SW(0.036),       
  textShadowColor: "#ff00c8",
  textShadowRadius: SH(0.008), 
},
secondaryButton: {
  marginTop: SH(0.035),      
  paddingVertical: SH(0.012),
  paddingHorizontal: SW(0.07), 
  borderWidth: 2,
  borderRadius: SW(0.022),  
},
secondaryText: {
  fontFamily: "PressStart2P_400Regular",
  fontSize: SW(0.025),      
},
footer: {
  position: "absolute",
  top: SH(0.79),       
  fontFamily: "PressStart2P_400Regular",
  fontSize: SW(0.022),       
  color: "#777",
},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1a0b2e",
    borderWidth: 2,
    borderColor: palette.neonViolet,
    borderRadius: SW(0.026),   
    width: "85%",
    padding: SW(0.06),       
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "PressStart2P_400Regular",
    color: palette.neonPink,
    fontSize: SW(0.032),     
    marginBottom: SH(0.02),   
  },
  input: {
    borderWidth: 2,
    borderColor: palette.neonViolet,
    borderRadius: SW(0.022),   
    color: "#fff",
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.032),       
    paddingVertical: SH(0.012),
    paddingHorizontal: SW(0.026), 
    width: "100%",
    marginBottom: SH(0.02),    
    textAlign: "center",
  },
  
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: SW(0.022),   
    paddingVertical: SH(0.014),
    marginHorizontal: SW(0.012), 
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.03),        
  },
  // Bouton RETOUR
  closeBtn: {
    alignSelf: "center",
    marginTop: SH(0.016),     
    paddingVertical: SH(0.014),
    paddingHorizontal: SW(0.06), 
    borderWidth: 2,
    borderColor: palette.neonPink,
    borderRadius: SW(0.026),   
    backgroundColor: "rgba(255,92,247,0.08)",
  },
  closeBtnText: {
    color: "#fff",
    fontFamily: "PressStart2P_400Regular",
    fontSize: SW(0.03),       
    letterSpacing: SW(0.003),  
    textAlign: "center",
  },  
});
