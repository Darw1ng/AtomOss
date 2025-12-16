import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedSplashScreen({ onFinish }) {
    const animation = useRef(null);

    return (
        <View style={styles.container}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 200,
                    height: 200,
                    backgroundColor: '#112217', // Mismo color que tu app.json
                }}
                // Reemplaza esto con tu archivo json descargado
                source={require('../../assets/splash-animation.json')} 
                loop={false} // Importante: que no se repita infinitamente
                onAnimationFinish={() => {
                    // Cuando termina la animación, ejecutamos la función para cambiar de pantalla
                    onFinish();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#112217', // Fondo coherente
    },
});
