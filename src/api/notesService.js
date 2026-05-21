import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@atomoss_notes_v1';
const TRASH_RETENTION_DAYS = 30;

const readAll = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error("Error al leer notas locales:", error);
        return [];
    }
};

const writeAll = async (notes) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const purgeOldTrash = (notes) => {
    const cutoff = Date.now() - TRASH_RETENTION_DAYS * 86400000;
    return notes.filter(n => {
        if (!n.deleted) return true;
        return new Date(n.deletedAt || 0).getTime() > cutoff;
    });
};

const notesService = {
    getAll: async () => {
        const all = await readAll();
        const pruned = purgeOldTrash(all);
        if (pruned.length !== all.length) await writeAll(pruned);
        return pruned.filter(n => !n.deleted);
    },

    getTrash: async () => {
        const all = await readAll();
        const pruned = purgeOldTrash(all);
        if (pruned.length !== all.length) await writeAll(pruned);
        return pruned
            .filter(n => n.deleted)
            .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    },

    create: async (noteData) => {
        try {
            const currentNotes = await readAll();
            const newNote = {
                id: Date.now().toString(),
                title: noteData.title,
                content: noteData.content,
                tags: noteData.tags || [],
                pinned: noteData.pinned || false,
                color: noteData.color || null,
                createdAt: new Date().toISOString()
            };
            await writeAll([newNote, ...currentNotes]);
            return newNote;
        } catch (error) {
            console.error("Error al guardar nota local:", error);
            throw error;
        }
    },

    update: async (id, noteData) => {
        try {
            const currentNotes = await readAll();
            const noteIndex = currentNotes.findIndex(n => n.id === id);
            if (noteIndex !== -1) {
                const updatedNote = {
                    ...currentNotes[noteIndex],
                    ...noteData,
                    updatedAt: new Date().toISOString()
                };
                currentNotes[noteIndex] = updatedNote;
                await writeAll(currentNotes);
                return updatedNote;
            }
            throw new Error('Nota no encontrada');
        } catch (error) {
            console.error("Error al actualizar nota local:", error);
            throw error;
        }
    },

    // Soft delete: marca la nota como eliminada (queda en papelera)
    delete: async (id) => {
        try {
            const currentNotes = await readAll();
            const idx = currentNotes.findIndex(n => n.id === id);
            if (idx !== -1) {
                currentNotes[idx] = {
                    ...currentNotes[idx],
                    deleted: true,
                    deletedAt: new Date().toISOString(),
                };
                await writeAll(currentNotes);
            }
            return true;
        } catch (error) {
            console.error("Error al mover nota a papelera:", error);
            throw error;
        }
    },

    restore: async (id) => {
        try {
            const currentNotes = await readAll();
            const idx = currentNotes.findIndex(n => n.id === id);
            if (idx !== -1) {
                const { deleted, deletedAt, ...rest } = currentNotes[idx];
                currentNotes[idx] = rest;
                await writeAll(currentNotes);
            }
            return true;
        } catch (error) {
            console.error("Error al restaurar nota:", error);
            throw error;
        }
    },

    permanentDelete: async (id) => {
        try {
            const currentNotes = await readAll();
            await writeAll(currentNotes.filter(n => n.id !== id));
            return true;
        } catch (error) {
            console.error("Error al eliminar nota permanentemente:", error);
            throw error;
        }
    },

    emptyTrash: async () => {
        try {
            const currentNotes = await readAll();
            await writeAll(currentNotes.filter(n => !n.deleted));
            return true;
        } catch (error) {
            console.error("Error al vaciar papelera:", error);
            throw error;
        }
    },
};

export default notesService;
