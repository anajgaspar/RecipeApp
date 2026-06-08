import React from "react";
import { Image, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View className="h-full flex flex-col justify-center items-center gap-4">
        <Image source={require('@/src/assets/icon.png')} className="w-64 h-64"/>
        <Text className="font-robotoSemibold text-4xl text-[#f97316]">Receita Na Mão</Text>
    </View>
  );
}