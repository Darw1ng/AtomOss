import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@atomoss_notes_v1';

// Función auxiliar para simular un pequeño retardo (opcional, da sensación de proceso)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const notesService = {
    // 1. Obtener todas las notas (Local)
    getAll: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            // Si no hay nada guardado aún, devolvemos un array vacío []
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error("Error al leer notas locales:", error);
            return [];
        }
    },

    // 2. Crear una nota nueva (Local)
    create: async (noteData) => {
        try {
            // a. Obtenemos las notas actuales
            const currentNotes = await notesService.getAll();

            // b. Creamos la nueva nota con un ID único (usamos la fecha actual)
            const newNote = {
                id: Date.now().toString(),
                title: noteData.title,
                content: noteData.content,
                createdAt: new Date().toISOString()
            };

            // c. La agregamos al principio de la lista
            const updatedNotes = [newNote, ...currentNotes];

            // d. Guardamos la lista actualizada
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));

            return newNote;
        } catch (error) {
            console.error("Error al guardar nota local:", error);
            throw error;
        }
    },

    // 3. Actualizar una nota existente (Local)
    update: async (id, noteData) => {
        try {
            const currentNotes = await notesService.getAll();

            // Encontramos el índice de la nota a editar
            const noteIndex = currentNotes.findIndex(n => n.id === id);

            if (noteIndex !== -1) {
                // Actualizamos solo los campos necesarios
                const updatedNote = {
                    ...currentNotes[noteIndex],
                    ...noteData,
                    updatedAt: new Date().toISOString()
                };

                // Reemplazamos en el array
                currentNotes[noteIndex] = updatedNote;

                // Guardamos
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentNotes));
                return updatedNote;
            }
            throw new Error('Nota no encontrada');
        } catch (error) {
            console.error("Error al actualizar nota local:", error);
            throw error;
        }
    },

    // 4. Eliminar una nota (Local)
    delete: async (id) => {
        try {
            const currentNotes = await notesService.getAll();

            // Filtramos la nota que queremos borrar
            const filteredNotes = currentNotes.filter(n => n.id !== id);

            // Guardamos la nueva lista
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
            return true;
        } catch (error) {
            console.error("Error al eliminar nota local:", error);
            throw error;
        }
    }
};

export default notesService;
