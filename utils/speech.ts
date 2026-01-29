import * as Speech from "expo-speech";
import { Platform } from "react-native";

let isSpeaking = false;

export async function speak(text: string): Promise<void> {
  if (isSpeaking) {
    await Speech.stop();
  }

  isSpeaking = true;

  return new Promise((resolve) => {
    const options: Speech.SpeechOptions = {
      language: "en-US",
      pitch: 1.0,
      rate: Platform.OS === "ios" ? 0.5 : 0.8,
      onDone: () => {
        isSpeaking = false;
        resolve();
      },
      onError: () => {
        isSpeaking = false;
        resolve();
      },
      onStopped: () => {
        isSpeaking = false;
        resolve();
      },
    };

    Speech.speak(text, options);
  });
}

export async function stopSpeaking(): Promise<void> {
  if (isSpeaking) {
    await Speech.stop();
    isSpeaking = false;
  }
}

export function isSpeechAvailable(): Promise<boolean> {
  return Speech.isSpeakingAsync().then(() => true).catch(() => false);
}
