// src/api/axiosClient.js
import axios from 'axios';

// CAMBIA ESTO por la IP de tu computadora si pruebas en celular real
// Ejemplo: '[http://192.168.1.50:3000/api](http://192.168.1.50:3000/api)'
const BASE_URL = '[https://tu-api-real.com/api](https://tu-api-real.com/api)';

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 5000, // Esperar máximo 5 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
