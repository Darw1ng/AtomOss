module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'], // Esto usa la librería que acabamos de instalar
        plugins: [
            'react-native-reanimated/plugin', // <--- ESTE DEBE SER EL ÚLTIMO
        ],
    };
};
