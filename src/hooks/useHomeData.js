import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notesService from '../api/notesService';
import calendarService from '../api/calendarService';

const READ_NOTIFICATIONS_KEY = '@atomoss_notifications_read_v1';

export const useHomeData = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const data = await notesService.getAll();
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error fetching notes:", error);
            setNotes([]); // Ensure notes is an array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchNotificationsCount = async () => {
        try {
            const storedReadIds = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
            const readIds = storedReadIds ? JSON.parse(storedReadIds) : [];
            const events = await calendarService.getAll();
            const systemIds = ['sys_1']; // Example system notifications
            const eventIds = events.map(e => e.id);
            const allIds = [...systemIds, ...eventIds];
            const count = allIds.filter(id => !readIds.includes(id)).length;
            setUnreadCount(count);
        } catch (error) {
            console.error("Error counting notifications:", error);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchNotes();
        fetchNotificationsCount();
    }, []));

    return { notes, loading, unreadCount, fetchNotes };
};
