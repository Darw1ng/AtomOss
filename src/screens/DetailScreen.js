import React, { useState, useRef, useMemo } from 'react';
import {
    View, TextInput, StyleSheet, TouchableOpacity, Text,
    KeyboardAvoidingView, Platform, ScrollView, Modal, Image, SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display';
import SignatureScreen from "react-native-signature-canvas";
// IMPORTANTE: Asegúrate de tener estos iconos importados
import {
    Save, Trash2, Bold, Heading, List, Image as ImageIcon,
    Wrench, Eye, EyeOff, X, Italic, Quote, Code, PenTool
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import notesService from '../api/notesService';

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
    const [isDrawing, setIsDrawing] = useState(false);

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

    const webStyle = `body { background-color: #fff; } .m-signature-pad--footer .button { background-color: ${theme.primary}; color: #FFF; }`;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View style={styles.mainContainer}>

                {/* 1. ÁREA DEL EDITOR */}
                <View style={styles.editorArea}>
                    <TextInput
                        style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
                        placeholder="Título del Experimento"
                        placeholderTextColor={theme.textDim}
                        value={title}
                        onChangeText={setTitle}
                        underlineColorAndroid="transparent"
                        autoCorrect={false}
                        spellCheck={false}
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
                            scrollEnabled={true}
                        />
                    )}
                </View>

                {/* 2. BARRA DE HERRAMIENTAS (Scroll Horizontal) */}
                {showToolbar && !isPreview && (
                    <View style={[styles.toolbarContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.toolbarScroll}
                            keyboardShouldPersistTaps="always"
                        >
                            {/* Negrita */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('**', '**')}>
                                <Bold size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Cursiva */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('_', '_')}>
                                <Italic size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Título */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('# ')}>
                                <Heading size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Lista */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('- ')}>
                                <List size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Cita */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('> ')}>
                                <Quote size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Código */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => insertMarkdown('`', '`')}>
                                <Code size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Imagen */}
                            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
                                <ImageIcon size={20} color={theme.primary} />
                            </TouchableOpacity>

                            {/* Dibujo */}
                            <TouchableOpacity style={styles.toolBtn} onPress={() => setIsDrawing(true)}>
                                <PenTool size={20} color={theme.primary} />
                            </TouchableOpacity>

                        </ScrollView>
                        <TouchableOpacity style={[styles.closeBarBtn, { borderLeftColor: theme.border }]} onPress={() => setShowToolbar(false)}>
                            <X size={16} color={theme.textDim} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* 3. FOOTER */}
                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.card, paddingBottom: Math.max(insets.bottom, 10) }]}>
                    <View style={styles.leftTools}>
                        <TouchableOpacity
                            style={[styles.roundBtn, { backgroundColor: theme.card, borderColor: theme.border }, showToolbar && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                            onPress={() => setShowToolbar(!showToolbar)}
                        >
                            <Wrench color={showToolbar ? theme.background : theme.text} size={20} />
                        </TouchableOpacity>

                        {/* BOTÓN PARA VER LA IMAGEN (PREVIEW) */}
                        <TouchableOpacity
                            style={[styles.roundBtn, { backgroundColor: theme.card, borderColor: theme.border, marginLeft: 10 }]}
                            onPress={() => setIsPreview(!isPreview)}
                        >
                            {isPreview ? <EyeOff color={theme.text} size={20} /> : <Eye color={theme.text} size={20} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightTools}>
                        {note && (
                            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.danger + '20' }]} onPress={handleDelete}>
                                <Trash2 color={theme.danger} size={20} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={saving}>
                            <Save color="#fff" size={18} style={{ marginRight: 8 }} />
                            <Text style={styles.saveText}>{saving ? '...' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, flexDirection: 'column' },

    editorArea: {
        flex: 1,
        padding: 20
    },

    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        borderBottomWidth: 1,
        paddingBottom: 8
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        textAlignVertical: 'top'
    },
    previewContainer: { flex: 1, marginBottom: 10 },

    toolbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        maxHeight: 60
    },
    toolbarScroll: { alignItems: 'center', paddingRight: 10 },
    toolBtn: { padding: 10, marginHorizontal: 2 },
    closeBarBtn: { padding: 5, borderLeftWidth: 1, marginLeft: 5 },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        borderTopWidth: 1
    },
    leftTools: { flexDirection: 'row' },
    rightTools: { flexDirection: 'row', alignItems: 'center' },
    roundBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 30, marginLeft: 10 },
    saveText: { fontWeight: 'bold', color: '#fff' },
    deleteBtn: { padding: 8, borderRadius: 50, marginRight: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeModalBtn: { padding: 5 }
});
