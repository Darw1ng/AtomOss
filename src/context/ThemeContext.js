// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useMemo } from 'react';
import { getTheme } from '../theme/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('dark');
    const [colorPalette, setColorPalette] = useState('green');
    const [highContrast, setHighContrast] = useState(false);
    const [language, setLanguage] = useState('Español');

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
