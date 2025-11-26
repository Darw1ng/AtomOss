import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { theme } from '../theme/colors';
import { MoreVertical } from 'lucide-react-native';

// Calculamos el ancho: Pantalla total / 3 columnas - un poco de margen
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth / 3) - 14;

export default function NoteCard({ title, content, onPress, onLongPress }) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Cabecera con título y 3 puntos */}
            <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {title || 'Vacío'}
                </Text>
                <TouchableOpacity onPress={onLongPress} style={styles.menuBtn} hitSlop={10}>
                    <MoreVertical size={16} color={theme.textDim} />
                </TouchableOpacity>
            </View>

            {/* Contenido (Vista previa pequeña) */}
            <Text style={styles.content} numberOfLines={4}>
                {content || ''}
            </Text>

            {/* Decoración visual pequeña en la esquina */}
            <View style={styles.cornerDeco} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.card,
        width: cardWidth,
        height: cardWidth, // Hacemos que sea cuadrada
        borderRadius: 12,
        padding: 10,
        margin: 4, // Separación entre cuadros
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'space-between',
        overflow: 'hidden',
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        color: theme.primary,
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 4,
    },
    menuBtn: {
        padding: 2,
    },
    content: {
        color: theme.textDim,
        fontSize: 11,
        lineHeight: 14,
        flex: 1, // Ocupa el resto del espacio
    },
    cornerDeco: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        width: 30,
        height: 30,
        backgroundColor: theme.primary,
        opacity: 0.1,
        borderRadius: 15,
    }
});