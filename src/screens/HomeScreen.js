import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Share,
    Alert,
    Dimensions,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { List as ListIcon, MoreVertical, Plus, Search, X, ArrowUpDown, Pin, Sparkles } from 'lucide-react-native';
import { timeAgo } from '../utils/timeAgo';
import { getDailyPrompt } from '../constants/prompts';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useHomeData } from '../hooks/useHomeData';
import notesService from '../api/notesService';
import { PREDEFINED_TAGS, NOTE_TINTS } from '../constants/tags';
import NoteCard from '../components/NoteCard';
import MainMenu from '../components/MainMenu';
import NoteOptionsMenu from '../components/NoteOptionsMenu';

const { width } = Dimensions.get('window');

const SORT_MODES = ['recent', 'oldest', 'az', 'edited'];
const SORT_LABELS = { recent: 'Recientes', oldest: 'Antiguas', az: 'A → Z', edited: 'Editadas' };

export default function HomeScreen({ navigation }) {
    const { theme, mode } = useTheme();
    const { notes, loading, unreadCount, fetchNotes } = useHomeData();

    const [viewMode, setViewMode] = useState('grid');
    const [menuVisible, setMenuVisible] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 10 });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState(null);
    const [sortMode, setSortMode] = useState('recent');
    const [promptDismissed, setPromptDismissed] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotes();
        setRefreshing(false);
    };
    const dailyPrompt = useMemo(() => getDailyPrompt(), []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.headerIcon}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.headerImage}
                        resizeMode="contain"
                    />
                    {unreadCount > 0 && <View style={styles.avatarBadge} />}
                </TouchableOpacity>
            ),
        });
    }, [navigation, unreadCount]);

    const cycleSortMode = () => {
        const idx = SORT_MODES.indexOf(sortMode);
        setSortMode(SORT_MODES[(idx + 1) % SORT_MODES.length]);
    };

    const filteredNotes = useMemo(() => {
        let result = [...notes];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title?.toLowerCase().includes(q) ||
                n.content?.toLowerCase().includes(q)
            );
        }

        if (activeTag) {
            result = result.filter(n => n.tags?.includes(activeTag));
        }

        switch (sortMode) {
            case 'az':
                result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'edited':
                result.sort((a, b) =>
                    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
                );
                break;
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Fijadas siempre al frente, respetando el orden de sort entre sí
        return [
            ...result.filter(n => n.pinned),
            ...result.filter(n => !n.pinned),
        ];
    }, [notes, searchQuery, activeTag, sortMode]);

    const handleOptionsPress = (note, event) => {
        const { pageX, pageY } = event.nativeEvent;
        setMenuPosition({ top: pageY + 10, right: width - pageX - 10 });
        setSelectedNote(note);
        setOptionsVisible(true);
    };

    const handleShare = async () => {
        if (!selectedNote) return;
        try {
            await Share.share({
                message: `${selectedNote.title}\n\n${selectedNote.content}`,
                title: selectedNote.title,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setOptionsVisible(false);
        }
    };

    const handleDelete = () => {
        if (!selectedNote) return;
        Alert.alert(
            'Mover a papelera',
            'Podrás restaurarla desde la papelera dentro de 30 días.',
            [
                { text: 'Cancelar', style: 'cancel', onPress: () => setOptionsVisible(false) },
                {
                    text: 'Mover',
                    style: 'destructive',
                    onPress: async () => {
                        await notesService.delete(selectedNote.id);
                        fetchNotes();
                        setOptionsVisible(false);
                    },
                },
            ]
        );
    };

    const handleExport = async () => {
        if (!selectedNote) return;
        const tagLabels = (selectedNote.tags || [])
            .map(id => PREDEFINED_TAGS.find(t => t.id === id)?.label)
            .filter(Boolean)
            .join(', ');
        const md = [
            `# ${selectedNote.title}`,
            tagLabels ? `\n> Etiquetas: ${tagLabels}` : '',
            `\n${selectedNote.content || ''}`,
            `\n---\n*Creado: ${new Date(selectedNote.createdAt).toLocaleDateString('es-MX')}*`,
        ].join('\n');
        try {
            await Share.share({ message: md, title: selectedNote.title });
        } catch (e) {
            console.error(e);
        }
        setOptionsVisible(false);
    };

    const handleDuplicate = async () => {
        if (!selectedNote) return;
        await notesService.create({
            title: `${selectedNote.title} (copia)`,
            content: selectedNote.content,
            tags: selectedNote.tags || [],
            color: selectedNote.color || null,
        });
        fetchNotes();
        setOptionsVisible(false);
    };

    const handlePin = async () => {
        if (!selectedNote) return;
        await notesService.update(selectedNote.id, { pinned: !selectedNote.pinned });
        fetchNotes();
        setOptionsVisible(false);
    };

    const handleColorChange = async (colorId) => {
        if (!selectedNote) return;
        await notesService.update(selectedNote.id, { color: colorId });
        // Actualiza selectedNote para reflejar el nuevo color sin cerrar el menu
        setSelectedNote(prev => ({ ...prev, color: colorId }));
        fetchNotes();
    };

    const renderItem = ({ item }) => {
        if (viewMode === 'grid') {
            return (
                <NoteCard
                    title={item.title}
                    content={item.content}
                    tags={item.tags}
                    pinned={item.pinned}
                    color={item.color}
                    updatedAt={item.updatedAt}
                    createdAt={item.createdAt}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                    onLongPress={(e) => handleOptionsPress(item, e)}
                />
            );
        }

        const resolvedTags = (item.tags || [])
            .map(id => PREDEFINED_TAGS.find(t => t.id === id))
            .filter(Boolean);

        const rowBg = item.color && NOTE_TINTS[item.color]
            ? NOTE_TINTS[item.color][mode === 'dark' ? 'dark' : 'light'] + 'aa'
            : 'rgba(0,0,0,0.2)';

        return (
            <TouchableOpacity
                style={[styles.listItem, { borderBottomColor: theme.border, backgroundColor: rowBg }]}
                onPress={() => navigation.navigate('Detail', { note: item })}
                onLongPress={(e) => handleOptionsPress(item, e)}
            >
                <View style={styles.iconBox}>
                    {item.pinned
                        ? <Pin size={15} color={theme.primary} fill={theme.primary} />
                        : <ListIcon size={18} color={theme.textDim} />
                    }
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={styles.listMeta}>
                        <Text style={[styles.listPreview, { color: theme.textDim }]} numberOfLines={1}>
                            {item.content ? item.content.replace(/[#*`]/g, '') : 'Sin contenido'}
                        </Text>
                        {resolvedTags.length > 0 && (
                            <View style={styles.listTagsRow}>
                                {resolvedTags.map(tag => (
                                    <View key={tag.id} style={[styles.listTagPill, { backgroundColor: tag.color + '25', borderColor: tag.color }]}>
                                        <Text style={{ color: tag.color, fontSize: 10 }}>{tag.label}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={(e) => handleOptionsPress(item, e)} style={{ padding: 5 }}>
                        <MoreVertical size={16} color={theme.textDim} />
                    </TouchableOpacity>
                    <Text style={{ color: theme.textDim, fontSize: 10, marginRight: 5, opacity: 0.7 }}>
                        {timeAgo(item.updatedAt || item.createdAt)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View style={styles.listHeaderContainer}>
            {!promptDismissed && !searchQuery && !activeTag && (
                <TouchableOpacity
                    style={[styles.promptBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]}
                    onPress={() => navigation.navigate('Detail', { note: null, prefillTitle: dailyPrompt })}
                    activeOpacity={0.7}
                >
                    <Sparkles size={14} color={theme.primary} />
                    <Text style={[styles.promptText, { color: theme.text }]} numberOfLines={2}>
                        {dailyPrompt}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setPromptDismissed(true)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <X size={14} color={theme.textDim} />
                    </TouchableOpacity>
                </TouchableOpacity>
            )}

            {/* Búsqueda + botón de orden */}
            <View style={styles.searchRow}>
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Search size={15} color={theme.textDim} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Buscar notas..."
                        placeholderTextColor={theme.textDim}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <X size={14} color={theme.textDim} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.sortBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={cycleSortMode}
                >
                    <ArrowUpDown size={13} color={theme.primary} />
                    <Text style={[styles.sortLabel, { color: theme.primary }]}>{SORT_LABELS[sortMode]}</Text>
                </TouchableOpacity>
            </View>

            {/* Chips de filtro por tag */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagFilterScroll}
                contentContainerStyle={styles.tagFilterContent}
            >
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        { borderColor: theme.border },
                        activeTag === null && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setActiveTag(null)}
                >
                    <Text style={[styles.filterChipText, { color: activeTag === null ? '#fff' : theme.textDim }]}>
                        Todas
                    </Text>
                </TouchableOpacity>
                {PREDEFINED_TAGS.map(tag => (
                    <TouchableOpacity
                        key={tag.id}
                        style={[
                            styles.filterChip,
                            { borderColor: tag.color },
                            activeTag === tag.id && { backgroundColor: tag.color },
                        ]}
                        onPress={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                    >
                        <View style={[styles.filterDot, { backgroundColor: tag.color, opacity: activeTag === tag.id ? 0 : 1 }]} />
                        <Text style={[styles.filterChipText, { color: activeTag === tag.id ? '#fff' : tag.color }]}>
                            {tag.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {(searchQuery.trim() || activeTag) && (
                <Text style={[styles.resultsCount, { color: theme.textDim }]}>
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'nota' : 'notas'}
                </Text>
            )}
        </View>
    );

    return (
        <LinearGradient
            colors={[theme.card, theme.background, theme.black]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            {loading && notes.length === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : (
                <FlatList
                    key={viewMode}
                    data={filteredNotes}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={viewMode === 'grid' ? 3 : 1}
                    columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={ListHeader}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.textDim }]}>
                            {searchQuery || activeTag ? 'Sin resultados' : 'No hay notas aún'}
                        </Text>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('Detail', { note: null })}
            >
                <Plus color="#fff" size={30} />
            </TouchableOpacity>

            <MainMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                navigation={navigation}
                viewMode={viewMode}
                setViewMode={setViewMode}
                unreadCount={unreadCount}
            />

            <NoteOptionsMenu
                visible={optionsVisible}
                onClose={() => setOptionsVisible(false)}
                onShare={handleShare}
                onDelete={handleDelete}
                onPin={handlePin}
                onDuplicate={handleDuplicate}
                onExport={handleExport}
                onColorChange={handleColorChange}
                isPinned={selectedNote?.pinned}
                noteColor={selectedNote?.color}
                menuPosition={menuPosition}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerIcon: { marginRight: 15 },
    headerImage: { width: 35, height: 35 },
    avatarBadge: {
        position: 'absolute', top: 0, right: 0, width: 10, height: 10,
        borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 1,
        borderColor: '#fff', zIndex: 10,
    },
    loader: { marginTop: 50 },
    listContent: { padding: 10 },
    columnWrapper: { justifyContent: 'flex-start' },
    listHeaderContainer: { marginBottom: 8 },
    promptBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
    },
    promptText: { flex: 1, fontSize: 13, fontStyle: 'italic' },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: { flex: 1, fontSize: 14, padding: 0 },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 4,
    },
    sortLabel: { fontSize: 11, fontWeight: '600' },
    tagFilterScroll: { marginBottom: 4 },
    tagFilterContent: { paddingRight: 10, gap: 6 },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    filterDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    filterChipText: { fontSize: 12, fontWeight: '600' },
    resultsCount: { fontSize: 11, marginTop: 4, marginLeft: 2 },
    listItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderBottomWidth: 1, marginBottom: 2,
    },
    iconBox: { marginRight: 12, opacity: 0.8 },
    listTitle: { fontWeight: 'bold', fontSize: 14 },
    listMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 },
    listPreview: { fontSize: 12 },
    listTagsRow: { flexDirection: 'row', gap: 4 },
    listTagPill: {
        borderRadius: 6,
        borderWidth: 1,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },
    fab: {
        position: 'absolute', bottom: 30, right: 30, width: 60, height: 60,
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 4.65,
    },
});
