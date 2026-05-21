import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PREDEFINED_TAGS } from '../constants/tags';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth / 3) - 14;

export default function NoteCard({ title, content, tags = [], onPress, onLongPress }) {
    const { theme } = useTheme();

    const resolvedTags = tags
        .map(id => PREDEFINED_TAGS.find(t => t.id === id))
        .filter(Boolean)
        .slice(0, 3);

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.7}
            onLongPress={onLongPress}
        >
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.primary }]} numberOfLines={1}>
                    {title || 'Vacío'}
                </Text>
            </View>

            <Text style={[styles.content, { color: theme.textDim }]} numberOfLines={4}>
                {content || ''}
            </Text>

            <View style={styles.footer}>
                {resolvedTags.length > 0 && (
                    <View style={styles.tagsRow}>
                        {resolvedTags.map(tag => (
                            <View key={tag.id} style={[styles.tagDot, { backgroundColor: tag.color }]} />
                        ))}
                    </View>
                )}
            </View>

            <View style={[styles.cornerDeco, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        height: cardWidth,
        borderRadius: 12,
        padding: 10,
        margin: 4,
        borderWidth: 1,
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
    content: {
        fontSize: 11,
        lineHeight: 14,
        flex: 1,
    },
    footer: {
        marginTop: 4,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 4,
    },
    tagDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        opacity: 0.9,
    },
    cornerDeco: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        width: 30,
        height: 30,
        opacity: 0.1,
        borderRadius: 15,
    },
});
