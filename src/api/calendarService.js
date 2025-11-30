import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@atomoss_calendar_events_v1';

const calendarService = {
    // 1. Obtener todos los eventos
    getAll: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error("Error al leer eventos:", error);
            return [];
        }
    },

    // 2. Crear un evento nuevo
    create: async (eventData) => {
        try {
            const currentEvents = await calendarService.getAll();
            const newEvent = {
                id: Date.now().toString(), // ID único basado en fecha
                ...eventData
            };
            const updatedEvents = [...currentEvents, newEvent];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
            return newEvent;
        } catch (error) {
            console.error("Error al guardar evento:", error);
            throw error;
        }
    },

    // 3. Eliminar evento
    delete: async (id) => {
        try {
            const currentEvents = await calendarService.getAll();
            const filteredEvents = currentEvents.filter(e => e.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
            return true;
        } catch (error) {
            console.error("Error al eliminar evento:", error);
            throw error;
        }
    }
};

export default calendarService;
