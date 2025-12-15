import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Modal, TextInput } from 'react-native';
import { Canvas, useTouchHandler, Skia, Group, rrect, rect, Box, Text as SkiaText } from '@shopify/react-native-skia';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Pointer, Plus } from 'lucide-react-native';
import diagramService from '../api/diagramService';
import { useFonts } from 'expo-font';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const DOUBLE_TAP_DELAY = 300; // ms

export default function CanvasScreen() {
    const { theme } = useTheme();
    const [nodes, setNodes] = useState([]);
    const [draggingNode, setDraggingNode] = useState(null);
    const [tool, setTool] = useState('select');
    const [editingNode, setEditingNode] = useState(null);
    const [inputText, setInputText] = useState('');

    const lastTap = useRef(null);

    let [fontsLoaded] = useFonts({
        'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
    });

    useEffect(() => {
        const load = async () => {
            const data = await diagramService.loadDiagram();
            if (data && data.nodes) setNodes(data.nodes);
        };
        load();
    }, []);

    const saveDiagram = (updatedNodes) => {
        diagramService.saveDiagram({ nodes: updatedNodes });
    };

    const findNodeAt = (x, y) => {
        // Iterate backwards to find the top-most node
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            if (x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height) {
                return node;
            }
        }
        return null;
    };

    const handleDoubleTap = (tappedNode) => {
        openEditModal(tappedNode);
    };

    const touchHandler = useTouchHandler({
        onStart: ({ x, y }) => {
            const tappedNode = findNodeAt(x, y);
            const now = Date.now();

            if (tappedNode && lastTap.current && (now - lastTap.current.time) < DOUBLE_TAP_DELAY && lastTap.current.nodeId === tappedNode.id) {
                handleDoubleTap(tappedNode);
                lastTap.current = null; // Reset tap tracking
                return;
            }

            if (tappedNode) {
                lastTap.current = { nodeId: tappedNode.id, time: now };
                if (tool === 'select') {
                    setDraggingNode({ id: tappedNode.id, offsetX: x - tappedNode.x, offsetY: y - tappedNode.y });
                }
            } else {
                lastTap.current = null;
            }
        },
        onActive: ({ x, y }) => {
            if (draggingNode) {
                setNodes(currentNodes =>
                    currentNodes.map(n =>
                        n.id === draggingNode.id ? { ...n, x: x - draggingNode.offsetX, y: y - draggingNode.offsetY } : n
                    )
                );
            }
        },
        onEnd: () => {
            if (draggingNode) {
                // Important: Use a callback with setNodes to get the latest state
                setNodes(currentNodes => {
                    saveDiagram(currentNodes);
                    return currentNodes;
                });
            }
            setDraggingNode(null);
        },
    });

    const addNode = () => {
        const newNode = {
            id: Date.now(),
            x: 50,
            y: 50,
            text: "Nuevo Nodo",
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        };
        setNodes(prev => {
            const updatedNodes = [...prev, newNode];
            saveDiagram(updatedNodes);
            return updatedNodes;
        });
    };

    const openEditModal = (node) => {
        setEditingNode(node);
        setInputText(node.text);
    };

    const handleUpdateText = () => {
        if (editingNode) {
            setNodes(prev => {
                const updatedNodes = prev.map(n =>
                    n.id === editingNode.id ? { ...n, text: inputText } : n
                );
                saveDiagram(updatedNodes);
                return updatedNodes;
            });
            setEditingNode(null);
            setInputText('');
        }
    };

    const handleClear = () => {
        Alert.alert("Limpiar Lienzo", "¿Borrar todo? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Limpiar", style: "destructive",
                    onPress: () => {
                        setNodes([]);
                        saveDiagram({ nodes: [] });
                    }
                }
            ]
        );
    };

    if (!fontsLoaded) {
        return <View style={styles.loadingContainer}><Text>Loading fonts...</Text></View>;
    }
    const font = Skia.Font(require('../../assets/fonts/Roboto-Regular.ttf'), 14);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Canvas style={styles.canvas} onTouch={touchHandler}>
                {nodes.map(node => {
                    const nodeRect = rrect(rect(node.x, node.y, node.width, node.height), 8, 8);
                    return (
                        <Group key={node.id}>
                            <Box box={nodeRect} color={theme.card} />
                            <Box box={nodeRect} color={theme.primary} style="stroke" strokeWidth={1} />
                            <SkiaText x={node.x + 10} y={node.y + 25} text={node.text.substring(0, 15)} color={theme.text} font={font} />
                        </Group>
                    )
                })}
            </Canvas>

            <View style={[styles.toolbar, { backgroundColor: theme.card }]}>
                <TouchableOpacity style={styles.toolButton} onPress={addNode}>
                    <Plus size={24} color={theme.primary} />
                    <Text style={[styles.toolText, { color: theme.text }]}>Añadir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolButton} onPress={() => setTool('select')}>
                    <Pointer size={24} color={tool === 'select' ? theme.primary : theme.textDim} />
                    <Text style={[styles.toolText, { color: tool === 'select' ? theme.primary : theme.textDim }]}>Mover</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
                    <Trash2 size={24} color={theme.danger} />
                    <Text style={[styles.toolText, { color: theme.danger }]}>Limpiar</Text>
                </TouchableOpacity>
            </View>

            <Modal transparent visible={!!editingNode} animationType="fade" onRequestClose={() => setEditingNode(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Nodo</Text>
                        <TextInput style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                            value={inputText} onChangeText={setInputText} autoFocus />
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleUpdateText}>
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    canvas: { flex: 1, width: '100%' },
    toolbar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 80, paddingBottom: 20, borderTopWidth: 1 },
    toolButton: { alignItems: 'center', justifyContent: 'center' },
    toolText: { fontSize: 12, marginTop: 4 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { width: '80%', padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: { height: 40, borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 20 },
    saveButton: { padding: 12, borderRadius: 5, alignItems: 'center' },
    saveButtonText: { color: 'white', fontWeight: 'bold' },
});
