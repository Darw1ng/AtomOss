export const PREDEFINED_TAGS = [
    { id: 'ideas',      label: 'Ideas',      color: '#8b5cf6' },
    { id: 'trabajo',    label: 'Trabajo',    color: '#3b82f6' },
    { id: 'personal',   label: 'Personal',   color: '#22c55e' },
    { id: 'urgente',    label: 'Urgente',    color: '#ef4444' },
    { id: 'aprender',   label: 'Aprender',   color: '#f59e0b' },
    { id: 'proyecto',   label: 'Proyecto',   color: '#ec4899' },
    { id: 'referencia', label: 'Ref',        color: '#06b6d4' },
];

// Tintes de fondo por nota — variante dark y light
export const NOTE_TINTS = {
    green:  { dark: '#1a3326', light: '#dcfce7' },
    blue:   { dark: '#1a2638', light: '#dbeafe' },
    purple: { dark: '#281a38', light: '#ede9fe' },
    amber:  { dark: '#382a14', light: '#fef3c7' },
    red:    { dark: '#381a1a', light: '#fee2e2' },
    teal:   { dark: '#1a2e30', light: '#ccfbf1' },
};

// Paleta de colores que se muestra en el menu de opciones
export const NOTE_TINT_PALETTE = [
    { id: null,      dot: null },
    { id: 'green',   dot: '#22c55e' },
    { id: 'blue',    dot: '#3b82f6' },
    { id: 'purple',  dot: '#8b5cf6' },
    { id: 'amber',   dot: '#f59e0b' },
    { id: 'red',     dot: '#ef4444' },
    { id: 'teal',    dot: '#06b6d4' },
];
