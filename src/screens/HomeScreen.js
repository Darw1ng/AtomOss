import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, LayoutGrid, List as ListIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import NoteCard from '../components/NoteCard';
import notesService from '../api/notesService';
import { theme } from '../theme/colors';

export default function HomeScreen({ navigation }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                    style={{ marginRight: 15 }}
                >
                    {viewMode === 'grid' ?
                        <ListIcon color={theme.text} size={24} /> :
                        <LayoutGrid color={theme.text} size={24} />
                    }
                </TouchableOpacity>
            ),
        });
    }, [navigation, viewMode]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const data = await notesService.getAll();
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { fetchNotes(); }, [])
    );

    const renderItem = ({ item }) => {
        if (viewMode === 'grid') {
            return (
                <NoteCard
                    title={item.title}
                    content={item.content}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                />
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => navigation.navigate('Detail', { note: item })}
                >
                    <View style={styles.iconBox}>
                        <ListIcon size={18} color={theme.textDim} />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.listPreview} numberOfLines={1}>
                            {item.content ? item.content.replace(/[#*`]/g, '') : 'Sin contenido'}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>Now</Text>
                </TouchableOpacity>
            );
        }
    };

    return (
        <LinearGradient
            colors={[theme.card, theme.background, '#000000']}
            style={styles.container}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        >
            {loading && notes.length === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    key={viewMode}
                    data={notes}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    numColumns={viewMode === 'grid' ? 3 : 1}
                    columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Detail', { note: null })}
            >
                <Plus color="#000" size={30} />
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: 10, paddingTop: 20 },
    columnWrapper: { justifyContent: 'flex-start' },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginBottom: 2,
    },
    iconBox: { marginRight: 12, opacity: 0.7 },
    listTitle: { color: theme.text, fontWeight: 'bold', fontSize: 14 },
    listPreview: { color: theme.textDim, fontSize: 12 },
    dateText: { color: theme.textDim, fontSize: 10, marginLeft: 10 },
    fab: {
        position: 'absolute',
        bottom: 30, right: 30,
        backgroundColor: theme.primary,
        width: 60, height: 60,
        borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
        elevation: 5,
    }
});
