import React, { useState, useRef, useMemo } from 'react';
import {
    View, TextInput, StyleSheet, TouchableOpacity, Text, Alert,
    KeyboardAvoidingView, Platform, ScrollView, Keyboard, Modal, Image, SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display';
import SignatureScreen from "react-native-signature-canvas";
import { Save, Trash2, Bold, Italic, List, Heading, Code, Quote, Image as ImageIcon, PenTool, Wrench, Eye, EyeOff, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext'; // Hook
import notesService from '../api/notesService';

export default function DetailScreen({ route, navigation }) {
    const { theme } = useTheme(); // Hook
    const { note } = route.params;
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');
    const [saving, setSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isDrawing, setIsDrawing] = useState(false);

    const contentInputRef = useRef(null);
    const signatureRef = useRef(null);

    // Estilos de Markdown Dinámicos (useMemo para que se actualicen)
    const markdownStyles = useMemo(() => ({
        body: { color: theme.textDim, fontSize: 16 },
        heading1: { color: theme.primary, fontWeight: 'bold', marginVertical: 10 },
        heading2: { color: theme.text, fontWeight: 'bold', marginTop: 10 },
        code_inline: { backgroundColor: theme.card, color: theme.secondary, borderRadius: 4 },
        fence: { backgroundColor: theme.card, color: theme.text, padding: 10, borderRadius: 8 },
        list_item: { color: theme.textDim, marginVertical: 2 },
        blockquote: { backgroundColor: theme.card, borderLeftColor: theme.primary, borderLeftWidth: 4, paddingHorizontal: 10, paddingVertical: 4 },
        image: { width: '100%', height: 200, borderRadius: 8 }
    }), [theme]);

    // ... (resto de funciones insertMarkdown, pickImage, etc. IGUALES que antes) ...
    // Para abreviar, omito funciones lógicas sin cambios (insertMarkdown, pickImage, handleSignatureOK, handleSave, handleDelete)
    // ... asume que están aquí igual que en tu código anterior ...

    const markdownRules = {
        image: (node, children, parent, styles) => (
            <Image key={node.key} style={styles.image} source={{ uri: node.attributes.src }} resizeMode="contain" />
        ),
    };
    // ... Logica de insertar y guardar igual ...
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
        if(note) await notesService.update(note.id, { title, content });
        else await notesService.create({ title, content });
        setSaving(false); navigation.goBack();
    };
    const handleDelete = async () => {
        await notesService.delete(note.id); navigation.goBack();
    };


    const webStyle = `body { background-color: #fff; } .m-signature-pad--footer .button { background-color: ${theme.primary}; color: #FFF; }`;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
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
                            ref={contentInputRef}
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

                {/* Modal Drawing */}
                <Modal visible={isDrawing} animationType="slide" onRequestClose={() => setIsDrawing(false)} presentationStyle="fullScreen">
                    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                        <View style={[styles.modalHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Lienzo</Text>
                            <TouchableOpacity onPress={() => setIsDrawing(false)} style={styles.closeModalBtn}>
                                <X color={theme.text} size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white' }}>
                            <SignatureScreen ref={signatureRef} onOK={(sig) => { insertMarkdown(`\n![Dibujo](${sig})\n`); setIsDrawing(false); }} webStyle={webStyle} />
                        </View>
                    </SafeAreaView>
                </Modal>

                {showToolbar && !isPreview && (
                    <View style={[styles.toolbarContainer, { backgroundColor: theme.card, borderColor: theme.border, bottom: 80 + (Platform.OS === 'android' ? 0 : 10) }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
                            {/* Iconos con theme.text */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('**', '**')}><Bold size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('# ')}><Heading size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('- ')}><List size={20} color={theme.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}><ImageIcon size={20} color={theme.primary} /></TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={[styles.closeBarBtn, { borderLeftColor: theme.border }]} onPress={() => setShowToolbar(false)}>
                            <X size={16} color={theme.textDim} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.card, paddingBottom: Math.max(insets.bottom, 15) }]}>
                    <View style={styles.leftTools}>
                        <TouchableOpacity
                            style={[styles.roundBtn, { backgroundColor: theme.card, borderColor: theme.border }, showToolbar && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                            onPress={() => setShowToolbar(!showToolbar)}
                        >
                            <Wrench color={showToolbar ? theme.background : theme.text} size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.card, borderColor: theme.border, marginLeft: 10 }]} onPress={() => setIsPreview(!isPreview)}>
                            {isPreview ? <EyeOff color={theme.text} size={22} /> : <Eye color={theme.text} size={22} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightTools}>
                        {note && (
                            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.danger + '20' }]} onPress={handleDelete}>
                                <Trash2 color={theme.danger} size={22} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={saving}>
                            <Save color="#fff" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.saveText}>{saving ? '...' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inputContainer: { flex: 1, padding: 20 },
    titleInput: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 8 },
    contentInput: { flex: 1, fontSize: 16, lineHeight: 24, paddingBottom: 20 },
    previewContainer: { flex: 1, marginBottom: 10 },
    toolbarContainer: { position: 'absolute', left: 20, right: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, elevation: 5, borderWidth: 1, zIndex: 100 },
    toolbarScroll: { alignItems: 'center', paddingRight: 10 },
    toolBtn: { padding: 10, marginHorizontal: 2 },
    closeBarBtn: { padding: 5, borderLeftWidth: 1, marginLeft: 5 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, borderTopWidth: 1 },
    leftTools: { flexDirection: 'row' },
    rightTools: { flexDirection: 'row', alignItems: 'center' },
    roundBtn: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, marginLeft: 10 },
    saveText: { fontWeight: 'bold', color: '#fff' },
    deleteBtn: { padding: 10, borderRadius: 50, marginRight: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    closeModalBtn: { padding: 5 }
});
