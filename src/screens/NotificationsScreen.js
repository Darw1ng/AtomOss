import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../theme/colors';
import { Bell, Calendar, Info } from 'lucide-react-native';

const NOTIFICATIONS = [
    { id: '1', type: 'alert', text: 'Nueva actualización disponible (v1.0.2)', time: 'Hace 2 min' },
    { id: '2', type: 'calendar', text: 'Recordatorio: Entrega de Proyecto mañana', time: 'Hace 1 hora' },
    { id: '3', type: 'info', text: 'Bienvenido a la comunidad AtomOss', time: 'Ayer' },
];

export default function NotificationsScreen() {
    const getIcon = (type) => {
        if (type === 'calendar') return <Calendar size={20} color="#facc15" />;
        if (type === 'alert') return <Bell size={20} color={theme.danger} />;
        return <Info size={20} color={theme.primary} />;
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.iconContainer}>
                            {getIcon(item.type)}
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.text}>{item.text}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        {/* Indicador de no leído */}
                        <View style={styles.dot} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    item: {
        flexDirection: 'row', alignItems: 'center', padding: 15,
        borderBottomWidth: 1, borderBottomColor: theme.card
    },
    iconContainer: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: theme.card,
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    text: { color: theme.text, fontSize: 14, marginBottom: 4 },
    time: { color: theme.textDim, fontSize: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary }
});
