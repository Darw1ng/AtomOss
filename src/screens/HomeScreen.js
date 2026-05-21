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
} from 'react-native';
import { List as ListIcon, MoreVertical, Plus, Search, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useHomeData } from '../hooks/useHomeData';
import notesService from '../api/notesService';
import { PREDEFINED_TAGS } from '../constants/tags';
import NoteCard from '../components/NoteCard';
import MainMenu from '../components/MainMenu';
import NoteOptionsMenu from '../components/NoteOptionsMenu';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { notes, loading, unreadCount, fetchNotes } = useHomeData();

    const [viewMode, setViewMode] = useState('grid');
    const [menuVisible, setMenuVisible] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 10 });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState(null);

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

    const filteredNotes = useMemo(() => {
        let result = notes;
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
        return result;
    }, [notes, searchQuery, activeTag]);

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
            'Eliminar Nota',
            '¿Estás seguro de que quieres eliminar esta nota?',
            [
                { text: 'Cancelar', style: 'cancel', onPress: () => setOptionsVisible(false) },
                {
                    text: 'Eliminar',
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

    const renderItem = ({ item }) => {
        if (viewMode === 'grid') {
            return (
                <NoteCard
                    title={item.title}
                    content={item.content}
                    tags={item.tags}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                    onLongPress={(e) => handleOptionsPress(item, e)}
                />
            );
        }

        const resolvedTags = (item.tags || [])
            .map(id => PREDEFINED_TAGS.find(t => t.id === id))
            .filter(Boolean);

        return (
            <TouchableOpacity
                style={[styles.listItem, { borderBottomColor: theme.border }]}
                onPress={() => navigation.navigate('Detail', { note: item })}
                onLongPress={(e) => handleOptionsPress(item, e)}
            >
                <View style={styles.iconBox}>
                    <ListIcon size={18} color={theme.textDim} />
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
                <TouchableOpacity onPress={(e) => handleOptionsPress(item, e)} style={{ padding: 5 }}>
                    <MoreVertical size={16} color={theme.textDim} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View style={styles.listHeaderContainer}>
            {/* Barra de búsqueda */}
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

            {/* Contador de resultados si hay búsqueda activa */}
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    searchInput: { flex: 1, fontSize: 14, padding: 0 },
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
        borderBottomWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 2,
    },
    iconBox: { marginRight: 12, opacity: 0.7 },
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
