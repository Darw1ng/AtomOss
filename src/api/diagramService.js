import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAGRAM_STORAGE_KEY = '@atomoss_diagram_v1';

const diagramService = {
    /**
     * Saves the entire diagram (an array of paths) to AsyncStorage.
     * @param {Array} diagram The diagram data to save.
     * @returns {Promise<void>}
     */
    async saveDiagram(diagram) {
        try {
            const jsonValue = JSON.stringify(diagram);
            await AsyncStorage.setItem(DIAGRAM_STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error("Failed to save diagram.", e);
            throw e; // Or handle it more gracefully
        }
    },

    /**
     * Loads the diagram data from AsyncStorage.
     * @returns {Promise<Array|null>} The loaded diagram data, or null if it doesn't exist.
     */
    async loadDiagram() {
        try {
            const jsonValue = await AsyncStorage.getItem(DIAGRAM_STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error("Failed to load diagram.", e);
            return []; // Return an empty array on error
        }
    },
};

export default diagramService;
