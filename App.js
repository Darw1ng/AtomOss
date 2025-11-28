import React from 'react';
import { StatusBar } from 'react-native';
// 1. IMPORTAR SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from './src/theme/colors';

import SettingsScreen from './src/screens/SettingsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NewsScreen from './src/screens/NewsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import CanvasScreen from './src/screens/CanvasScreen'; // <--- IMPORTAR

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        // 2. ENVOLVER TODA LA APP CON ESTE PROVIDER
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: theme.card },
                        headerTintColor: theme.primary,
                        headerTitleStyle: { fontWeight: 'bold' },
                        contentStyle: { backgroundColor: theme.background }
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'AtomOss' }}
                    />

                    <Stack.Screen
                        name="Detail"
                        component={DetailScreen}
                        options={({ route }) => ({
                            title: route.params.note ? 'Editar Archivo' : 'Nuevo Archivo'
                        })}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{ title: 'Configuración' }}
                    />
                    <Stack.Screen
                        name="Calendar"
                        component={CalendarScreen}
                        options={{ title: 'Calendario y Eventos' }}
                    />
                    <Stack.Screen
                        name="News"
                        component={NewsScreen}
                        options={{ title: 'Noticias de Desarrollo' }}
                    />
                    <Stack.Screen
                        name="Notifications"
                        component={NotificationsScreen}
                        options={{ title: 'Notificaciones' }}
                    />
                    <Stack.Screen
                        name="Canvas"
                        component={CanvasScreen}
                        options={{ title: 'Mapas Mentales' }}
                    />

                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
