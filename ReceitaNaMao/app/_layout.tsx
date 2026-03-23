import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../src/styles/index.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Gastromond-Regular": require("../src/assets/fonts/Gastromond-Regular.otf"),
    "Gastromond-Italic": require("../src/assets/fonts/Gastromond-Italic.otf"),
    "RobotoSerif-Regular": require("../src/assets/fonts/RobotoSerif-Regular.ttf"),
    "RobotoSerif-SemiBold": require("../src/assets/fonts/RobotoSerif-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
