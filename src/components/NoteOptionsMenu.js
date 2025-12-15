import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const NoteOptionsMenu = ({ visible, onClose, onShare, onDelete, menuPosition }) => {
    const { theme } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <Pressable style={styles.fullScreenOverlay} onPress={onClose}>
                <View style={[
                    styles.popupMenu,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        top: menuPosition.top,
                        right: menuPosition.right
                    }
                ]}>
                    <TouchableOpacity style={styles.popupItem} onPress={onShare}>
                        <Share2 size={18} color={theme.primary} />
                        <Text style={[styles.popupText, { color: theme.text }]}>Compartir</Text>
                    </TouchableOpacity>
                    <View style={[styles.popupDivider, { backgroundColor: theme.border }]} />
                    <TouchableOpacity style={styles.popupItem} onPress={onDelete}>
                        <Trash2 size={18} color={theme.danger} />
                        <Text style={[styles.popupText, { color: theme.danger }]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    popupMenu: {
        position: 'absolute',
        width: 160,
        borderRadius: 12,
        borderTopRightRadius: 2,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingVertical: 5
    },
    popupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15
    },
    popupText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12
    },
    popupDivider: {
        height: 1,
        marginHorizontal: 10,
        opacity: 0.5
    }
});

export default NoteOptionsMenu;
