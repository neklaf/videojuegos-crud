// public/app.js
document.addEventListener('DOMContentLoaded', () => {

    // DOM: Estudios
    const formEstudio = document.getElementById('form-estudio');
    const inputEstudioId = document.getElementById('estudio-id');
    const inputEstudioNombre = document.getElementById('estudio-nombre');
    const inputEstudioPais = document.getElementById('estudio-pais');
    const btnEstudio = document.getElementById('btn-estudio');
    const btnCancelEstudio = document.getElementById('btn-cancel-estudio');
    const tablaEstudios = document.getElementById('tabla-estudios');

    // DOM: Videojuegos
    const formJuego = document.getElementById('form-juego');
    const inputJuegoId = document.getElementById('juego-id');
    const inputJuegoTitulo = document.getElementById('juego-titulo');
    const inputJuegoFecha = document.getElementById('juego-fecha'); // Campo de fecha
    const selectJuegoEstudio = document.getElementById('juego-estudio');
    const btnJuego = document.getElementById('btn-juego');
    const btnCancelJuego = document.getElementById('btn-cancel-juego');
    const selectFiltroEstudio = document.getElementById('filtro-estudio');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const tablaJuegos = document.getElementById('tabla-juegos');

    // ==========================================
    // SECCIÓN 1: ESTUDIOS
    // ==========================================

    async function cargarEstudios() {
        const res = await fetch('/api/estudios');
        const estudios = await res.json();

        tablaEstudios.innerHTML = '';
        estudios.forEach(e => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${e.id}</td>
                <td><strong>${e.nombre}</strong></td>
                <td>${e.pais}</td>
                <td>
                    <button class="btn-edit" onclick="prepararEditarEstudio(${e.id}, '${e.nombre}', '${e.pais}')">Editar</button>
                    <button class="btn-del" onclick="eliminarEstudio(${e.id})">Eliminar</button>
                </td>
            `;
            tablaEstudios.appendChild(tr);
        });

        actualizarSelectoresEstudios(estudios);
    }

    function actualizarSelectoresEstudios(estudios) {
        const valorFiltroPrevio = selectFiltroEstudio.value;

        selectJuegoEstudio.innerHTML = '<option value="">-- Seleccionar Desarrollador --</option>';
        selectFiltroEstudio.innerHTML = '<option value="">-- Todos los Estudios --</option>';

        estudios.forEach(e => {
            selectJuegoEstudio.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
            selectFiltroEstudio.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
        });

        selectFiltroEstudio.value = valorFiltroPrevio;
    }

    formEstudio.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = inputEstudioId.value;
        const nombre = inputEstudioNombre.value.trim();
        const pais = inputEstudioPais.value.trim();

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/api/estudios/${id}` : '/api/estudios';

        await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, pais })
        });

        cancelarModoEdicionEstudio();
        await cargarEstudios();
        await cargarVideojuegos();
    });

    window.prepararEditarEstudio = (id, nombre, pais) => {
        inputEstudioId.value = id;
        inputEstudioNombre.value = nombre;
        inputEstudioPais.value = pais;
        btnEstudio.textContent = 'Actualizar Estudio';
        btnCancelEstudio.style.display = 'inline-block';
    };

    btnCancelEstudio.addEventListener('click', cancelarModoEdicionEstudio);

    function cancelarModoEdicionEstudio() {
        formEstudio.reset();
        inputEstudioId.value = '';
        btnEstudio.textContent = 'Guardar Estudio';
        btnCancelEstudio.style.display = 'none';
    }

    window.eliminarEstudio = async (id) => {
        if (!confirm('¿Eliminar estudio? Se borrarán sus juegos asociados (CASCADE).')) return;
        await fetch(`/api/estudios/${id}`, { method: 'DELETE' });
        await cargarEstudios();
        await cargarVideojuegos();
    };

    // ==========================================
    // SECCIÓN 2: VIDEOJUEGOS
    // ==========================================

    async function cargarVideojuegos(estudioId = '') {
        const url = estudioId ? `/api/videojuegos?estudio_id=${estudioId}` : '/api/videojuegos';
        const res = await fetch(url);
        const juegos = await res.json();

        tablaJuegos.innerHTML = '';
        if (juegos.length === 0) {
            tablaJuegos.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay juegos registrados.</td></tr>';
            return;
        }

        juegos.forEach(j => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${j.id}</td>
                <td><strong>${j.titulo}</strong></td>
                <td>${j.fecha_lanzamiento}</td>
                <td>${j.estudio}</td>
                <td>
                    <button class="btn-edit" onclick="prepararEditarJuego(${j.id}, '${j.titulo.replace(/'/g, "\\'")}', '${j.fecha_lanzamiento}', ${j.estudio_id})">Editar</button>
                    <button class="btn-del" onclick="eliminarJuego(${j.id})">Eliminar</button>
                </td>
            `;
            tablaJuegos.appendChild(tr);
        });
    }

    formJuego.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = inputJuegoId.value;
        const titulo = inputJuegoTitulo.value.trim();
        const fecha_lanzamiento = inputJuegoFecha.value; // Formato YYYY-MM-DD
        const estudio_id = parseInt(selectJuegoEstudio.value);

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/api/videojuegos/${id}` : '/api/videojuegos';

        await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, fecha_lanzamiento, estudio_id })
        });

        cancelarModoEdicionJuego();
        await cargarVideojuegos(selectFiltroEstudio.value);
    });

    window.prepararEditarJuego = (id, titulo, fecha, estudioId) => {
        inputJuegoId.value = id;
        inputJuegoTitulo.value = titulo;
        inputJuegoFecha.value = fecha; // Asigna directamente el string ISO YYYY-MM-DD al input date
        selectJuegoEstudio.value = estudioId;
        btnJuego.textContent = 'Actualizar Juego';
        btnCancelJuego.style.display = 'inline-block';
    };

    btnCancelJuego.addEventListener('click', cancelarModoEdicionJuego);

    function cancelarModoEdicionJuego() {
        formJuego.reset();
        inputJuegoId.value = '';
        btnJuego.textContent = 'Guardar Juego';
        btnCancelJuego.style.display = 'none';
    }

    window.eliminarJuego = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este videojuego?')) return;
        await fetch(`/api/videojuegos/${id}`, { method: 'DELETE' });
        await cargarVideojuegos(selectFiltroEstudio.value);
    };

    btnFiltrar.addEventListener('click', () => {
        cargarVideojuegos(selectFiltroEstudio.value);
    });

    // Carga inicial
    cargarEstudios();
    cargarVideojuegos();
});
