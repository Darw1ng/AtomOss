import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronRight, ChevronDown, Folder, FileText, Settings, Database } from 'lucide-react-native';
import { theme } from '../theme/colors';

// Datos simulados de estructura (luego vendrán del backend)
const MOCK_STRUCTURE = [
    { id: '1', name: 'Personal Backup', type: 'folder', children: [
            { id: '11', name: 'Assets', type: 'folder', children: [] },
            { id: '12', name: 'Templates', type: 'folder', children: [] }
        ]},
    { id: '2', name: 'Computer Science', type: 'folder', children: [] },
    { id: '3', name: 'Hacking', type: 'folder', children: [
            { id: '31', name: 'Ethical Hacking 101', type: 'note' },
            { id: '32', name: 'Canvas Hacking', type: 'canvas' }
        ]},
    { id: '4', name: 'Journal', type: 'folder', children: [] },
    { id: '5', name: 'My Second Brain', type: 'canvas' },
];

const FileItem = ({ item, level = 0, onPress }) => {
    const [expanded, setExpanded] = useState(false);
    const isFolder = item.type === 'folder';

    const handlePress = () => {
        if (isFolder) {
            setExpanded(!expanded);
        } else {
            onPress(item);
        }
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.itemRow, { paddingLeft: 20 + (level * 15) }]}
                onPress={handlePress}
            >
                {/* Icono de Flecha (solo carpetas) */}
                <View style={{ width: 20 }}>
                    {isFolder && (
                        expanded ?
                            <ChevronDown size={14} color={theme.textDim} /> :
                            <ChevronRight size={14} color={theme.textDim} />
                    )}
                </View>

                {/* Icono del Tipo */}
                <View style={{ marginRight: 8 }}>
                    {item.type === 'folder' && <Folder size={16} color={theme.secondary} />}
                    {item.type === 'note' && <FileText size={16} color={theme.textDim} />}
                    {item.type === 'canvas' && <Database size={16} color={theme.primary} />}
                </View>

                <Text style={[styles.itemText, item.type === 'canvas' && {color: theme.primary}]}>
                    {item.name}
                </Text>

                {item.type === 'canvas' && (
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>CANVAS</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Renderizado recursivo de hijos */}
            {isFolder && expanded && item.children && (
                <View>
                    {item.children.map(child => (
                        <FileItem key={child.id} item={child} level={level + 1} onPress={onPress} />
                    ))}
                </View>
            )}
        </View>
    );
};

export default function FileSidebar({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explorador</Text>
                <Settings size={18} color={theme.textDim} />
            </View>

            <ScrollView style={styles.scroll}>
                {MOCK_STRUCTURE.map(item => (
                    <FileItem
                        key={item.id}
                        item={item}
                        onPress={(note) => {
                            // Navegar a la nota o filtrar la lista principal
                            navigation.navigate('Home');
                            console.log("Filtrar por:", note.name);
                        }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d1117', paddingTop: 50 }, // Fondo muy oscuro (tipo VSCode)
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
    },
    headerTitle: { color: theme.text, fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
    scroll: { flex: 1, marginTop: 10 },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingRight: 10,
    },
    itemText: { color: theme.textDim, fontSize: 14 },
    tagBadge: {
        backgroundColor: theme.border,
        paddingHorizontal: 4,
        borderRadius: 4,
        marginLeft: 'auto',
        transform: [{scale: 0.8}]
    },
    tagText: { color: theme.primary, fontSize: 10, fontWeight: 'bold' }
});
