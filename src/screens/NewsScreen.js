import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { theme } from '../theme/colors';

const NEWS = [
    {
        id: '1',
        title: 'Version 0.0.13 Actualizacion de contenido',
        date: '28 Nov 2025',
        image: require('../../assets/cuki.jpeg'),
        content: 'Esto es la version Alpha, unicamente ciertos individuos seleccionados tendran acceso a esta version.      ' + '-Felicidades eres especial'
    },
    {
        id: '2',
        title: '¡Bienvenido a AtomOss!',
        date: '28 Nov 2025',
        image: require('../../assets/noticia1.png'),
        content: 'Lanzamiento oficial de la Alpha abierta para la comunidad seleccionada.'
    },
];

export default function NewsScreen() {
    return (
        <View style={styles.container}>
            <FlatList
                data={NEWS}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 15 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* Componente de Imagen Local */}
                        <Image
                            source={item.image}
                            style={styles.newsImage}
                            resizeMode="cover"
                        />

                        <View style={styles.cardBody}>
                            <Text style={styles.date}>{item.date}</Text>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.content}>{item.content}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    card: {
        backgroundColor: theme.card,
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 3
    },
    // Estilo para que la imagen ocupe el ancho de la tarjeta
    newsImage: {
        width: '100%',
        height: 150, // Puedes ajustar la altura de la imagen aquí
    },
    cardBody: { padding: 15 },
    date: { color: theme.primary, fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
    title: { color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    content: { color: theme.textDim, fontSize: 14, lineHeight: 20 }
});
