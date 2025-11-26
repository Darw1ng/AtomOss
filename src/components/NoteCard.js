import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../theme/colors';
import { Atom } from 'lucide-react-native';

export default function NoteCard({ title, content, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>{title || 'Sin Título'}</Text>
                <Atom size={16} color={theme.primary} />
            </View>
            <Text style={styles.content} numberOfLines={2}>
                {content || 'Sin contenido...'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: theme.text,
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    content: {
        color: theme.textDim,
        fontSize: 14,
    },
});
