import React, { useState, useLayoutEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Image,
    Share,
    Alert,
    Dimensions
} from 'react-native';
import { List as ListIcon, MoreVertical, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useHomeData } from '../hooks/useHomeData';
import notesService from '../api/notesService';
import NoteCard from '../components/NoteCard';
import MainMenu from '../components/MainMenu';
import NoteOptionsMenu from '../components/NoteOptionsMenu';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { notes, loading, unreadCount, fetchNotes } = useHomeData();

    const [viewMode, setViewMode] = useState('grid');
    const [menuVisible, setMenuVisible] = useState(false);
    
    // --- State for Note Options Menu ---
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 10 });

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

    const handleOptionsPress = (note, event) => {
        const { pageX, pageY } = event.nativeEvent;
        const positionFromRight = width - pageX - 10;
        setMenuPosition({ top: pageY + 10, right: positionFromRight });
        setSelectedNote(note);
        setOptionsVisible(true);
    };

    const handleShare = async () => {
        if (!selectedNote) return;
        try {
            await Share.share({
                message: `${selectedNote.title}\n\n${selectedNote.content}`,
                title: selectedNote.title
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
            "Eliminar Nota",
            "¿Estás seguro de que quieres eliminar esta nota?",
            [
                { text: "Cancelar", style: "cancel", onPress: () => setOptionsVisible(false) },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        await notesService.delete(selectedNote.id);
                        fetchNotes(); // Refresh notes
                        setOptionsVisible(false);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        if (viewMode === 'grid') {
            return (
                <NoteCard
                    title={item.title}
                    content={item.content}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                    onLongPress={(e) => handleOptionsPress(item, e)}
                />
            );
        }
        return (
            <TouchableOpacity
                style={[styles.listItem, { borderBottomColor: theme.border }]}
                onPress={() => navigation.navigate('Detail', { note: item })}
                onLongPress={(e) => handleOptionsPress(item, e)}
            >
                <View style={styles.iconBox}><ListIcon size={18} color={theme.textDim} /></View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.listPreview, { color: theme.textDim }]} numberOfLines={1}>
                        {item.content ? item.content.replace(/[#*`]/g, '') : 'Sin contenido'}
                    </Text>
                </View>
                <TouchableOpacity onPress={(e) => handleOptionsPress(item, e)} style={{ padding: 5 }}>
                    <MoreVertical size={16} color={theme.textDim} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient
            colors={[theme.card, theme.background, theme.black]}
            style={styles.container}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        >
            {loading && notes.length === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : (
                <FlatList
                    key={viewMode}
                    data={notes}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={viewMode === 'grid' ? 3 : 1}
                    columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
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
        borderColor: '#fff', zIndex: 10
    },
    loader: { marginTop: 50 },
    listContent: { padding: 10, paddingTop: 20 },
    columnWrapper: { justifyContent: 'flex-start' },
    listItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderBottomWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 2
    },
    iconBox: { marginRight: 12, opacity: 0.7 },
    listTitle: { fontWeight: 'bold', fontSize: 14 },
    listPreview: { fontSize: 12 },
    fab: {
        position: 'absolute', bottom: 30, right: 30, width: 60, height: 60,
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 4.65
    },
});
