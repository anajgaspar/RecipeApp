import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, View, Text, TextInput } from 'react-native';
import { resendVerification, verifyEmail } from '@/src/services/authService';

export default function ConfirmEmail({ navigation, route }: { navigation: any; route?: { params?: { email?: string; token?: string } } }) {
    const [email, setEmail] = useState(route?.params?.email ?? '');
    const [token, setToken] = useState(route?.params?.token ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    async function handleVerifyEmail() {
        if (!email.trim() || !token.trim()) {
            setErrorMessage('Informe e-mail e token para validar.');
            return;
        }

        setErrorMessage('');
        setInfoMessage('');
        setIsSubmitting(true);

        try {
            await verifyEmail({
                email: email.trim(),
                token: token.trim(),
            });

            setInfoMessage('E-mail validado com sucesso. Agora você pode entrar.');
            navigation.replace('Login');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao validar e-mail.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendVerification() {
        if (!email.trim()) {
            setErrorMessage('Informe seu e-mail para reenviar a confirmação.');
            return;
        }

        setErrorMessage('');
        setInfoMessage('');
        setIsSubmitting(true);

        try {
            const message = await resendVerification({ email: email.trim() });
            setInfoMessage(message);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao reenviar confirmação.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="h-full flex flex-col justify-center items-center">
            <Pressable onPress={() => navigation.replace('Signup')} className='absolute top-16 left-8'>
                <FontAwesome6 name="arrow-left" size={24} color="black" />
            </Pressable>
            <View className="w-full h-full flex flex-col justify-center items-center gap-4 m-8 p-8">
                <MaterialCommunityIcons name="email-check-outline" size={80} color="black" />
                <Text className="font-robotoSemibold text-lg">Confirmação de e-mail</Text>
                <Text className="text-center">Conta criada com sucesso. Cole abaixo o token recebido por e-mail para validar sua conta.</Text>

                <View className="w-full bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="text-xs mb-1">E-mail</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="seu@email.com"
                        placeholderTextColor="#9ca3af"
                        className="text-sm"
                    />
                </View>

                <View className="w-full bg-[#fdfbf7] rounded-md px-3 py-2">
                    <Text className="text-xs mb-1">Token de confirmação</Text>
                    <TextInput
                        value={token}
                        onChangeText={setToken}
                        autoCapitalize="none"
                        placeholder="Cole o token recebido"
                        placeholderTextColor="#9ca3af"
                        className="text-sm"
                    />
                </View>

                {errorMessage ? <Text className="text-red-500 text-sm text-center">{errorMessage}</Text> : null}
                {infoMessage ? <Text className="text-green-700 text-sm text-center">{infoMessage}</Text> : null}

                <Pressable disabled={isSubmitting} onPress={handleVerifyEmail} className="w-full bg-[#f97316] p-3 rounded-md">
                    <Text className="text-center text-white font-semibold">{isSubmitting ? 'Validando...' : 'Validar e-mail'}</Text>
                </Pressable>

                <Pressable disabled={isSubmitting} onPress={handleResendVerification} className="w-full bg-white border border-[#f97316] p-3 rounded-md">
                    <Text className="text-center text-[#f97316] font-semibold">Reenviar e-mail de confirmação</Text>
                </Pressable>

                <Pressable onPress={() => navigation.replace('Login')} className="w-full p-3 rounded-md">
                    <Text className="text-center text-black font-semibold">Ir para login</Text>
                </Pressable>
            </View>
        </View>
    )
}