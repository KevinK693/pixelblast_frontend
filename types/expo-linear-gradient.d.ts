// ✅ Correction TS : autorise n'importe quel tableau de ColorValue dans <LinearGradient />

declare module "expo-linear-gradient" {
    import * as React from "react";
    import { ColorValue, StyleProp, ViewStyle } from "react-native";
  
    export interface LinearGradientProps {
      colors: ColorValue[]; // <-- la ligne magique ✅
      start?: { x: number; y: number };
      end?: { x: number; y: number };
      locations?: number[];
      style?: StyleProp<ViewStyle>;
    }
  
    export class LinearGradient extends React.Component<LinearGradientProps> {}
  }
  