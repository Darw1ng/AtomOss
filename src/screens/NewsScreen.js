import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // <--- CAMBIO 1: Importar Hook

const NEWS = [
    {
        id: '4',
        title: '¡Novedades!',
        date: '01 Dic 2025',
        image: require('../../assets/oki.jpeg'),
        content: 'Mejora de Logo!, El calendario funciona de mejor manera con nuevas modificaciones, hay un nuevo canva de dibujo!, la funcion de agregar fotos fue agregada pero aun tiene bugs...'
    },
    {
        id: '3',
        title: 'Version 0.14 Actualizacion de contenido',
        date: '01 Dic 2025',
        image: require('../../assets/kos.jpeg'),
        content: 'Mejoras de contenido, se mejoraron y arreglaron bugs menores.'
    },
    {
        id: '2',
        title: 'Version 0.13 Actualizacion de contenido',
        date: '28 Nov 2025',
        image: require('../../assets/cuki.jpeg'),
        content: 'Esto es la version Alpha, unicamente ciertos individuos seleccionados tendran acceso a esta version.      ' + '-Felicidades eres especial'

    },
    {
        id: '1',
        title: '¡Bienvenido a AtomOss!',
        date: '28 Nov 2025',
        image: require('../../assets/noticia1.png'),
        content: 'Lanzamiento oficial de la Alpha abierta para la comunidad seleccionada.'
    },
];

export default function NewsScreen() {
    const { theme } = useTheme(); // <--- CAMBIO 2: Usar Hook

    // CAMBIO 3: Mover estilos dentro del componente o usar estilos dinámicos en línea
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={NEWS}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 15 }}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <Image
                            source={item.image}
                            style={styles.newsImage}
                            resizeMode="cover"
                        />
                        <View style={styles.cardBody}>
                            <Text style={[styles.date, { color: theme.primary }]}>{item.date}</Text>
                            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[styles.content, { color: theme.textDim }]}>{item.content}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: {
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 3
    },
    newsImage: {
        width: '100%',
        height: 150,
    },
    cardBody: { padding: 15 },
    date: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    content: { fontSize: 14, lineHeight: 20 }
});
