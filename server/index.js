const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // Importamos Multer
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// --- CONFIGURACIÓN DE ALMACENAMIENTO (Multer) ---
// 1. Aseguramos que la carpeta 'uploads' exista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('📂 Carpeta uploads creada');
}

// 2. Definimos dónde y cómo se guardan los archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta destino
    },
    filename: (req, file, cb) => {
        // Generamos un nombre único: timestamp + extensión original
        // Ej: dibujo-169877665544.png
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// 3. ¡IMPORTANTE! Hacemos pública la carpeta uploads
// Esto permite acceder a las imágenes vía: http://tu-ip:3000/uploads/nombre-archivo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- "BASE DE DATOS" SIMULADA ---
let notesDB = [
    {
        id: '1',
        title: 'Bienvenido a AtomOss',
        content: 'Esta nota tiene texto y podría tener imágenes.',
        date: new Date().toISOString()
    }
];

// --- RUTAS DE NOTAS (CRUD EXISTENTE) ---
app.get('/api/notes', (req, res) => {
    // Para ver las imágenes en el celular, necesitamos la IP de tu máquina, no 'localhost'
    // Aquí podrías procesar las URLs si fuera necesario, pero por ahora enviamos tal cual.
    res.json(notesDB);
});

app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'El título es obligatorio' });

    const newNote = {
        id: Date.now().toString(),
        title,
        content: content || '',
        date: new Date().toISOString()
    };

    notesDB.unshift(newNote);
    res.status(201).json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const noteIndex = notesDB.findIndex(n => n.id === id);

    if (noteIndex === -1) return res.status(404).json({ error: 'Nota no encontrada' });

    notesDB[noteIndex] = {
        ...notesDB[noteIndex],
        title: title || notesDB[noteIndex].title,
        content: content || notesDB[noteIndex].content,
        date: new Date().toISOString()
    };

    res.json(notesDB[noteIndex]);
});

app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    notesDB = notesDB.filter(n => n.id !== id);
    res.json({ message: 'Nota eliminada con éxito' });
});

// --- NUEVA RUTA: SUBIDA DE IMÁGENES/DIBUJOS ---
// El frontend enviará el archivo con el nombre de campo 'image'
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        console.log('📸 Imagen recibida:', req.file.filename);

        // Construimos la URL pública para que el frontend la use
        // NOTA: Reemplaza 'localhost' por tu IP local si pruebas en celular físico (ej: 192.168.1.XX)
        // Puedes obtenerla dinámicamente o dejarla fija en tu configuración.
        const protocol = req.protocol;
        const host = req.get('host'); // Esto obtiene 'localhost:3000' o tu IP:3000
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        // Respondemos con la URL que se insertará en el Markdown
        res.json({ url: fileUrl });

    } catch (error) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({ error: 'Error interno al procesar la imagen' });
    }
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => { // Escuchar en 0.0.0.0 permite conexiones externas (celular)
    console.log(`
  AtomOss Backend corriendo!
  Servidor escuchando en puerto: ${PORT}
  Carpeta de uploads pública en: http://localhost:${PORT}/uploads
  `);
});
