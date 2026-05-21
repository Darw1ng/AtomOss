import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { Pin } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PREDEFINED_TAGS, NOTE_TINTS } from '../constants/tags';
import { timeAgo } from '../utils/timeAgo';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth / 2) - 14;

export default function NoteCard({ title, content, tags = [], pinned = false, color = null, updatedAt, createdAt, onPress, onLongPress }) {
    const { theme, mode } = useTheme();

    const resolvedTags = tags
        .map(id => PREDEFINED_TAGS.find(t => t.id === id))
        .filter(Boolean)
        .slice(0, 3);

    const bgColor = color && NOTE_TINTS[color]
        ? NOTE_TINTS[color][mode === 'dark' ? 'dark' : 'light']
        : theme.card;

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: bgColor, borderColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.7}
            onLongPress={onLongPress}
        >
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.primary }]} numberOfLines={1}>
                    {title || 'Vacío'}
                </Text>
                {pinned && <Pin size={14} color={theme.primary} fill={theme.primary} />}
            </View>

            <Text style={[styles.content, { color: theme.textDim }]} numberOfLines={6}>
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
                <Text style={[styles.timestamp, { color: theme.textDim }]}>
                    {timeAgo(updatedAt || createdAt)}
                </Text>
            </View>

            <View style={[styles.cornerDeco, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        height: cardWidth,
        borderRadius: 16,
        padding: 14,
        margin: 5,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 6,
    },
    content: {
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
    },
    footer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 5,
    },
    timestamp: {
        fontSize: 11,
        opacity: 0.75,
    },
    tagDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        opacity: 0.95,
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
