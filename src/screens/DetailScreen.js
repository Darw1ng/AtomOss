import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Save, Trash2 } from 'lucide-react-native';
// CAMBIO 1: Importamos notesService en lugar de 'client' directo para mantener consistencia
import notesService from '../api/notesService';
import { theme } from '../theme/colors';

export default function DetailScreen({ route, navigation }) {
    const { note } = route.params;

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Error", "La partícula necesita un nombre");

        setSaving(true);
        try {
            if (note) {
                // ACTUALIZAR (PUT) - Lógica de actualización
                await notesService.update(note.id, { title, content });
                console.log("Nota actualizada correctamente");
            } else {
                // CREAR (POST) - Lógica de creación
                await notesService.create({ title, content });
                console.log("Nota creada correctamente");
            }
            navigation.goBack(); // Volver al inicio y recargar la lista
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Fallo en la fusión del núcleo (Error de red)");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert("Desintegrar", "¿Eliminar esta nota?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        // ELIMINAR (DELETE)
                        await notesService.delete(note.id);
                        navigation.goBack();
                    } catch (error) {
                        Alert.alert("Error", "No se pudo eliminar la nota");
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.titleInput}
                placeholder="Título del Experimento"
                placeholderTextColor={theme.textDim}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.contentInput}
                placeholder="Observaciones..."
                placeholderTextColor={theme.textDim}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
            />

            <View style={styles.footer}>
                {note && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Trash2 color={theme.danger} size={24} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Save color="#fff" size={20} style={{marginRight: 8}}/>
                    <Text style={styles.saveText}>{saving ? 'Procesando...' : 'Guardar'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ... (Los estilos se mantienen igual que en tu archivo original)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 8
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        color: theme.textDim,
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 20,
    },
    saveBtn: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        marginLeft: 15,
    },
    saveText: { fontWeight: 'bold', color: '#fff' },
    deleteBtn: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 50 }
});
