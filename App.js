import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { Moon, Globe, Accessibility, ChevronRight, Palette, Check, Sun } from 'lucide-react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

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
    const languages = ['Español', 'English', 'Français', 'Português', 'Deutsch'];

    const OptionRow = ({ icon: Icon, title, value, onValueChange, type = 'switch', subLabel, rightElement }) => (
        <View style={[styles.row, { borderBottomColor: theme.card }]}>
            <View style={styles.rowLeft}>
                <Icon size={22} color={theme.primary} style={{ marginRight: 15 }} />
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
    sectionTitle: { fontSize: 13, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, borderBottomWidth: 1
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    label: { fontSize: 16 },
    subLabel: { fontSize: 12 },
    colorRow: { paddingVertical: 15, borderBottomWidth: 1 },
    colorCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
    selectedColorCircle: { borderWidth: 2, borderColor: 'white' },
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', borderRadius: 15, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    langOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 8, marginBottom: 5 },
    langText: { fontSize: 16 },
    closeBtn: { marginTop: 15, padding: 12, borderRadius: 8, alignItems: 'center' }
});
