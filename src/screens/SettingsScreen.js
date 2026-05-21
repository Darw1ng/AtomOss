import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, Share, Alert } from 'react-native';
import { Moon, Globe, Accessibility, ChevronRight, Palette, Check, Sun, Download } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { PALETTES } from '../theme/theme';
import notesService from '../api/notesService';

export default function SettingsScreen() {
    const {
        theme,
        mode,
        toggleTheme,
        highContrast,
        toggleHighContrast,
        colorPalette,
        changeColor,
        language,
        changeLanguage
    } = useTheme();

    const [langModalVisible, setLangModalVisible] = useState(false);

    const handleExportAll = async () => {
        try {
            const notes = await notesService.getAll();
            if (notes.length === 0) {
                Alert.alert('Sin notas', 'No tienes notas para exportar.');
                return;
            }
            await Share.share({
                message: JSON.stringify(notes, null, 2),
                title: `AtomOss Backup — ${notes.length} notas`,
            });
        } catch (e) {
            console.error(e);
        }
    };
    const languages = ['Español', 'English', 'Français', 'Português', 'Deutsch'];

    const OptionRow = ({ icon: Icon, title, value, onValueChange, type = 'switch', subLabel, rightElement }) => (
        <View style={[styles.row, { borderBottomColor: theme.card }]}>
            <View style={styles.rowLeft}>
                <Icon size={24} color={theme.primary} style={{ marginRight: 16 }} />
                <View>
                    <Text style={[styles.label, { color: theme.text }]}>{title}</Text>
                    {subLabel && <Text style={[styles.subLabel, { color: theme.textDim }]}>{subLabel}</Text>}
                </View>
            </View>
            {rightElement ? rightElement : (
                type === 'switch' ? (
                    <Switch
                        trackColor={{ false: theme.border, true: theme.secondary }}
                        thumbColor={value ? theme.primary : '#f4f3f4'}
                        onValueChange={onValueChange}
                        value={value}
                    />
                ) : (
                    <TouchableOpacity onPress={onValueChange} style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={{color: theme.textDim, marginRight: 5}}>{value}</Text>
                        <ChevronRight size={18} color={theme.textDim} />
                    </TouchableOpacity>
                )
            )}
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>

            {/* SECCIÓN APARIENCIA */}
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Apariencia</Text>

            <OptionRow
                icon={mode === 'dark' ? Moon : Sun}
                title={mode === 'dark' ? "Modo Oscuro" : "Modo Claro"}
                value={mode === 'dark'}
                onValueChange={toggleTheme}
            />

            {/* Selector de Color */}
            <View style={[styles.colorRow, { borderBottomColor: theme.card }]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                    <Palette size={22} color={theme.primary} style={{ marginRight: 15 }} />
                    <Text style={[styles.label, { color: theme.text }]}>Color de Énfasis</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    {Object.keys(PALETTES).map((colorKey) => (
                        <TouchableOpacity
                            key={colorKey}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: PALETTES[colorKey].primary },
                                colorPalette === colorKey && styles.selectedColorCircle
                            ]}
                            onPress={() => changeColor(colorKey)}
                        >
                            {colorPalette === colorKey && <Check size={16} color="white" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* SECCIÓN GENERAL */}
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>General</Text>
            <OptionRow
                icon={Globe}
                title="Idioma"
                type="link"
                value={language}
                onValueChange={() => setLangModalVisible(true)}
            />

            {/* SECCIÓN DATOS */}
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Datos</Text>
            <OptionRow
                icon={Download}
                title="Exportar backup"
                subLabel="Todas tus notas como JSON"
                type="link"
                value=""
                onValueChange={handleExportAll}
            />

            {/* SECCIÓN ACCESIBILIDAD */}
            <Text style={[styles.sectionTitle, { color: theme.textDim }]}>Accesibilidad</Text>
            <OptionRow
                icon={Accessibility}
                title="Alto Contraste"
                subLabel="Aumentar legibilidad (B/N)"
                value={highContrast}
                onValueChange={toggleHighContrast}
            />

            {/* MODAL DE IDIOMA */}
            <Modal
                visible={langModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLangModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Seleccionar Idioma</Text>
                        {languages.map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[styles.langOption, lang === language && { backgroundColor: theme.background }]}
                                onPress={() => { changeLanguage(lang); setLangModalVisible(false); }}
                            >
                                <Text style={[styles.langText, { color: theme.text }]}>{lang}</Text>
                                {lang === language && <Check size={20} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: theme.primary }]}
                            onPress={() => setLangModalVisible(false)}
                        >
                            <Text style={{color: 'white', fontWeight: 'bold'}}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 18, borderBottomWidth: 1
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    label: { fontSize: 17, fontWeight: '500' },
    subLabel: { fontSize: 13, marginTop: 2 },
    colorRow: { paddingVertical: 18, borderBottomWidth: 1 },
    colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
    selectedColorCircle: { borderWidth: 2.5, borderColor: 'white' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', borderRadius: 16, padding: 22, elevation: 5 },
    modalTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
    langOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 5 },
    langText: { fontSize: 17 },
    closeBtn: { marginTop: 18, padding: 14, borderRadius: 10, alignItems: 'center' }
});
