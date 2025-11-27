import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from './src/theme/colors';

// Importar Pantallas
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import FileSidebar from './src/components/FileSidebar'; // Importamos el nuevo componente

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// 1. Creamos el Navegador Lateral (Drawer) que contiene el Home
function DrawerGroup() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <FileSidebar {...props} />} // Usamos nuestro diseño personalizado
            screenOptions={{
                headerStyle: { backgroundColor: theme.card, elevation: 0, shadowOpacity: 0 },
                headerTintColor: theme.primary,
                headerTitleStyle: { fontWeight: 'bold' },
                drawerStyle: { backgroundColor: '#0d1117', width: '80%' }, // Estilo del fondo del drawer
                sceneContainerStyle: { backgroundColor: theme.background }
            }}
        >
            <Drawer.Screen
                name="HomeDrawer"
                component={HomeScreen}
                options={{ title: 'AtomOss' }}
            />
        </Drawer.Navigator>
    );
}

// 2. El Stack Principal envuelve al Drawer y al Detalle
// Esto permite que al abrir una nota, la nota cubra toda la pantalla (incluido el menú)
export default function App() {
    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: theme.card },
                    headerTintColor: theme.primary,
                    contentStyle: { backgroundColor: theme.background }
                }}
            >
                {/* La pantalla principal ahora es el Grupo Drawer */}
                <Stack.Screen
                    name="Main"
                    component={DrawerGroup}
                    options={{ headerShown: false }} // Ocultamos el header del stack para usar el del drawer
                />

                {/* La pantalla de detalle se abre "encima" de todo */}
                <Stack.Screen
                    name="Detail"
                    component={DetailScreen}
                    options={({ route }) => ({
                        title: route.params.note ? 'Editar Archivo' : 'Nuevo Archivo'
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
