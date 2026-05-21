import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2, RotateCcw, Trash } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import notesService from '../api/notesService';
import { timeAgo } from '../utils/timeAgo';

export default function TrashScreen() {
    const { theme } = useTheme();
    const [trash, setTrash] = useState([]);

    const load = async () => {
        const data = await notesService.getTrash();
        setTrash(data);
    };

    useFocusEffect(useCallback(() => { load(); }, []));

    const handleRestore = async (id) => {
        await notesService.restore(id);
        load();
    };

    const handlePermanentDelete = (note) => {
        Alert.alert(
            'Eliminar permanentemente',
            `"${note.title || 'Sin título'}" se eliminará para siempre.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await notesService.permanentDelete(note.id);
                        load();
                    },
                },
            ]
        );
    };

    const handleEmptyTrash = () => {
        if (trash.length === 0) return;
        Alert.alert(
            'Vaciar papelera',
            `${trash.length} ${trash.length === 1 ? 'nota se eliminará' : 'notas se eliminarán'} permanentemente.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Vaciar',
                    style: 'destructive',
                    onPress: async () => {
                        await notesService.emptyTrash();
                        load();
                    },
                },
            ]
        );
    };

    const daysLeft = (deletedAt) => {
        if (!deletedAt) return 30;
        const elapsed = Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000);
        return Math.max(0, 30 - elapsed);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.subtitle, { color: theme.textDim }]}>
                    {trash.length === 0
                        ? 'La papelera está vacía'
                        : `${trash.length} ${trash.length === 1 ? 'nota' : 'notas'} · se borran tras 30 días`}
                </Text>
                {trash.length > 0 && (
                    <TouchableOpacity onPress={handleEmptyTrash} style={styles.emptyBtn}>
                        <Trash size={14} color={theme.danger} />
                        <Text style={[styles.emptyBtnText, { color: theme.danger }]}>Vaciar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={trash}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={
                    <Text style={[styles.empty, { color: theme.textDim }]}>
                        Las notas eliminadas aparecerán aquí. {'\n'}Tienes 30 días para restaurarlas.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                                {item.title || 'Sin título'}
                            </Text>
                            {item.content ? (
                                <Text style={[styles.itemPreview, { color: theme.textDim }]} numberOfLines={1}>
                                    {item.content.replace(/[#*`]/g, '')}
                                </Text>
                            ) : null}
                            <Text style={[styles.itemMeta, { color: theme.textDim }]}>
                                Eliminada {timeAgo(item.deletedAt)} · {daysLeft(item.deletedAt)} días restantes
                            </Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: theme.primary + '20' }]}
                                onPress={() => handleRestore(item.id)}
                            >
                                <RotateCcw size={16} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: theme.danger + '20' }]}
                                onPress={() => handlePermanentDelete(item)}
                            >
                                <Trash2 size={16} color={theme.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    },
    subtitle: { fontSize: 12, flex: 1 },
    emptyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    },
    emptyBtnText: { fontSize: 12, fontWeight: '600' },
    item: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 10, borderWidth: 1,
        padding: 12, marginBottom: 8,
    },
    itemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    itemPreview: { fontSize: 12, marginBottom: 4 },
    itemMeta: { fontSize: 10, opacity: 0.8 },
    actions: { flexDirection: 'row', gap: 6, marginLeft: 10 },
    iconBtn: {
        width: 34, height: 34, borderRadius: 17,
        justifyContent: 'center', alignItems: 'center',
    },
    empty: { textAlign: 'center', marginTop: 60, fontSize: 13, lineHeight: 20 },
});
