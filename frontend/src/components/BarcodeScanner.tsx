import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { CameraView, Camera } from "expo-camera";
import Ionicons from '@expo/vector-icons/Ionicons';

type BarcodeScannerProps = {
    visible: boolean;
    onClose: () => void;
    onDetected?: (barcode: string, productName?: string) => void;
};

const { width, height } = Dimensions.get('window');
const SCANNER_WIDTH = 280;
const SCANNER_HEIGHT = 100;

export default function BarcodeScanner({ visible, onClose, onDetected }: BarcodeScannerProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };

        getCameraPermissions();
    }, []);

    useEffect(() => {
        if (visible) {
            const getCameraPermissions = async () => {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === "granted");
            };
            getCameraPermissions();
            setScanned(false);
        } else {
            setScanned(false);
            setLoadingInfo(false);
        }
    }, [visible]);

    async function handleBarCodeScanned({ data }: { data: string }) {
        if (scanned) return;
        setScanned(true);
        setLoadingInfo(true);

        let productName: string | undefined;
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(data)}.json`);
            const json = await res.json();
            if (json && json.status === 1 && json.product) {
                productName = json.product.product_name || json.product.generic_name || undefined;
            }
        } catch (err) {
            console.warn('A requisição da API OpenFoodFacts falhou.', err);
        } finally {
            setLoadingInfo(false);
            onDetected?.(data, productName);
            setTimeout(() => {
                setScanned(false);
            }, 500);
        }
    }

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                <View style={{ flex: 1 }}>
                    {hasPermission === false ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                            <Text style={{ color: 'white' }}>Sem acesso à câmera. Autorize nas configurações.</Text>
                        </View>
                    ) : hasPermission === null ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator color="#f97316" size="large" />
                        </View>
                    ) : (
                        <CameraView
                            style={{ flex: 1 }}
                            facing="back"
                            active={visible}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["ean13", "ean8", "upca", "upce", "qr", "pdf417", "code128", "code39"],
                            }}
                            onMountError={(error) => {
                                console.error('Camera mount error:', error);
                            }}
                        />
                    )}
                </View>

                <View style={{ position: 'absolute', top: 48, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Pressable onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24, padding: 8 }}>
                        <Ionicons name="close" size={24} color="white" />
                    </Pressable>
                </View>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: (height - SCANNER_HEIGHT) / 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                    <View style={{
                        width: SCANNER_WIDTH,
                        height: SCANNER_HEIGHT,
                        borderWidth: 3,
                        borderColor: '#f97316',
                        borderRadius: 8,
                    }} />
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: (height - SCANNER_HEIGHT) / 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                    <View style={{ position: 'absolute', top: (height - SCANNER_HEIGHT) / 2, left: 0, width: (width - SCANNER_WIDTH) / 2, height: SCANNER_HEIGHT, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                    <View style={{ position: 'absolute', top: (height - SCANNER_HEIGHT) / 2, right: 0, width: (width - SCANNER_WIDTH) / 2, height: SCANNER_HEIGHT, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                </View>

                <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' }}>
                    {loadingInfo ? (
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 }}>
                            <ActivityIndicator color="#f97316" />
                        </View>
                    ) : (
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 }}>
                            <Text style={{ color: 'black' }}>Aponte a câmera para o código de barras do produto</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
