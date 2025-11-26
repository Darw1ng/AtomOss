const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; // El puerto donde escuchará el servidor

// --- MIDDLEWARE (Configuración) ---
app.use(cors()); // Permite que tu app móvil se conecte a este servidor
app.use(bodyParser.json()); // Permite recibir datos en formato JSON

// --- "BASE DE DATOS" SIMULADA ---
// En un proyecto real, aquí te conectarías a MongoDB o MySQL
let notesDB = [
    {
        id: '1',
        title: 'Bienvenido a AtomOss',
        content: 'Esta es tu primera nota desde el servidor.',
        date: new Date().toISOString()
    }
];

// --- RUTAS (ENDPOINTS) ---

// 1. GET: Obtener todas las notas
app.get('/api/notes', (req, res) => {
    console.log('📡 GET /api/notes - Enviando notas al cliente');
    res.json(notesDB);
});

// 2. POST: Crear una nueva nota
app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;

    console.log('📥 POST /api/notes - Recibiendo:', title);

    if (!title) {
        return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const newNote = {
        id: Date.now().toString(), // Generamos un ID único simple
        title,
        content: content || '',
        date: new Date().toISOString()
    };

    notesDB.unshift(newNote); // Agregamos al principio de la lista
    res.status(201).json(newNote); // Respondemos con la nota creada
});

// 3. PUT: Actualizar una nota existente
app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    console.log(`📝 PUT /api/notes/${id} - Actualizando nota`);

    const noteIndex = notesDB.findIndex(n => n.id === id);

    if (noteIndex === -1) {
        return res.status(404).json({ error: 'Nota no encontrada' });
    }

    // Actualizamos solo los campos que nos enviaron
    notesDB[noteIndex] = {
        ...notesDB[noteIndex],
        title: title || notesDB[noteIndex].title,
        content: content || notesDB[noteIndex].content,
        date: new Date().toISOString() // Actualizamos la fecha de modificación
    };

    res.json(notesDB[noteIndex]);
});

// 4. DELETE: Eliminar una nota
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/notes/${id} - Eliminando nota`);

    const initialLength = notesDB.length;
    notesDB = notesDB.filter(n => n.id !== id);

    if (notesDB.length === initialLength) {
        return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.json({ message: 'Nota eliminada con éxito' });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`
  AtomOss Backend corriendo!
  Servidor escuchando en: http://localhost:${PORT}
  `);
});