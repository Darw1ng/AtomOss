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
    ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// Importaciones unificadas de iconos
import {
    Plus,
    LayoutGrid,
    List as ListIcon,
    Settings,
    Calendar,
    Newspaper,
    Bell,
    X,
    ChevronRight,
    Network // Icono para el mapa mental
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import NoteCard from '../components/NoteCard';
import notesService from '../api/notesService';
import { theme } from '../theme/colors';

export default function HomeScreen({ navigation }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    // Estado para controlar el menú modal
    const [menuVisible, setMenuVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            // Icono de la App como botón de menú
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={{ marginRight: 15 }}
                >
                    <Image
                        source={require('../../assets/icon.png')}
                        style={{ width: 32, height: 32, borderRadius: 8 }}
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const data = await notesService.getAll();
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { fetchNotes(); }, [])
    );

    // Renderizado de ítems
    const renderItem = ({ item }) => {
        if (viewMode === 'grid') {
            return (
                <NoteCard
                    title={item.title}
                    content={item.content}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                />
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                >
                    <View style={styles.iconBox}>
                        <ListIcon size={18} color={theme.textDim} />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.listPreview} numberOfLines={1}>
                            {item.content ? item.content.replace(/[#*`]/g, '') : 'Sin contenido'}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>Now</Text>
                </TouchableOpacity>
            );
        }
    };

    // Componente reutilizable para opciones del menú
    const MenuItem = ({ icon: Icon, label, onPress, badge }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                    <Icon size={20} color={theme.primary} />
                </View>
                <Text style={styles.menuItemText}>{label}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
                <ChevronRight size={16} color={theme.textDim} />
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={[theme.card, theme.background, '#000000']}
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

            {/* FAB para crear nueva nota */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Detail', { note: null })}
            >
                <Plus color="#000" size={30} />
            </TouchableOpacity>

            {/* --- MODAL DE MENÚ PERSONALIZADO --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>

                    <Pressable style={styles.menuContainer} onPress={() => {}}>

                        <View style={styles.menuHeader}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={{ width: 24, height: 24, marginRight: 10, borderRadius: 5 }}
                                />
                                <Text style={styles.menuTitle}>AtomOss Menu</Text>
                            </View>
                            <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                <X size={24} color={theme.textDim} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{paddingVertical: 10}}>
                            {/* Lienzo Mental (Nueva opción) */}
                            <MenuItem
                                icon={Network}
                                label="Lienzo Mental"
                                onPress={() => { setMenuVisible(false); navigation.navigate('Canvas'); }}
                            />

                            <View style={styles.divider} />

                            {/* Opciones Estándar */}
                            <MenuItem
                                icon={Settings}
                                label="Configuración"
                                onPress={() => { setMenuVisible(false); navigation.navigate('Settings'); }}
                            />
                            <MenuItem
                                icon={Calendar}
                                label="Calendario"
                                onPress={() => { setMenuVisible(false); navigation.navigate('Calendar'); }}
                            />
                            <MenuItem
                                icon={Newspaper}
                                label="Noticias"
                                onPress={() => { setMenuVisible(false); navigation.navigate('News'); }}
                            />
                            <MenuItem
                                icon={Bell}
                                label="Notificaciones"
                                badge="3"
                                onPress={() => { setMenuVisible(false); navigation.navigate('Notifications'); }}
                            />

                            <View style={styles.divider} />

                            {/* Cambio de Vista */}
                            <MenuItem
                                icon={viewMode === 'grid' ? ListIcon : LayoutGrid}
                                label={viewMode === 'grid' ? "Cambiar a Lista" : "Cambiar a Cuadrícula"}
                                onPress={() => {
                                    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
                                    setMenuVisible(false);
                                }}
                            />
                        </ScrollView>

                    </Pressable>
                </Pressable>
            </Modal>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: 10, paddingTop: 20 },
    columnWrapper: { justifyContent: 'flex-start' },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginBottom: 2,
    },
    iconBox: { marginRight: 12, opacity: 0.7 },
    listTitle: { color: theme.text, fontWeight: 'bold', fontSize: 14 },
    listPreview: { color: theme.textDim, fontSize: 12 },
    dateText: { color: theme.textDim, fontSize: 10, marginLeft: 10 },
    fab: {
        position: 'absolute',
        bottom: 30, right: 30,
        backgroundColor: theme.primary,
        width: 60, height: 60,
        borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
        elevation: 5,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    // Estilos del Menú
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 50,
        paddingRight: 10
    },
    menuContainer: {
        width: 250,
        backgroundColor: theme.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        elevation: 10,
        overflow: 'hidden',
        marginTop: 10
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    menuTitle: {
        color: theme.text,
        fontWeight: 'bold',
        fontSize: 16
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 10
    },
    menuItemText: {
        color: theme.text,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 5,
        marginHorizontal: 15
    },
    badge: {
        backgroundColor: theme.danger,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        marginRight: 8
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    }
});
