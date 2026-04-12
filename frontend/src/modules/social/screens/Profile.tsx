import { View, ScrollView } from "react-native";
import TopBar from "../components/TopBar";
import ProfileInfo from "../components/ProfileInfo";
import CardOption from "../components/CardOption";

export default function Profile() {
    return (
        <ScrollView className="flex-1 bg-white">
            <TopBar />
            <ProfileInfo />
            <View className="flex-1 h-px bg-gray-200" />
            <CardOption />
        </ScrollView>
    )
}
