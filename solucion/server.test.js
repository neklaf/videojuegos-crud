const request = require('supertest');
const app = require('./server');
const db = require('./db');

describe('Pruebas funcionales de la API (server.js)', () => {
    // Cerramos la conexión a la base de datos al finalizar todos los tests
    afterAll(async () => {
        await db.destroy();
    });

    // 1. Que POST /api/estudios devuelve un error 400 si envío solamente el nombre pero omite el país
    test('POST /api/estudios devuelve un error 400 si se omite el pais', async () => {
        const res = await request(app)
            .post('/api/estudios')
            .send({
                nombre: `Estudio Test ${Date.now()}`
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    // 2. Que PUT /api/videojuegos/:id actualiza correctamente en base de datos todos los campos
    //    (titulo, fecha_lanzamiento y estudio_id), comprobando después con un GET
    test('PUT /api/videojuegos/:id actualiza correctamente titulo, fecha_lanzamiento y estudio_id, comprobado con GET', async () => {
        const timestamp = Date.now();
        // Creamos primero un videojuego para poder actualizarlo de forma aislada
        const nuevoJuegoRes = await request(app)
            .post('/api/videojuegos')
            .send({
                titulo: `Juego Inicial Test ${timestamp}`,
                fecha_lanzamiento: 2000,
                estudio_id: 1
            });

        expect(nuevoJuegoRes.status).toBe(201);
        const juegoId = nuevoJuegoRes.body.id;

        try {
            // Actualizamos todos los campos del videojuego creado
            const datosActualizados = {
                titulo: `Juego Modificado Test ${timestamp}`,
                fecha_lanzamiento: 2024,
                estudio_id: 2
            };

            const putRes = await request(app)
                .put(`/api/videojuegos/${juegoId}`)
                .send(datosActualizados);

            expect(putRes.status).toBe(200);

            // Comprobamos con GET que se han actualizado todos los campos en la base de datos
            const getRes = await request(app).get('/api/videojuegos');
            expect(getRes.status).toBe(200);

            const juegoEncontrado = getRes.body.find((j) => j.id === juegoId);
            expect(juegoEncontrado).toBeDefined();
            expect(juegoEncontrado.titulo).toBe(datosActualizados.titulo);
            expect(juegoEncontrado.fecha_lanzamiento).toBe(datosActualizados.fecha_lanzamiento);
            expect(juegoEncontrado.estudio_id).toBe(datosActualizados.estudio_id);
        } finally {
            // Limpieza: eliminamos el juego creado para no ensuciar la base de datos
            await db('videojuegos').where({ id: juegoId }).del();
        }
    });

    // 3. Que DELETE /api/videojuegos/:9999 (un ID que no existe) devuelve un código de estado 404
    test('DELETE /api/videojuegos/:id devuelve 404 cuando el ID no existe', async () => {
        const idInexistente = 9999;
        const res = await request(app).delete(`/api/videojuegos/${idInexistente}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});
