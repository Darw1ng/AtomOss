import client from './axiosClient';

// Definimos los endpoints para mantener el código ordenado
const ENDPOINTS = {
    NOTES: '/notes', // Esto se suma a la baseURL, resultando en: http://.../api/notes
};

const notesService = {
    // 1. Obtener todas las notas (GET)
    getAll: async () => {
        try {
            const response = await client.get(ENDPOINTS.NOTES);
            return response.data;
        } catch (error) {
            console.error("Error en getAll notes:", error);
            throw error;
        }
    },

    // 2. Crear una nota nueva (POST)
    create: async (noteData) => {
        try {
            const response = await client.post(ENDPOINTS.NOTES, noteData);
            return response.data;
        } catch (error) {
            console.error("Error en create note:", error);
            throw error;
        }
    },

    // 3. Actualizar una nota existente (PUT)
    update: async (id, noteData) => {
        try {
            const response = await client.put(`${ENDPOINTS.NOTES}/${id}`, noteData);
            return response.data;
        } catch (error) {
            console.error("Error en update note:", error);
            throw error;
        }
    },

    // 4. Eliminar una nota (DELETE)
    delete: async (id) => {
        try {
            const response = await client.delete(`${ENDPOINTS.NOTES}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error en delete note:", error);
            throw error;
        }
    }
};

export default notesService;