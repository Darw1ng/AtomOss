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
    ScrollView,
    Keyboard
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display'; // Importamos el renderizador
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
    PenTool,
    Wrench, // Icono para herramientas
    Eye,    // Icono para ver
    EyeOff, // Icono para editar
    X       // Icono para cerrar menú
} from 'lucide-react-native';
import notesService from '../api/notesService';
import { theme } from '../theme/colors';

export default function DetailScreen({ route, navigation }) {
    const { note } = route.params;

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);

    // Estados nuevos
    const [isPreview, setIsPreview] = useState(false); // Modo vista previa
    const [showToolbar, setShowToolbar] = useState(false); // Mostrar/Ocultar barra
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    const contentInputRef = useRef(null);

    // --- CORRECCIÓN DE LA LÓGICA DE INSERCIÓN ---
    const insertMarkdown = (prefix, suffix = '') => {
        // Obtenemos inicio y fin de la selección actual
        const { start, end } = selection;

        // Partimos el texto actual en 3 partes
        const textBefore = content.substring(0, start);
        const textSelected = content.substring(start, end);
        const textAfter = content.substring(end);

        let newText = '';
        let newCursorPos = 0;

        // Lógica específica para bloques que requieren nueva línea (como listas o títulos)
        const isBlockElement = prefix === '- ' || prefix === '# ' || prefix === '> ';

        if (isBlockElement) {
            // Si es un bloque, aseguramos que esté en una línea nueva si no estamos al inicio
            const needsNewLine = start > 0 && content[start - 1] !== '\n';
            const extraBreak = needsNewLine ? '\n' : '';

            newText = `${textBefore}${extraBreak}${prefix}${textSelected}${suffix}${textAfter}`;
            // Mover el cursor al final de la inserción
            newCursorPos = start + extraBreak.length + prefix.length + textSelected.length + suffix.length;
        } else {
            // Inserción inline (negrita, cursiva, código)
            newText = `${textBefore}${prefix}${textSelected}${suffix}${textAfter}`;
            // Si hay texto seleccionado, envolvemos. Si no, ponemos el cursor en medio.
            if (textSelected.length > 0) {
                newCursorPos = start + prefix.length + textSelected.length + suffix.length;
            } else {
                newCursorPos = start + prefix.length;
            }
        }

        setContent(newText);

        // Enfocamos y actualizamos la posición del cursor (necesario en RN)
        setTimeout(() => {
            contentInputRef.current?.focus();
            // Nota: En RN cambiar la selección programáticamente a veces requiere un pequeño hack o re-render,
            // pero al escribir el texto el cursor suele irse al final.
        }, 50);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            // Insertar imagen en la posición del cursor
            insertMarkdown('![Imagen](' + imageUri + ')', '');
            setShowToolbar(false); // Ocultar barra tras insertar
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
            Alert.alert("Error", "Fallo de conexión");
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
                        Alert.alert("Error", "No se pudo eliminar");
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

                {/* Cabecera de Inputs */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Título del Experimento"
                        placeholderTextColor={theme.textDim}
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* VISTA PREVIA vs EDITOR */}
                    {isPreview ? (
                        <ScrollView style={styles.previewContainer}>
                            <Markdown style={markdownStyles}>
                                {content || '*Nada por aquí...*'}
                            </Markdown>
                        </ScrollView>
                    ) : (
                        <TextInput
                            ref={contentInputRef}
                            style={styles.contentInput}
                            placeholder="Escribe tus observaciones aquí..."
                            placeholderTextColor={theme.textDim}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                            // IMPORTANTE: Rastreamos la selección
                            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
                        />
                    )}
                </View>

                {/* --- BARRA DE HERRAMIENTAS FLOTANTE --- */}

                {/* 1. Barra Expandida (Horizontal scroll) */}
                {showToolbar && !isPreview && (
                    <View style={styles.toolbarContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('**', '**')}>
                                <Bold size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('_', '_')}>
                                <Italic size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('# ')}>
                                <Heading size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('- ')}>
                                <List size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('`', '`')}>
                                <Code size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('> ')}>
                                <Quote size={20} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
                                <ImageIcon size={20} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('```\n', '\n```')}>
                                <PenTool size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </ScrollView>
                        {/* Botón X pequeña para cerrar barra */}
                        <TouchableOpacity style={styles.closeBarBtn} onPress={() => setShowToolbar(false)}>
                            <X size={16} color={theme.textDim} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* 2. Área de Botones Flotantes Inferiores */}
                <View style={styles.footer}>

                    {/* Botón Izquierda: Herramientas */}
                    <View style={styles.leftTools}>
                        {!isPreview && (
                            <TouchableOpacity
                                style={[styles.roundBtn, showToolbar && styles.activeBtn]}
                                onPress={() => {
                                    setShowToolbar(!showToolbar);
                                    if(!showToolbar) setTimeout(()=> contentInputRef.current?.focus(), 100);
                                }}
                            >
                                <Wrench color={showToolbar ? theme.background : theme.text} size={22} />
                            </TouchableOpacity>
                        )}

                        {/* Botón Ojo: Toggle Preview */}
                        <TouchableOpacity
                            style={[styles.roundBtn, { marginLeft: 10 }]}
                            onPress={() => {
                                setIsPreview(!isPreview);
                                setShowToolbar(false); // Cerrar herramientas al ver preview
                                Keyboard.dismiss();
                            }}
                        >
                            {isPreview ? (
                                <EyeOff color={theme.text} size={22} />
                            ) : (
                                <Eye color={theme.text} size={22} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Botones Derecha: Guardar/Borrar */}
                    <View style={styles.rightTools}>
                        {note && (
                            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                <Trash2 color={theme.danger} size={22} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Save color="#fff" size={20} style={{marginRight: 8}}/>
                            <Text style={styles.saveText}>{saving ? '...' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// Estilos de Markdown Display (Personalización básica)
const markdownStyles = StyleSheet.create({
    body: { color: theme.textDim, fontSize: 16 },
    heading1: { color: theme.primary, fontWeight: 'bold', marginVertical: 10 },
    heading2: { color: theme.text, fontWeight: 'bold', marginTop: 10 },
    code_inline: { backgroundColor: '#333', color: '#ff79c6', borderRadius: 4 },
    fence: { backgroundColor: '#1e1e1e', color: '#f8f8f2', padding: 10, borderRadius: 8 },
    list_item: { color: theme.textDim, marginVertical: 2 },
    blockquote: { backgroundColor: '#22452E', borderLeftColor: theme.primary, borderLeftWidth: 4, paddingHorizontal: 10, paddingVertical: 4 },
    image: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' }
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inputContainer: { flex: 1, padding: 20 },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 8
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        color: theme.textDim,
        lineHeight: 24,
        paddingBottom: 80, // Espacio para que el texto no quede tapado por la barra
    },
    previewContainer: {
        flex: 1,
        marginBottom: 80,
    },

    // Barra de herramientas expandible (aparece sobre el teclado/footer)
    toolbarContainer: {
        position: 'absolute',
        bottom: 80, // Justo encima del footer
        left: 20,
        right: 20,
        backgroundColor: theme.card,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.border,
        zIndex: 100,
    },
    toolbarScroll: {
        alignItems: 'center',
        paddingRight: 10
    },
    toolBtn: {
        padding: 10,
        marginHorizontal: 2,
    },
    closeBarBtn: {
        padding: 5,
        borderLeftWidth: 1,
        borderLeftColor: theme.border,
        marginLeft: 5
    },

    // Footer inferior fijo
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        backgroundColor: theme.background,
        borderTopWidth: 1,
        borderTopColor: theme.card
    },
    leftTools: {
        flexDirection: 'row',
    },
    rightTools: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    roundBtn: {
        width: 45, height: 45,
        borderRadius: 25,
        backgroundColor: theme.card,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border
    },
    activeBtn: {
        backgroundColor: theme.primary,
        borderColor: theme.primary
    },
    saveBtn: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginLeft: 10,
    },
    saveText: { fontWeight: 'bold', color: '#fff' },
    deleteBtn: {
        padding: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 50,
        marginRight: 5
    }
});
