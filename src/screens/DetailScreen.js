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
    Keyboard,
    Modal,
    Image,
    SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // [IMPORTANTE] Nuevo hook
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display';
import SignatureScreen from "react-native-signature-canvas";

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
    Wrench,
    Eye,
    EyeOff,
    X
} from 'lucide-react-native';
import notesService from '../api/notesService';
import { theme } from '../theme/colors';

export default function DetailScreen({ route, navigation }) {
    const { note } = route.params;
    const insets = useSafeAreaInsets(); // [IMPORTANTE] Obtenemos las medidas seguras del dispositivo

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);

    const [isPreview, setIsPreview] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isDrawing, setIsDrawing] = useState(false);

    const contentInputRef = useRef(null);
    const signatureRef = useRef(null);

    const markdownRules = {
        image: (node, children, parent, styles) => {
            return (
                <Image
                    key={node.key}
                    style={styles.image}
                    source={{ uri: node.attributes.src }}
                    resizeMode="contain"
                    accessible={true}
                    accessibilityLabel={node.attributes.alt}
                />
            );
        },
    };

    const insertMarkdown = (prefix, suffix = '') => {
        const { start, end } = selection;
        const textBefore = content.substring(0, start);
        const textSelected = content.substring(start, end);
        const textAfter = content.substring(end);

        let newText = '';
        let newCursorPos = 0;

        const isBlockElement = prefix === '- ' || prefix === '# ' || prefix === '> ';

        if (isBlockElement) {
            const needsNewLine = start > 0 && content[start - 1] !== '\n';
            const extraBreak = needsNewLine ? '\n' : '';
            newText = `${textBefore}${extraBreak}${prefix}${textSelected}${suffix}${textAfter}`;
            newCursorPos = start + extraBreak.length + prefix.length + textSelected.length + suffix.length;
        } else {
            newText = `${textBefore}${prefix}${textSelected}${suffix}${textAfter}`;
            if (textSelected.length > 0) {
                newCursorPos = start + prefix.length + textSelected.length + suffix.length;
            } else {
                newCursorPos = start + prefix.length;
            }
        }

        setContent(newText);
        setTimeout(() => {
            contentInputRef.current?.focus();
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
            insertMarkdown('![Imagen](' + imageUri + ')', '');
            setShowToolbar(false);
        }
    };

    const handleSignatureOK = (signature) => {
        insertMarkdown(`\n![Dibujo](${signature})\n`);
        setIsDrawing(false);
        setShowToolbar(false);
    };

    const handleSignatureEmpty = () => {
        Alert.alert("Lienzo vacío", "Por favor dibuja algo antes de guardar.");
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

    const webStyle = `
        body, html {
            width: 100%; height: 100%; margin: 0; padding: 0;
            background-color: #fff;
        }
        .m-signature-pad {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            margin: 0;
            border: none;
            box-shadow: none;
        }
        .m-signature-pad--body {
            border: none;
            bottom: 80px;
            top: 0px;
        }
        .m-signature-pad--footer {
            position: absolute;
            bottom: 20px;
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: transparent;
        }
        .m-signature-pad--footer .button {
            background-color: ${theme.primary};
            color: #FFF;
            border-radius: 25px;
            border: none;
            padding: 10px 25px;
            font-weight: bold;
            font-family: system-ui;
        }
        .m-signature-pad--footer .button.clear {
            background-color: ${theme.card};
            color: ${theme.textDim};
        }
    `;

    return (
        // [CAMBIO] Usamos 'height' en Android para que el footer suba correctamente
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20} // Ajuste fino para el offset
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

                    {isPreview ? (
                        <ScrollView style={styles.previewContainer}>
                            <Markdown style={markdownStyles} rules={markdownRules}>
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
                            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
                        />
                    )}
                </View>

                <Modal
                    visible={isDrawing}
                    animationType="slide"
                    onRequestClose={() => setIsDrawing(false)}
                    presentationStyle="fullScreen"
                >
                    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Lienzo</Text>
                            <TouchableOpacity onPress={() => setIsDrawing(false)} style={styles.closeModalBtn}>
                                <X color={theme.text} size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white' }}>
                            <SignatureScreen
                                ref={signatureRef}
                                onOK={handleSignatureOK}
                                onEmpty={handleSignatureEmpty}
                                descriptionText="Firma o dibuja arriba"
                                clearText="Borrar"
                                confirmText="Insertar"
                                webStyle={webStyle}
                                autoClear={true}
                                imageType="image/png"
                                trimWhitespace={true}
                            />
                        </View>
                    </SafeAreaView>
                </Modal>

                {showToolbar && !isPreview && (
                    <View style={[styles.toolbarContainer, { bottom: 80 + (Platform.OS === 'android' ? 0 : 10) }]}>
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
                            <TouchableOpacity style={styles.toolBtn} onPress={() => setIsDrawing(true)}>
                                <PenTool size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={styles.closeBarBtn} onPress={() => setShowToolbar(false)}>
                            <X size={16} color={theme.textDim} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* [CAMBIO IMPORTANTE]
                   El footer ahora usa insets.bottom para el padding.
                   Esto hace que suba si hay barra de navegación o teclado.
                */}
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
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

                        <TouchableOpacity
                            style={[styles.roundBtn, { marginLeft: 10 }]}
                            onPress={() => {
                                setIsPreview(!isPreview);
                                setShowToolbar(false);
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

const markdownStyles = StyleSheet.create({
    body: { color: theme.textDim, fontSize: 16 },
    heading1: { color: theme.primary, fontWeight: 'bold', marginVertical: 10 },
    heading2: { color: theme.text, fontWeight: 'bold', marginTop: 10 },
    code_inline: { backgroundColor: '#333', color: '#ff79c6', borderRadius: 4 },
    fence: { backgroundColor: '#1e1e1e', color: '#f8f8f2', padding: 10, borderRadius: 8 },
    list_item: { color: theme.textDim, marginVertical: 2 },
    blockquote: { backgroundColor: '#22452E', borderLeftColor: theme.primary, borderLeftWidth: 4, paddingHorizontal: 10, paddingVertical: 4 },
    image: { width: '100%', height: 200, borderRadius: 8 }
});

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        // Quitamos el paddingBottom excesivo, el flex y el KeyboardAvoidingView se encargarán
        paddingBottom: 20,
    },
    previewContainer: {
        flex: 1,
        marginBottom: 10,
    },
    toolbarContainer: {
        position: 'absolute',
        // Ya no es fijo bottom 80, se ajustará relativo al contenedor padre
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15,
        // El paddingBottom ahora se controla dinámicamente en el JSX
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
    },
    modalTitle: {
        color: theme.text,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    closeModalBtn: {
        padding: 5
    }
});
