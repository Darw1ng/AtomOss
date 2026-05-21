import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share2, Trash2, Pin, PinOff, X, Copy, FileDown } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { NOTE_TINT_PALETTE } from '../constants/tags';

const NoteOptionsMenu = ({
    visible,
    onClose,
    onShare,
    onDelete,
    onPin,
    onDuplicate,
    onExport,
    onColorChange,
    isPinned = false,
    noteColor = null,
    menuPosition,
}) => {
    const { theme } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="fade"
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={[
                    styles.menu,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        top: menuPosition.top,
                        right: menuPosition.right,
                    }
                ]}>
                    {/* Selector de color */}
                    <View style={[styles.colorRow, { borderBottomColor: theme.border }]}>
                        {NOTE_TINT_PALETTE.map(({ id, dot }) => (
                            <TouchableOpacity
                                key={String(id)}
                                style={[
                                    styles.colorDot,
                                    id
                                        ? { backgroundColor: dot + '40', borderColor: dot }
                                        : { borderColor: theme.textDim, borderStyle: 'dashed' },
                                    noteColor === id && { borderWidth: 2.5 },
                                ]}
                                onPress={() => onColorChange(id)}
                            >
                                {!id && <X size={9} color={theme.textDim} />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Fijar / Desfijar */}
                    <TouchableOpacity style={styles.item} onPress={onPin}>
                        {isPinned
                            ? <PinOff size={17} color={theme.primary} />
                            : <Pin size={17} color={theme.text} />
                        }
                        <Text style={[styles.itemText, { color: isPinned ? theme.primary : theme.text }]}>
                            {isPinned ? 'Desfijar' : 'Fijar'}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.item} onPress={onDuplicate}>
                        <Copy size={17} color={theme.text} />
                        <Text style={[styles.itemText, { color: theme.text }]}>Duplicar</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.item} onPress={onShare}>
                        <Share2 size={17} color={theme.primary} />
                        <Text style={[styles.itemText, { color: theme.text }]}>Compartir</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.item} onPress={onExport}>
                        <FileDown size={17} color={theme.text} />
                        <Text style={[styles.itemText, { color: theme.text }]}>Exportar .md</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.item} onPress={onDelete}>
                        <Trash2 size={17} color={theme.danger} />
                        <Text style={[styles.itemText, { color: theme.danger }]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'transparent' },
    menu: {
        position: 'absolute',
        width: 200,
        borderRadius: 12,
        borderTopRightRadius: 2,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingVertical: 6,
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    colorDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 15,
    },
    itemText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        marginHorizontal: 10,
        opacity: 0.5,
    },
});

export default NoteOptionsMenu;
