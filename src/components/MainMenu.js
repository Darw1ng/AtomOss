import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import {
    LayoutGrid, List as ListIcon, Settings, Calendar,
    Newspaper, Bell, X, ChevronRight, Network, BarChart2
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const MenuItem = ({ icon: Icon, label, onPress, badge, theme }) => (
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

const MainMenu = ({ visible, onClose, navigation, viewMode, setViewMode, unreadCount }) => {
    const { theme } = useTheme();

    const navigateAndClose = (screen) => {
        onClose();
        navigation.navigate(screen);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={[styles.menuContainer, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => {}}>
                    <View style={[styles.menuHeader, { borderBottomColor: theme.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/icon.png')} style={styles.menuIcon} />
                            <Text style={[styles.menuTitle, { color: theme.text }]}>AtomOss Menu</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}><X size={24} color={theme.textDim} /></TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                        <MenuItem theme={theme} icon={Network} label="Lienzo Mental" onPress={() => navigateAndClose('DiagramList')} />
                        <MenuItem theme={theme} icon={BarChart2} label="Estadísticas" onPress={() => navigateAndClose('Stats')} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <MenuItem theme={theme} icon={Settings} label="Configuración" onPress={() => navigateAndClose('Settings')} />
                        <MenuItem theme={theme} icon={Calendar} label="Calendario" onPress={() => navigateAndClose('Calendar')} />
                        <MenuItem theme={theme} icon={Newspaper} label="Noticias" onPress={() => navigateAndClose('News')} />
                        <MenuItem theme={theme} icon={Bell} label="Notificaciones" badge={unreadCount} onPress={() => navigateAndClose('Notifications')} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <MenuItem
                            theme={theme}
                            icon={viewMode === 'grid' ? ListIcon : LayoutGrid}
                            label={viewMode === 'grid' ? "Cambiar a Lista" : "Cambiar a Cuadrícula"}
                            onPress={() => {
                                setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
                                onClose();
                            }}
                        />
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 50,
        paddingRight: 10,
    },
    menuContainer: {
        width: 250,
        borderRadius: 12,
        borderWidth: 1,
        elevation: 10,
        overflow: 'hidden',
        marginTop: 10,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    menuTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    menuIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        borderRadius: 5,
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
        marginRight: 10,
    },
    menuItemText: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginVertical: 5,
        marginHorizontal: 15,
    },
    badge: {
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        marginRight: 8,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default MainMenu;
