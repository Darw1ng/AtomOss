import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, TextInput, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2, Search, X, GitFork } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import diagramService from '../api/diagramService';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 30) / 2;

const CARD_COLORS = ['#1c3829', '#1c2638', '#281a38', '#382a14', '#381a1a', '#1a2e30'];

function getCardColor(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

export default function DiagramListScreen({ navigation }) {
    const { theme } = useTheme();
    const [diagrams, setDiagrams] = useState([]);
    const [search, setSearch] = useState('');

    const loadDiagrams = async () => {
        const data = await diagramService.loadAllDiagrams();
        setDiagrams(data);
    };

    useFocusEffect(
        React.useCallback(() => { loadDiagrams(); }, [])
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return diagrams;
        const q = search.toLowerCase();
        return diagrams.filter(d => (d.name || '').toLowerCase().includes(q));
    }, [diagrams, search]);

    const handleCreateNew = () => {
        navigation.navigate('Canvas', { diagramId: `diagram_${Date.now()}`, isNew: true });
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Borrar Mapa Mental',
            `¿Borrar "${name || 'este mapa'}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: async () => {
                        await diagramService.deleteDiagram(id);
                        loadDiagrams();
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const cardColor = getCardColor(item.id);
        const initials = (item.name || 'M').substring(0, 2).toUpperCase();
        const nodeCount = item.nodes ? item.nodes.length : item.elements ? item.elements.length : null;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: cardColor, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Canvas', { diagramId: item.id })}
                activeOpacity={0.8}
            >
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Trash2 size={14} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>

                <View style={styles.cardIcon}>
                    <GitFork size={18} color="rgba(255,255,255,0.3)" />
                </View>

                <View style={styles.cardInitials}>
                    <Text style={styles.initialsText}>{initials}</Text>
                </View>

                <Text style={styles.cardName} numberOfLines={2}>
                    {item.name || `Mapa #${item.id.slice(-4)}`}
                </Text>

                {nodeCount !== null && (
                    <Text style={styles.cardMeta}>{nodeCount} nodo{nodeCount !== 1 ? 's' : ''}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Barra de búsqueda */}
            <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Search size={15} color={theme.textDim} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Buscar mapas..."
                    placeholderTextColor={theme.textDim}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <X size={14} color={theme.textDim} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filtered}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={[styles.newBtn, { backgroundColor: theme.primary }]}
                        onPress={handleCreateNew}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.newBtnText}>Nuevo Mapa Mental</Text>
                    </TouchableOpacity>
                }
                ListEmptyComponent={
                    <Text style={[styles.empty, { color: theme.textDim }]}>
                        {search ? 'Sin resultados' : 'No hay mapas mentales aún'}
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        marginBottom: 4,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: { flex: 1, fontSize: 14, padding: 0 },
    grid: { padding: 10 },
    newBtn: {
        height: 52,
        marginBottom: 10,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    newBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        margin: 5,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        justifyContent: 'flex-end',
        elevation: 3,
        overflow: 'hidden',
    },
    deleteBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
    },
    cardIcon: {
        position: 'absolute',
        top: 14,
        left: 14,
    },
    cardInitials: {
        position: 'absolute',
        top: '25%',
        alignSelf: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        left: CARD_SIZE / 2 - 38,
    },
    initialsText: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 'bold' },
    cardName: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 2 },
    cardMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
    empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
