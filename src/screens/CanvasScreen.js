import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Modal, TextInput, PanResponder } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg'; // <--- El cambio mágico
import { useTheme } from '../context/ThemeContext';
import { Trash2, Pointer, Plus, Share2 } from 'lucide-react-native'; // Agregué icono para conectar
import diagramService from '../api/diagramService';
import { useFonts } from 'expo-font';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;
const DOUBLE_TAP_DELAY = 300;

export default function CanvasScreen() {
    const { theme } = useTheme();
    
    // Estado ampliado para incluir conexiones
    const [diagram, setDiagram] = useState({ nodes: [], connections: [] });
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [tool, setTool] = useState('select'); // 'select' | 'connect'
    
    // Para edición de texto
    const [editingNode, setEditingNode] = useState(null);
    const [inputText, setInputText] = useState('');
    
    // Referencias para gestos
    const lastTap = useRef(null);
    const offset = useRef({ x: 0, y: 0 }); // Para calcular el arrastre suave

    let [fontsLoaded] = useFonts({
        'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
    });

    useEffect(() => {
        const load = async () => {
            const data = await diagramService.loadDiagram();
            // Adaptamos la carga por si el formato anterior era solo un array
            if (Array.isArray(data)) {
                setDiagram({ nodes: data, connections: [] });
            } else if (data) {
                setDiagram(data);
            }
        };
        load();
    }, []);

    const saveDiagram = (newDiagram) => {
        diagramService.saveDiagram(newDiagram);
    };

    // Lógica para guardar nodos actualizados
    const updateNodes = (newNodes) => {
        const newDiagram = { ...diagram, nodes: newNodes };
        setDiagram(newDiagram);
        saveDiagram(newDiagram);
    };

    const findNodeAt = (x, y) => {
        // Buscamos de arriba a abajo (el último renderizado está encima)
        for (let i = diagram.nodes.length - 1; i >= 0; i--) {
            const node = diagram.nodes[i];
            if (x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height) {
                return node;
            }
        }
        return null;
    };

    // Configuración del PanResponder (Gestor de toques nativo)
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: (evt, gestureState) => {
                const { locationX, locationY } = evt.nativeEvent;
                const tappedNode = findNodeAt(locationX, locationY);
                const now = Date.now();

                // Detección de Doble Tap
                if (tappedNode && lastTap.current && (now - lastTap.current.time) < DOUBLE_TAP_DELAY && lastTap.current.id === tappedNode.id) {
                    openEditModal(tappedNode);
                    lastTap.current = null;
                    return;
                }

                if (tappedNode) {
                    lastTap.current = { id: tappedNode.id, time: now };
                    
                    if (tool === 'select') {
                        setDraggingNodeId(tappedNode.id);
                        // Calculamos la diferencia entre donde toqué y la esquina del nodo
                        offset.current = {
                            x: locationX - tappedNode.x,
                            y: locationY - tappedNode.y
                        };
                    } else if (tool === 'connect') {
                         // Aquí iría la lógica futura para conectar nodos
                         // Por ahora solo seleccionamos
                         Alert.alert("Conectar", "Selecciona otro nodo para crear un enlace (Lógica pendiente)");
                    }
                }
            },

            onPanResponderMove: (evt, gestureState) => {
                if (draggingNodeId && tool === 'select') {
                    // Actualizamos posición en tiempo real
                    const { locationX, locationY } = evt.nativeEvent;
                    setDiagram(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n => 
                            n.id === draggingNodeId 
                            ? { ...n, x: locationX - offset.current.x, y: locationY - offset.current.y } 
                            : n
                        )
                    }));
                }
            },

            onPanResponderRelease: () => {
                if (draggingNodeId) {
                    setDraggingNodeId(null);
                    saveDiagram(diagram); // Guardar al soltar
                }
            },
        })
    ).current;

    const addNode = () => {
        const newNode = {
            id: Date.now(),
            x: 100,
            y: 100,
            text: "Idea Nueva",
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        };
        updateNodes([...diagram.nodes, newNode]);
    };

    const openEditModal = (node) => {
        setEditingNode(node);
        setInputText(node.text);
    };

    const handleUpdateText = () => {
        if (editingNode) {
            updateNodes(diagram.nodes.map(n =>
                n.id === editingNode.id ? { ...n, text: inputText } : n
            ));
            setEditingNode(null);
            setInputText('');
        }
    };

    const handleClear = () => {
        Alert.alert("Limpiar Lienzo", "¿Borrar todo el mapa mental?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Borrar", 
                style: "destructive", 
                onPress: () => {
                    setDiagram({ nodes: [], connections: [] });
                    saveDiagram({ nodes: [], connections: [] });
                }
            }
        ]);
    };

    if (!fontsLoaded) return <View style={styles.loadingContainer}><Text>Cargando fuente...</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Área del Lienzo SVG con PanResponder */}
            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <Svg style={styles.canvas}>
                    {/* 1. Dibujar Conexiones (Líneas) PRIMERO para que queden detrás */}
                    {diagram.connections && diagram.connections.map((conn, index) => {
                        // Lógica placeholder para dibujar líneas entre nodos
                        // Necesitarías buscar las coordenadas de los nodos 'from' y 'to'
                        return null; 
                    })}

                    {/* 2. Dibujar Nodos */}
                    {diagram.nodes.map(node => (
                        <G key={node.id} x={node.x} y={node.y}>
                            {/* Caja del nodo */}
                            <Rect
                                width={node.width}
                                height={node.height}
                                rx={8} // Radio del borde redondeado
                                fill={theme.card}
                                stroke={theme.primary}
                                strokeWidth={1}
                            />
                            {/* Texto del nodo */}
                            <SvgText
                                x={node.width / 2}
                                y={(node.height / 2) + 5} // Ajuste vertical
                                fill={theme.text}
                                fontSize="14"
                                fontFamily="Roboto-Regular"
                                textAnchor="middle" // Centrar horizontalmente
                            >
                                {node.text.length > 15 ? node.text.substring(0, 12) + '...' : node.text}
                            </SvgText>
                        </G>
                    ))}
                </Svg>
            </View>

            {/* Barra de Herramientas */}
            <View style={[styles.toolbar, { backgroundColor: theme.card }]}>
                <TouchableOpacity style={styles.toolButton} onPress={addNode}>
                    <Plus size={24} color={theme.primary} />
                    <Text style={[styles.toolText, { color: theme.text }]}>Añadir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.toolButton} onPress={() => setTool('select')}>
                    <Pointer size={24} color={tool === 'select' ? theme.primary : theme.textDim} />
                    <Text style={[styles.toolText, { color: tool === 'select' ? theme.primary : theme.textDim }]}>Mover</Text>
                </TouchableOpacity>

                {/* Botón futuro para conexiones */}
                <TouchableOpacity style={styles.toolButton} onPress={() => setTool('connect')}>
                    <Share2 size={24} color={tool === 'connect' ? theme.primary : theme.textDim} />
                    <Text style={[styles.toolText, { color: tool === 'connect' ? theme.primary : theme.textDim }]}>Unir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
                    <Trash2 size={24} color={theme.danger} />
                    <Text style={[styles.toolText, { color: theme.danger }]}>Limpiar</Text>
                </TouchableOpacity>
            </View>

            {/* Modal de Edición (Igual que antes) */}
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
    canvasContainer: { flex: 1, width: '100%', overflow: 'hidden' }, // Importante para PanResponder
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