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
import DateTimePicker from '@react-native-community/datetimepicker'; // <--- IMPORTANTE: Librería instalada
import { useTheme } from '../context/ThemeContext';
import calendarService from '../api/calendarService';
import {
    MapPin, Clock, X, Check, Calendar as CalendarIcon,
    Repeat, AlignLeft, Trash2, ChevronLeft, ChevronRight, List
} from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const WEEK_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const REPEAT_OPTIONS = ['Nunca', 'Diariamente', 'Semanalmente', 'Mensualmente', 'Anualmente'];

export default function CalendarScreen() {
    const { theme } = useTheme();

    // --- ESTADOS PRINCIPALES ---
    const now = new Date();
    const [events, setEvents] = useState([]);
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [activeIndex, setActiveIndex] = useState(now.getMonth());
    const flatListRef = useRef(null);

    // --- ESTADOS DEL FORMULARIO ---
    const [modalVisible, setModalVisible] = useState(false);
    const [repeatModalVisible, setRepeatModalVisible] = useState(false); // Modal para repetir
    const [selectedDateFull, setSelectedDateFull] = useState(null);

    const [newTitle, setNewTitle] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newDescription, setNewDescription] = useState(''); // Nuevo campo Descripción
    const [isAllDay, setIsAllDay] = useState(false);
    const [repeatOption, setRepeatOption] = useState('Nunca');
    const [calendarType, setCalendarType] = useState('Trabajo');

    // Manejo de Horas
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // +1 hora
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // --- EFECTOS Y CARGA ---
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

    // --- AYUDAS ---
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        if (index !== activeIndex && index >= 0 && index < 12) {
            setActiveIndex(index);
        }
    };

    const changeMonth = (direction) => {
        let newIndex = activeIndex + direction;
        let newYear = currentYear;
        if (newIndex < 0) { newIndex = 11; newYear -= 1; }
        else if (newIndex > 11) { newIndex = 0; newYear += 1; }
        setCurrentYear(newYear);
        setActiveIndex(newIndex);
        flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    };

    const handleDayPress = (dateObj) => {
        if (!dateObj) return;
        const offsetDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
        const dateKey = offsetDate.toISOString().split('T')[0];

        // Resetear formulario
        setSelectedDateFull(dateKey);
        setNewTitle('');
        setNewLocation('');
        setNewDescription('');
        setIsAllDay(false);
        setRepeatOption('Nunca');
        setStartDate(new Date());
        setEndDate(new Date(new Date().getTime() + 60 * 60 * 1000));

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
            description: newDescription,
            type: 'user',
            time: isAllDay ? 'Todo el día' : `${formatTime(startDate)} - ${formatTime(endDate)}`,
            startTimeRaw: startDate.toISOString(), // Guardamos ISO para lógica futura
            endTimeRaw: endDate.toISOString(),
            repeat: repeatOption,
            calendar: calendarType
        };

        await calendarService.create(newEventData);
        await loadEvents();
        setModalVisible(false);
    };

    const handleDelete = async (id) => {
        Alert.alert("Eliminar", "¿Borrar este evento?", [
            { text: "Cancelar" },
            { text: "Borrar", style: "destructive", onPress: async () => {
                    await calendarService.delete(id);
                    loadEvents();
                }}
        ]);
    };

    // --- HANDLERS DEL DATE PICKER ---
    const onDateChange = (event, selectedDate, type) => {
        if (type === 'start') {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) setStartDate(selectedDate);
        } else {
            setShowEndPicker(Platform.OS === 'ios');
            if (selectedDate) setEndDate(selectedDate);
        }
    };

    // --- COMPONENTES UI ---
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
                                        (!isSelected && isToday) && { borderWidth: 1, borderColor: theme.primary, borderRadius: 15 }
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
            activeOpacity={isSwitch || !onPress ? 1 : 0.6}
            onPress={onPress}
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
                <View style={{flexDirection: 'row', alignItems:'center'}}>
                    <Text style={[styles.formValue, { color: color || theme.textDim }]}>{value}</Text>
                    {onPress && <ChevronRight size={16} color={theme.textDim} style={{marginLeft: 5}} />}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Dinámico */}
            <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => changeMonth(-1)} hitSlop={15}>
                    <ChevronLeft color={theme.text} size={28} />
                </TouchableOpacity>
                <View style={{alignItems: 'center'}}>
                    <Text style={[styles.headerTitleMain, { color: theme.text }]}>{MONTHS[activeIndex]}</Text>
                    <Text style={[styles.headerYearSub, { color: theme.textDim }]}>{currentYear}</Text>
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
                    onMomentumScrollEnd={handleScroll}
                    getItemLayout={(data, index) => ({length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index})}
                    renderItem={({ item, index }) => <MonthCalendar monthIndex={index} year={currentYear} />}
                />
            </View>

            {/* Lista de Eventos */}
            <View style={{ flex: 1 }}>
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Eventos de {MONTHS[activeIndex]}</Text>
                <FlatList
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
                            <Text style={{ textAlign: 'center', color: theme.textDim, marginTop: 10 }}>Sin eventos este mes</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.eventCard, { backgroundColor: theme.card, borderLeftColor: theme.primary }]}>
                            <View style={styles.eventContent}>
                                <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
                                <View style={styles.metaRow}>
                                    <Clock size={12} color={theme.textDim} style={{ marginRight: 4 }} />
                                    <Text style={[styles.eventMeta, { color: theme.textDim }]}>{item.time}</Text>
                                </View>
                                {item.location ? (
                                    <View style={styles.metaRow}>
                                        <MapPin size={12} color={theme.textDim} style={{ marginRight: 4 }} />
                                        <Text style={[styles.eventMeta, { color: theme.textDim }]}>{item.location}</Text>
                                    </View>
                                ) : null}
                                {item.description ? (
                                    <Text style={[styles.eventDesc, { color: theme.textDim, marginTop: 4 }]} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                ) : null}
                                {item.repeat !== 'Nunca' && (
                                    <View style={[styles.repeatBadge, {backgroundColor: theme.background}]}>
                                        <Repeat size={10} color={theme.primary} style={{marginRight: 3}}/>
                                        <Text style={{fontSize: 10, color: theme.primary}}>{item.repeat}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={[styles.dateBadge, { backgroundColor: theme.background }]}>
                                    <Text style={[styles.dateBadgeText, { color: theme.primary }]}>{item.day}</Text>
                                    <Text style={[styles.dateBadgeMonth, { color: theme.textDim }]}>
                                        {MONTHS[item.monthIndex] ? MONTHS[item.monthIndex].substring(0,3).toUpperCase() : ''}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 5 }}>
                                    <Trash2 size={18} color={theme.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            {/* --- MODAL FORMULARIO --- */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                        <View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.headerBtn}><X size={24} color={theme.textDim} /></TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo Evento</Text>
                            <TouchableOpacity onPress={saveEvent} style={styles.headerBtn}><Check size={24} color={theme.primary} /></TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Título y Ubicación */}
                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderBottomColor: theme.border }]}
                                    placeholder="Título del evento"
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

                            {/* Horas */}
                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <FormRow label="Todo el día" isSwitch switchValue={isAllDay} onSwitchChange={setIsAllDay} />
                                {!isAllDay && (
                                    <>
                                        <FormRow
                                            label="Empieza"
                                            value={formatTime(startDate)}
                                            onPress={() => setShowStartPicker(true)}
                                        />
                                        <FormRow
                                            label="Termina"
                                            value={formatTime(endDate)}
                                            onPress={() => setShowEndPicker(true)}
                                            isLast
                                        />
                                    </>
                                )}
                            </View>

                            {/* Repetición */}
                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <FormRow
                                    label="Repetir"
                                    value={repeatOption}
                                    icon={Repeat}
                                    onPress={() => setRepeatModalVisible(true)}
                                />
                                <FormRow label="Calendario" value={calendarType} icon={CalendarIcon} color="#d946ef" isLast />
                            </View>

                            {/* Descripción */}
                            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
                                <View style={{flexDirection:'row', padding: 15, alignItems:'flex-start'}}>
                                    <AlignLeft size={20} color={theme.textDim} style={{marginRight: 10, marginTop: 3}} />
                                    <TextInput
                                        style={[styles.inputDesc, { color: theme.text }]}
                                        placeholder="Agregar descripción / notas"
                                        placeholderTextColor={theme.textDim}
                                        value={newDescription}
                                        onChangeText={setNewDescription}
                                        multiline
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* PICKERS DE HORA (Android/iOS handled) */}
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="time"
                                display="default"
                                onChange={(e, d) => onDateChange(e, d, 'start')}
                            />
                        )}
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="time"
                                display="default"
                                onChange={(e, d) => onDateChange(e, d, 'end')}
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- MODAL REPETICIÓN --- */}
            <Modal animationType="fade" transparent={true} visible={repeatModalVisible} onRequestClose={() => setRepeatModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlayCenter} activeOpacity={1} onPress={() => setRepeatModalVisible(false)}>
                    <View style={[styles.popupMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.popupTitle, {color: theme.textDim}]}>Repetir evento</Text>
                        {REPEAT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[styles.popupItem, option === repeatOption && {backgroundColor: theme.background}]}
                                onPress={() => { setRepeatOption(option); setRepeatModalVisible(false); }}
                            >
                                <Text style={[styles.popupText, {color: theme.text}]}>{option}</Text>
                                {option === repeatOption && <Check size={16} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
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
    eventContent: { flex: 1, paddingRight: 10 },
    eventTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    eventMeta: { fontSize: 12 },
    eventDesc: { fontSize: 12, fontStyle: 'italic' },
    dateBadge: { alignItems: 'center', padding: 8, borderRadius: 8, minWidth: 50, marginBottom: 5 },
    dateBadgeText: { fontWeight: 'bold', fontSize: 16 },
    dateBadgeMonth: { fontSize: 10, fontWeight: 'bold' },
    repeatBadge: { flexDirection: 'row', alignItems:'center', alignSelf:'flex-start', paddingHorizontal: 6, paddingVertical:2, borderRadius: 4, marginTop: 6 },

    // Modales
    modalOverlay: { flex: 1 },
    modalContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 17, fontWeight: 'bold' },
    headerBtn: { padding: 10 },
    modalBody: { flex: 1, padding: 20 },
    inputGroup: { borderRadius: 10, marginBottom: 20, overflow: 'hidden' },
    input: { fontSize: 16, padding: 15, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    inputDesc: { fontSize: 16, flex: 1, minHeight: 80, textAlignVertical: 'top' },
    formRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, justifyContent: 'space-between' },
    formLabel: { fontSize: 16, flex: 1, marginLeft: 10 },
    formValue: { fontSize: 16 },

    // Modal Centro (Repetir)
    modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    popupMenu: { width: '80%', borderRadius: 12, borderWidth: 1, padding: 10 },
    popupTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 10 },
    popupItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 8, marginBottom: 2 },
    popupText: { fontSize: 16 }
});
