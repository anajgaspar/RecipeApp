import { StatusBar } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../src/modules/SplashScreen";
import LoginPage from "../src/modules/auth/screens/LoginPage";
import SignupPage from "@/src/modules/auth/screens/SignupPage";
import ConfirmEmail from "@/src/modules/auth/screens/ConfirmEmail";
import Feed from "@/src/modules/Tab";
import RecipeDetails from "@/src/modules/recipes/screens/RecipeDetails";
import RecipeRegister from "@/src/modules/recipes/screens/RecipeRegister";
import { useAuth } from "@/src/modules/auth/context/AuthContext";
import EditProfileForm from "@/src/modules/social/screens/EditProfileForm";
import EditFamilyProfile from "@/src/modules/social/screens/EditFamilyProfile";
import MyRecipesList from "@/src/modules/social/screens/MyRecipesList";
import MyFavoritesList from "@/src/modules/social/screens/MyFavoritesList";
import FamilyProfiles from "@/src/modules/social/screens/FamilyProfiles";
import Notifications from "@/src/modules/social/screens/Notifications";
import SocialConnections from "@/src/modules/social/screens/SocialConnections";

export default function App() {
  const Stack = createNativeStackNavigator();
  const { isAuthenticated, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <SplashScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator initialRouteName={isAuthenticated ? "Feed" : "Login"}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }} />
            <Stack.Screen name="RecipeDetails" component={RecipeDetails} options={{ headerShown: false }} />
            <Stack.Screen name="RecipeRegister" component={RecipeRegister} options={{ headerShown: false }} />
            <Stack.Screen name="MyRecipes" component={MyRecipesList} options={{ headerShown: false }} />
            <Stack.Screen name="MyFavorites" component={MyFavoritesList} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileForm} options={{ headerShown: false }} />
            <Stack.Screen name="EditFamilyProfile" component={EditFamilyProfile} options={{ headerShown: false }} />
            <Stack.Screen name="FamilyProfiles" component={FamilyProfiles} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
            <Stack.Screen name="SocialConnections" component={SocialConnections} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupPage} options={{ headerShown: false }} />
            <Stack.Screen name="ConfirmEmail" component={ConfirmEmail} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}
