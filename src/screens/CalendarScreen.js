import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Clock } from 'lucide-react-native';

const EVENTS = [
    { id: '1', title: 'Entrega de Proyecto', date: '28', type: 'user', time: '14:00' },
    { id: '2', title: 'Día de la Independencia', date: '16', type: 'holiday', location: 'México', time: 'Todo el día' },
];

export default function CalendarScreen() {
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(null);
    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    const renderEvent = ({ item }) => (
        <View style={[styles.eventCard, { backgroundColor: theme.card }, item.type === 'holiday' ? { borderLeftColor: '#facc15' } : { borderLeftColor: theme.primary }]}>
            <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <Clock size={12} color={theme.textDim} style={{ marginRight: 4 }} />
                    <Text style={[styles.eventMeta, { color: theme.textDim }]}>{item.time} - {item.type === 'holiday' ? 'Festivo' : 'Personal'}</Text>
                </View>
            </View>
            <View style={[styles.dateBadge, { backgroundColor: theme.background }]}>
                <Text style={[styles.dateBadgeText, { color: theme.primary }]}>{item.date}</Text>
                <Text style={[styles.dateBadgeMonth, { color: theme.textDim }]}>NOV</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.calendarContainer, { backgroundColor: theme.card }]}>
                <Text style={[styles.monthTitle, { color: theme.text }]}>Noviembre 2025</Text>
                <View style={styles.daysGrid}>
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <Text key={i} style={[styles.dayLabel, { color: theme.textDim }]}>{d}</Text>)}
                    {days.map(day => {
                        const isSelected = selectedDate === day;
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayCell, isSelected && { backgroundColor: theme.primary }]}
                                onPress={() => setSelectedDate(day)}
                            >
                                <Text style={[styles.dayText, { color: isSelected ? '#fff' : theme.text }]}>{day}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <Text style={[styles.sectionHeader, { color: theme.text }]}>Próximos Eventos</Text>
            <FlatList data={EVENTS} keyExtractor={item => item.id} renderItem={renderEvent} contentContainerStyle={{ padding: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    calendarContainer: { padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    monthTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    dayLabel: { width: '13%', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
    dayCell: { width: '13%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderRadius: 20 },
    dayText: {},
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginTop: 20 },
    eventCard: { marginBottom: 10, borderRadius: 10, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4 },
    eventTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    eventMeta: { fontSize: 12 },
    dateBadge: { alignItems: 'center', padding: 8, borderRadius: 8 },
    dateBadgeText: { fontWeight: 'bold', fontSize: 18 },
    dateBadgeMonth: { fontSize: 10 }
});
