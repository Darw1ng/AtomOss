// src/theme/theme.js

export const PALETTES = {
    green: { primary: '#44895C', secondary: '#336745' },
    blue: { primary: '#3b82f6', secondary: '#1e40af' },
    purple: { primary: '#8b5cf6', secondary: '#5b21b6' },
    orange: { primary: '#f97316', secondary: '#9a3412' },
};

export const getTheme = (mode, paletteName, highContrast) => {
    const palette = PALETTES[paletteName] || PALETTES.green;

    if (highContrast) {
        return {
            background: '#000000',
            card: '#000000',
            text: '#FFFFFF',
            textDim: '#FFFF00',
            primary: '#FFFFFF',
            secondary: '#FFFFFF',
            border: '#FFFFFF',
            black: '#000000',
            danger: '#FF0000',
            success: '#00FF00',
            statusBarStyle: 'light-content'
        };
    }

    if (mode === 'dark') {
        return {
            background: '#112217',
            card: '#22452E',
            text: '#ffffff',
            textDim: '#a0bfa8',
            primary: palette.primary,
            secondary: palette.secondary,
            border: '#336745',
            black: '#000000',
            danger: '#ef4444',
            success: palette.primary,
            statusBarStyle: 'light-content'
        };
    }

    return {
        background: '#F0FDF4',
        card: '#FFFFFF',
        text: '#1a2e1a',
        textDim: '#526b52',
        primary: palette.primary,
        secondary: palette.secondary,
        border: '#bbf7d0',
        black: '#000000',
        danger: '#ef4444',
        success: palette.primary,
        statusBarStyle: 'dark-content'
    };
};
