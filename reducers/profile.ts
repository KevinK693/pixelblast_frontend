import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  nickname: null,
  color: "#ffffff",
  token: null,
  level: 1,
  score: 0,
  bestScore: 0,
  bestLevel: 0,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    // 🌈 Créer ou modifier un profil
    setProfile(state, action) {
      state.nickname = action.payload.nickname ?? state.nickname;
      state.color = action.payload.color ?? state.color;
      state.token = action.payload.token ?? state.token;
    },

    // 🔑 Ajouter le token après connexion
    updateToken(state, action) {
      state.token = action.payload;
    },

    // 🔢 Mettre à jour score / niveau en jeu
    updateProgress(state, action) {
      state.level = action.payload.level;
      state.score = action.payload.score;
    },

    // 🏆 Mettre à jour les meilleurs scores
    updateBest(state, action) {
      state.bestScore = action.payload.bestScore;
      state.bestLevel = action.payload.bestLevel;
    },

    // 🚪 Déconnexion / reset complet
    clearProfile() {
      return initialState;
    },
    resetProgress(state) {
      state.level = 1;
      state.score = 0;
    }
    
  },
});

export const {
  setProfile,
  updateToken,
  updateProgress,
  updateBest,
  clearProfile,
  resetProgress,
} = profileSlice.actions;


export default profileSlice.reducer;
