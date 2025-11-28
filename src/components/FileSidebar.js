import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronRight, ChevronDown, Folder, FileText, Settings, Database } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext'; // <--- Usar el Hook

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
    const { theme } = useTheme(); // Obtener tema
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
                <View style={{ width: 20 }}>
                    {isFolder && (
                        expanded ?
                            <ChevronDown size={14} color={theme.textDim} /> :
                            <ChevronRight size={14} color={theme.textDim} />
                    )}
                </View>

                <View style={{ marginRight: 8 }}>
                    {item.type === 'folder' && <Folder size={16} color={theme.secondary} />}
                    {item.type === 'note' && <FileText size={16} color={theme.textDim} />}
                    {item.type === 'canvas' && <Database size={16} color={theme.primary} />}
                </View>

                <Text style={[styles.itemText, { color: item.type === 'canvas' ? theme.primary : theme.textDim }]}>
                    {item.name}
                </Text>

                {item.type === 'canvas' && (
                    <View style={[styles.tagBadge, { backgroundColor: theme.border }]}>
                        <Text style={[styles.tagText, { color: theme.primary }]}>CANVAS</Text>
                    </View>
                )}
            </TouchableOpacity>

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
    const { theme } = useTheme(); // Obtener tema

    return (
        // Fondo dinámico
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Explorador</Text>
                <Settings size={18} color={theme.textDim} />
            </View>

            <ScrollView style={styles.scroll}>
                {MOCK_STRUCTURE.map(item => (
                    <FileItem
                        key={item.id}
                        item={item}
                        onPress={(note) => {
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
    container: { flex: 1, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
    headerTitle: { fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
    scroll: { flex: 1, marginTop: 10 },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingRight: 10 },
    itemText: { fontSize: 14 },
    tagBadge: { paddingHorizontal: 4, borderRadius: 4, marginLeft: 'auto', transform: [{ scale: 0.8 }] },
    tagText: { fontSize: 10, fontWeight: 'bold' }
});
