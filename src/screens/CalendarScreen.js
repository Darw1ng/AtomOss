import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/colors';
import { MapPin, Clock } from 'lucide-react-native';

// Datos Simulados
const EVENTS = [
    { id: '1', title: 'Entrega de Proyecto', date: '28', type: 'user', time: '14:00' },
    { id: '2', title: 'Día de la Independencia', date: '16', type: 'holiday', location: 'México', time: 'Todo el día' },
    { id: '3', title: 'Reunión de Desarrolladores', date: '30', type: 'user', time: '10:00' },
];

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState(null);
    const days = Array.from({ length: 30 }, (_, i) => i + 1); // Simula Noviembre

    const renderEvent = ({ item }) => (
        <View style={[styles.eventCard, item.type === 'holiday' ? { borderLeftColor: '#facc15' } : { borderLeftColor: theme.primary }]}>
            <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <Clock size={12} color={theme.textDim} style={{marginRight: 4}}/>
                    <Text style={styles.eventMeta}>{item.time} - {item.type === 'holiday' ? 'Festivo' : 'Personal'}</Text>
                </View>
                {item.location && (
                    <View style={styles.metaRow}>
                        <MapPin size={12} color={theme.textDim} style={{marginRight: 4}}/>
                        <Text style={styles.eventMeta}>{item.location}</Text>
                    </View>
                )}
            </View>
            <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{item.date}</Text>
                <Text style={styles.dateBadgeMonth}>NOV</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Calendario Visual Simple */}
            <View style={styles.calendarContainer}>
                <Text style={styles.monthTitle}>Noviembre 2025</Text>
                <View style={styles.daysGrid}>
                    {['L','M','M','J','V','S','D'].map((d, i) => (
                        <Text key={i} style={styles.dayLabel}>{d}</Text>
                    ))}
                    {days.map(day => {
                        const hasEvent = EVENTS.find(e => e.date === day.toString());
                        const isSelected = selectedDate === day;
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayCell,
                                    isSelected && styles.selectedDay,
                                    hasEvent && !isSelected && styles.eventDay
                                ]}
                                onPress={() => setSelectedDate(day)}
                            >
                                <Text style={[styles.dayText, isSelected && {color: 'white'}]}>{day}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <Text style={styles.sectionHeader}>Próximos Eventos</Text>
            <FlatList
                data={EVENTS}
                keyExtractor={item => item.id}
                renderItem={renderEvent}
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    calendarContainer: { padding: 20, backgroundColor: theme.card, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    monthTitle: { color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    dayLabel: { width: '13%', textAlign: 'center', color: theme.textDim, marginBottom: 10, fontWeight: 'bold' },
    dayCell: { width: '13%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderRadius: 20 },
    dayText: { color: theme.text },
    selectedDay: { backgroundColor: theme.primary },
    eventDay: { backgroundColor: 'rgba(68, 137, 92, 0.3)' }, // Verde clarito

    sectionHeader: { color: theme.text, fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginTop: 20 },
    eventCard: {
        backgroundColor: theme.card, marginBottom: 10, borderRadius: 10, padding: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderLeftWidth: 4
    },
    eventTitle: { color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    eventMeta: { color: theme.textDim, fontSize: 12 },
    dateBadge: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 },
    dateBadgeText: { color: theme.primary, fontWeight: 'bold', fontSize: 18 },
    dateBadgeMonth: { color: theme.textDim, fontSize: 10 }
});
