import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Save, Trash2 } from 'lucide-react-native';
import client from '../api/axiosClient';
import { theme } from '../theme/colors';

export default function DetailScreen({ route, navigation }) {
    // Si viene una nota en los parámetros, es edición. Si no, es creación.
    const { note } = route.params;

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Error", "La partícula necesita un nombre");

        setSaving(true);
        try {
            if (note) {
                // ACTUALIZAR (PUT)
                // await client.put(`/notes/${note.id}`, { title, content });
                console.log("Actualizando...", title);
            } else {
                // CREAR (POST)
                // await client.post('/notes', { title, content });
                console.log("Creando...", title);
            }
            navigation.goBack(); // Volver al inicio
        } catch (error) {
            Alert.alert("Error", "Fallo en la fusión del núcleo");
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
                    // await client.delete(`/notes/${note.id}`);
                    navigation.goBack();
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
