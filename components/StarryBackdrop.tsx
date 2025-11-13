import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: W, height: H } = Dimensions.get("window");

// Galaxy tint (comme Home)
const DEFAULT_TINT = [
  "rgb(5, 0, 18)", 
  "rgb(5, 0, 18)"
] as const;


// Planète
const DEFAULT_PLANET_TINT = [
  "rgba(25, 20, 40, 1)",
  "rgba(15, 10, 25, 1)",
] as const;

// Accents lumineux
const ACCENT_BEAM_1 = ["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"] as const;
const ACCENT_BEAM_2 = ["rgba(255,255,255,0.06)", "rgba(255,255,255,0)"] as const;

const SHOOTING_COLORS = ["#a7b1ff", "rgba(167,177,255,0)"] as const;

const toColors = (arr: readonly (string | number)[]): ColorValue[] =>
  [...arr] as ColorValue[];

type Props = {
  seed?: number;
  stars?: number;
  shooting?: number;
  tint?: readonly (string | number)[];
  planetTint?: readonly (string | number)[];
  accentBeams?: boolean;
  speed?: number;
  showPlanet?: boolean;
};

export default function StarryBackdrop({
  seed = 9,
  stars = 95,
  shooting = 3,
  tint = DEFAULT_TINT,
  planetTint = DEFAULT_PLANET_TINT,
  accentBeams = true,
  speed = 1,
  showPlanet = true,
}: Props) {
  // RNG
  const R = useMemo(() => {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }, [seed]);

  // Étoiles fixes améliorées
  const starsData = useMemo(
    () =>
      Array.from({ length: stars }).map((_, i) => ({
        id: i,
        x: R() * W,
        y: R() * H,
        size: 2 + R() * 0.1, // ✨ un peu plus grosses
        baseOpacity: 0.3 + R() * 0.6,
        twinkle: new Animated.Value(R()),
        scale: new Animated.Value(1),
        color:
          R() > 0.5
            ? "rgba(225, 55, 162, 0.9)" // Rose
            : "rgba(33, 122, 255, 0.9)", // Bleu
      })),
    [seed, stars]
  );

  // Twinkle + pulsation
  useEffect(() => {
    const anims: Animated.CompositeAnimation[] = [];

    starsData.forEach((s) => {
      const duration = 800 + R() * 900;

      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(s.twinkle, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(s.scale, {
              toValue: 1.45,
              duration,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(s.twinkle, {
              toValue: 0,
              duration,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(s.scale, {
              toValue: 1,
              duration,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      anims.push(loop);
    });

    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [starsData]);

  // Étoiles filantes
  const shootingVals = useMemo(
    () =>
      Array.from({ length: shooting }).map(() => ({
        tx: new Animated.Value(0),
        ty: new Animated.Value(0),
      })),
    [shooting]
  );

  useEffect(() => {
    const runners = shootingVals.map(({ tx, ty }) => {
      let stop = false;
      const run = () => {
        if (stop) return;
        const startX = W + 100;
        const startY = R() * H * 0.7;
        const endX = -200;
        const endY = startY + 200;

        tx.setValue(startX);
        ty.setValue(startY);

        Animated.parallel([
          Animated.timing(tx, {
            toValue: endX,
            duration: 1300 / speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(ty, {
            toValue: endY,
            duration: 1300 / speed,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() =>
          setTimeout(run, 600 + Math.random() * 1600)
        );
      };
      run();
      return () => {
        stop = true;
        tx.stopAnimation();
        ty.stopAnimation();
      };
    });

    return () => runners.forEach((r) => r());
  }, [shootingVals, speed]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={toColors(tint)}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Lumière futuriste (comme Home) */}
      {accentBeams && (
        <>
          <LinearGradient
            colors={toColors(ACCENT_BEAM_1)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.beam, { transform: [{ rotateZ: "-20deg" }] }]}
          />
          <LinearGradient
            colors={toColors(ACCENT_BEAM_2)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.beam,
              { top: H * 0.2, transform: [{ rotateZ: "-30deg" }] },
            ]}
          />
        </>
      )}

      {/* SCINTILLEMENT + PULSATION */}
      {starsData.map((s) => (
        <Animated.View
          key={s.id}
          style={[
            styles.star,
            {
              backgroundColor: s.color,
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              opacity: Animated.add(
                new Animated.Value(s.baseOpacity * 0.6),
                Animated.multiply(s.twinkle, 0.7)
              ),
              transform: [{ scale: s.scale }],
            },
          ]}
        />
      ))}

      {/* Shooting stars */}
      {shootingVals.map(({ tx, ty }, i) => (
        <Animated.View
          key={i}
          style={[
            styles.shooting,
            { transform: [{ translateX: tx }, { translateY: ty }, { rotateZ: "-18deg" }] },
          ]}
        >
          <LinearGradient
            colors={toColors(SHOOTING_COLORS)}
            style={styles.shootingLine}
          />
        </Animated.View>
      ))}

      {/* Planète */}
      {showPlanet && (
        <View style={styles.planetWrap}>
          <LinearGradient
            colors={toColors(planetTint)}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.planet}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  beam: {
    position: "absolute",
    width: W * 1.4,
    height: H * 0.5,
    left: -W * 0.25,
    top: -H * 0.1,
  },
  star: {
    position: "absolute",
    borderRadius: 50,
  },
  shooting: {
    position: "absolute",
    width: 120,
    height: 3,
  },
  shootingLine: {
    position: "absolute",
    left: 10,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  planetWrap: {
    position: "absolute",
    bottom: -H * 0.56,
    left: -W * 0.4,
    width: W * 1.8,
    height: W * 1.8,
    overflow: "hidden",
    borderTopLeftRadius: W * 0.9,
    borderTopRightRadius: W * 0.9,
  },
  planet: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    height: W * 1.5,
    borderTopLeftRadius: W * 0.9,
    borderTopRightRadius: W * 0.9,
  },
});
