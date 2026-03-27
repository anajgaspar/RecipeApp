import { ScrollView, View, Image, Text, Pressable } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import RecipeList from "../components/RecipeList";
import RecipeComments from "../components/RecipeComments";

export default function RecipeDetails({ navigation }: { navigation: any }) {
    return (
        <View className="flex-1 bg-white">
            <ScrollView className="w-full" contentContainerStyle={{ paddingBottom: 96 }}>
                <View className="w-full flex flex-col">
                    <View className="relative">
                        <Image
                            source={{ uri: 'https://guiadacozinha.com.br/wp-content/uploads/2019/10/lasanha-bolonhesa.jpg' }}
                            className="w-full h-80 rounded-t-xl"
                            resizeMode="cover"
                        />
                        <View className="absolute top-12 right-20 bg-white rounded-full p-2">
                            <FontAwesome6 name="heart" size={24} color="black" />
                        </View>
                        <View className="absolute top-12 right-6 bg-white rounded-full p-2">
                            <Ionicons name="share-social-outline" size={24} color="black" />
                        </View>
                        <Pressable onPress={() => navigation.replace('Feed')} className="absolute top-12 left-6 bg-white rounded-full p-2">
                            <FontAwesome6 name="arrow-left" size={24} color="black" />
                        </Pressable>
                    </View>
                    <View className="flex flex-row">
                        <Text className="absolute bottom-12 left-6 bg-white/40 font-semibold text-white py-1 px-2 rounded-full">Cetogênica</Text>
                        <Text className="absolute bottom-12 left-36 bg-white/40 font-semibold text-white py-1 px-2 rounded-full">Fácil</Text>
                    </View>
                    <View className="flex flex-row">
                        <Text className="absolute bottom-2 left-6 font-bold text-2xl text-white">Lasanha Bolonhesa</Text>
                    </View>
                </View>
                <View className="flex flex-row justify-between p-4">
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <FontAwesome6 name="clock" size={16} color="#f97316" />
                        <Text>30min</Text>
                    </View>
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <FontAwesome6 name="arrow-trend-up" size={16} color="#f97316" />
                        <Text>Fácil</Text>
                    </View>
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <Ionicons name="people-outline" size={16} color="#f97316" />
                        <Text>4 porções</Text>
                    </View>
                    <View className="flex flex-col items-center justify-center bg-[#9ca3af]/10 w-24 h-20 rounded-md gap-2">
                        <Ionicons name="cash-outline" size={16} color="#f97316" />
                        <Text>R$30,00</Text>
                    </View>
                </View>
                <View className="flex flex-row justify-between items-center p-4">
                    <View className="flex flex-row gap-2">
                        <Image
                            source={{ uri: 'https://icon-icons.com/download-file?file=https%3A%2F%2Fimages.icon-icons.com%2F3708%2FPNG%2F512%2Fgirl_female_woman_person_people_avatar_icon_230018.png&id=230018&pack_or_individual=pack' }}
                            className="w-14 h-14"
                        />
                        <Text className="pt-2">Jane Doe</Text>
                    </View>
                    <Pressable className="flex justify-center border border-[#9ca3af]/80 rounded-md h-10 px-2">
                        <Text>Seguir</Text>
                    </Pressable>
                </View>
                <View className="flex-1 h-px bg-gray-200" />
                <RecipeList />
                <View className="flex-1 h-px mt-2 bg-gray-200" />
                <RecipeComments/>
            </ScrollView>
            <Pressable className="absolute bottom-6 left-4 right-4 flex flex-row justify-center items-center gap-4 bg-[#f97316] p-4 rounded-md">
                <Ionicons name="play-outline" size={16} color="white" />
                <Text className="text-white font-semibold">Iniciar Modo de Preparo</Text>
            </Pressable>
        </View>
    )
}