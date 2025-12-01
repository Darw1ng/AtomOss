import React, { useState, useRef, useMemo } from 'react';
import {
    View, TextInput, StyleSheet, TouchableOpacity, Text,
    KeyboardAvoidingView, Platform, ScrollView, Modal, Image, SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display';
import SignatureScreen from "react-native-signature-canvas";
import {
    Save, Trash2, Bold, Heading, List, Image as ImageIcon,
    Wrench, Eye, EyeOff, X, Italic, Quote, Code, PenTool,
    Check, Eraser, RotateCcw, Palette // Iconos nuevos
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import notesService from '../api/notesService';

// Colores disponibles para el pincel
const DRAWING_COLORS = ['#000000', '#FF0000', '#44895C', '#3b82f6', '#facc15'];

export default function DetailScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { note } = route.params || {};
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    // Estados para el Canvas
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const signatureRef = useRef(null);

    const markdownStyles = useMemo(() => ({
        body: { color: theme.textDim, fontSize: 16 },
        heading1: { color: theme.primary, fontWeight: 'bold', marginVertical: 10 },
        heading2: { color: theme.text, fontWeight: 'bold', marginTop: 10 },
        code_inline: { backgroundColor: theme.card, color: theme.primary, borderRadius: 4, paddingHorizontal: 4 },
        blockquote: {
            backgroundColor: theme.card,
            borderLeftColor: theme.primary,
            borderLeftWidth: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginVertical: 4
        },
        image: { width: '100%', height: 200, borderRadius: 8 }
    }), [theme]);

    const markdownRules = {
        image: (node, children, parent, styles) => (
            <Image key={node.key} style={styles.image} source={{ uri: node.attributes.src }} resizeMode="contain" />
        ),
    };

    const insertMarkdown = (prefix, suffix = '') => {
        const { start, end } = selection;
        const newText = content.substring(0, start) + prefix + content.substring(start, end) + suffix + content.substring(end);
        setContent(newText);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!result.canceled) insertMarkdown('![Imagen](' + result.assets[0].uri + ')', '');
    };

    const handleSave = async () => {
        setSaving(true);
        if (note) await notesService.update(note.id, { title, content });
        else await notesService.create({ title, content });
        setSaving(false); navigation.goBack();
    };

    const handleDelete = async () => {
        await notesService.delete(note.id); navigation.goBack();
    };

    // --- FUNCIONES DEL CANVAS ---

    // CSS para "arreglar" el lienzo: quita bordes, sombras y footer predeterminado
    const webStyle = `
        .m-signature-pad {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            margin: 0; padding: 0; border: none; box-shadow: none;
        }
        .m-signature-pad--body { bottom: 0px; top: 0px; left: 0px; right: 0px; height: 100%; border: none; }
        .m-signature-pad--footer { display: none; } 
        body { background-color: #fff; margin: 0; }
    `;

    const handleColorChange = (color) => {
        setPenColor(color);
        signatureRef.current?.changePenColor(color);
    };

    const handleEraser = () => {
        setPenColor('#FFFFFF'); // Truco: Pintar de blanco es borrar
        signatureRef.current?.changePenColor('#FFFFFF');
    };

    const handleClearCanvas = () => {
        signatureRef.current?.clearSignature();
    };

    const handleConfirmDrawing = () => {
        signatureRef.current?.readSignature(); // Esto dispara onOK
    };

    const handleOnOK = (signature) => {
        insertMarkdown(`\n![Dibujo](${signature})\n`);
        setIsDrawing(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View style={styles.mainContainer}>
                {/* 1. ÁREA DEL EDITOR (Igual que antes) */}
                <View style={styles.editorArea}>
                    <TextInput
                        style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
                        placeholder="Título del Experimento"
                        placeholderTextColor={theme.textDim}
                        value={title}
                        onChangeText={setTitle}
                    />
                    {isPreview ? (
                        <ScrollView style={styles.previewContainer}>
                            <Markdown style={markdownStyles} rules={markdownRules}>{content || '*Nada por aquí...*'}</Markdown>
                        </ScrollView>
                    ) : (
                        <TextInput
                            style={[styles.contentInput, { color: theme.textDim }]}
                            placeholder="Escribe tus observaciones aquí..."
                            placeholderTextColor={theme.textDim}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                        />
                    )}
                </View>

                {/* 2. BARRA DE HERRAMIENTAS (Igual que antes) */}
                {showToolbar && !isPreview && (
                    <View style={[styles.toolbarContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll} keyboardShouldPersistTaps="always">
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('**', '**')}><Bold size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('_', '_')}><Italic size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('# ')}><Heading size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('- ')}><List size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('> ')}><Quote size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('`', '`')}><Code size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}><ImageIcon size={20} color={theme.primary} /></TouchableOpacity>

                            {/* Botón para abrir el Canvas */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => { setIsDrawing(true); setPenColor('#000000'); }}>
                                <PenTool size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={[styles.closeBarBtn, { borderLeftColor: theme.border }]} onPress={() => setShowToolbar(false)}>
                            <X size={16} color={theme.textDim} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* 3. FOOTER (Igual que antes) */}
                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.card, paddingBottom: Math.max(insets.bottom, 10) }]}>
                    <View style={styles.leftTools}>
                        <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.card, borderColor: theme.border }, showToolbar && { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => setShowToolbar(!showToolbar)}>
                            <Wrench color={showToolbar ? theme.background : theme.text} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.card, borderColor: theme.border, marginLeft: 10 }]} onPress={() => setIsPreview(!isPreview)}>
                            {isPreview ? <EyeOff color={theme.text} size={20} /> : <Eye color={theme.text} size={20} />}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rightTools}>
                        {note && (<TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.danger + '20' }]} onPress={handleDelete}><Trash2 color={theme.danger} size={20} /></TouchableOpacity>)}
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={saving}>
                            <Save color="#fff" size={18} style={{ marginRight: 8 }} />
                            <Text style={styles.saveText}>{saving ? '...' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* --- MODAL MEJORADO DEL LIENZO --- */}
            <Modal visible={isDrawing} animationType="slide" onRequestClose={() => setIsDrawing(false)} presentationStyle="fullScreen">
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>

                    {/* Header del Lienzo */}
                    <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Lienzo de Dibujo</Text>
                        <TouchableOpacity onPress={() => setIsDrawing(false)} style={styles.closeModalBtn}>
                            <X color={theme.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Área de Dibujo */}
                    <View style={{ flex: 1, backgroundColor: 'white' }}>
                        <SignatureScreen
                            ref={signatureRef}
                            onOK={handleOnOK}
                            webStyle={webStyle}
                            penColor={penColor}
                            // Opcional: ajustar grosor mínimo y máximo si quieres "más grande" por defecto
                            minWidth={3}
                            maxWidth={5}
                        />
                    </View>

                    {/* Barra de Herramientas del Lienzo */}
                    <View style={[styles.canvasToolbar, { backgroundColor: theme.card }]}>

                        {/* Selector de Colores */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: 15 }}>
                            {DRAWING_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorDot,
                                        { backgroundColor: color },
                                        penColor === color && { borderWidth: 2, borderColor: 'white' }
                                    ]}
                                    onPress={() => handleColorChange(color)}
                                />
                            ))}
                        </ScrollView>

                        {/* Herramientas: Borrar, Limpiar, Guardar */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.canvasToolBtn} onPress={handleEraser}>
                                <Eraser color={penColor === '#FFFFFF' ? theme.primary : theme.textDim} size={22} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.canvasToolBtn} onPress={handleClearCanvas}>
                                <RotateCcw color={theme.textDim} size={22} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.canvasSaveBtn, { backgroundColor: theme.primary }]} onPress={handleConfirmDrawing}>
                                <Check color="#fff" size={24} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, flexDirection: 'column' },
    editorArea: { flex: 1, padding: 20 },
    titleInput: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 8 },
    contentInput: { flex: 1, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
    previewContainer: { flex: 1, marginBottom: 10 },
    toolbarContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderTopWidth: 1, borderBottomWidth: 1, maxHeight: 60 },
    toolbarScroll: { alignItems: 'center', paddingRight: 10 },
    toolBtn: { padding: 10, marginHorizontal: 2 },
    closeBarBtn: { padding: 5, borderLeftWidth: 1, marginLeft: 5 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, borderTopWidth: 1 },
    leftTools: { flexDirection: 'row' },
    rightTools: { flexDirection: 'row', alignItems: 'center' },
    roundBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 30, marginLeft: 10 },
    saveText: { fontWeight: 'bold', color: '#fff' },
    deleteBtn: { padding: 8, borderRadius: 50, marginRight: 5 },

    // Estilos del Modal del Lienzo
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeModalBtn: { padding: 5 },

    canvasToolbar: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    colorDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    canvasToolBtn: {
        padding: 10,
        marginRight: 5
    },
    canvasSaveBtn: {
        width: 45,
        height: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10
    }
});
