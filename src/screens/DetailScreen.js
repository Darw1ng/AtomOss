import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
// 1. Importamos la librería de imágenes
import * as ImagePicker from 'expo-image-picker';
import {
    Save,
    Trash2,
    Bold,
    Italic,
    List,
    Heading,
    Code,
    Quote,
    Image as ImageIcon,
    PenTool
} from 'lucide-react-native';
import notesService from '../api/notesService';
import { theme } from '../theme/colors';

export default function DetailScreen({ route, navigation }) {
    const { note } = route.params;

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);

    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const contentInputRef = useRef(null);

    // Función auxiliar para insertar texto en la posición del cursor
    const insertMarkdown = (prefix, text, suffix = '') => {
        const start = selection.start;
        const end = selection.end;

        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end);
        const selectedText = content.substring(start, end);

        // Si hay texto seleccionado, lo usamos. Si no, usamos el texto pasado como argumento.
        let insertion = '';
        if (selectedText) {
            insertion = `${prefix}${selectedText}${suffix}`;
        } else {
            insertion = `${prefix}${text}${suffix}`;
        }

        let newText = '';
        if (prefix === '- ' || prefix === '# ') {
            newText = `${textBefore}\n${insertion}${textAfter}`;
        } else {
            newText = `${textBefore}${insertion}${textAfter}`;
        }

        setContent(newText);
        // Pequeño delay para asegurar que el teclado no se oculte bruscamente
        setTimeout(() => contentInputRef.current?.focus(), 100);
    };

    // --- 2. NUEVA FUNCIÓN PARA SELECCIONAR IMAGEN ---
    const pickImage = async () => {
        // Pedir permisos (necesario en algunos dispositivos)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para adjuntar fotos.');
            return;
        }

        // Abrir la galería
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
            allowsEditing: true, // Permitir recorte básico
            // aspect: [4, 3], // Opcional: forzar proporción
            quality: 0.8, // Calidad (0 a 1) para optimizar tamaño
        });

        if (!result.canceled) {
            // Obtenemos la URI de la imagen seleccionada
            const imageUri = result.assets[0].uri;

            // Insertamos la sintaxis Markdown con la URI real del dispositivo
            // Formato: ![Imagen](file:///ruta/a/la/imagen.jpg)
            insertMarkdown('![Imagen](', imageUri, ')');
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Error", "La partícula necesita un nombre");

        setSaving(true);
        try {
            if (note) {
                await notesService.update(note.id, { title, content });
            } else {
                await notesService.create({ title, content });
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Fallo en la fusión del núcleo (Error de red)");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert("Desintegrar", "¿Eliminar esta nota?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await notesService.delete(note.id);
                        navigation.goBack();
                    } catch (error) {
                        Alert.alert("Error", "No se pudo eliminar la nota");
                    }
                }
            }
        ]);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Título del Experimento"
                        placeholderTextColor={theme.textDim}
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        ref={contentInputRef}
                        style={styles.contentInput}
                        placeholder="Escribe tus observaciones aquí..."
                        placeholderTextColor={theme.textDim}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
                    />
                </View>

                {/* Barra de Herramientas */}
                <View style={styles.toolbar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('**', 'texto', '**')}>
                            <Bold size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('_', 'texto', '_')}>
                            <Italic size={20} color={theme.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('# ', 'Título', '')}>
                            <Heading size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('- ', 'elemento', '')}>
                            <List size={20} color={theme.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('`', 'código', '`')}>
                            <Code size={20} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('> ', 'cita', '')}>
                            <Quote size={20} color={theme.text} />
                        </TouchableOpacity>

                        {/* 3. CONECTAMOS LA FUNCIÓN AL BOTÓN */}
                        <TouchableOpacity
                            style={styles.toolBtn}
                            onPress={pickImage}
                        >
                            <ImageIcon size={20} color={theme.primary} />
                        </TouchableOpacity>

                        {/* Dibujo (Placeholder por ahora) */}
                        <TouchableOpacity
                            style={styles.toolBtn}
                            onPress={() => insertMarkdown('![drawing](', 'ruta_dibujo', ')')}
                        >
                            <PenTool size={20} color={theme.primary} />
                        </TouchableOpacity>

                    </ScrollView>
                </View>

                <View style={styles.footer}>
                    {note && (
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <Trash2 color={theme.danger} size={24} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Save color="#fff" size={20} style={{marginRight: 8}}/>
                        <Text style={styles.saveText}>{saving ? 'Procesando...' : 'Guardar'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inputContainer: { flex: 1, padding: 20 },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 8
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        color: theme.textDim,
        lineHeight: 24,
    },
    toolbar: {
        flexDirection: 'row',
        backgroundColor: theme.card,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        height: 50,
    },
    toolBtn: {
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 15,
        backgroundColor: theme.background,
    },
    saveBtn: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        marginLeft: 15,
    },
    saveText: { fontWeight: 'bold', color: '#fff' },
    deleteBtn: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 50 }
});
