// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// CRUD 1: ESTUDIOS / DESARROLLADORAS
// ==========================================

app.get('/api/estudios', async (req, res) => {
    try {
        const estudios = await db('estudios').select('*').orderBy('id', 'asc');
        res.json(estudios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/estudios', async (req, res) => {
    const { nombre, pais } = req.body;
    // BUG INTENCIONADO 1: Se usa '&&' en vez de '||'. 
    // Si mandan solo 'nombre' sin 'pais', se cuela la petición sin dar error 400.
    if (!nombre && !pais) {
        return res.status(400).json({ error: 'Nombre y País son obligatorios' });
    }
    try {
        const [id] = await db('estudios').insert({ nombre, pais });
        res.status(201).json({ id, nombre, pais });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/estudios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, pais } = req.body;
    try {
        const updated = await db('estudios').where({ id }).update({ nombre, pais });
        if (!updated) return res.status(404).json({ error: 'Estudio no encontrado' });
        res.json({ mensaje: 'Estudio actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/estudios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await db('estudios').where({ id }).del();
        if (!deleted) return res.status(404).json({ error: 'Estudio no encontrado' });
        res.json({ mensaje: 'Estudio eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// CRUD 2: VIDEOJUEGOS
// ==========================================

app.get('/api/videojuegos', async (req, res) => {
    try {
        const { estudio_id } = req.query;
        let query = db('videojuegos')
            .join('estudios', 'videojuegos.estudio_id', '=', 'estudios.id')
            .select(
                'videojuegos.id',
                'videojuegos.titulo',
                'videojuegos.fecha_lanzamiento',
                'videojuegos.estudio_id',
                'estudios.nombre as estudio'
            )
            .orderBy('videojuegos.fecha_lanzamiento', 'desc');

        if (estudio_id) {
            query = query.where('videojuegos.estudio_id', estudio_id);
        }

        const juegos = await query;
        res.json(juegos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/videojuegos', async (req, res) => {
    const { titulo, fecha_lanzamiento, estudio_id } = req.body;
    if (!titulo || !fecha_lanzamiento || !estudio_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    try {
        const [id] = await db('videojuegos').insert({
            titulo,
            fecha_lanzamiento,
            estudio_id
        });
        res.status(201).json({ id, titulo, fecha_lanzamiento, estudio_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/videojuegos/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, fecha_lanzamiento, estudio_id } = req.body;
    try {
        // BUG INTENCIONADO 2: Nos olvidamos de pasar 'fecha_lanzamiento' al update.
        // El endpoint responde 200 OK, pero en la BD la fecha nunca se actualiza.
        const updated = await db('videojuegos').where({ id }).update({
            titulo,
            estudio_id
        });
        if (!updated) return res.status(404).json({ error: 'Videojuego no encontrado' });
        res.json({ mensaje: 'Videojuego actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/videojuegos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db('videojuegos').where({ id }).del();
        // BUG INTENCIONADO 3: No comprobamos si 'deleted' es 0.
        // Si intentas borrar el ID 99999, devuelve 200 OK en vez de 404 Not Found.
        res.json({ mensaje: 'Videojuego eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajuste para permitir testing funcional con Supertest sin levantar el puerto dos veces
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor activo en: http://localhost:${PORT}`);
    });
}

module.exports = app;