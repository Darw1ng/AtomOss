import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAGRAMS_STORAGE_KEY = '@atomoss_diagrams_v1';

const diagramService = {
    /**
     * Loads all diagrams from AsyncStorage.
     * @returns {Promise<Array>} A promise that resolves to an array of diagrams.
     */
    async loadAllDiagrams() {
        try {
            const jsonValue = await AsyncStorage.getItem(DIAGRAMS_STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error("Failed to load diagrams.", e);
            return [];
        }
    },

    /**
     * Loads a single diagram by its ID.
     * @param {string} id The ID of the diagram to load.
     * @returns {Promise<Object|null>} The loaded diagram, or null if not found.
     */
    async loadDiagram(id) {
        try {
            const allDiagrams = await this.loadAllDiagrams();
            return allDiagrams.find(d => d.id === id) || null;
        } catch (e) {
            console.error(`Failed to load diagram with id ${id}.`, e);
            return null;
        }
    },

    /**
     * Saves a diagram. If the diagram has an ID, it updates it. Otherwise, it adds it as a new diagram.
     * @param {Object} diagram The diagram to save. It should have an 'id' property.
     * @returns {Promise<void>}
     */
    async saveDiagram(diagram) {
        try {
            const allDiagrams = await this.loadAllDiagrams();
            const index = allDiagrams.findIndex(d => d.id === diagram.id);

            if (index !== -1) {
                // Update existing diagram
                allDiagrams[index] = diagram;
            } else {
                // Add new diagram
                allDiagrams.push(diagram);
            }

            const jsonValue = JSON.stringify(allDiagrams);
            await AsyncStorage.setItem(DIAGRAMS_STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error("Failed to save diagram.", e);
            throw e;
        }
    },

    /**
     * Deletes a diagram by its ID.
     * @param {string} id The ID of the diagram to delete.
     * @returns {Promise<void>}
     */
    async deleteDiagram(id) {
        try {
            const allDiagrams = await this.loadAllDiagrams();
            const filteredDiagrams = allDiagrams.filter(d => d.id !== id);
            const jsonValue = JSON.stringify(filteredDiagrams);
            await AsyncStorage.setItem(DIAGRAMS_STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error(`Failed to delete diagram with id ${id}.`, e);
            throw e;
        }
    },
};

export default diagramService;