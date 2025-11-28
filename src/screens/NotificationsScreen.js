import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Bell, Calendar, Info } from 'lucide-react-native';

const NOTIFICATIONS = [
    { id: '1', type: 'alert', text: 'Nueva actualización', time: 'Hace 2 min' },
    { id: '2', type: 'calendar', text: 'Recordatorio', time: 'Hace 1 hora' },
];

export default function NotificationsScreen() {
    const { theme } = useTheme();

    const getIcon = (type) => {
        if (type === 'calendar') return <Calendar size={20} color="#facc15" />;
        if (type === 'alert') return <Bell size={20} color={theme.danger} />;
        return <Info size={20} color={theme.primary} />;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.item, { borderBottomColor: theme.card }]}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
                            {getIcon(item.type)}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.text, { color: theme.text }]}>{item.text}</Text>
                            <Text style={[styles.time, { color: theme.textDim }]}>{item.time}</Text>
                        </View>
                        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    text: { fontSize: 14, marginBottom: 4 },
    time: { fontSize: 12 },
    dot: { width: 8, height: 8, borderRadius: 4 }
});
