import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from './src/theme/colors';
import SettingsScreen from './src/screens/SettingsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NewsScreen from './src/screens/NewsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Importar Pantallas
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
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

            </Stack.Navigator>
        </NavigationContainer>
    );
}
