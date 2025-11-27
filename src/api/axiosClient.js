import axios from 'axios';

// SI USAS EMULADOR ANDROID: usa 'http://10.0.2.2:3000/api'
// SI USAS CELULAR FÍSICO: usa tu IP real 'http://192.168.1.XX:3000/api'
// SI USAS IPHONE SIMULADOR: usa 'http://localhost:3000/api'

const BASE_URL = 'http://192.168.1.248:3000/api';


const client = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
