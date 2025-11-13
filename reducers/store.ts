// reducers/store.ts ✅ CLEAN ✅

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Réducteur importé
import profileReducer from "./profile";

// ✅ Combinaison des reducers
const rootReducer = combineReducers({
  profile: profileReducer,
});

// ✅ Configuration de Redux Persist
const persistConfig = {
  key: "faceup",
  storage: AsyncStorage,
};

// ✅ Reducer persisté (automatique, propre)
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Store global
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ obligatoire sinon erreur Persist
    }),
});

// ✅ Persistor
export const persistor = persistStore(store);

// ✅ Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
