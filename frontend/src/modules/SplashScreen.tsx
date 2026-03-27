import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";

export default function SplashScreen({ navigation }: { navigation: any }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login')
    }, 5000)
  }, [])
  
  return (
    <View className="h-full flex flex-col justify-center items-center gap-4">
        <Image source={require('@/src/assets/logo.png')} className="w-64 h-64"/>
        <Text className="font-gastromond text-4xl text-[#f97316]">Receita Na Mao</Text>
    </View>
  );
}