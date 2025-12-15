import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Modal, TextInput, PanResponder } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Pointer, Plus, Share2, Save } from 'lucide-react-native';
import diagramService from '../api/diagramService';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const DOUBLE_TAP_DELAY = 300;

export default function CanvasScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { diagramId, isNew } = route.params;

    const [diagram, setDiagram] = useState({ id: diagramId, name: `Mapa Mental #${diagramId.substring(8)}`, nodes: [], connections: [] });
    const diagramRef = useRef(diagram);
    diagramRef.current = diagram;

    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const draggingNodeIdRef = useRef(draggingNodeId);
    draggingNodeIdRef.current = draggingNodeId;
    
    const [tool, setTool] = useState('select');
    const toolRef = useRef(tool);
    toolRef.current = tool;

    const [connectingNodeId, setConnectingNodeId] = useState(null);
    const connectingNodeIdRef = useRef(connectingNodeId);
    connectingNodeIdRef.current = connectingNodeId;

    const [editingNode, setEditingNode] = useState(null);
    const [inputText, setInputText] = useState('');

    const lastTap = useRef(null);
    const offset = useRef({ x: 0, y: 0 });

    const [pan, setPan] = useState({ x: 0, y: 0 });
    const panRef = useRef(pan);
    panRef.current = pan;
    
    const panStateRef = useRef({ isPanning: false, startPan: { x: 0, y: 0 } });

    useEffect(() => {
        const load = async () => {
            if (!isNew) {
                const data = await diagramService.loadDiagram(diagramId);
                if (data) {
                    setDiagram(data);
                }
            }
        };
        load();
    }, [diagramId, isNew]);

    const saveDiagram = (newDiagram) => {
        diagramService.saveDiagram(newDiagram);
    };

    const updateDiagram = (newDiagram) => {
        setDiagram(newDiagram);
        saveDiagram(newDiagram);
    }

    const findNodeAt = (x, y) => {
        for (let i = diagramRef.current.nodes.length - 1; i >= 0; i--) {
            const node = diagramRef.current.nodes[i];
            if (x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height) {
                return node;
            }
        }
        return null;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: (evt, gestureState) => {
                const { locationX, locationY } = evt.nativeEvent;
                const canvasX = locationX - panRef.current.x;
                const canvasY = locationY - panRef.current.y;
                const tappedNode = findNodeAt(canvasX, canvasY);
                const now = Date.now();

                if (tappedNode && lastTap.current && (now - lastTap.current.time) < DOUBLE_TAP_DELAY && lastTap.current.id === tappedNode.id) {
                    openEditModal(tappedNode);
                    lastTap.current = null;
                    return;
                }

                if (tappedNode) {
                    lastTap.current = { id: tappedNode.id, time: now };

                    if (toolRef.current === 'select') {
                        setDraggingNodeId(tappedNode.id);
                        offset.current = {
                            x: canvasX - tappedNode.x,
                            y: canvasY - tappedNode.y
                        };
                    } else if (toolRef.current === 'connect') {
                        if (!connectingNodeIdRef.current) {
                            setConnectingNodeId(tappedNode.id);
                        } else {
                            if (connectingNodeIdRef.current !== tappedNode.id) {
                                const newConnection = { from: connectingNodeIdRef.current, to: tappedNode.id };
                                updateDiagram({ ...diagramRef.current, connections: [...diagramRef.current.connections, newConnection] });
                            }
                            setConnectingNodeId(null);
                        }
                    }
                } else {
                    panStateRef.current.isPanning = true;
                    panStateRef.current.startPan = { ...panRef.current };
                }
            },

            onPanResponderMove: (evt, gestureState) => {
                if (draggingNodeIdRef.current && toolRef.current === 'select') {
                    const { locationX, locationY } = evt.nativeEvent;
                    const canvasX = locationX - panRef.current.x;
                    const canvasY = locationY - panRef.current.y;
                    setDiagram(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                            n.id === draggingNodeIdRef.current
                            ? { ...n, x: canvasX - offset.current.x, y: canvasY - offset.current.y }
                            : n
                        )
                    }));
                } else if (panStateRef.current.isPanning) {
                    setPan({
                        x: panStateRef.current.startPan.x + gestureState.dx,
                        y: panStateRef.current.startPan.y + gestureState.dy,
                    });
                }
            },

            onPanResponderRelease: () => {
                if (draggingNodeIdRef.current) {
                    setDraggingNodeId(null);
                    saveDiagram(diagramRef.current);
                }
                if (panStateRef.current.isPanning) {
                    panStateRef.current.isPanning = false;
                }
            },
        })
    ).current;

    const addNode = () => {
        const newNode = {
            id: Date.now(),
            x: 100 - panRef.current.x,
            y: 100 - panRef.current.y,
            text: "Idea Nueva",
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        };
        updateDiagram({ ...diagramRef.current, nodes: [...diagramRef.current.nodes, newNode] });
    };

    const openEditModal = (node) => {
        setEditingNode(node);
        setInputText(node.text);
    };

    const handleUpdateText = () => {
        if (editingNode) {
            const newNodes = diagramRef.current.nodes.map(n =>
                n.id === editingNode.id ? { ...n, text: inputText } : n
            );
            updateDiagram({ ...diagramRef.current, nodes: newNodes });
            setEditingNode(null);
            setInputText('');
        }
    };

    const handleClear = () => {
        Alert.alert("Limpiar Lienzo", "¿Borrar todo el contenido de este mapa mental?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Borrar",
                style: "destructive",
                onPress: () => {
                    updateDiagram({ ...diagramRef.current, nodes: [], connections: [] });
                }
            }
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <Svg style={styles.canvas}>
                    <G transform={`translate(${pan.x}, ${pan.y})`}>
                        {diagram.connections && diagram.connections.map((conn, index) => {
                            const fromNode = diagram.nodes.find(n => n.id === conn.from);
                            const toNode = diagram.nodes.find(n => n.id === conn.to);
                            if (!fromNode || !toNode) return null;

                            return (
                                <Line
                                    key={`conn-${index}`}
                                    x1={fromNode.x + fromNode.width / 2}
                                    y1={fromNode.y + fromNode.height / 2}
                                    x2={toNode.x + toNode.width / 2}
                                    y2={toNode.y + toNode.height / 2}
                                    stroke={theme.primary}
                                    strokeWidth="2"
                                />
                            );
                        })}
                        {diagram.nodes.map(node => (
                            <G key={node.id} x={node.x} y={node.y}>
                                <Rect
                                    width={node.width}
                                    height={node.height}
                                    rx={8}
                                    fill={theme.card}
                                    stroke={connectingNodeId === node.id ? theme.secondary : theme.primary}
                                    strokeWidth={connectingNodeId === node.id ? 2 : 1}
                                />
                                <SvgText
                                    x={node.width / 2}
                                    y={(node.height / 2) + 5}
                                    fill={theme.text}
                                    fontSize="14"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {node.text.length > 15 ? node.text.substring(0, 12) + '...' : node.text}
                                </SvgText>
                            </G>
                        ))}
                    </G>
                </Svg>
            </View>

            <View style={[styles.toolbar, { backgroundColor: theme.card }]}>
                <TouchableOpacity style={styles.toolButton} onPress={addNode}>
                    <Plus size={24} color={theme.primary} />
                    <Text style={[styles.toolText, { color: theme.text }]}>Añadir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={() => setTool('select')}>
                    <Pointer size={24} color={tool === 'select' ? theme.primary : theme.textDim} />
                    <Text style={[styles.toolText, { color: tool === 'select' ? theme.primary : theme.textDim }]}>Mover</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={() => setTool('connect')}>
                    <Share2 size={24} color={tool === 'connect' ? theme.primary : theme.textDim} />
                    <Text style={[styles.toolText, { color: tool === 'connect' ? theme.primary : theme.textDim }]}>Unir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
                    <Trash2 size={24} color={theme.danger} />
                    <Text style={[styles.toolText, { color: theme.danger }]}>Limpiar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={() => {
                    saveDiagram(diagramRef.current);
                    Alert.alert("Guardado", "Tu mapa mental ha sido guardado.");
                }}>
                    <Save size={24} color={theme.success} />
                    <Text style={[styles.toolText, { color: theme.success }]}>Guardar</Text>
                </TouchableOpacity>
            </View>

            <Modal transparent visible={!!editingNode} animationType="fade" onRequestClose={() => setEditingNode(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Idea</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                            value={inputText}
                            onChangeText={setInputText}
                            autoFocus
                        />
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
    canvasContainer: { flex: 1, width: '100%', overflow: 'hidden' },
    canvas: { flex: 1, width: '100%', height: '100%' },
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