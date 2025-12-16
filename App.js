import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Importa el nuevo componente animado
import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen';

// Tus pantallas existentes
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NewsScreen from './src/screens/NewsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CanvasScreen from './src/screens/CanvasScreen';
import DiagramListScreen from './src/screens/DiagramListScreen';

// Prevenimos que la splash nativa se oculte sola
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
    const { theme } = useTheme();
    // ... Tu configuración de navegación existente ...
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: { backgroundColor: theme.card },
                    headerTintColor: theme.text,
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: theme.background },
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AtomOss' }} />
                <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Editor' }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
                <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario' }} />
                <Stack.Screen name="News" component={NewsScreen} options={{ title: 'Noticias' }} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
                <Stack.Screen name="Canvas" component={CanvasScreen} options={{ title: 'Lienzo Mental' }} />
                <Stack.Screen name="DiagramList" component={DiagramListScreen} options={{ title: 'Mapas Mentales' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true); // Estado para controlar la animación

    useEffect(() => {
        async function prepare() {
            try {
                // Aquí cargas fuentes, datos de usuario, etc.
                await new Promise(resolve => setTimeout(resolve, 4000)); // Simulación de carga
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // Ocultamos la splash nativa (la imagen estática)
            // Esto revela INMEDIATAMENTE nuestro componente <AnimatedSplashScreen />
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    // Si la app está lista pero la animación no ha terminado, mostramos la animación
    if (showAnimation) {
        return (
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                 <AnimatedSplashScreen onFinish={() => setShowAnimation(false)} />
            </View>
        );
    }

    // Cuando termina la animación, mostramos la App real
    return (
        <ThemeProvider>
            <MainNavigator />
        </ThemeProvider>
    );
}