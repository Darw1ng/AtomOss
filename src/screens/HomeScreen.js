import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Share, // <--- Importamos Share
    Alert  // <--- Importamos Alert para confirmaciones
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
    Plus, LayoutGrid, List as ListIcon, Settings, Calendar,
    Newspaper, Bell, X, ChevronRight, Network,
    Share2, Trash2, MoreVertical // <--- Nuevos iconos
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import NoteCard from '../components/NoteCard';
import notesService from '../api/notesService';
import calendarService from '../api/calendarService';

const READ_NOTIFICATIONS_KEY = '@atomoss_notifications_read_v1';

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [menuVisible, setMenuVisible] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- ESTADOS PARA EL MENÚ DE OPCIONES DE NOTA ---
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 15 }}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={{ width: 35, height: 35 }}
                        resizeMode="contain"
                    />
                    {unreadCount > 0 && (
                        <View style={styles.avatarBadge} />
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, unreadCount]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const data = await notesService.getAll();
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) { console.log("Error:", error); }
        finally { setLoading(false); }
    };

    const fetchNotificationsCount = async () => {
        try {
            const storedReadIds = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
            const readIds = storedReadIds ? JSON.parse(storedReadIds) : [];
            const events = await calendarService.getAll();
            const systemIds = ['sys_1'];
            const eventIds = events.map(e => e.id);
            const allIds = [...systemIds, ...eventIds];
            const count = allIds.filter(id => !readIds.includes(id)).length;
            setUnreadCount(count);
        } catch (error) {
            console.error("Error al contar notificaciones:", error);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchNotes();
        fetchNotificationsCount();
    }, []));

    // --- FUNCIONES DE ACCIÓN ---

    const handleOptionsPress = (note) => {
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
            setOptionsVisible(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = () => {
        if (!selectedNote) return;

        Alert.alert(
            "Eliminar Nota",
            "¿Estás seguro de que quieres eliminar esta nota?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        await notesService.delete(selectedNote.id);
                        setOptionsVisible(false);
                        fetchNotes(); // Recargar lista
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
                    // Conectamos los 3 puntitos (tu componente NoteCard usa onLongPress para el botón de menú)
                    onLongPress={() => handleOptionsPress(item)}
                />
            );
        } else {
            return (
                <TouchableOpacity
                    style={[styles.listItem, { borderBottomColor: theme.border }]}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                    // También agregamos long press a la lista para consistencia
                    onLongPress={() => handleOptionsPress(item)}
                >
                    <View style={styles.iconBox}><ListIcon size={18} color={theme.textDim} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.listPreview, { color: theme.textDim }]} numberOfLines={1}>
                            {item.content ? item.content.replace(/[#*`]/g, '') : 'Sin contenido'}
                        </Text>
                    </View>
                    {/* Botón de 3 puntos también en modo lista */}
                    <TouchableOpacity onPress={() => handleOptionsPress(item)} style={{padding: 5}}>
                        <MoreVertical size={16} color={theme.textDim} />
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        }
    };

    const MenuItem = ({ icon: Icon, label, onPress, badge }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}><Icon size={20} color={theme.primary} /></View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>{label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
                <ChevronRight size={16} color={theme.textDim} />
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={[theme.card, theme.background, theme.black]}
            style={styles.container}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        >
            {loading && notes.length === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    key={viewMode}
                    data={notes}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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

            {/* --- MODAL MENÚ PRINCIPAL --- */}
            <Modal animationType="fade" transparent={true} visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <Pressable style={[styles.menuContainer, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => { }}>
                        <View style={[styles.menuHeader, { borderBottomColor: theme.border }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={require('../../assets/icon.png')} style={{ width: 24, height: 24, marginRight: 10, borderRadius: 5 }} />
                                <Text style={[styles.menuTitle, { color: theme.text }]}>AtomOss Menu</Text>
                            </View>
                            <TouchableOpacity onPress={() => setMenuVisible(false)}><X size={24} color={theme.textDim} /></TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                            <MenuItem icon={Network} label="Lienzo Mental" onPress={() => { setMenuVisible(false); navigation.navigate('Canvas'); }} />
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <MenuItem icon={Settings} label="Configuración" onPress={() => { setMenuVisible(false); navigation.navigate('Settings'); }} />
                            <MenuItem icon={Calendar} label="Calendario" onPress={() => { setMenuVisible(false); navigation.navigate('Calendar'); }} />
                            <MenuItem icon={Newspaper} label="Noticias" onPress={() => { setMenuVisible(false); navigation.navigate('News'); }} />
                            <MenuItem icon={Bell} label="Notificaciones" badge={unreadCount} onPress={() => { setMenuVisible(false); navigation.navigate('Notifications'); }} />
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <MenuItem icon={viewMode === 'grid' ? ListIcon : LayoutGrid} label={viewMode === 'grid' ? "Cambiar a Lista" : "Cambiar a Cuadrícula"} onPress={() => { setViewMode(prev => prev === 'grid' ? 'list' : 'grid'); setMenuVisible(false); }} />
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- MODAL OPCIONES DE NOTA (3 PUNTITOS) --- */}
            <Modal animationType="slide" transparent={true} visible={optionsVisible} onRequestClose={() => setOptionsVisible(false)}>
                <Pressable style={styles.centerOverlay} onPress={() => setOptionsVisible(false)}>
                    <View style={[styles.optionsModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.optionsTitle, { color: theme.text }]} numberOfLines={1}>
                            {selectedNote?.title || 'Opciones'}
                        </Text>

                        <TouchableOpacity style={styles.optionItem} onPress={handleShare}>
                            <Share2 size={20} color={theme.primary} />
                            <Text style={[styles.optionText, { color: theme.text }]}>Compartir</Text>
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
                            <Trash2 size={20} color={theme.danger} />
                            <Text style={[styles.optionText, { color: theme.danger }]}>Eliminar</Text>
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity style={styles.optionItem} onPress={() => setOptionsVisible(false)}>
                            <X size={20} color={theme.textDim} />
                            <Text style={[styles.optionText, { color: theme.textDim }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: 10, paddingTop: 20 },
    columnWrapper: { justifyContent: 'flex-start' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 2 },
    iconBox: { marginRight: 12, opacity: 0.7 },
    listTitle: { fontWeight: 'bold', fontSize: 14 },
    listPreview: { fontSize: 12 },
    dateText: { fontSize: 10, marginLeft: 10 },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 50, paddingRight: 10 },
    menuContainer: { width: 250, borderRadius: 12, borderWidth: 1, elevation: 10, overflow: 'hidden', marginTop: 10 },
    menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
    menuTitle: { fontWeight: 'bold', fontSize: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 15 },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIconContainer: { width: 30, alignItems: 'center', marginRight: 10 },
    menuItemText: { fontSize: 14 },
    divider: { height: 1, marginVertical: 5, marginHorizontal: 15 },
    badge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginRight: 8 },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    avatarBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#fff',
        zIndex: 10
    },
    // Nuevos estilos para el modal de opciones (centrado)
    centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    optionsModal: { width: '80%', borderRadius: 15, borderWidth: 1, padding: 5, elevation: 10, overflow: 'hidden' },
    optionsTitle: { textAlign: 'center', padding: 15, fontSize: 16, fontWeight: 'bold', opacity: 0.8 },
    optionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, justifyContent: 'center' },
    optionText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});
