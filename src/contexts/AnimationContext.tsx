import { createContext, useContext, useMemo, ReactNode } from "react";
import { useSettings } from "./SettingsContext";

export interface AnimationSettings {
  enabled: boolean;
  blurPx: number;
  translateY: number;
  duration: number;
  repeat: boolean;
}

const defaults: AnimationSettings = {
  enabled: true,
  blurPx: 12,
  translateY: 30,
  duration: 0.7,
  repeat: false,
};

const AnimationContext = createContext<AnimationSettings>(defaults);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const data = useSettings();

  const value = useMemo<AnimationSettings>(() => ({
    enabled: data.animation_reveal_enabled !== "false",
    blurPx: parseFloat(data.animation_blur_px) || defaults.blurPx,
    translateY: parseFloat(data.animation_reveal_y) || defaults.translateY,
    duration: parseFloat(data.animation_reveal_duration) || defaults.duration,
    repeat: data.animation_repeat === "true",
  }), [data]);

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  return useContext(AnimationContext);
}
