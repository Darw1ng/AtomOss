import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Importar tus pantallas
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NewsScreen from './src/screens/NewsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CanvasScreen from './src/screens/CanvasScreen';
import DiagramListScreen from './src/screens/DiagramListScreen';

const Stack = createNativeStackNavigator();

// Componente separado para manejar las opciones de navegación que requieren el tema
const MainNavigator = () => {
    const { theme } = useTheme();

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: { backgroundColor: theme.card },
                    headerTintColor: theme.text,
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: theme.background }, // Fondo global
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
    return (
        <ThemeProvider>
            <MainNavigator />
        </ThemeProvider>
    );
}
