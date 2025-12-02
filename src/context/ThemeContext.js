import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. Importar AsyncStorage
import { getTheme } from '../theme/theme';

const ThemeContext = createContext();
const PREFS_KEY = '@atomoss_theme_prefs_v1'; // Clave para guardar la config

export const ThemeProvider = ({ children }) => {
    // Estados iniciales por defecto
    const [mode, setMode] = useState('dark');
    const [colorPalette, setColorPalette] = useState('green');
    const [highContrast, setHighContrast] = useState(false);
    const [language, setLanguage] = useState('Español');

    // Estado para saber si ya cargamos los datos (para evitar sobrescribir al inicio)
    const [isLoaded, setIsLoaded] = useState(false);

    // 2. EFECTO: Cargar configuración al iniciar
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const storedPrefs = await AsyncStorage.getItem(PREFS_KEY);
                if (storedPrefs) {
                    const prefs = JSON.parse(storedPrefs);
                    // Si existen datos guardados, actualizamos el estado
                    if (prefs.mode) setMode(prefs.mode);
                    if (prefs.colorPalette) setColorPalette(prefs.colorPalette);
                    if (prefs.highContrast !== undefined) setHighContrast(prefs.highContrast);
                    if (prefs.language) setLanguage(prefs.language);
                }
            } catch (error) {
                console.error("Error al cargar preferencias:", error);
            } finally {
                setIsLoaded(true); // Marcamos como cargado
            }
        };
        loadPreferences();
    }, []);

    // 3. EFECTO: Guardar configuración cada vez que cambie algo
    useEffect(() => {
        if (isLoaded) { // Solo guardamos si ya terminó la carga inicial
            const savePreferences = async () => {
                try {
                    const prefsToSave = {
                        mode,
                        colorPalette,
                        highContrast,
                        language
                    };
                    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefsToSave));
                } catch (error) {
                    console.error("Error al guardar preferencias:", error);
                }
            };
            savePreferences();
        }
    }, [mode, colorPalette, highContrast, language, isLoaded]); // Se ejecuta cuando cualquiera de estos cambia

    const theme = useMemo(() =>
            getTheme(mode, colorPalette, highContrast),
        [mode, colorPalette, highContrast]);

    const toggleTheme = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
    const toggleHighContrast = () => setHighContrast(prev => !prev);
    const changeColor = (color) => setColorPalette(color);
    const changeLanguage = (lang) => setLanguage(lang);

    return (
        <ThemeContext.Provider value={{
            theme,
            mode,
            colorPalette,
            highContrast,
            language,
            toggleTheme,
            toggleHighContrast,
            changeColor,
            changeLanguage
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
