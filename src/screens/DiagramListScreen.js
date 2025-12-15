import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import diagramService from '../api/diagramService';
import { Plus, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function DiagramListScreen({ navigation }) {
    const { theme } = useTheme();
    const [diagrams, setDiagrams] = useState([]);

    const loadDiagrams = async () => {
        const data = await diagramService.loadAllDiagrams();
        setDiagrams(data);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadDiagrams();
        }, [])
    );

    const handleCreateNew = () => {
        const newDiagramId = `diagram_${Date.now()}`;
        navigation.navigate('Canvas', { diagramId: newDiagramId, isNew: true });
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Borrar Mapa Mental",
            "¿Estás seguro de que quieres borrar este mapa mental? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Borrar",
                    style: "destructive",
                    onPress: async () => {
                        await diagramService.deleteDiagram(id);
                        loadDiagrams();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.itemContainer, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('Canvas', { diagramId: item.id })}
        >
            <Text style={[styles.itemText, { color: theme.text }]}>{item.name || `Mapa Mental #${item.id}`}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Trash2 size={20} color={theme.danger} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={diagrams}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                ListHeaderComponent={
                    <TouchableOpacity 
                        style={[styles.itemContainer, styles.addButton, { backgroundColor: theme.primary }]}
                        onPress={handleCreateNew}
                    >
                        <Plus size={40} color="white" />
                        <Text style={styles.addButtonText}>Nuevo Mapa</Text>
                    </TouchableOpacity>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    grid: {
        padding: 10,
    },
    itemContainer: {
        flex: 1,
        margin: 5,
        borderRadius: 10,
        padding: 15,
        aspectRatio: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
    },
    itemText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addButton: {
        justifyContent: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    }
});
