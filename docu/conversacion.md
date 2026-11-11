# Registro de Conversación: Pruebas Funcionales y Corrección de API REST

**Proyecto:** `videojuegos-crud`  
**Tecnologías:** Node.js, Express, Knex, SQLite3, Jest, Supertest  
**Fecha:** 11 de noviembre de 2026  

---

## 1. Petición del Usuario

> **Usuario:**  
> analiza el fichero server.js para ver las rutas de mi aplicacion. Crea un archivo server.test.js utilizando jest y supertest para realizar pruebas funcionales de la API. Necisito que compruebes:  
> 1. Que POST /api/estudios devuelve un error 400 si envio solamente el nombre pero omite el pais  
> 2. Que PUT /api/videojuegos/:id actualiza correctamente en base de datos todos los campos (titulo, fecha_lanzamiento y estudio_id), comprobando despues con un GET  
> 3. Que DELETE /api/videojuegos/:9999 (un ID que no existe) devuelve un codigo de estado 404  

---

## 2. Respuesta del Asistente

### 2.1. Análisis de rutas de `server.js`

Se analizaron las rutas expuestas por la aplicación Express:

#### **Estudios / Desarrolladoras (`/api/estudios`)**
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/estudios` | Obtiene el listado completo de estudios ordenados por `id` ascendente. | Ninguno |
| `POST` | `/api/estudios` | Da de alta un nuevo estudio. | `{ nombre, pais }` |
| `PUT` | `/api/estudios/:id` | Modifica el nombre y país del estudio indicado. | Params: `id`, Body: `{ nombre, pais }` |
| `DELETE` | `/api/estudios/:id` | Elimina el estudio indicado por `id`. | Params: `id` |

#### **Videojuegos (`/api/videojuegos`)**
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/videojuegos` | Obtiene videojuegos junto al nombre del estudio. Admite filtro opcional. | Query param: `?estudio_id=` |
| `POST` | `/api/videojuegos` | Registra un nuevo videojuego. | `{ titulo, fecha_lanzamiento, estudio_id }` |
| `PUT` | `/api/videojuegos/:id` | Actualiza los datos de un videojuego por `id`. | Params: `id`, Body: `{ titulo, fecha_lanzamiento, estudio_id }` |
| `DELETE` | `/api/videojuegos/:id` | Elimina el videojuego con el `id` indicado. | Params: `id` |

---

### 2.2. Creación del archivo `server.test.js`

Se redactó el fichero de pruebas funcionales `server.test.js` utilizando **Jest** y **Supertest**, cerrando la conexión a la base de datos al finalizar y asegurando la idempotencia mediante identificadores dinámicos y limpieza en bloque `finally`:

```javascript
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
```

---

### 2.3. Ejecución inicial con fallos detectados

Al ejecutar `npm test`, la suite detectó los 3 fallos intencionados presentes en `server.js`:

```text
FAIL ./server.test.js
  Pruebas funcionales de la API (server.js)
    ✕ POST /api/estudios devuelve un error 400 si se omite el pais (40 ms)
    ✕ PUT /api/videojuegos/:id actualiza correctamente titulo, fecha_lanzamiento y estudio_id, comprobado con GET (26 ms)
    ✕ DELETE /api/videojuegos/:id devuelve 404 cuando el ID no existe (3 ms)

  ● POST /api/estudios devuelve un error 400 si se omite el pais:
    Expected: 400
    Received: 500

  ● PUT /api/videojuegos/:id actualiza correctamente titulo, fecha_lanzamiento y estudio_id, comprobado con GET:
    Expected: 2024
    Received: 2000

  ● DELETE /api/videojuegos/:id devuelve 404 cuando el ID no existe:
    Expected: 404
    Received: 200
```

---

## 3. Petición del Usuario

> **Usuario:**  
> una vez que han finalizado los tests y han fallado los tres que hemos descrito analiza el codigo de server.js, y genera una corrección para los errores encontrados

---

## 4. Respuesta del Asistente: Corrección de `server.js`

### 4.1. Análisis de causas y correcciones aplicadas

1. **Bug en validación (`POST /api/estudios`)**:
   - **Causa:** La condición `if (!nombre && !pais)` solo disparaba el error 400 cuando ambos campos faltaban. Al enviar solo el nombre, pasaba la validación e intentaba insertarse en SQLite violando la restricción `NOT NULL`, respondiendo con código 500.
   - **Corrección:** Usar `if (!nombre || !pais)`.

2. **Bug de actualización incompleta (`PUT /api/videojuegos/:id`)**:
   - **Causa:** En `db('videojuegos').where({ id }).update({ titulo, estudio_id })` se omitía la propiedad `fecha_lanzamiento`. Por ello, en el `GET` posterior la fecha seguía siendo la inicial.
   - **Corrección:** Añadir `fecha_lanzamiento` al objeto de actualización.

3. **Bug de código HTTP en recurso inexistente (`DELETE /api/videojuegos/:id`)**:
   - **Causa:** No se verificaba el número de filas afectadas retornado por `.del()`, respondiendo con `200 OK` incluso al intentar borrar un ID inexistente como `9999`.
   - **Corrección:** Comprobar si `deleted` es 0 o falsy y retornar `404 Not Found`.

### 4.2. Código corregido en `server.js`

```javascript
// 1. Corrección en POST /api/estudios
app.post('/api/estudios', async (req, res) => {
    const { nombre, pais } = req.body;
    if (!nombre || !pais) {
        return res.status(400).json({ error: 'Nombre y País son obligatorios' });
    }
    try {
        const [id] = await db('estudios').insert({ nombre, pais });
        res.status(201).json({ id, nombre, pais });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Corrección en PUT /api/videojuegos/:id
app.put('/api/videojuegos/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, fecha_lanzamiento, estudio_id } = req.body;
    try {
        const updated = await db('videojuegos').where({ id }).update({
            titulo,
            fecha_lanzamiento,
            estudio_id
        });
        if (!updated) return res.status(404).json({ error: 'Videojuego no encontrado' });
        res.json({ mensaje: 'Videojuego actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Corrección en DELETE /api/videojuegos/:id
app.delete('/api/videojuegos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await db('videojuegos').where({ id }).del();
        if (!deleted) return res.status(404).json({ error: 'Videojuego no encontrado' });
        res.json({ mensaje: 'Videojuego eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

---

### 4.3. Validación final con `npm test`

Tras guardar las correcciones, se reejecutó la suite de tests:

```text
> app-crud@1.0.0 test
> jest

PASS ./server.test.js
  Pruebas funcionales de la API (server.js)
    ✓ POST /api/estudios devuelve un error 400 si se omite el pais (27 ms)
    ✓ PUT /api/videojuegos/:id actualiza correctamente titulo, fecha_lanzamiento y estudio_id, comprobado con GET (34 ms)
    ✓ DELETE /api/videojuegos/:id devuelve 404 cuando el ID no existe (3 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.392 s, estimated 1 s
Ran all test suites.
```
