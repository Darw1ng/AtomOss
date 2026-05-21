import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Bell, Calendar, Info, ChevronDown, ChevronUp, MapPin } from 'lucide-react-native';
import calendarService from '../api/calendarService'; // Asegúrate de importar el servicio creado anteriormente

// Habilitar animaciones para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const READ_NOTIFICATIONS_KEY = '@atomoss_notifications_read_v1';

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [readIds, setReadIds] = useState([]); // IDs de notificaciones leídas
    const [expandedId, setExpandedId] = useState(null); // ID de la notificación expandida

    // Cargar datos al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            // 1. Cargar IDs leídos desde almacenamiento local
            const storedReadIds = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
            const parsedReadIds = storedReadIds ? JSON.parse(storedReadIds) : [];
            setReadIds(parsedReadIds);

            // 2. Obtener eventos del calendario
            const events = await calendarService.getAll();

            // 3. Transformar eventos a formato de notificación
            const calendarNotifications = events.map(event => ({
                id: event.id,
                type: 'calendar',
                title: `Evento Próximo: ${event.title}`,
                description: event.location ? `Ubicación: ${event.location}` : 'Sin ubicación especificada.',
                time: `Día ${event.date} • ${event.time}`,
                originalDate: event.date // Para ordenar si quisieras
            }));

            // 4. (Opcional) Agregar notificaciones del sistema fijas
            const systemNotifications = [
                {
                    id: 'sys_1',
                    type: 'alert',
                    title: 'Bienvenido a AtomOss',
                    description: 'Explora las nuevas funcionalidades del lienzo mental y el editor de notas.',
                    time: 'Enero 2024',
                    originalDate: '2024-01-01T00:00:00.000Z',
                }
            ];

            // Combinar, ordenar y guardar en estado
            const allNotifications = [...systemNotifications, ...calendarNotifications];
            allNotifications.sort((a, b) => new Date(b.originalDate) - new Date(a.originalDate)); // Ordenar de más nuevo a más antiguo
            setNotifications(allNotifications);

        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        }
    };

    const handleMarkAllRead = async () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(allIds);
        await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(allIds));
    };

    const handlePress = async (id) => {
        // Animación suave
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // 1. Expandir/Colapsar descripción
        setExpandedId(prev => prev === id ? null : id);

        // 2. Marcar como leído si no lo está
        if (!readIds.includes(id)) {
            const newReadIds = [...readIds, id];
            setReadIds(newReadIds);
            await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(newReadIds));
        }
    };

    const getIcon = (type) => {
        if (type === 'calendar') return <Calendar size={20} color="#facc15" />; // Amarillo para calendario
        if (type === 'alert') return <Bell size={20} color="#ef4444" />;      // Rojo para alertas
        return <Info size={20} color="#3b82f6" />;                            // Azul por defecto
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Centro de Notificaciones</Text>
                {notifications.some(n => !readIds.includes(n.id)) && (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text style={[styles.markAllText, { color: theme.primary }]}>Leer todo</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <Text style={{ color: theme.textDim, textAlign: 'center', marginTop: 30 }}>
                        No tienes notificaciones pendientes.
                    </Text>
                }
                renderItem={({ item }) => {
                    const isRead = readIds.includes(item.id);
                    const isExpanded = expandedId === item.id;

                    return (
                        <TouchableOpacity
                            style={[
                                styles.item,
                                { backgroundColor: theme.card, borderColor: theme.border },
                                !isRead && { borderLeftColor: theme.primary, borderLeftWidth: 4 } // Borde izquierdo si está pendiente
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handlePress(item.id)}
                        >
                            <View style={styles.itemHeader}>
                                {/* Icono */}
                                <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                                    {getIcon(item.type)}
                                </View>

                                {/* Texto Principal */}
                                <View style={{ flex: 1 }}>
                                    <Text style={[
                                        styles.title,
                                        { color: theme.text },
                                        !isRead && { fontWeight: 'bold' } // Negrita si está pendiente
                                    ]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.time, { color: theme.textDim }]}>{item.time}</Text>
                                </View>

                                {/* Indicador de estado (Punto o Flecha) */}
                                <View style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
                                    {!isRead && (
                                        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                                    )}
                                    {/* Mostrar flecha si ya se leyó para indicar que se puede abrir */}
                                    {isRead && (
                                        isExpanded
                                            ? <ChevronUp size={16} color={theme.textDim} />
                                            : <ChevronDown size={16} color={theme.textDim} />
                                    )}
                                </View>
                            </View>

                            {/* Descripción Desplegable */}
                            {isExpanded && (
                                <View style={[styles.details, { borderTopColor: theme.border }]}>
                                    <Text style={[styles.description, { color: theme.textDim }]}>
                                        {item.description}
                                    </Text>
                                    {item.type === 'calendar' && (
                                        <TouchableOpacity
                                            style={{flexDirection: 'row', marginTop: 8}}
                                            onPress={() => Alert.alert('Función no disponible', 'La visualización en mapa aún no está implementada.')}
                                        >
                                            <MapPin size={14} color={theme.textDim} style={{marginRight: 4}}/>
                                            <Text style={{color: theme.textDim, fontSize: 12}}>Ver en mapa</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    markAllText: { fontSize: 13, fontWeight: '600' },
    item: {
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    title: { fontSize: 14, marginBottom: 4 },
    time: { fontSize: 12 },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute'
    },
    details: {
        padding: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)' // Sutil diferencia de fondo
    },
    description: {
        fontSize: 13,
        lineHeight: 18
    }
});
