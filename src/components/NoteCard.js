import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // 1. Importar Hook
import { MoreVertical } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth / 3) - 14;

export default function NoteCard({ title, content, onPress, onLongPress }) {
    const { theme } = useTheme(); // 2. Obtener tema

    return (
        <TouchableOpacity
            // 3. Estilos dinámicos mezclados con estáticos
            style={[styles.card, {
                backgroundColor: theme.card,
                borderColor: theme.border
            }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.primary }]} numberOfLines={1}>
                    {title || 'Vacío'}
                </Text>
                <TouchableOpacity onPress={onLongPress} style={styles.menuBtn} hitSlop={10}>
                    <MoreVertical size={16} color={theme.textDim} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.content, { color: theme.textDim }]} numberOfLines={4}>
                {content || ''}
            </Text>

            <View style={[styles.cornerDeco, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>
    );
}

// Solo dejamos layout y dimensiones aquí
const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        height: cardWidth,
        borderRadius: 12,
        padding: 10,
        margin: 4,
        borderWidth: 1,
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
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 4,
    },
    menuBtn: { padding: 2 },
    content: {
        fontSize: 11,
        lineHeight: 14,
        flex: 1,
    },
    cornerDeco: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        width: 30,
        height: 30,
        opacity: 0.1,
        borderRadius: 15,
    }
});
