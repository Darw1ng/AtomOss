import React, { useState, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Alert,
    Share
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, FolderOpen } from 'lucide-react-native';

import NoteCard from '../components/NoteCard';
import notesService from '../api/notesService'; // <--- Importamos el servicio real
import { theme } from '../theme/colors';

export default function HomeScreen({ navigation }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- LOGICA DE CARGA ---
    const fetchNotes = async () => {
        setLoading(true);
        try {
            // Llamada REAL al backend
            const data = await notesService.getAll();

            // Validamos que sea un array para evitar errores
            if (Array.isArray(data)) {
                setNotes(data);
            } else {
                setNotes([]);
            }
        } catch (error) {
            console.log("Error al cargar notas:", error);
            // Opcional: Mostrar un mensaje sutil si falla
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta cada vez que la pantalla recibe el foco (al volver de Detalle)
    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [])
    );

    // --- LOGICA DEL MENU (3 PUNTOS) ---
    const handleOptions = (note) => {
        Alert.alert(
            note.title || "Opciones",
            "¿Qué deseas hacer con esta partícula?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Compartir",
                    onPress: () => shareNote(note)
                },
                {
                    text: "Eliminar",
                    style: 'destructive',
                    onPress: () => deleteNote(note.id)
                }
            ]
        );
    };

    const shareNote = async (note) => {
        try {
            await Share.share({
                message: `${note.title}\n\n${note.content}`,
            });
        } catch (error) {
            // Error silencioso
        }
    };

    const deleteNote = async (id) => {
        try {
            // 1. Borrar en servidor
            await notesService.delete(id);
            // 2. Actualizar lista visualmente (más rápido que recargar todo)
            setNotes(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            Alert.alert("Error", "No se pudo desintegrar la nota.");
        }
    };

    // --- COMPONENTE DE ESTADO VACÍO (MEME) ---
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconBg}>
                <FolderOpen size={60} color={theme.textDim} strokeWidth={1} />
            </View>

            <Text style={styles.memeText}>
                "En términos de notas...{"\n"}no tenemos notas"
            </Text>

            <Text style={styles.subText}>Agrega algunas al núcleo</Text>

            <TouchableOpacity
                style={styles.bigAddBtn}
                onPress={() => navigation.navigate('Detail', { note: null })}
            >
                <Plus color="#fff" size={40} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && notes.length === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={notes}
                    // Aseguramos que key sea string único
                    keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={notes.length === 0 ? styles.listEmpty : styles.listContent}
                    renderItem={({ item }) => (
                        <NoteCard
                            title={item.title}
                            content={item.content}
                            onPress={() => navigation.navigate('Detail', { note: item })}
                            onLongPress={() => handleOptions(item)}
                        />
                    )}
                    ListEmptyComponent={!loading && renderEmptyState}
                />
            )}

            {/* Botón flotante pequeño (solo visible si HAY notas para no tapar el grande) */}
            {notes.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Detail', { note: null })}
                >
                    <Plus color="#000" size={30} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    listContent: { padding: 8, paddingTop: 20 },
    listEmpty: { flexGrow: 1, justifyContent: 'center' },
    columnWrapper: { justifyContent: 'flex-start' },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: -50,
    },
    iconBg: {
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        padding: 20,
        borderRadius: 100,
        marginBottom: 20,
    },
    memeText: {
        color: theme.textDim,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 8,
        opacity: 0.8,
    },
    subText: {
        color: theme.textDim,
        fontSize: 14,
        marginBottom: 30,
        opacity: 0.5,
    },
    bigAddBtn: {
        backgroundColor: theme.primary,
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: theme.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    }
});