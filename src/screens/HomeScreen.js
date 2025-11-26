import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Para recargar al volver
import { Plus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import NoteCard from '../components/NoteCard';
import client from '../api/axiosClient';
import { theme } from '../theme/colors';

export default function HomeScreen({ navigation }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Función para cargar notas
    const fetchNotes = async () => {
        setLoading(true);
        try {
            // DESCOMENTAR CUANDO TENGAS BACKEND:
            // const response = await client.get('/notes');
            // setNotes(response.data);

            // MOCK TEMPORAL (Borrar esto luego):
            setTimeout(() => {
                setNotes([{ id: '1', title: 'Prueba AtomOss', content: 'Si ves esto, la UI funciona.' }]);
            }, 500);

        } catch (error) {
            console.error("Error fetching notes:", error);
            alert("No se pudo conectar al núcleo (Backend Error)");
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta cada vez que entras a la pantalla
    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [])
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NoteCard
                            title={item.title}
                            content={item.content}
                            onPress={() => navigation.navigate('Detail', { note: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay partículas (notas) aún.</Text>
                    }
                />
            )}

            {/* Botón Flotante (FAB) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Detail', { note: null })}
            >
                <Plus color="#000" size={30} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    list: { padding: 20 },
    emptyText: { color: theme.textDim, textAlign: 'center', marginTop: 50 },
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
        elevation: 5, // Sombra en Android
        shadowColor: theme.primary, // Sombra en iOS
        shadowOpacity: 0.5,
        shadowRadius: 10,
    }
});
