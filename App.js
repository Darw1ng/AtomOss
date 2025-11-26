// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from './src/theme/colors';

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
                    contentStyle: { backgroundColor: theme.background } // Fondo global
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
                        title: route.params.note ? 'Editar Partícula' : 'Nueva Partícula'
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}