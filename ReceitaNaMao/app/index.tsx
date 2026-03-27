import { StatusBar } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../src/modules/SplashScreen";
import LoginPage from "../src/modules/auth/screens/LoginPage";
import SignupPage from "@/src/modules/auth/screens/SignupPage";
import ConfirmEmail from "@/src/modules/auth/screens/ConfirmEmail";
import Feed from "@/src/modules/Tab";
import RecipeDetails from "@/src/modules/recipes/screens/RecipeDetails";

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
        <Stack.Screen name="Signup" component={SignupPage} options={{ headerShown: false }}/>
        <Stack.Screen name="ConfirmEmail" component={ConfirmEmail} options={{ headerShown: false }}/>
        <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }}/>
        <Stack.Screen name="RecipeDetails" component={RecipeDetails} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </>
  );
}
