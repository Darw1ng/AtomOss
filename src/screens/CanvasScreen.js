import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../theme/colors';
import { Save, Play, Info } from 'lucide-react-native';

// Plantilla inicial de ejemplo
const INITIAL_CODE = `mindmap
  root((AtomOss))
    Funcionalidades
      Notas
      Calendario
      Canvas
    Tecnologias
      React Native
      Expo
      NodeJS`;

export default function CanvasScreen() {
    const [code, setCode] = useState(INITIAL_CODE);
    const [htmlContent, setHtmlContent] = useState('');

    // Generamos el HTML cada vez que cambia el código (con un debounce manual o botón de refrescar)
    const generateHtml = (diagramCode) => {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background-color: ${theme.background}; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
          #container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
          /* Ajuste de colores para Mermaid */
          .node rect, .node circle, .node ellipse, .node polygon, .node path { fill: ${theme.card} !important; stroke: ${theme.primary} !important; }
          .node .label { color: ${theme.text} !important; }
          .edgePath .path { stroke: ${theme.textDim} !important; }
        </style>
      </head>
      <body>
        <div class="mermaid" id="container">
          ${diagramCode}
        </div>
        <script type="module">
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ 
            startOnLoad: true, 
            theme: 'dark',
            securityLevel: 'loose',
            mindmap: { useMaxWidth: false }
          });
        </script>
      </body>
      </html>
    `;
    };

    // Cargar inicial
    useEffect(() => {
        setHtmlContent(generateHtml(code));
    }, []);

    const handleRender = () => {
        setHtmlContent(generateHtml(code));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Área de Visualización */}
            <View style={styles.viewerContainer}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlContent }}
                    style={{ backgroundColor: theme.background }}
                    containerStyle={{ backgroundColor: theme.background }}
                    startInLoadingState={true}
                    renderLoading={() => <ActivityIndicator color={theme.primary} size="large" style={{position:'absolute', top: '50%', left: '50%'}}/>}
                />
            </View>

            {/* Área de Edición */}
            <View style={styles.editorContainer}>
                <View style={styles.editorHeader}>
                    <Text style={styles.editorTitle}>Código del Diagrama</Text>
                    <TouchableOpacity onPress={handleRender} style={styles.renderBtn}>
                        <Play size={16} color="white" fill="white" style={{marginRight: 5}}/>
                        <Text style={styles.btnText}>Renderizar</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    multiline
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <View style={styles.tips}>
                    <Info size={14} color={theme.textDim} style={{marginRight: 5}}/>
                    <Text style={styles.tipsText}>Soporta: mindmap, graph TD, sequenceDiagram...</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    viewerContainer: { flex: 2, borderBottomWidth: 1, borderBottomColor: theme.border },
    editorContainer: { flex: 1, backgroundColor: theme.card, padding: 15 },
    editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    editorTitle: { color: theme.primary, fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
    input: {
        flex: 1,
        backgroundColor: theme.background,
        color: theme.text,
        padding: 10,
        borderRadius: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
        textAlignVertical: 'top'
    },
    renderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    tips: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    tipsText: { color: theme.textDim, fontSize: 11 }
});
