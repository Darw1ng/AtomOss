import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/colors';
import { Moon, Globe, Accessibility, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
    // Estados simulados
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [highContrast, setHighContrast] = useState(false);

    const OptionRow = ({ icon: Icon, title, value, onValueChange, type = 'switch', subLabel }) => (
        <View style={styles.row}>
            <View style={styles.rowLeft}>
                <Icon size={22} color={theme.primary} style={{ marginRight: 15 }} />
                <View>
                    <Text style={styles.label}>{title}</Text>
                    {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
                </View>
            </View>
            {type === 'switch' ? (
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
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>Apariencia</Text>
            <OptionRow
                icon={Moon}
                title="Modo Oscuro"
                value={isDarkMode}
                onValueChange={setIsDarkMode}
            />

            <Text style={styles.sectionTitle}>General</Text>
            <OptionRow
                icon={Globe}
                title="Idioma"
                type="link"
                value="Español"
                onValueChange={() => alert('Cambiar Idioma')}
            />

            <Text style={styles.sectionTitle}>Accesibilidad</Text>
            <OptionRow
                icon={Accessibility}
                title="Alto Contraste"
                subLabel="Mejorar legibilidad del texto"
                value={highContrast}
                onValueChange={setHighContrast}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20 },
    sectionTitle: { color: theme.textDim, fontSize: 13, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.card
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    label: { color: theme.text, fontSize: 16 },
    subLabel: { color: theme.textDim, fontSize: 12 }
});
