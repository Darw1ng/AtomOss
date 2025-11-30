import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Switch,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import calendarService from '../api/calendarService';
import {
    MapPin, Clock, X, Check, Calendar as CalendarIcon,
    Bell, Repeat, Users, Paperclip, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_WIDTH = SCREEN_WIDTH; // Usamos todo el ancho para facilitar el paging

const WEEK_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarScreen() {
    const { theme } = useTheme();

    // --- ESTADOS ---
    const now = new Date();
    const [events, setEvents] = useState([]);
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [activeIndex, setActiveIndex] = useState(now.getMonth()); // Iniciar en mes actual

    const flatListRef = useRef(null); // Referencia para controlar el carrusel

    // Modal y Formulario
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDateFull, setSelectedDateFull] = useState(null);

    // Formulario States
    const [newTitle, setNewTitle] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    const [repeatOption, setRepeatOption] = useState('Nunca');
    const [calendarType, setCalendarType] = useState('Trabajo');
    const [startTime, setStartTime] = useState('11:00 a.m.');
    const [endTime, setEndTime] = useState('12:00 p.m.');

    // --- EFECTOS ---

    // Scrollear al mes actual al cargar (con un pequeño delay para asegurar renderizado)
    useEffect(() => {
        setTimeout(() => {
            if(flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: activeIndex, animated: false });
            }
        }, 100);
    }, []);

    const loadEvents = async () => {
        const data = await calendarService.getAll();
        setEvents(data);
    };

    useFocusEffect(useCallback(() => { loadEvents(); }, []));

    // --- LÓGICA DE CALENDARIO ---

    const getDaysInMonth = (monthIndex, year) => {
        const date = new Date(year, monthIndex, 1);
        const days = [];
        for (let i = 0; i < date.getDay(); i++) days.push(null);
        while (date.getMonth() === monthIndex) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    // Controlar cambio de mes al deslizar
    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        if (index !== activeIndex && index >= 0 && index < 12) {
            setActiveIndex(index);
        }
    };

    // Controlar cambio de mes con flechas
    const changeMonth = (direction) => {
        let newIndex = activeIndex + direction;
        let newYear = currentYear;

        if (newIndex < 0) {
            newIndex = 11;
            newYear -= 1;
        } else if (newIndex > 11) {
            newIndex = 0;
            newYear += 1;
        }

        setCurrentYear(newYear);
        setActiveIndex(newIndex);
        flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    };

    const handleDayPress = (dateObj) => {
        if (!dateObj) return;
        // Ajustar zona horaria local para evitar problemas de día anterior
        const offsetDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
        const dateKey = offsetDate.toISOString().split('T')[0];

        setSelectedDateFull(dateKey);
        setNewTitle('');
        setNewLocation('');
        setIsAllDay(false);
        setModalVisible(true);
    };

    const saveEvent = async () => {
        if (!newTitle.trim()) {
            Alert.alert("Atención", "El título es obligatorio.");
            return;
        }

        const newEventData = {
            title: newTitle,
            dateKey: selectedDateFull,
            day: selectedDateFull.split('-')[2],
            monthIndex: parseInt(selectedDateFull.split('-')[1]) - 1,
            location: newLocation,
            type: 'user',
            time: isAllDay ? 'Todo el día' : startTime,
            repeat: repeatOption,
            calendar: calendarType
        };

        await calendarService.create(newEventData);
        await loadEvents();
        setModalVisible(false);
    };

    const handleDelete = async (id) => {
        await calendarService.delete(id);
        loadEvents();
    };

    // --- COMPONENTES ---

    const MonthCalendar = ({ monthIndex, year }) => {
        const days = getDaysInMonth(monthIndex, year);

        return (
            <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 15 }}>
                <View style={[styles.monthCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.weekHeader}>
                        {WEEK_DAYS.map((d, i) => (
                            <Text key={i} style={[styles.weekDayText, { color: theme.textDim }]}>{d}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {days.map((dateObj, index) => {
                            if (!dateObj) return <View key={index} style={styles.dayCell} />;

                            // Ajuste simple para key de fecha local
                            const tempDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
                            const dateKey = tempDate.toISOString().split('T')[0];

                            const hasEvent = events.some(e => e.dateKey === dateKey);
                            const isSelected = selectedDateFull === dateKey;
                            const isToday = new Date().toDateString() === dateObj.toDateString();

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayCell,
                                        isSelected && { backgroundColor: theme.primary, borderRadius: 15 },
                                        (!isSelected && isToday) && { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: 1, borderRadius: 15 }
                                    ]}
                                    onPress={() => handleDayPress(dateObj)}
                                >
                                    <Text style={[styles.dayText, { color: isSelected ? '#fff' : theme.text }]}>
                                        {dateObj.getDate()}
                                    </Text>
                                    {hasEvent && !isSelected && (
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.primary, position: 'absolute', bottom: 3 }} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        );
    };

    const FormRow = ({ label, value, icon: Icon, isSwitch, switchValue, onSwitchChange, isLast, color, onPress }) => (
        <TouchableOpacity
            activeOpacity={isSwitch ? 1 : 0.6}
            onPress={isSwitch ? null : onPress}
            style={[styles.formRow, { borderBottomColor: theme.border }, isLast && { borderBottomWidth: 0 }]}
        >
            {Icon && <View style={{ width: 30 }}><Icon size={20} color={color || theme.textDim} /></View>}
            <Text style={[styles.formLabel, { color: theme.text }]}>{label}</Text>
            {isSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={'#fff'}
                />
            ) : (
                <Text style={[styles.formValue, { color: color || theme.textDim }]}>{value}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {/* Header Dinámico: Mes + Año */}
            <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={15}>
                    <ChevronLeft color={theme.text} size={28} />
                </TouchableOpacity>
                <View style={{alignItems: 'center'}}>
                    <Text style={[styles.headerTitleMain, { color: theme.text }]}>
                        {MONTHS[activeIndex]}
                    </Text>
                    <Text style={[styles.headerYearSub, { color: theme.textDim }]}>
                        {currentYear}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => changeMonth(1)} hitSlop={15}>
                    <ChevronRight color={theme.text} size={28} />
                </TouchableOpacity>
            </View>

            {/* Calendario Horizontal */}
            <View style={{ height: 340 }}>
                <FlatList
                    ref={flatListRef}
                    data={MONTHS}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    onMomentumScrollEnd={handleScroll} // Detectar fin de deslizamiento
                    getItemLayout={(data, index) => (
                        {length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index}
                    )}
                    renderItem={({ item, index }) => (
                        <MonthCalendar monthIndex={index} year={currentYear} />
                    )}
                />
            </View>

            {/* Lista de Eventos */}
            <View style={{ flex: 1 }}>
                <Text style={[styles.sectionHeader, { color: theme.text }]}>
                    Eventos de {MONTHS[activeIndex]}
                </Text>

                <FlatList
                    // Filtrar eventos solo del mes visible para no saturar
                    data={events.filter(e => {
                        if(!e.dateKey) return false;
                        const [y, m] = e.dateKey.split('-');
                        return parseInt(y) === currentYear && parseInt(m) === (activeIndex + 1);
                    }).sort((a, b) => (a.dateKey > b.dateKey ? 1 : -1))}

                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={{alignItems:'center', marginTop: 30, opacity: 0.5}}>
                            <CalendarIcon size={40} color={theme.textDim} />
                            <Text style={{ textAlign: 'center', color: theme.textDim, marginTop: 10 }}>
                                Sin eventos este mes
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.eventCard, { backgroundColor: theme.card, borderLeftColor: theme.primary }]}>
                            <View style={styles.eventContent}>
                                <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
                                <View style={styles.metaRow}>
                                    <Clock size={12} color={theme.textDim} style={{ marginRight: 4 }} />
                                    <Text style={[styles.eventMeta, { color: theme.textDim }]}>{item.time} • {item.calendar}</Text>
                                </View>
                                {item.location ? <Text style={[styles.eventMeta, { color: theme.textDim, marginTop: 2 }]}>{item.location}</Text> : null}
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <View style={[styles.dateBadge, { backgroundColor: theme.background }]}>
                                    <Text style={[styles.dateBadgeText, { color: theme.primary }]}>{item.day}</Text>
                                    <Text style={[styles.dateBadgeMonth, { color: theme.textDim }]}>
                                        {MONTHS[item.monthIndex] ? MONTHS[item.monthIndex].substring(0,3).toUpperCase() : ''}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginTop: 5 }}>
                                    <Trash2 size={16} color={theme.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            {/* Modal (Igual que antes) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                        <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.headerBtn}>
                                <X size={24} color={theme.textDim} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo Evento</Text>
                            <TouchableOpacity onPress={saveEvent} style={styles.headerBtn}>
                                <Check size={24} color={theme.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                                    placeholder="Título"
                                    placeholderTextColor={theme.textDim}
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderBottomWidth: 0 }]}
                                    placeholder="Ubicación"
                                    placeholderTextColor={theme.textDim}
                                    value={newLocation}
                                    onChangeText={setNewLocation}
                                />
                            </View>

                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <FormRow label="Todo el día" isSwitch switchValue={isAllDay} onSwitchChange={setIsAllDay} />
                                <FormRow label="Fecha" value={selectedDateFull} isLast />
                            </View>

                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <FormRow label="Repetir" value={repeatOption} icon={Repeat} onPress={() => {}} />
                                <FormRow label="Calendario" value={calendarType} icon={CalendarIcon} color="#d946ef" onPress={() => {}} isLast />
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1 },
    headerTitleMain: { fontSize: 20, fontWeight: 'bold', textTransform: 'capitalize' },
    headerYearSub: { fontSize: 14, marginTop: -2 },

    monthCard: { borderRadius: 12, padding: 15, borderWidth: 1, marginTop: 10, height: 320 },
    weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    weekDayText: { fontSize: 12, width: '14.28%', textAlign: 'center', fontWeight: 'bold' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
    dayText: { fontSize: 15 },

    sectionHeader: { fontSize: 15, fontWeight: 'bold', marginLeft: 15, marginBottom: 10, marginTop: 5, textTransform: 'uppercase', opacity: 0.7 },
    eventCard: { marginBottom: 10, borderRadius: 10, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4 },
    eventContent: { flex: 1 },
    eventTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    eventMeta: { fontSize: 12 },
    dateBadge: { alignItems: 'center', padding: 8, borderRadius: 8, minWidth: 50 },
    dateBadgeText: { fontWeight: 'bold', fontSize: 16 },
    dateBadgeMonth: { fontSize: 10, fontWeight: 'bold' },

    modalOverlay: { flex: 1 },
    modalContainer: { flex: 1, paddingTop: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 17, fontWeight: 'bold' },
    headerBtn: { padding: 5 },
    modalBody: { flex: 1, padding: 20 },
    inputGroup: { borderRadius: 10, marginBottom: 25, overflow: 'hidden' },
    input: { fontSize: 16, padding: 15, borderBottomWidth: 1, borderColor: '#333' },
    formRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, justifyContent: 'space-between' },
    formLabel: { fontSize: 16, flex: 1, marginLeft: 10 },
    formValue: { fontSize: 16 }
});
