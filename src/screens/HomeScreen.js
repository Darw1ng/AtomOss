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
import { Plus, FolderOpen } from 'lucide-react-native'; // Asegúrate de tener lucide instalado

import NoteCard from '../components/NoteCard';
import client from '../api/axiosClient';
import { theme } from '../theme/colors';

export default function HomeScreen({ navigation }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- LOGICA DE CARGA ---
    const fetchNotes = async () => {
        setLoading(true);
        try {
            // BACKEND REAL:
            // const response = await client.get('/notes');
            // setNotes(response.data);

            // MOCK TEMPORAL (Vacío para probar tu diseño):
            // Cambia esto a [] para ver el mensaje de "no tenemos notas"
            // O pon datos para ver la cuadrícula
            setTimeout(() => {
                // Simulo vacío o datos aleatorios para probar
                setNotes([]);

                // Descomenta esto para ver la cuadrícula llena:
                /*
                setNotes([
                  { id: '1', title: 'Idea App', content: 'React Native con Expo' },
                  { id: '2', title: 'Compras', content: 'Leche, Pan, Uranio' },
                  { id: '3', title: 'Gym', content: 'Día de pierna' },
                  { id: '4', title: 'Contraseña', content: '1234... no, espera' },
                ]);
                */
            }, 500);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
            alert(error.message);
        }
    };

    const deleteNote = async (id) => {
        // Aquí iría tu llamada al backend: await client.delete(`/notes/${id}`);
        // Simulamos borrado local:
        setNotes(prev => prev.filter(n => n.id !== id));
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
            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3} // <-- LA MAGIA DE LA CUADRÍCULA
                    columnWrapperStyle={styles.columnWrapper} // Estilo para las filas
                    contentContainerStyle={notes.length === 0 ? styles.listEmpty : styles.listContent}
                    renderItem={({ item }) => (
                        <NoteCard
                            title={item.title}
                            content={item.content}
                            onPress={() => navigation.navigate('Detail', { note: item })}
                            onLongPress={() => handleOptions(item)} // 3 puntos acción
                        />
                    )}
                    ListEmptyComponent={renderEmptyState}
                />
            )}

            {/* Botón flotante pequeño (solo visible si HAY notas) */}
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
    listEmpty: { flexGrow: 1, justifyContent: 'center' }, // Centra el contenido vacío
    columnWrapper: { justifyContent: 'flex-start' }, // Alineación de la cuadrícula

    // Estilos del Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: -50, // Pequeño ajuste visual
    },
    iconBg: {
        backgroundColor: 'rgba(148, 163, 184, 0.1)', // Gris translúcido
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

    // FAB pequeño original
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