import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import notesService from '../api/notesService';
import diagramService from '../api/diagramService';
import { PREDEFINED_TAGS, NOTE_TINT_PALETTE } from '../constants/tags';

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function StatsScreen() {
    const { theme } = useTheme();
    const [notes, setNotes] = useState([]);
    const [diagrams, setDiagrams] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const load = async () => {
                setLoading(true);
                const [n, d] = await Promise.all([
                    notesService.getAll(),
                    diagramService.loadAllDiagrams(),
                ]);
                setNotes(Array.isArray(n) ? n : []);
                setDiagrams(Array.isArray(d) ? d : []);
                setLoading(false);
            };
            load();
        }, [])
    );

    const totalWords = useMemo(() =>
        notes.reduce((sum, n) =>
            sum + (n.content || '').trim().split(/\s+/).filter(w => w.length > 0).length, 0),
        [notes]);

    const pinnedCount = useMemo(() => notes.filter(n => n.pinned).length, [notes]);

    const thisWeekCount = useMemo(() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notes.filter(n => n.createdAt && new Date(n.createdAt) >= weekAgo).length;
    }, [notes]);

    const avgWords = notes.length > 0 ? Math.round(totalWords / notes.length) : 0;

    const tagStats = useMemo(() =>
        PREDEFINED_TAGS
            .map(tag => ({ ...tag, count: notes.filter(n => n.tags?.includes(tag.id)).length }))
            .filter(t => t.count > 0)
            .sort((a, b) => b.count - a.count),
        [notes]);

    const maxTagCount = tagStats.length > 0 ? tagStats[0].count : 1;

    const last7Days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayStr = d.toISOString().split('T')[0];
            return {
                label: DAY_LABELS[d.getDay()],
                count: notes.filter(n => n.createdAt?.startsWith(dayStr)).length,
            };
        });
    }, [notes]);

    const maxDay = Math.max(1, ...last7Days.map(d => d.count));

    const colorStats = useMemo(() =>
        NOTE_TINT_PALETTE
            .filter(t => t.id)
            .map(tint => ({ ...tint, count: notes.filter(n => n.color === tint.id).length }))
            .filter(t => t.count > 0),
        [notes]);

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={theme.primary} />;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>

            {/* RESUMEN */}
            <View style={styles.grid}>
                <Card label="Notas"       value={fmt(notes.length)}  color={theme.primary} theme={theme} />
                <Card label="Palabras"    value={fmt(totalWords)}    color="#3b82f6"       theme={theme} />
                <Card label="Esta semana" value={thisWeekCount}      color="#22c55e"       theme={theme} />
                <Card label="Fijadas"     value={pinnedCount}        color="#f59e0b"       theme={theme} />
                <Card label="Mapas"       value={diagrams.length}    color="#ec4899"       theme={theme} />
                <Card label="Prom/nota"   value={`${avgWords}p`}     color="#06b6d4"       theme={theme} />
            </View>

            {/* ACTIVIDAD 7 DÍAS */}
            <Section title="Actividad — últimos 7 días" theme={theme}>
                <View style={styles.barChart}>
                    {last7Days.map((d, i) => (
                        <View key={i} style={styles.barCol}>
                            {d.count > 0 && (
                                <Text style={[styles.barCount, { color: theme.textDim }]}>{d.count}</Text>
                            )}
                            <View style={[styles.barTrack, { backgroundColor: theme.background }]}>
                                <View style={[
                                    styles.barFill,
                                    {
                                        height: `${(d.count / maxDay) * 100}%`,
                                        backgroundColor: d.count > 0 ? theme.primary : 'transparent',
                                    }
                                ]} />
                            </View>
                            <Text style={[styles.barLabel, { color: theme.textDim }]}>{d.label}</Text>
                        </View>
                    ))}
                </View>
            </Section>

            {/* ETIQUETAS */}
            {tagStats.length > 0 && (
                <Section title="Etiquetas más usadas" theme={theme}>
                    {tagStats.map(tag => (
                        <View key={tag.id} style={styles.tagRow}>
                            <Text style={[styles.tagLabel, { color: tag.color }]}>{tag.label}</Text>
                            <View style={[styles.tagTrack, { backgroundColor: theme.background }]}>
                                <View style={[
                                    styles.tagFill,
                                    { width: `${(tag.count / maxTagCount) * 100}%`, backgroundColor: tag.color }
                                ]} />
                            </View>
                            <Text style={[styles.tagCount, { color: theme.textDim }]}>{tag.count}</Text>
                        </View>
                    ))}
                </Section>
            )}

            {/* COLORES */}
            {colorStats.length > 0 && (
                <Section title="Colores de notas" theme={theme}>
                    <View style={styles.colorRow}>
                        {colorStats.map(tint => (
                            <View key={tint.id} style={styles.colorItem}>
                                <View style={[styles.colorDot, { backgroundColor: tint.dot }]} />
                                <Text style={[styles.colorCount, { color: theme.textDim }]}>{tint.count}</Text>
                            </View>
                        ))}
                    </View>
                </Section>
            )}

            {notes.length === 0 && (
                <Text style={[styles.empty, { color: theme.textDim }]}>
                    Escribe tus primeras notas para ver estadísticas.
                </Text>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function Card({ label, value, color, theme }) {
    return (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardValue, { color }]}>{value}</Text>
            <Text style={[styles.cardLabel, { color: theme.textDim }]}>{label}</Text>
        </View>
    );
}

function Section({ title, theme, children }) {
    return (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>{title.toUpperCase()}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    card: {
        flex: 1, minWidth: '28%', padding: 14,
        borderRadius: 12, borderWidth: 1, alignItems: 'center',
    },
    cardValue: { fontSize: 24, fontWeight: 'bold' },
    cardLabel: { fontSize: 11, marginTop: 3, textAlign: 'center' },
    section: {
        borderRadius: 12, borderWidth: 1,
        padding: 16, marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 10, fontWeight: 'bold',
        marginBottom: 14, letterSpacing: 1,
    },
    barChart: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-end', height: 110,
    },
    barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
    barCount: { fontSize: 10, marginBottom: 3 },
    barTrack: { width: 20, height: 72, borderRadius: 5, overflow: 'hidden', justifyContent: 'flex-end' },
    barFill: { width: '100%', borderRadius: 5 },
    barLabel: { fontSize: 11, marginTop: 5 },
    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    tagLabel: { width: 76, fontSize: 12, fontWeight: '600' },
    tagTrack: { flex: 1, height: 9, borderRadius: 5, overflow: 'hidden', marginHorizontal: 8 },
    tagFill: { height: '100%', borderRadius: 5 },
    tagCount: { width: 22, fontSize: 12, textAlign: 'right' },
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
    colorItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    colorDot: { width: 14, height: 14, borderRadius: 7 },
    colorCount: { fontSize: 13 },
    empty: { textAlign: 'center', marginTop: 60, fontSize: 14 },
});
