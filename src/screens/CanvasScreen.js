import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import { Play, Info } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INITIAL_CODE = `mindmap\n  root((AtomOss))\n    Funcionalidades\n      Notas\n      Canvas`;
const STORAGE_KEY = '@atomoss_canvas_code_v1';

export default function CanvasScreen() {
    const { theme } = useTheme();
    const [code, setCode] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const isMounted = useRef(true);

    // Debounce effect
    useEffect(() => {
        isMounted.current = true;
        
        const loadCode = async () => {
            const savedCode = await AsyncStorage.getItem(STORAGE_KEY);
            if (isMounted.current) {
                setCode(savedCode || INITIAL_CODE);
                setIsLoading(false);
            }
        };

        loadCode();

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const handler = setTimeout(() => {
                AsyncStorage.setItem(STORAGE_KEY, code);
            }, 500); // 500ms debounce

            return () => {
                clearTimeout(handler);
            };
        }
    }, [code, isLoading]);

    const generateHtml = (diagramCode) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background-color: ${theme.background}; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
          .node rect, .node circle { fill: ${theme.card} !important; stroke: ${theme.primary} !important; }
          .node .label { color: ${theme.text} !important; }
          .edgePath .path { stroke: ${theme.textDim} !important; }
        </style>
      </head>
      <body>
        <div class="mermaid">${diagramCode}</div>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ startOnLoad: true, theme: 'base' });
        </script>
      </body>
      </html>
    `;

    useEffect(() => {
        if (!isLoading) {
            setHtmlContent(generateHtml(code));
        }
    }, [code, theme, isLoading]);

    if (isLoading) {
        return <ActivityIndicator style={{ flex: 1, backgroundColor: theme.background }} color={theme.primary} size="large" />;
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.viewerContainer, { borderBottomColor: theme.border }]}>
                <WebView originWhitelist={['*']} source={{ html: htmlContent }} style={{ backgroundColor: theme.background }} />
            </View>
            <View style={[styles.editorContainer, { backgroundColor: theme.card }]}>
                <View style={styles.editorHeader}>
                    <Text style={[styles.editorTitle, { color: theme.primary }]}>Código</Text>
                    <TouchableOpacity onPress={() => setHtmlContent(generateHtml(code))} style={[styles.renderBtn, { backgroundColor: theme.primary }]}>
                        <Play size={16} color="white" /><Text style={styles.btnText}>Renderizar</Text>
                    </TouchableOpacity>
                </View>
                <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text }]} multiline value={code} onChangeText={setCode} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    viewerContainer: { flex: 2, borderBottomWidth: 1 },
    editorContainer: { flex: 1, padding: 15 },
    editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    editorTitle: { fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
    input: { flex: 1, padding: 10, borderRadius: 8, fontFamily: 'monospace', fontSize: 12, textAlignVertical: 'top' },
    renderBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 5 }
});
